import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import axios from "axios";
import { addMonths, parse, format, isValid } from "date-fns";
import { encryptData, decryptData, validateSyncUrl } from "../utils/security";

const STORAGE_KEY = "@financeiro_v1_data";
const CLOUD_URL_KEY = "@financeiro_cloud_url";
const PET_VISIBILITY_KEY = "@financeiro_show_pet";
const GOOGLE_SCRIPT_TOKEN =
  process.env.REACT_APP_GOOGLE_APPS_SCRIPT_TOKEN || "07102024";

const initialData = {
  expenses: [],
  debts: [],
  incomes: [],
};

export const useFinancialData = () => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    // Tenta decifrar. Se falhar ou for nulo, usa dados iniciais.
    const decrypted = saved ? decryptData(saved) : null;
    return decrypted || initialData;
  });

  const [cloudUrl, setCloudUrl] = useState(
    () => localStorage.getItem(CLOUD_URL_KEY) || "",
  );
  const [showPet, setShowPet] = useState(
    () => localStorage.getItem(PET_VISIBILITY_KEY) !== "false",
  );
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Persistence Local & Auto-sync
  useEffect(() => {
    // Encrypt data before saving to localStorage
    const encrypted = encryptData(data);
    if (encrypted) {
      localStorage.setItem(STORAGE_KEY, encrypted);
    }

    if (cloudUrl) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        syncToCloud();
      }, 2000);
    }
  }, [data, cloudUrl]);

  const { expenses, debts, incomes } = data;

  // Cloud Actions
  const syncToCloud = async (targetUrl = cloudUrl) => {
    if (!targetUrl) return;

    if (!validateSyncUrl(targetUrl)) {
      console.warn("URL insegura ou inválida para sync:", targetUrl);
      return;
    }
    try {
      setIsSyncing(true);
      // Inclui token de seguranca no payload
      const payload = { ...data, token: GOOGLE_SCRIPT_TOKEN };

      await axios.post(targetUrl, JSON.stringify(payload), {
        headers: { "Content-Type": "text/plain;charset=utf-8" },
      });
    } catch (error) {
      console.error("Cloud Sync Error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const loadFromCloud = useCallback(
    async (targetUrl = cloudUrl) => {
      if (!targetUrl) return;
      try {
        setLoading(true);
        const response = await axios.get(targetUrl);
        if (response.data && response.data.expenses) {
          setData(response.data);
          toast.success("Dados carregados da nuvem!");
        }
      } catch (error) {
        console.error("Load Error:", error);
        toast.error("Erro ao buscar dados da nuvem");
      } finally {
        setLoading(false);
      }
    },
    [cloudUrl],
  );

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

  // Summary Calculation
  const summary = useMemo(() => {
    const total_income = incomes.reduce(
      (sum, inc) => sum + (Number(inc.value) || 0),
      0,
    );
    const total_expenses = expenses.reduce(
      (sum, exp) => sum + (Number(exp.value) || 0),
      0,
    );

    const total_debt = debts.reduce((sum, d) => {
      const remaining =
        (Number(d.total_amount) || 0) - (Number(d.paid_amount) || 0);
      return sum + Math.max(0, remaining);
    }, 0);

    const total_committed =
      total_expenses +
      debts.reduce((sum, d) => sum + (Number(d.installment_value) || 0), 0);
    const available_salary = total_income - total_committed;

    return {
      total_income,
      total_expenses,
      total_debt,
      total_committed,
      available_salary,
    };
  }, [expenses, debts, incomes]);

  // Generators
  const generateId = () => crypto.randomUUID();
  const getNowISO = () => new Date().toISOString();

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
  }, []);

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
  }, []);

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
  }, []);

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

  const rollMonth = useCallback(() => {
    if (!window.confirm("Deseja iniciar o próximo mês?")) return;

    setData((prev) => {
      const newExpenses = [];
      const newIncomes = [];
      const updatedDebts = prev.debts.map((debt) => ({
        ...debt,
        paid_amount: Math.min(
          (Number(debt.paid_amount) || 0) +
            (Number(debt.installment_value) || 0),
          Number(debt.total_amount) || 0,
        ),
      }));

      const incrementMonth = (dateStr) => {
        try {
          // Parse string "DD/MM/YYYY" to Date object
          const date = parse(dateStr, "dd/MM/yyyy", new Date());

          if (!isValid(date)) return dateStr;

          // Add 1 month safely (handles leap years and different month lengths)
          const newDate = addMonths(date, 1);

          // Format back to "DD/MM/YYYY"
          return format(newDate, "dd/MM/yyyy");
        } catch (e) {
          console.error("Date error:", e);
          return dateStr;
        }
      };

      prev.expenses.forEach((exp) => {
        if (exp.is_fixed) {
          newExpenses.push({
            ...exp,
            id: generateId(),
            due_date: incrementMonth(exp.due_date),
            status: "pending",
            created_at: getNowISO(),
          });
        }
      });

      prev.incomes.forEach((inc) => {
        newIncomes.push({
          ...inc,
          id: generateId(),
          date: incrementMonth(inc.date),
          created_at: getNowISO(),
        });
      });

      return {
        expenses: [...prev.expenses, ...newExpenses],
        incomes: [...prev.incomes, ...newIncomes],
        debts: updatedDebts,
      };
    });
    toast.success("Próximo mês iniciado!");
  }, []);

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
    data: { expenses, debts, incomes, summary, cloudUrl, isSyncing, showPet },
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
      exportData,
      importData,
      updateCloudUrl,
      updatePetVisibility,
      forceSync: syncToCloud,
    },
  };
};
