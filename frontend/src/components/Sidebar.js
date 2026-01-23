import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Progress } from "./ui/progress";
import { motion } from "framer-motion";
import { PieChart as PieIcon, Activity, Target } from "lucide-react";
import { formatCurrency } from "../utils";

const Sidebar = ({ expenses, debts, summary }) => {
  // Calculate spending by category
  const categoryData = useMemo(
    () =>
      expenses.reduce((acc, expense) => {
        const existing = acc.find((item) => item.name === expense.category);
        if (existing) {
          existing.value += expense.value;
        } else {
          acc.push({ name: expense.category, value: expense.value });
        }
        return acc;
      }, []),
    [expenses],
  );

  const COLORS = ["#22c55e", "#f43f5e", "#3b82f6", "#eab308", "#a855f7"];

  // Calculate debt progress
  const { totalDebtAmount, totalPaidAmount, debtProgress } = useMemo(() => {
    const tDebt = debts.reduce((sum, d) => sum + d.total_amount, 0);
    const tPaid = debts.reduce((sum, d) => sum + d.paid_amount, 0);
    const progress = tDebt > 0 ? (tPaid / tDebt) * 100 : 0;
    return {
      totalDebtAmount: tDebt,
      totalPaidAmount: tPaid,
      debtProgress: progress,
    };
  }, [debts]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl">
          <p className="text-white font-body font-bold text-sm mb-1">
            {payload[0].name}
          </p>
          <p className="text-primary font-mono font-bold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <aside className="w-full lg:w-96 space-y-8" data-testid="sidebar">
      {/* Spending Distribution */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={itemVariants}
        className="glass-card rounded-3xl p-8"
        data-testid="spending-distribution-card"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-lg">
            <PieIcon size={20} className="text-primary" />
          </div>
          <h3 className="text-xl font-bold font-heading text-white">
            Distribuição
          </h3>
        </div>

        {categoryData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <PieIcon size={32} className="text-muted-foreground opacity-20" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              Ainda não há dados <br /> de gastos registrados.
            </p>
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Debt Payoff Progress */}
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        variants={itemVariants}
        className="glass-card rounded-3xl p-8"
        data-testid="debt-progress-card"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Target size={20} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-bold font-heading text-white">
            Progresso Geral
          </h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Total Pago
                </p>
                <p
                  className="text-2xl font-bold font-heading text-primary"
                  data-testid="debt-paid-amount"
                >
                  {formatCurrency(totalPaidAmount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Meta Total
                </p>
                <p
                  className="text-lg font-bold font-heading text-white/50"
                  data-testid="debt-total-amount"
                >
                  {formatCurrency(totalDebtAmount)}
                </p>
              </div>
            </div>

            <div className="relative pt-1">
              <Progress
                value={debtProgress}
                className="h-3 rounded-full bg-white/5"
                data-testid="debt-progress-bar"
              />
              <div
                className="absolute top-0 right-0 -mt-1 mr-2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full shadow-lg"
                style={{ left: `${Math.min(debtProgress, 90)}%` }}
              >
                {debtProgress.toFixed(0)}%
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Restante à Liquidar
            </p>
            <div className="flex items-baseline gap-2">
              <p
                className="text-3xl font-extrabold font-heading text-destructive"
                data-testid="debt-remaining-amount"
              >
                {formatCurrency(totalDebtAmount - totalPaidAmount)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        variants={itemVariants}
        className="glass-card rounded-3xl p-8"
        data-testid="quick-stats-card"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Activity size={20} className="text-purple-500" />
          </div>
          <h3 className="text-xl font-bold font-heading text-white">
            Atividade
          </h3>
        </div>

        <div className="space-y-4">
          {[
            {
              label: "Total de Despesas",
              value: expenses.length,
              color: "text-white",
            },
            {
              label: "Dívidas Ativas",
              value: debts.length,
              color: "text-destructive",
            },
            {
              label: "Despesas Pagas",
              value: expenses.filter((e) => e.status === "paid").length,
              color: "text-primary",
            },
            {
              label: "Despesas Fixas",
              value: expenses.filter((e) => e.is_fixed).length,
              color: "text-blue-400",
            },
          ].map((stat, i) => (
            <div key={i} className="flex justify-between items-center group">
              <span className="text-sm text-muted-foreground group-hover:text-white transition-colors">
                {stat.label}
              </span>
              <span className={`text-base font-bold font-mono ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </aside>
  );
};

export default Sidebar;
