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

const Sidebar = React.memo(({ expenses, debts, summary }) => {
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
          <div className="h-[280px] w-full relative overflow-hidden">
            <ResponsiveContainer
              width="99%"
              height="100%"
              minWidth={0}
              minHeight={0}
            >
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

      {/* Debt Payoff Progress - Enhanced Gauge View */}
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        variants={itemVariants}
        className="glass-card rounded-3xl p-8 relative overflow-hidden"
        data-testid="debt-progress-card"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
            <Target size={20} />
          </div>
          <h3 className="text-xl font-bold font-heading text-white">
            Progresso Geral
          </h3>
        </div>

        <div className="flex flex-col items-center">
          {/* Circular Gauge */}
          <div className="h-[180px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Pago", value: debtProgress },
                    { name: "Restante", value: 100 - debtProgress }
                  ]}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="rgba(255,255,255,0.05)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
              <span className="text-4xl font-black font-heading text-white leading-none">
                {debtProgress.toFixed(0)}%
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-1">
                Concluído
              </span>
            </div>
          </div>

          {/* Stats below gauge */}
          <div className="w-full mt-6 space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/[0.03] rounded-2xl border border-white/5">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-1">
                  Total Liquidado
                </p>
                <p className="text-lg font-black font-heading text-primary">
                  {formatCurrency(totalPaidAmount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-1">
                  Meta Total
                </p>
                <p className="text-sm font-bold font-heading text-white/60">
                  {formatCurrency(totalDebtAmount)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-destructive/5 rounded-2xl border border-destructive/10">
              <p className="text-[10px] uppercase font-black tracking-widest text-destructive/50 mb-1">
                Ainda Restante
              </p>
              <p className="text-2xl font-black font-heading text-destructive-foreground">
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
});

export default Sidebar;
