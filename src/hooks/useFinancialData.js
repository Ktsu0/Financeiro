import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import axios from "axios";
import { addMonths, parse, format, isValid } from "date-fns";
import { encryptData, decryptData, validateSyncUrl } from "../utils/security";
import { parseDate } from "../utils";

const STORAGE_KEY = "@financeiro_v1_data";
const CLOUD_URL_KEY = "@financeiro_cloud_url";
const PET_VISIBILITY_KEY = "@financeiro_show_pet";
const GOOGLE_SCRIPT_TOKEN = process.env.REACT_APP_GOOGLE_APPS_SCRIPT_TOKEN;
const TOMBSTONE_MAX_AGE_DAYS = 90;
const EPSILON = 0.01;

const initialData = {
  expenses: [],
  debts: [],
  incomes: [],
  automation_meta: {
    last_processed_month: format(new Date(), "yyyy-MM"), // Inicia no mês atual para evitar duplicar atualizações já feitas manualmente
  }
};

// Sinaliza (uma vez, no carregamento) se os dados locais existiam mas não puderam
// ser descriptografados (ex.: a chave de criptografia mudou entre deploys).
let didDecryptFailOnLoad = false;

// --- Helpers de sincronização (fetch-merge-push por registro) ---

const getUpdatedAt = (item) =>
  item.updated_at || item.created_at || "1970-01-01T00:00:00.000Z";

// Preenche updated_at em registros antigos (criados antes desse campo existir)
const backfillTimestamps = (arr = []) =>
  arr.map((item) =>
    item.updated_at ? item : { ...item, updated_at: getUpdatedAt(item) },
  );

