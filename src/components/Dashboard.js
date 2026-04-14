import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  CreditCard,
  LayoutGrid,
  CalendarRange,
  Zap,
} from "lucide-react";
import { useFinancialData } from "../hooks/useFinancialData";

import Header from "./Header";
import FinancialGrid from "./FinancialGrid";
import Sidebar from "./Sidebar";
import HistoricalChart from "./HistoricalChart";
import DebtTracking from "./DebtTracking";
import FullAnalysis from "./FullAnalysis";
import AddTransactionModal from "./AddTransactionModal";
import AddDebtModal from "./AddDebtModal";
import AddIncomeModal from "./AddIncomeModal";
import ManageIncomesModal from "./ManageIncomesModal";
import SettingsModal from "./SettingsModal";
import FinancialPet from "./FinancialPet";

// Optimized animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const Dashboard = () => {
  const { data, loading, actions } = useFinancialData();
  const {
    expenses,
    debts,
    incomes,
    filteredExpenses,
    filteredIncomes,
    summary,
    showPet,
    selectedMonth,
  } = data;

  const [modals, setModals] = useState({
    expense: false,
    debt: false,
    income: false,
    manageIncomes: false,
    settings: false,
    analysis: false,
  });

  const toggleModal = (modal, value) => {
    setModals((prev) => ({ ...prev, [modal]: value }));
  };

  const handleAddExpense = async (expenseData) => {
    const success = await actions.addExpense(expenseData);
    if (success) toggleModal("expense", false);
  };

  const handleAddDebt = async (debtData) => {
    const success = await actions.addDebt(debtData);
    if (success) toggleModal("debt", false);
  };

  const handleAddIncome = async (incomeData) => {
    const success = await actions.addIncome(incomeData);
    if (success) toggleModal("income", false);
  };

  // Memoize action buttons to prevent re-renders
  const actionButtons = useMemo(
    () => [
      {
        label: "Próximo Mês",
        icon: CalendarRange,
        onClick: actions.rollMonth,
        className:
          "btn-base bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500 hover:text-white",
        title: "Gera automaticamente entradas do próximo mês",
        hideOnMobile: true,
      },
      {
        label: "Atualizar Mês",
        icon: Zap,
        onClick: actions.forceProjectCurrentMonth,
        className:
          "btn-base bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white",
        title: "Puxa despesas fixas e atualiza parcelas do mês atual agora",
      },
      {
        label: "Receita",
        icon: Plus,
        onClick: () => toggleModal("income", true),
        className: "btn-primary",
      },
      {
        label: "Despesa",
        icon: Minus,
        onClick: () => toggleModal("expense", true),
        className: "btn-secondary",
      },
      {
        label: "Dívida",
        icon: CreditCard,
        onClick: () => toggleModal("debt", true),
        className: "btn-destructive",
      },
    ],
    [actions.rollMonth],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
        <div className="text-white/50 text-base sm:text-xl font-heading animate-pulse text-center">
          Iniciando Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 relative">
      <Header
        summary={summary}
        onEditIncomes={() => toggleModal("manageIncomes", true)}
        onOpenSettings={() => toggleModal("settings", true)}
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 -mt-4 sm:-mt-8 relative z-10">
        {/* Month Selector & Analysis Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4"
        >
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
            <button
              onClick={() => {
                const [y, m] = selectedMonth.split("-");
                const date = new Date(parseInt(y), parseInt(m) - 1, 1);
                date.setMonth(date.getMonth() - 1);
                actions.setSelectedMonth(
                  `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`,
                );
              }}
              className="p-2 hover:bg-white/10 rounded-xl text-white transition-all"
            >
              <Minus size={16} />
            </button>
            <div className="px-6 py-2 bg-primary/10 rounded-xl border border-primary/20 flex flex-col items-center min-w-[180px]">
              <span className="text-[10px] uppercase font-black text-primary/60 tracking-widest leading-none mb-1">
                Período Selecionado
              </span>
              <span className="text-sm font-black text-white capitalize leading-none">
                {new Intl.DateTimeFormat("pt-BR", {
                  month: "long",
                  year: "numeric",
                }).format(
                  new Date(
                    parseInt(selectedMonth.split("-")[0]),
                    parseInt(selectedMonth.split("-")[1]) - 1,
                    1,
                  ),
                )}
              </span>
            </div>
            <button
              onClick={() => {
                const [y, m] = selectedMonth.split("-");
                const date = new Date(parseInt(y), parseInt(m) - 1, 1);
                date.setMonth(date.getMonth() + 1);
                actions.setSelectedMonth(
                  `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`,
                );
              }}
              className="p-2 hover:bg-white/10 rounded-xl text-white transition-all"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={() => toggleModal("analysis", true)}
            className="btn-primary shimmer group flex items-center gap-3 px-10"
          >
            <LayoutGrid size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="uppercase tracking-widest font-black text-xs">Análise Completa</span>
          </button>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Main Content Area */}
          <div className="xl:col-span-8 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Action Bar - Responsive */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col gap-4 glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-white/5 rounded-xl sm:rounded-2xl">
                  <LayoutGrid className="text-muted-foreground" size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Ações Rápidas
                  </h3>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Gerencie seus fluxos financeiros
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                {actionButtons.map((btn, idx) => {
                  const Icon = btn.icon;
                  if (btn.hideOnMobile) {
                    return (
                      <button
                        key={idx}
                        onClick={btn.onClick}
                        className={`${btn.className} hidden sm:flex`}
                        title={btn.title}
                      >
                        <Icon size={18} strokeWidth={2.5} />
                        <span className="hidden md:inline">{btn.label}</span>
                      </button>
                    );
                  }
                  return (
                    <button
                      key={idx}
                      onClick={btn.onClick}
                      className={btn.className}
                      title={btn.title}
                    >
                      <Icon
                        size={16}
                        strokeWidth={3}
                        className="sm:w-[18px] sm:h-[18px]"
                      />
                      <span className="text-xs sm:text-sm">{btn.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Charts - Responsive */}
            <motion.div variants={fadeInUp}>
              <HistoricalChart expenses={expenses} incomes={incomes} />
            </motion.div>

            {/* Data Grids - Responsive */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <motion.div variants={fadeInUp}>
                <FinancialGrid
                  expenses={filteredExpenses}
                  onUpdateExpense={actions.updateExpense}
                  onDeleteExpense={actions.deleteExpense}
                  onCloneExpense={(id) => actions.cloneExpense(id, format(new Date(), "yyyy-MM"))}
                />
              </motion.div>

              <motion.div variants={fadeInUp}>
                <DebtTracking
                  debts={debts}
                  onUpdateDebt={actions.updateDebt}
                  onDeleteDebt={actions.deleteDebt}
                />
              </motion.div>
            </div>
          </div>

          {/* Sidebar - Responsive: Bottom on mobile, side on desktop */}
          <div className="xl:col-span-4 xl:sticky xl:top-8">
            <Sidebar expenses={filteredExpenses} debts={debts} summary={summary} />
          </div>
        </motion.div>
      </main>

      {/* Persistence/Version Footer */}
      <footer className="mt-auto py-8 flex justify-center w-full relative z-10">
        <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.2em] text-center">
          Meu Financeiro v2.0 • 100% Local & Seguro
        </p>
      </footer>

      {/* Floating Pet */}
      {showPet && <FinancialPet summary={summary} />}

      {/* Modals */}
      <AnimatePresence mode="wait">
        {modals.expense && (
          <AddTransactionModal
            isOpen={modals.expense}
            onClose={() => toggleModal("expense", false)}
            onSubmit={handleAddExpense}
          />
        )}
        {modals.debt && (
          <AddDebtModal
            isOpen={modals.debt}
            onClose={() => toggleModal("debt", false)}
            onSubmit={handleAddDebt}
          />
        )}
        {modals.income && (
          <AddIncomeModal
            isOpen={modals.income}
            onClose={() => toggleModal("income", false)}
            onSubmit={handleAddIncome}
          />
        )}
        {modals.manageIncomes && (
          <ManageIncomesModal
            isOpen={modals.manageIncomes}
            onClose={() => toggleModal("manageIncomes", false)}
            incomes={filteredIncomes}
            onUpdateIncome={actions.updateIncome}
            onDeleteIncome={actions.deleteIncome}
          />
        )}
        {modals.settings && (
          <SettingsModal
            isOpen={modals.settings}
            onClose={() => toggleModal("settings", false)}
            expenses={expenses}
            debts={debts}
            incomes={incomes}
            cloudUrl={data.cloudUrl}
            isSyncing={data.isSyncing}
            showPet={showPet}
            onUpdatePetVisibility={actions.updatePetVisibility}
            onUpdateCloudUrl={actions.updateCloudUrl}
            onExportJSON={actions.exportData}
            onImportJSON={actions.importData}
          />
        )}
        {modals.analysis && (
          <FullAnalysis
            isOpen={modals.analysis}
            onClose={() => toggleModal("analysis", false)}
            expenses={expenses}
            incomes={incomes}
            debts={debts}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
