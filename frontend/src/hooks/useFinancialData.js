import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const useFinancialData = () => {
  const [expenses, setExpenses] = useState([]);
  const [debts, setDebts] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expenses: 0,
    total_debt: 0,
    total_committed: 0,
    available_salary: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      if (expenses.length === 0) setLoading(true);

      const [expensesRes, debtsRes, incomesRes, summaryRes] = await Promise.all(
        [
          axios.get(`${API}/expenses`),
          axios.get(`${API}/debts`),
          axios.get(`${API}/incomes`),
          axios.get(`${API}/summary`),
        ],
      );

      setExpenses(expensesRes.data);
      setDebts(debtsRes.data);
      setIncomes(incomesRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [expenses.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Actions
  const addExpense = useCallback(
    async (expenseData) => {
      try {
        await axios.post(`${API}/expenses`, expenseData);
        toast.success("Despesa adicionada com sucesso!");
        fetchData();
        return true;
      } catch (error) {
        toast.error("Erro ao adicionar despesa");
        return false;
      }
    },
    [fetchData],
  );

  const updateExpense = useCallback(
    async (id, updates) => {
      try {
        await axios.put(`${API}/expenses/${id}`, updates);
        toast.success("Despesa atualizada!");
        fetchData();
      } catch (error) {
        toast.error("Erro ao atualizar despesa");
      }
    },
    [fetchData],
  );

  const deleteExpense = useCallback(
    async (id) => {
      try {
        await axios.delete(`${API}/expenses/${id}`);
        toast.success("Despesa excluída!");
        fetchData();
      } catch (error) {
        toast.error("Erro ao excluir despesa");
      }
    },
    [fetchData],
  );

  const addDebt = useCallback(
    async (debtData) => {
      try {
        await axios.post(`${API}/debts`, debtData);
        toast.success("Dívida adicionada com sucesso!");
        fetchData();
        return true;
      } catch (error) {
        toast.error("Erro ao adicionar dívida");
        return false;
      }
    },
    [fetchData],
  );

  const updateDebt = useCallback(
    async (id, updates) => {
      try {
        await axios.put(`${API}/debts/${id}`, updates);
        toast.success("Dívida atualizada!");
        fetchData();
      } catch (error) {
        toast.error("Erro ao atualizar dívida");
      }
    },
    [fetchData],
  );

  const deleteDebt = useCallback(
    async (id) => {
      try {
        await axios.delete(`${API}/debts/${id}`);
        toast.success("Dívida excluída!");
        fetchData();
      } catch (error) {
        toast.error("Erro ao excluir dívida");
      }
    },
    [fetchData],
  );

  const addIncome = useCallback(
    async (incomeData) => {
      try {
        await axios.post(`${API}/incomes`, incomeData);
        toast.success("Receita adicionada com sucesso!");
        fetchData();
        return true;
      } catch (error) {
        toast.error("Erro ao adicionar receita");
        return false;
      }
    },
    [fetchData],
  );

  const updateIncome = useCallback(
    async (id, updates) => {
      try {
        await axios.put(`${API}/incomes/${id}`, updates);
        toast.success("Receita atualizada!");
        fetchData();
      } catch (error) {
        toast.error("Erro ao atualizar receita");
      }
    },
    [fetchData],
  );

  const deleteIncome = useCallback(
    async (id) => {
      try {
        await axios.delete(`${API}/incomes/${id}`);
        toast.success("Receita excluída!");
        fetchData();
      } catch (error) {
        toast.error("Erro ao excluir receita");
      }
    },
    [fetchData],
  );

  const rollMonth = useCallback(async () => {
    if (
      window.confirm(
        "Isso irá criar cópias de todas as despesas fixas e receitas para o próximo mês. Deseja continuar?",
      )
    ) {
      try {
        const response = await axios.post(`${API}/roll-month`);
        toast.success(response.data.message);
        fetchData();
      } catch (error) {
        toast.error("Erro ao processar próximo mês");
      }
    }
  }, [fetchData]);

  return {
    data: { expenses, debts, incomes, summary },
    loading,
    actions: {
      fetchData,
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
    },
  };
};
