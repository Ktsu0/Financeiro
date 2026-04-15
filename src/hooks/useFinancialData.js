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

const initialData = {
  expenses: [],
  debts: [],
  incomes: [],
  automation_meta: {
    last_processed_month: format(new Date(), "yyyy-MM"), // Inicia no mês atual para evitar duplicar atualizações já feitas manualmente
  }
};

export const useFinancialData = () => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const decrypted = saved ? decryptData(saved) : null;
    const baseData = decrypted || initialData;
    // Se não tiver automation_meta (usuário antigo), define como o mês atual
    // Isso evita que o sistema tente "corrigir" o mês atual que o usuário já mexeu
    if (!baseData.automation_meta) {
      baseData.automation_meta = {
        last_processed_month: format(new Date(), "yyyy-MM")
      };
    }
    return baseData;
  });

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

  const { expenses, debts, incomes } = data;

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
        const payload = { ...data, token: GOOGLE_SCRIPT_TOKEN };

        await axios.post(targetUrl, JSON.stringify(payload), {
          headers: { "Content-Type": "text/plain;charset=utf-8" },
        });
      } catch (error) {
        console.error("Cloud Sync Error:", error);
      } finally {
        setIsSyncing(false);
      }
    },
    [cloudUrl, data],
  );

  const previousDataHashRef = useRef("");
  const initialLoadDoneRef = useRef(false);

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
          const newData = response.data;
          // Garantir metadados no item vindo da nuvem
          if (!newData.automation_meta) {
            newData.automation_meta = initialData.automation_meta;
          }
          const newDataString = JSON.stringify(newData);

          if (newDataString !== previousDataHashRef.current) {
            previousDataHashRef.current = newDataString;
            setData(newData);
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
        previousDataHashRef.current = currentDataString;
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
    const newExpense = {
      ...expenseData,
      id: generateId(),
      status: expenseData.status || "pending",
      created_at: getNowISO(),
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
        exp.id === id ? { ...exp, ...updates } : exp,
      ),
    }));
    toast.success("Despesa atualizada!");
  }, []);

  const deleteExpense = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((exp) => exp.id !== id),
    }));
    toast.success("Despesa excluída!");
  }, []);

  const addDebt = useCallback((debtData) => {
    const newDebt = {
      ...debtData,
      id: generateId(),
      paid_amount: Number(debtData.paid_amount) || 0,
      created_at: getNowISO(),
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
      debts: prev.debts.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }));
    toast.success("Dívida atualizada!");
  }, []);

  const deleteDebt = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      debts: prev.debts.filter((d) => d.id !== id),
    }));
    toast.success("Dívida excluída!");
  }, []);

  const addIncome = useCallback((incomeData) => {
    const newIncome = {
      ...incomeData,
      id: generateId(),
      created_at: getNowISO(),
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
        inc.id === id ? { ...inc, ...updates } : inc,
      ),
    }));
    toast.success("Receita atualizada!");
  }, []);

  const deleteIncome = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      incomes: prev.incomes.filter((inc) => inc.id !== id),
    }));
    toast.success("Receita excluída!");
  }, []);

  // Core Projection Logic (reusable for manual and auto)
  const projectItems = useCallback((sourceMonthDate, targetMonthDate) => {
    const incrementDateMonth = (dateStr) => {
      const d = parseDate(dateStr);
      if (!d) return dateStr;
      return format(addMonths(d, 1), "dd/MM/yyyy");
    };

    setData((prev) => {
      const nextMonthExpenses = [];
      prev.expenses.forEach((exp) => {
        const expDate = parseDate(exp.due_date);

        const isSourceMonth = expDate && 
          expDate.getMonth() === sourceMonthDate.getMonth() && 
          expDate.getFullYear() === sourceMonthDate.getFullYear();
          expDate.getMonth() === sourceMonthDate.getMonth() && 
          expDate.getFullYear() === sourceMonthDate.getFullYear();

        if (exp.is_fixed && isSourceMonth) {
          // Check if it already exists in target month to avoid duplicates
          const exists = prev.expenses.some(e => 
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
              created_at: getNowISO(),
            });
          }
        }
      });

      const nextMonthIncomes = [];
      (prev.incomes || []).forEach((inc) => {
        const incDate = parseDate(inc.date);
        const isSourceMonth = incDate && 
          incDate.getMonth() === sourceMonthDate.getMonth() && 
          incDate.getFullYear() === sourceMonthDate.getFullYear();

        if (inc.is_fixed && isSourceMonth) {
          const exists = (prev.incomes || []).some(i => 
            i.name === inc.name && 
            parseDate(i.date)?.getMonth() === targetMonthDate.getMonth() &&
            parseDate(i.date)?.getFullYear() === targetMonthDate.getFullYear()
          );

          if (!exists) {
            nextMonthIncomes.push({
              ...inc,
              id: generateId(),
              date: incrementDateMonth(inc.date),
              created_at: getNowISO(),
            });
          }
        }
      });

      const updatedDebts = prev.debts.map((debt) => {
        const instVal = Number(debt.installment_value) || 0;
        const currentPaid = Number(debt.paid_amount) || 0;
        const currentInst = Number(debt.paid_installments) || 0;
        const totalInst = debt.total_installments || (instVal > 0 ? Math.ceil(debt.total_amount / instVal) : 0) || 0;

        return {
          ...debt,
          paid_installments: Math.min(currentInst + 1, totalInst),
          paid_amount: Math.min(
            currentPaid + instVal,
            Number(debt.total_amount) || 0,
          ),
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

  // Automation Effect: Triggered every 5th of the month
  useEffect(() => {
    const automator = () => {
      const now = new Date();
      const currentDay = now.getDate();
      const currentMonthKey = format(now, "yyyy-MM");
      
      const lastUpdate = data.automation_meta?.last_processed_month;
      
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
    const timer = setTimeout(automator, 3000);
    return () => clearTimeout(timer);
  }, [data.automation_meta, projectItems]);

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
          const expense = prev.expenses.find((e) => e.id === id);
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
             e.name === expense.name &&
             parseDate(e.due_date)?.getMonth() === targetDate.getMonth() &&
             parseDate(e.due_date)?.getFullYear() === targetDate.getFullYear()
          );

          if (alreadyExists) {
             setTimeout(() => toast.error("Atenção: Esta conta já foi colocada no mês atual!"), 100);
             return prev;
          }

          const newExpense = {
            ...expense,
            id: generateId(),
            due_date: newDateStr,
            status: "pending",
            created_at: getNowISO()
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
