import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { formatCurrency } from "../utils";

const HistoricalChart = React.memo(({ expenses, incomes }) => {
  // Memoized historical data to prevent re-calculation on setiap render
  const historicalData = React.useMemo(() => {
    const data = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthName = format(monthDate, "MMM/yy", { locale: ptBR });

      // Calculate total income for this month
      const monthIncome = incomes
        .filter((income) => {
          try {
            const [day, month, year] = income.date.split("/");
            const incomeDate = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
            );
            return isWithinInterval(incomeDate, {
              start: monthStart,
              end: monthEnd,
            });
          } catch {
            return false;
          }
        })
        .reduce((sum, income) => sum + income.value, 0);

      // Calculate total expenses for this month
      const monthExpenses = expenses
        .filter((expense) => {
          try {
            const [day, month, year] = expense.due_date.split("/");
            const expenseDate = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
            );
            return isWithinInterval(expenseDate, {
              start: monthStart,
              end: monthEnd,
            });
          } catch {
            return false;
          }
        })
        .reduce((sum, expense) => sum + expense.value, 0);

      data.push({
        month: monthName,
        Receitas: monthIncome,
        Despesas: monthExpenses,
      });
    }

    return data;
  }, [expenses, incomes]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
          <p className="text-white font-heading font-black text-xs uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
            {label}
          </p>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <p className="text-sm font-medium text-white/70">
                  {entry.name}:{" "}
                  <span className="font-mono font-black text-white ml-1">
                    {formatCurrency(entry.value)}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-8"
      data-testid="historical-chart"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <BarChart3 className="text-primary" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight font-heading text-white">
            Histórico Consolidado
          </h2>
          <p className="text-sm text-muted-foreground font-body">
            Comparativo de fluxo nos últimos 6 meses
          </p>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={historicalData}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.03)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "rgba(255,255,255,0.4)",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "rgba(255,255,255,0.4)",
                fontSize: 10,
                fontWeight: 700,
              }}
              tickFormatter={(value) =>
                `R$${value >= 1000 ? (value / 1000).toFixed(1) + "k" : value}`
              }
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{
                paddingBottom: "30px",
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            />
            <Bar
              dataKey="Receitas"
              fill="#22c55e"
              radius={[6, 6, 0, 0]}
              barSize={24}
            />
            <Bar
              dataKey="Despesas"
              fill="#f43f5e"
              radius={[6, 6, 0, 0]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
});

export default HistoricalChart;
