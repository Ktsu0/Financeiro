import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parse, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import Header from './Header';
import FinancialGrid from './FinancialGrid';
import Sidebar from './Sidebar';
import HistoricalChart from './HistoricalChart';
import DebtTracking from './DebtTracking';
import AddTransactionModal from './AddTransactionModal';
import AddDebtModal from './AddDebtModal';
import AddIncomeModal from './AddIncomeModal';
import ExportButtons from './ExportButtons';

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
    available_salary: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, debtsRes, incomesRes, summaryRes] = await Promise.all([
        axios.get(`${API}/expenses`),
        axios.get(`${API}/debts`),
        axios.get(`${API}/incomes`),
        axios.get(`${API}/summary`)
      ]);
      
      setExpenses(expensesRes.data);
      setDebts(debtsRes.data);
      setIncomes(incomesRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add expense
  const handleAddExpense = async (expenseData) => {
    try {
      await axios.post(`${API}/expenses`, expenseData);
      toast.success('Despesa adicionada com sucesso!');
      fetchData();
      setShowAddExpense(false);
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Erro ao adicionar despesa');
    }
  };

  // Update expense
  const handleUpdateExpense = async (id, updates) => {
    try {
      await axios.put(`${API}/expenses/${id}`, updates);
      toast.success('Despesa atualizada!');
      fetchData();
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Erro ao atualizar despesa');
    }
  };

  // Delete expense
  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`${API}/expenses/${id}`);
      toast.success('Despesa excluída!');
      fetchData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Erro ao excluir despesa');
    }
  };

  // Add debt
  const handleAddDebt = async (debtData) => {
    try {
      await axios.post(`${API}/debts`, debtData);
      toast.success('Dívida adicionada com sucesso!');
      fetchData();
      setShowAddDebt(false);
    } catch (error) {
      console.error('Error adding debt:', error);
      toast.error('Erro ao adicionar dívida');
    }
  };

  // Update debt
  const handleUpdateDebt = async (id, updates) => {
    try {
      await axios.put(`${API}/debts/${id}`, updates);
      toast.success('Dívida atualizada!');
      fetchData();
    } catch (error) {
      console.error('Error updating debt:', error);
      toast.error('Erro ao atualizar dívida');
    }
  };

  // Delete debt
  const handleDeleteDebt = async (id) => {
    try {
      await axios.delete(`${API}/debts/${id}`);
      toast.success('Dívida excluída!');
      fetchData();
    } catch (error) {
      console.error('Error deleting debt:', error);
      toast.error('Erro ao excluir dívida');
    }
  };

  // Add income
  const handleAddIncome = async (incomeData) => {
    try {
      await axios.post(`${API}/incomes`, incomeData);
      toast.success('Receita adicionada com sucesso!');
      fetchData();
      setShowAddIncome(false);
    } catch (error) {
      console.error('Error adding income:', error);
      toast.error('Erro ao adicionar receita');
    }
  };

  // Update income
  const handleUpdateIncome = async (id, updates) => {
    try {
      await axios.put(`${API}/incomes/${id}`, updates);
      toast.success('Receita atualizada!');
      fetchData();
    } catch (error) {
      console.error('Error updating income:', error);
      toast.error('Erro ao atualizar receita');
    }
  };

  // Delete income
  const handleDeleteIncome = async (id) => {
    try {
      await axios.delete(`${API}/incomes/${id}`);
      toast.success('Receita excluída!');
      fetchData();
    } catch (error) {
      console.error('Error deleting income:', error);
      toast.error('Erro ao excluir receita');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-xl font-heading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header summary={summary} />
      
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Quick Action Buttons */}
            <div className="flex gap-4 flex-wrap">
              <button
                data-testid="add-income-btn"
                onClick={() => setShowAddIncome(true)}
                className="bg-primary text-primary-foreground hover:bg-[#00CC76] font-bold shadow-[0_0_15px_rgba(0,255,148,0.4)] hover:scale-105 active:scale-95 rounded-full px-6 py-2 font-heading"
              >
                + Adicionar Receita
              </button>
              <button
                data-testid="add-expense-btn"
                onClick={() => setShowAddExpense(true)}
                className="bg-transparent border border-destructive text-destructive hover:bg-destructive/10 font-medium rounded-full px-6 py-2 font-heading"
              >
                + Adicionar Despesa
              </button>
              <button
                data-testid="add-debt-btn"
                onClick={() => setShowAddDebt(true)}
                className="bg-transparent border border-destructive text-destructive hover:bg-destructive/10 font-medium rounded-full px-6 py-2 font-heading"
              >
                + Adicionar Dívida
              </button>
            </div>

            {/* Export Buttons */}
            <ExportButtons expenses={expenses} debts={debts} incomes={incomes} />

            {/* Historical Chart */}
            <HistoricalChart expenses={expenses} incomes={incomes} />

            {/* Financial Grid */}
            <FinancialGrid
              expenses={expenses}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
            />

            {/* Debt Tracking */}
            <DebtTracking
              debts={debts}
              onUpdateDebt={handleUpdateDebt}
              onDeleteDebt={handleDeleteDebt}
            />
          </div>

          {/* Sidebar */}
          <Sidebar expenses={expenses} debts={debts} summary={summary} />
        </div>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onSubmit={handleAddExpense}
      />
      <AddDebtModal
        isOpen={showAddDebt}
        onClose={() => setShowAddDebt(false)}
        onSubmit={handleAddDebt}
      />
      <AddIncomeModal
        isOpen={showAddIncome}
        onClose={() => setShowAddIncome(false)}
        onSubmit={handleAddIncome}
      />
    </div>
  );
};

export default Dashboard;
