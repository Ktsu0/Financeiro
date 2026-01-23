import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "../utils";

const Header = React.memo(({ summary, onEditIncomes }) => {
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

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Wallet className="text-primary" size={24} />
              </div>
              <h1
                className="text-3xl font-extrabold tracking-tight font-heading text-white"
                data-testid="app-title"
              >
                NEON<span className="text-primary italic">FINANCE</span>
              </h1>
            </div>
            <p className="text-sm text-muted-foreground font-body max-w-xs">
              Sua gestão financeira de próxima geração, simples e poderosa.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Estado Atual
              </p>
              <p className="text-sm font-medium text-white">
                Consolidado em Tempo Real
              </p>
            </div>
            <div className="h-10 w-[1px] bg-white/10 hidden sm:block" />
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold"
                >
                  {i}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Available Salary */}
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-2xl p-8 neon-glow relative overflow-hidden group"
            data-testid="available-salary-card"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={80} />
            </div>
            <div className="relative flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Capital Disponível
                  </p>
                </div>
                <div>
                  <h2
                    className="text-5xl font-extrabold font-heading tracking-tight text-white mb-2"
                    data-testid="available-salary-value"
                  >
                    {formatCurrency(summary.available_salary)}
                  </h2>
                  <div className="flex items-center gap-2 text-primary text-sm font-medium">
                    <ArrowUpRight size={16} />
                    <span>
                      +{formatCurrency(summary.total_income)} entrada total
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="p-4 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/20">
                  <TrendingUp size={24} strokeWidth={2.5} />
                </div>
                <button
                  onClick={onEditIncomes}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-xl transition-all flex items-center justify-center"
                  title="Gerenciar Receitas"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Total Committed */}
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-2xl p-8 neon-glow-red relative overflow-hidden group"
            data-testid="total-committed-card"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingDown size={80} />
            </div>
            <div className="relative flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Total Comprometido
                  </p>
                </div>
                <div>
                  <h2
                    className="text-5xl font-extrabold font-heading tracking-tight text-white mb-2"
                    data-testid="total-committed-value"
                  >
                    {formatCurrency(summary.total_committed)}
                  </h2>
                  <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                    <ArrowDownRight size={16} />
                    <span>
                      {" "}
                      {formatCurrency(summary.total_expenses)} fixas +{" "}
                      {formatCurrency(summary.total_debt)} dívidas
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-destructive text-destructive-foreground rounded-2xl shadow-xl shadow-destructive/20">
                <TrendingDown size={24} strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
});

export default Header;
