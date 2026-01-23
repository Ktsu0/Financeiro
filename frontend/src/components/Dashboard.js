import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  CreditCard,
  LayoutGrid,
  CalendarRange,
} from "lucide-react";
import Header from "./Header";
import FinancialGrid from "./FinancialGrid";
import Sidebar from "./Sidebar";
import HistoricalChart from "./HistoricalChart";
import DebtTracking from "./DebtTracking";
import AddTransactionModal from "./AddTransactionModal";
import AddDebtModal from "./AddDebtModal";
import AddIncomeModal from "./AddIncomeModal";
import ExportButtons from "./ExportButtons";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
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
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);

  // Optimized Fetch all data
  const fetchData = React.useCallback(async () => {
    try {
      // Don't set global loading if we already have data (silent refresh)
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

  // Memoized Handlers
  const handleAddExpense = React.useCallback(
    async (expenseData) => {
      try {
        await axios.post(`${API}/expenses`, expenseData);
        toast.success("Despesa adicionada com sucesso!");
        fetchData();
        setShowAddExpense(false);
      } catch (error) {
        toast.error("Erro ao adicionar despesa");
      }
    },
    [fetchData],
  );

  const handleUpdateExpense = React.useCallback(
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

  const handleDeleteExpense = React.useCallback(
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

  const handleAddDebt = React.useCallback(
    async (debtData) => {
      try {
        await axios.post(`${API}/debts`, debtData);
        toast.success("Dívida adicionada com sucesso!");
        fetchData();
        setShowAddDebt(false);
      } catch (error) {
        toast.error("Erro ao adicionar dívida");
      }
    },
    [fetchData],
  );

  const handleUpdateDebt = React.useCallback(
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

  const handleDeleteDebt = React.useCallback(
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

  const handleAddIncome = React.useCallback(
    async (incomeData) => {
      try {
        await axios.post(`${API}/incomes`, incomeData);
        toast.success("Receita adicionada com sucesso!");
        fetchData();
        setShowAddIncome(false);
      } catch (error) {
        toast.error("Erro ao adicionar receita");
      }
    },
    [fetchData],
  );

  const handleRollMonth = React.useCallback(async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
        <div className="text-white/50 text-xl font-heading animate-pulse">
          Iniciando Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header summary={summary} />

      <main className="max-w-[1600px] mx-auto px-6 lg:px-12 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Space */}
          <div className="lg:col-span-8 space-y-8">
            {/* Action Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-6 glass-card p-6 rounded-3xl"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl">
                  <LayoutGrid className="text-muted-foreground" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Ações Rápidas
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Gerencie seus fluxos financeiros
                  </p>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap justify-center sm:justify-end flex-1">
                <button
                  onClick={handleRollMonth}
                  className="btn-base bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500 hover:text-white"
                  title="Gera automaticamente entradas do próximo mês"
                >
                  <CalendarRange size={18} strokeWidth={2.5} />
                  <span>Próximo Mês</span>
                </button>
                <button
                  onClick={() => setShowAddIncome(true)}
                  className="btn-primary"
                >
                  <Plus size={18} strokeWidth={3} />
                  <span>Receita</span>
                </button>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="btn-secondary"
                >
                  <Minus size={18} strokeWidth={3} />
                  <span>Despesa</span>
                </button>
                <button
                  onClick={() => setShowAddDebt(true)}
                  className="btn-destructive"
                >
                  <CreditCard size={18} strokeWidth={2.5} />
                  <span>Dívida</span>
                </button>
              </div>
            </motion.div>

            {/* Export & Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="px-8"
            >
              <ExportButtons
                expenses={expenses}
                debts={debts}
                incomes={incomes}
              />
            </motion.div>

            {/* Charts Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <HistoricalChart expenses={expenses} incomes={incomes} />
            </motion.div>

            {/* Grids */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <FinancialGrid
                  expenses={expenses}
                  onUpdateExpense={handleUpdateExpense}
                  onDeleteExpense={handleDeleteExpense}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <DebtTracking
                  debts={debts}
                  onUpdateDebt={handleUpdateDebt}
                  onDeleteDebt={handleDeleteDebt}
                />
              </motion.div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 sticky top-8">
            <Sidebar expenses={expenses} debts={debts} summary={summary} />
          </div>
        </div>
      </main>

      {/* Modals with AnimatePresence */}
      <AnimatePresence>
        {showAddExpense && (
          <AddTransactionModal
            isOpen={showAddExpense}
            onClose={() => setShowAddExpense(false)}
            onSubmit={handleAddExpense}
          />
        )}
        {showAddDebt && (
          <AddDebtModal
            isOpen={showAddDebt}
            onClose={() => setShowAddDebt(false)}
            onSubmit={handleAddDebt}
          />
        )}
        {showAddIncome && (
          <AddIncomeModal
            isOpen={showAddIncome}
            onClose={() => setShowAddIncome(false)}
            onSubmit={handleAddIncome}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