// Mescla duas coleções pelo id, mantendo sempre a versão com updated_at mais recente
const mergeArraysById = (mine = [], theirs = []) => {
  const map = new Map();
  mine.forEach((item) => map.set(item.id, item));
  theirs.forEach((item) => {
    const existing = map.get(item.id);
    if (!existing || getUpdatedAt(item) > getUpdatedAt(existing)) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
};

// Rede de segurança contra duplicidade: se dois dispositivos, sem terem sincronizado
// ainda entre si, criarem cada um sua própria cópia da mesma despesa/receita fixa
// projetada para o mesmo mês (ex.: automação do dia 5 rodando em paralelo), mantém
// só a criada primeiro e tombstona as demais.
const dedupeFixedProjections = (items, dateKey) => {
  const groups = new Map();
  items.forEach((item) => {
    if (item.is_fixed && !item.deleted_at) {
      const d = parseDate(item[dateKey]);
      if (d) {
        const key = `${item.name}|${d.getFullYear()}-${d.getMonth()}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
      }
    }
  });

  const tombstoneIds = new Set();
  groups.forEach((group) => {
    if (group.length > 1) {
      const sorted = [...group].sort((a, b) =>
        (a.created_at || "").localeCompare(b.created_at || ""),
      );
      sorted.slice(1).forEach((dup) => tombstoneIds.add(dup.id));
    }
  });

  if (tombstoneIds.size === 0) return items;

  const now = new Date().toISOString();
  return items.map((item) =>
    tombstoneIds.has(item.id) ? { ...item, deleted_at: now } : item,
  );
};

const normalizeCloudData = (raw) => ({
  expenses: backfillTimestamps(raw.expenses || []),
  incomes: backfillTimestamps(raw.incomes || []),
  debts: backfillTimestamps(raw.debts || []),
  automation_meta: raw.automation_meta || initialData.automation_meta,
});

// Mescla o estado local com o estado da nuvem, registro a registro, em vez de
// sobrescrever o blob inteiro (que é o que causava perda de dados quando duas
// pessoas mexiam ao mesmo tempo).
const mergeData = (mine, theirs) => {
  const expenses = dedupeFixedProjections(
    mergeArraysById(mine.expenses, theirs.expenses),
    "due_date",
  );
  const incomes = dedupeFixedProjections(
    mergeArraysById(mine.incomes || [], theirs.incomes || []),
    "date",
  );
  const debts = mergeArraysById(mine.debts, theirs.debts);

  const mineMonth = mine.automation_meta?.last_processed_month || "";
  const theirMonth = theirs.automation_meta?.last_processed_month || "";

  return {
    expenses,
    incomes,
    debts,
    automation_meta: {
      last_processed_month: mineMonth > theirMonth ? mineMonth : theirMonth,
    },
  };
};

// Remove tombstones (registros excluídos) antigos para o payload não crescer para sempre
const purgeOldTombstones = (data) => {
  const cutoff = Date.now() - TOMBSTONE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const keep = (item) =>
    !item.deleted_at || new Date(item.deleted_at).getTime() > cutoff;
  return {
    ...data,
    expenses: data.expenses.filter(keep),
    incomes: (data.incomes || []).filter(keep),
    debts: data.debts.filter(keep),
  };
};

export const useFinancialData = () => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const decrypted = saved ? decryptData(saved) : null;

    if (saved && !decrypted) {
      // Dados existem mas não puderam ser lidos (ex.: chave de criptografia trocada).
      // Em vez de deixar o app reiniciar do zero e sobrescrever o backup em silêncio,
      // guarda uma cópia do texto cifrado original para possível recuperação.
      didDecryptFailOnLoad = true;
      try {
        localStorage.setItem(`${STORAGE_KEY}_corrupt_backup_${Date.now()}`, saved);
      } catch {
        // localStorage cheio ou indisponível: nada mais a fazer aqui
      }
    }

    const baseData = decrypted || initialData;
    // Se não tiver automation_meta (usuário antigo), define como o mês atual
    // Isso evita que o sistema tente "corrigir" o mês atual que o usuário já mexeu
    if (!baseData.automation_meta) {
      baseData.automation_meta = {
        last_processed_month: format(new Date(), "yyyy-MM")
      };
    }
    baseData.expenses = backfillTimestamps(baseData.expenses);
    baseData.debts = backfillTimestamps(baseData.debts);
    baseData.incomes = backfillTimestamps(baseData.incomes || []);
    return baseData;
  });

  useEffect(() => {
    if (didDecryptFailOnLoad) {
      toast.error("Não foi possível carregar seus dados salvos neste dispositivo.", {
        description:
          "Uma cópia de segurança dos dados criptografados foi preservada no armazenamento local. Fale com quem administra o site se precisar recuperá-los.",
      });
    }
  }, []);

  const [cloudUrl, setCloudUrl] = useState(
    () => localStorage.getItem(CLOUD_URL_KEY) || "",
  );
  const [showPet, setShowPet] = useState(
    () => localStorage.getItem(PET_VISIBILITY_KEY) !== "false",
  );
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    () => format(new Date(), "yyyy-MM"),
  );
  const saveTimeoutRef = useRef(null);
  const isSyncingRef = useRef(false);

  // Sync ref with state
  useEffect(() => {
    isSyncingRef.current = isSyncing;
  }, [isSyncing]);

  // Mantém uma ref sempre atualizada dos dados para uso em callbacks que
  // precisam ficar com identidade estável (ex.: o polling de sync não pode
  // ser recriado a cada edição, senão o intervalo de 30s nunca dispara).
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // As coleções "visíveis" escondem tombstones (registros excluídos, mas
  // mantidos internamente para propagar a exclusão entre dispositivos).
  const expenses = useMemo(
    () => data.expenses.filter((e) => !e.deleted_at),
    [data.expenses],
  );
  const debts = useMemo(
    () => data.debts.filter((d) => !d.deleted_at),
    [data.debts],
  );
  const incomes = useMemo(
    () => (data.incomes || []).filter((i) => !i.deleted_at),
    [data.incomes],
  );

  const previousDataHashRef = useRef("");
  const initialLoadDoneRef = useRef(false);

  // Cloud Actions
  const syncToCloud = useCallback(
    async (targetUrl = cloudUrl) => {
      if (!targetUrl) return;

      if (!validateSyncUrl(targetUrl)) {
        console.warn("URL insegura ou inválida para sync:", targetUrl);
        return;
      }
      try {
        setIsSyncing(true);

        // Busca o estado atual da nuvem e mescla registro a registro antes de
        // enviar, para não apagar mudanças feitas por outro dispositivo desde
        // a última sincronização (last-write-wins do blob inteiro era a causa
        // da perda de dados quando duas pessoas mexiam ao mesmo tempo).
        let base = dataRef.current;
        try {
          const response = await axios.get(targetUrl);
          if (
            response.data &&
            (response.data.expenses ||
              response.data.debts ||
              response.data.incomes)
          ) {
            const cloudData = normalizeCloudData(response.data);
            base = purgeOldTombstones(mergeData(dataRef.current, cloudData));
            setData(base);
          }
        } catch (fetchErr) {
          console.warn(
            "Não foi possível buscar dados atuais da nuvem antes de enviar:",
            fetchErr,
          );
        }

        previousDataHashRef.current = JSON.stringify(base);
        const payload = { ...base, token: GOOGLE_SCRIPT_TOKEN };

        await axios.post(targetUrl, JSON.stringify(payload), {
          headers: { "Content-Type": "text/plain;charset=utf-8" },
        });
      } catch (error) {
        console.error("Cloud Sync Error:", error);
      } finally {
        setIsSyncing(false);
      }
    },
    [cloudUrl],
  );

  const loadFromCloud = useCallback(
    async (targetUrl = cloudUrl, silent = false) => {
      if (!targetUrl) return;
      try {
        if (!silent) setLoading(true);
        const response = await axios.get(targetUrl);

        if (
          response.data &&
          (response.data.expenses ||
            response.data.debts ||
            response.data.incomes)
        ) {
          const cloudData = normalizeCloudData(response.data);
          const merged = purgeOldTombstones(
            mergeData(dataRef.current, cloudData),
          );
          const mergedString = JSON.stringify(merged);

          if (mergedString !== previousDataHashRef.current) {
            previousDataHashRef.current = mergedString;
            setData(merged);
            if (!silent) toast.success("Dados sincronizados com a nuvem!");
          }
          initialLoadDoneRef.current = true;
        }
      } catch (error) {
        console.error("Load Error:", error);
        if (!silent) toast.error("Erro ao buscar dados da nuvem");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [cloudUrl],
  );

  // Persistence Local & Auto-sync (Push)
  useEffect(() => {
    const currentDataString = JSON.stringify(data);

    // Encrypt data before saving to localStorage
    const encrypted = encryptData(data);
    if (encrypted) {
      localStorage.setItem(STORAGE_KEY, encrypted);
    }

    // SÓ envia se: tiver URL, o primeiro load terminou, e os dados são diferentes do último hash conhecido
    if (
      cloudUrl &&
      initialLoadDoneRef.current &&
      currentDataString !== previousDataHashRef.current
    ) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        syncToCloud();
      }, 2000);
    }
  }, [data, cloudUrl, syncToCloud]);

  // Multi-device Sync (Pull)
  useEffect(() => {
    if (!cloudUrl) return;

    // Busca inicial ao carregar (com loading visível)
    loadFromCloud(cloudUrl, false);

    // Polling a cada 30 segundos (em silêncio, sem travar a tela)
    const pollInterval = setInterval(() => {
      if (!isSyncingRef.current) {
        loadFromCloud(cloudUrl, true);
      }
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [cloudUrl, loadFromCloud]);

  const updateCloudUrl = (url) => {
    if (url && !validateSyncUrl(url)) {
      toast.error("URL inválida! Use HTTPS ou localhost.");
      return;
    }

    localStorage.setItem(CLOUD_URL_KEY, url);
    setCloudUrl(url);
    if (url) {
      toast.success("Link da nuvem configurado!");
      loadFromCloud(url);
    } else {
      toast.info("Sincronização desativada");
    }
  };

  const updatePetVisibility = (visible) => {
    localStorage.setItem(PET_VISIBILITY_KEY, visible.toString());
    setShowPet(visible);
  };

  const filteredData = useMemo(() => {
    const [year, month] = selectedMonth.split("-");
    const targetMonth = parseInt(month, 10);
    const targetYear = parseInt(year, 10);

    const filterByMonth = (items, dateKey) =>
      items.filter((item) => {
        const parsedDate = parseDate(item[dateKey]);
        if (!parsedDate) return false;
        return (
          parsedDate.getMonth() + 1 === targetMonth &&
          parsedDate.getFullYear() === targetYear
        );
      });

    return {
      expenses: filterByMonth(expenses, "due_date"),
      incomes: filterByMonth(incomes, "date"),
    };
  }, [expenses, incomes, selectedMonth]);

  // Summary Calculation
  const summary = useMemo(() => {
    const total_income = filteredData.incomes.reduce(
      (sum, inc) => sum + (Number(inc.value) || 0),
      0,
    );
    const total_expenses = filteredData.expenses.reduce(
      (sum, exp) => sum + (Number(exp.value) || 0),
      0,
    );

    const [year, month] = selectedMonth.split("-");
    const targetDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    const now = new Date();
    const currentRealMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const diffMonths = (targetDate.getFullYear() - currentRealMonth.getFullYear()) * 12 + (targetDate.getMonth() - currentRealMonth.getMonth());

    const total_debt = debts.reduce((sum, d) => {
      const remaining =
        (Number(d.total_amount) || 0) - (Number(d.paid_amount) || 0);
      return sum + Math.max(0, remaining);
    }, 0);

    const total_committed =
      total_expenses +
      debts.reduce((sum, d) => {
        const instVal = Number(d.installment_value) || 0;
        const tInst = d.total_installments || (instVal > 0 ? Math.ceil(d.total_amount / instVal) : 0) || 0;
        const pInst = d.paid_installments || 0;
        const remaining = Math.max(0, tInst - pInst);

        let val = instVal;
        // Se a dívida já foi paga integralmente, não compromete mais nada (no mês atual ou futuro)
        if (remaining === 0 && diffMonths >= 0) {
            val = 0;
        } else if (diffMonths >= remaining && diffMonths > 0) {
            // Se as parcelas acabarão antes do mês projetado, a dívida some para essa projeção futura
            val = 0;
        }

        return sum + val;
      }, 0);

    const available_salary = total_income - total_committed;

    return {
      total_income,
      total_expenses,
      total_debt,
      total_committed,
      available_salary,
    };
  }, [filteredData, debts, selectedMonth]);

  // Generators
  const generateId = useCallback(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }, []);
  const getNowISO = useCallback(() => new Date().toISOString(), []);

  // Actions
  const addExpense = useCallback((expenseData) => {
    const now = getNowISO();
    const newExpense = {
      ...expenseData,
      id: generateId(),
      status: expenseData.status || "pending",
      created_at: now,
      updated_at: now,
    };
    setData((prev) => ({
      ...prev,
      expenses: [...prev.expenses, newExpense],
    }));
    toast.success("Despesa adicionada!");
    return true;
  }, [generateId, getNowISO]);

  const updateExpense = useCallback((id, updates) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((exp) =>
        exp.id === id ? { ...exp, ...updates, updated_at: getNowISO() } : exp,
      ),
    }));
    toast.success("Despesa atualizada!");
  }, [getNowISO]);

  const deleteExpense = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((exp) =>
        exp.id === id
          ? { ...exp, deleted_at: getNowISO(), updated_at: getNowISO() }
          : exp,
      ),
    }));
    toast.success("Despesa excluída!");
  }, [getNowISO]);

  const addDebt = useCallback((debtData) => {
    const now = getNowISO();
    const newDebt = {
      ...debtData,
      id: generateId(),
      paid_amount: Number(debtData.paid_amount) || 0,
      created_at: now,
      updated_at: now,
    };
    setData((prev) => ({
      ...prev,
      debts: [...prev.debts, newDebt],
    }));
    toast.success("Dívida adicionada!");
    return true;
  }, [generateId, getNowISO]);

  const updateDebt = useCallback((id, updates) => {
    setData((prev) => ({
      ...prev,
      debts: prev.debts.map((d) =>
        d.id === id ? { ...d, ...updates, updated_at: getNowISO() } : d,
      ),
    }));
    toast.success("Dívida atualizada!");
  }, [getNowISO]);

  const deleteDebt = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      debts: prev.debts.map((d) =>
        d.id === id
          ? { ...d, deleted_at: getNowISO(), updated_at: getNowISO() }
          : d,
      ),
    }));
    toast.success("Dívida excluída!");
  }, [getNowISO]);

  const addIncome = useCallback((incomeData) => {
    const now = getNowISO();
    const newIncome = {
      ...incomeData,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };
    setData((prev) => ({
      ...prev,
      incomes: [...prev.incomes, newIncome],
    }));
    toast.success("Receita adicionada!");
    return true;
  }, [generateId, getNowISO]);

  const updateIncome = useCallback((id, updates) => {
    setData((prev) => ({
      ...prev,
      incomes: prev.incomes.map((inc) =>
        inc.id === id ? { ...inc, ...updates, updated_at: getNowISO() } : inc,
      ),
    }));
    toast.success("Receita atualizada!");
  }, [getNowISO]);

  const deleteIncome = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      incomes: prev.incomes.map((inc) =>
        inc.id === id
          ? { ...inc, deleted_at: getNowISO(), updated_at: getNowISO() }
          : inc,
      ),
    }));
    toast.success("Receita excluída!");
  }, [getNowISO]);

  // Core Projection Logic (reusable for manual and auto)
  const projectItems = useCallback((sourceMonthDate, targetMonthDate) => {
    const incrementDateMonth = (dateStr) => {
      const d = parseDate(dateStr);
      if (!d) return dateStr;
      return format(addMonths(d, 1), "dd/MM/yyyy");
    };

    setData((prev) => {
      const now = getNowISO();
      const nextMonthExpenses = [];
      prev.expenses.forEach((exp) => {
        if (exp.deleted_at) return;
        const expDate = parseDate(exp.due_date);

        const isSourceMonth = expDate &&
          expDate.getMonth() === sourceMonthDate.getMonth() &&
          expDate.getFullYear() === sourceMonthDate.getFullYear();

        if (exp.is_fixed && isSourceMonth) {
          // Check if it already exists in target month to avoid duplicates
          const exists = prev.expenses.some(e =>
            !e.deleted_at &&
            e.name === exp.name &&
            parseDate(e.due_date)?.getMonth() === targetMonthDate.getMonth() &&
            parseDate(e.due_date)?.getFullYear() === targetMonthDate.getFullYear()
          );

          if (!exists) {
            nextMonthExpenses.push({
              ...exp,
              id: generateId(),
              due_date: incrementDateMonth(exp.due_date),
              status: "pending",
              created_at: now,
              updated_at: now,
            });
          }
        }
      });

      const nextMonthIncomes = [];
      (prev.incomes || []).forEach((inc) => {
        if (inc.deleted_at) return;
        const incDate = parseDate(inc.date);
        const isSourceMonth = incDate &&
          incDate.getMonth() === sourceMonthDate.getMonth() &&
          incDate.getFullYear() === sourceMonthDate.getFullYear();

        if (inc.is_fixed && isSourceMonth) {
          const exists = (prev.incomes || []).some(i =>
            !i.deleted_at &&
            i.name === inc.name &&
            parseDate(i.date)?.getMonth() === targetMonthDate.getMonth() &&
            parseDate(i.date)?.getFullYear() === targetMonthDate.getFullYear()
          );

          if (!exists) {
            nextMonthIncomes.push({
              ...inc,
              id: generateId(),
              date: incrementDateMonth(inc.date),
              created_at: now,
              updated_at: now,
            });
          }
        }
      });

      const targetMonthKey = format(targetMonthDate, "yyyy-MM");

      const updatedDebts = prev.debts.map((debt) => {
        if (debt.deleted_at) return debt;

        const instVal = Number(debt.installment_value) || 0;
        const currentPaid = Number(debt.paid_amount) || 0;
        const currentInst = Number(debt.paid_installments) || 0;
        const totalAmount = Number(debt.total_amount) || 0;
        const totalInst = debt.total_installments || (instVal > 0 ? Math.ceil(totalAmount / instVal) : 0) || 0;

        // Considera concluída tanto por valor (com margem de 1 centavo para
        // absorver arredondamento de parcela) quanto por contagem de parcelas,
        // já que dívidas cujo total não divide exato pelas parcelas (ex.: 100
        // em 3x de 33,33) nunca bateriam exatamente o valor total.
        if (currentPaid >= totalAmount - EPSILON || (totalInst > 0 && currentInst >= totalInst)) {
          return debt;
        }

        const newInst = Math.min(currentInst + 1, totalInst || currentInst + 1);
        const isNowComplete = totalInst > 0 && newInst >= totalInst;
        const newPaidAmount = isNowComplete
          ? totalAmount
          : Math.min(currentPaid + instVal, totalAmount);

        return {
          ...debt,
          due_date: debt.due_date ? incrementDateMonth(debt.due_date) : debt.due_date,
          paid_installments: newInst,
          paid_amount: newPaidAmount,
          completed_month: isNowComplete ? targetMonthKey : debt.completed_month,
          updated_at: now,
        };
      });

      return {
        ...prev,
        expenses: [...prev.expenses, ...nextMonthExpenses],
        incomes: [...(prev.incomes || []), ...nextMonthIncomes],
        debts: updatedDebts,
        automation_meta: {
           ...prev.automation_meta,
           last_processed_month: targetMonthKey
        }
      };
    });
  }, [generateId, getNowISO]);

  const rollMonth = useCallback(() => {
    if (!window.confirm("Deseja projetar os lançamentos fixos para o próximo mês?")) return;
    
    const [year, month] = selectedMonth.split("-");
    const currentViewDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    const nextDate = addMonths(currentViewDate, 1);

    projectItems(currentViewDate, nextDate);
    setSelectedMonth(format(nextDate, "yyyy-MM"));
    toast.success("Lançamentos projetados e visão alterada para o próximo mês!");
  }, [selectedMonth, projectItems]);

  // Automation Effect: Triggered every 5th of the month.
  // Reavalia periodicamente (não só uma vez no mount) para cobrir o caso de a
  // aba ficar aberta e atravessar a virada do dia 5 sem recarregar a página.
  useEffect(() => {
    const automator = () => {
      const now = new Date();
      const currentDay = now.getDate();
      const currentMonthKey = format(now, "yyyy-MM");

      const lastUpdate = dataRef.current.automation_meta?.last_processed_month;

      // Se for dia 5 ou mais e ainda não processou o mês atual
      if (currentDay >= 5 && lastUpdate !== currentMonthKey) {
        const lastMonthDate = addMonths(now, -1);
        projectItems(lastMonthDate, now);
        toast.info("Automação mensal: Despesas fixas e parcelas atualizadas para o dia 5! 🚀", {
          description: "Nós carregamos suas despesas do mês passado e avançamos as parcelas dos cartões automaticamente."
        });
      }
    };

    // Pequeno delay para garantir que os dados iniciais carregaram (especialmente da nuvem)
    const initialTimer = setTimeout(automator, 3000);
    // Reavalia a cada 15 minutos, cobrindo sessões abertas por muito tempo
    const interval = setInterval(automator, 15 * 60 * 1000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [projectItems]);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute(
      "download",
      `backup_financeiro_${new Date().toISOString().split("T")[0]}.json`,
    );
    linkElement.click();
  }, [data]);

  const importData = useCallback((jsonData) => {
    try {
      const parsed =
        typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
      if (parsed.expenses) {
        if (!parsed.automation_meta) {
          parsed.automation_meta = initialData.automation_meta;
        }
        parsed.expenses = backfillTimestamps(parsed.expenses);
        parsed.debts = backfillTimestamps(parsed.debts || []);
        parsed.incomes = backfillTimestamps(parsed.incomes || []);
        setData(parsed);
        toast.success("Dados importados!");
        return true;
      }
    } catch (e) {
      toast.error("Erro ao importar");
    }
    return false;
  }, []);

  return {
    data: {
      expenses,
      debts,
      incomes,
      filteredExpenses: filteredData.expenses,
      filteredIncomes: filteredData.incomes,
      summary,
      cloudUrl,
      isSyncing,
      showPet,
      selectedMonth,
      automationMeta: data.automation_meta,
    },
    loading,
      actions: {
      fetchData: loadFromCloud,
      addExpense,
      updateExpense,
      deleteExpense,
      addDebt,
      updateDebt,
      deleteDebt,
      addIncome,
      updateIncome,
      deleteIncome,
      rollMonth,
      cloneExpense: useCallback((id, targetMonthKey) => {
        setData((prev) => {
          const expense = prev.expenses.find((e) => e.id === id && !e.deleted_at);
          if (!expense) return prev;

          const [y, m] = targetMonthKey.split("-");
          const targetDate = new Date(parseInt(y), parseInt(m) - 1, 1);

          let newDateStr = expense.due_date;
          const d = parseDate(expense.due_date);
          if (d) {
             const newD = new Date(targetDate.getFullYear(), targetDate.getMonth(), d.getDate());
             newDateStr = format(newD, "dd/MM/yyyy");
          }

          // Verificação se a despesa já foi replicada no mês
          const alreadyExists = prev.expenses.some(e =>
             !e.deleted_at &&
             e.name === expense.name &&
             parseDate(e.due_date)?.getMonth() === targetDate.getMonth() &&
             parseDate(e.due_date)?.getFullYear() === targetDate.getFullYear()
          );

          if (alreadyExists) {
             setTimeout(() => toast.error("Atenção: Esta conta já foi colocada no mês atual!"), 100);
             return prev;
          }

          const now = getNowISO();
          const newExpense = {
            ...expense,
            id: generateId(),
            due_date: newDateStr,
            status: "pending",
            created_at: now,
            updated_at: now,
          };

          setTimeout(() => toast.success("Despesa replicada para o mês selecionado!"), 100);
          return {
            ...prev,
            expenses: [...prev.expenses, newExpense]
          };
        });
      }, [generateId, getNowISO]),
      forceProjectCurrentMonth: () => {
        const now = new Date();
        const currentMonthKey = format(now, "yyyy-MM");
        
        // Prevent doubling up if already processed this month via manual or auto
        if (data.automation_meta?.last_processed_month === currentMonthKey) {
          toast.info("Atenção: O mês atual já foi processado. As despesas já foram projetadas.", {
             description: "Isso previne que suas despesas e parcelas dupliquem!"
          });
          return;
        }

        const lastMonthDate = addMonths(now, -1);
        projectItems(lastMonthDate, now);
        toast.success("Mês atualizado manualmente com gastos fixos e parcelas!");
      },
      exportData,
      importData,
      updateCloudUrl,
      updatePetVisibility,
      setSelectedMonth,
      forceSync: syncToCloud,
    },
  };
};
