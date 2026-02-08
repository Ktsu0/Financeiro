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

      <div className="max-w-[1600px] mx-auto px-[4%] sm:px-[6%] lg:px-12 py-5 sm:py-8 lg:py-10 relative">
        {/* Top Section with Title and Settings */}
        <div className="flex items-start justify-between gap-4 mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 min-w-0"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Wallet className="text-primary" size={18} />
              </div>
              <h1
                className="text-xl sm:text-3xl font-extrabold tracking-tight font-heading text-white truncate"
                data-testid="app-title"
              >
                <span className="animate-rgb">Minhas Finanças</span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-sm text-muted-foreground font-body max-w-[80%] sm:max-w-xs leading-tight">
              Sua gestão financeira de próxima geração
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="shrink-0"
          >
            <button
              onClick={onOpenSettings}
              className="group relative p-3 sm:p-4 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 rounded-2xl transition-all duration-300 flex items-center gap-2 shadow-lg"
              title="Configurações"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Settings
                className="text-muted-foreground group-hover:text-primary transition-colors group-hover:rotate-90 duration-500"
                size={20}
              />
              <span className="hidden md:block text-sm font-bold text-white/70 group-hover:text-white">
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
          className="grid grid-cols-1 md:grid-cols-2 gap-[4%] sm:gap-6"
        >
          {/* Available Salary Card */}
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 neon-glow relative overflow-hidden group"
            data-testid="available-salary-card"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <TrendingUp size={60} className="sm:w-20 sm:h-20" />
            </div>

            <div className="relative flex flex-col h-full justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Capital Disponível
                  </p>
                </div>

                <div className="flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <h2
                      className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-white mb-1 truncate"
                      data-testid="available-salary-value"
                    >
                      {formatCurrency(summary.available_salary)}
                    </h2>
                    <div className="flex items-center gap-1.5 text-primary text-[10px] sm:text-sm font-medium">
                      <ArrowUpRight size={14} className="shrink-0" />
                      <span className="truncate">
                        +{formatCurrency(summary.total_income)} entrada total
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <div className="p-3 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20">
                      <TrendingUp size={20} strokeWidth={2.5} />
                    </div>
                    <button
                      onClick={onEditIncomes}
                      className="p-2 sm:p-2.5 bg-white/10 hover:bg-primary/20 text-white border border-white/10 rounded-xl transition-all flex items-center justify-center"
                      title="Gerenciar Receitas"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Total Committed Card */}
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 neon-glow-red relative overflow-hidden group"
            data-testid="total-committed-card"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <TrendingDown size={60} className="sm:w-20 sm:h-20" />
            </div>
            <div className="relative flex flex-col h-full justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Total Comprometido
                  </p>
                </div>

                <div className="flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <h2
                      className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-white mb-1 truncate"
                      data-testid="total-committed-value"
                    >
                      {formatCurrency(summary.total_committed)}
                    </h2>
                    <div className="flex items-center gap-1.5 text-destructive text-[10px] sm:text-sm font-medium">
                      <ArrowDownRight size={14} className="shrink-0" />
                      <span className="truncate">
                        {formatCurrency(summary.total_expenses)} fixas +{" "}
                        {formatCurrency(summary.total_debt)} dívidas
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-destructive text-destructive-foreground rounded-xl shadow-lg shadow-destructive/20 shrink-0">
                    <TrendingDown size={20} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
});

export default Header;
