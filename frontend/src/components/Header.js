import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "../utils";

const Header = React.memo(({ summary, onEditIncomes, onOpenSettings }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <header className="relative overflow-hidden border-b border-white/5 bg-card/30 backdrop-blur-md">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px]" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-10 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg sm:rounded-xl">
                <Wallet className="text-primary" size={20} />
              </div>
              <h1
                className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white"
                data-testid="app-title"
              >
                <span className="animate-rgb">Minhas Finanças</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-body max-w-xs">
              Sua gestão financeira de próxima geração
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 sm:gap-4"
          >
            <button
              onClick={onOpenSettings}
              className="group relative p-3 sm:p-4 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 rounded-2xl sm:rounded-[1.5rem] transition-all duration-300 flex items-center gap-3 overflow-hidden shadow-lg"
              title="Configurações"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Settings
                className="text-muted-foreground group-hover:text-primary transition-colors group-hover:rotate-90 duration-500"
                size={20}
              />
              <span className="hidden sm:block text-sm font-bold text-white/70 group-hover:text-white transition-colors">
                Ajustes
              </span>
            </button>
          </motion.div>
        </div>

        {/* Cards Section - Responsive Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Available Salary Card */}
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 neon-glow relative overflow-hidden group"
            data-testid="available-salary-card"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={60} className="sm:w-20 sm:h-20" />
            </div>
            <div className="relative flex items-start justify-between">
              <div className="space-y-2 sm:space-y-4 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Capital Disponível
                  </p>
                </div>
                <div>
                  <h2
                    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-white mb-1 sm:mb-2"
                    data-testid="available-salary-value"
                  >
                    {formatCurrency(summary.available_salary)}
                  </h2>
                  <div className="flex items-center gap-2 text-primary text-xs sm:text-sm font-medium">
                    <ArrowUpRight size={14} className="sm:w-4 sm:h-4" />
                    <span className="truncate">
                      +{formatCurrency(summary.total_income)} entrada total
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-2">
                <div className="p-2 sm:p-3 lg:p-4 bg-primary text-primary-foreground rounded-xl sm:rounded-2xl shadow-xl shadow-primary/20">
                  <TrendingUp
                    size={18}
                    strokeWidth={2.5}
                    className="sm:w-6 sm:h-6"
                  />
                </div>
                <button
                  onClick={onEditIncomes}
                  className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg sm:rounded-xl transition-all flex items-center justify-center"
                  title="Gerenciar Receitas"
                >
                  <Edit2 size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Total Committed Card */}
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 neon-glow-red relative overflow-hidden group"
            data-testid="total-committed-card"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingDown size={60} className="sm:w-20 sm:h-20" />
            </div>
            <div className="relative flex items-start justify-between">
              <div className="space-y-2 sm:space-y-4 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Total Comprometido
                  </p>
                </div>
                <div>
                  <h2
                    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-white mb-1 sm:mb-2"
                    data-testid="total-committed-value"
                  >
                    {formatCurrency(summary.total_committed)}
                  </h2>
                  <div className="flex items-center gap-2 text-destructive text-xs sm:text-sm font-medium">
                    <ArrowDownRight size={14} className="sm:w-4 sm:h-4" />
                    <span className="truncate">
                      {formatCurrency(summary.total_expenses)} fixas +{" "}
                      {formatCurrency(summary.total_debt)} dívidas
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-2 sm:p-3 lg:p-4 bg-destructive text-destructive-foreground rounded-xl sm:rounded-2xl shadow-xl shadow-destructive/20 ml-2">
                <TrendingDown
                  size={18}
                  strokeWidth={2.5}
                  className="sm:w-6 sm:h-6"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
});

export default Header;
