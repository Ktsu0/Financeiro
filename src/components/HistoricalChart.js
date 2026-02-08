import React, { useState, useMemo } from "react";
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
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  isBefore,
  isAfter,
  isSameMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Settings, X, Check } from "lucide-react";
import { formatCurrency } from "../utils";

const HistoricalChart = React.memo(({ expenses, incomes }) => {
  const BASE_DATE = new Date(2026, 0, 1);
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState(() => {
    // Inicializa com o mês atual + 5 meses seguintes
    const initial = [];
    for (let i = 0; i <= 5; i++) {
      initial.push(format(addMonths(currentMonth, i), "yyyy-MM"));
    }
    return initial;
  });

  // Gera lista de todos os meses disponíveis
  const availableMonths = useMemo(() => {
    const months = new Set();

    // Adiciona mês atual
    months.add(format(currentMonth, "yyyy-MM"));

    // Adiciona 5 meses anteriores
    for (let i = 1; i <= 5; i++) {
      const month = subMonths(currentMonth, i);
      if (!isBefore(month, BASE_DATE)) {
        months.add(format(month, "yyyy-MM"));
      }
    }

    // Adiciona 5 meses futuros
    for (let i = 1; i <= 5; i++) {
      months.add(format(addMonths(currentMonth, i), "yyyy-MM"));
    }

    // Adiciona meses que têm dados (despesas ou receitas)
    [...expenses, ...incomes].forEach((item) => {
      try {
        const dateStr = item.due_date || item.date;
        const [day, month, year] = dateStr.split("/");
        const itemDate = new Date(parseInt(year), parseInt(month) - 1, 1);

        if (!isBefore(itemDate, BASE_DATE)) {
          months.add(format(itemDate, "yyyy-MM"));
        }
      } catch (e) {
        // Ignora datas inválidas
      }
    });

    // Converte para array e ordena
    return Array.from(months)
      .sort()
      .map((monthKey) => {
        const [year, month] = monthKey.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return {
          key: monthKey,
          date,
          label: format(date, "MMMM/yy", { locale: ptBR }),
          isCurrent: isSameMonth(date, currentMonth),
          isFuture: isAfter(date, currentMonth),
          isPast: isBefore(date, currentMonth),
        };
      });
  }, [expenses, incomes, currentMonth]);

  const toggleMonth = (monthKey) => {
    setSelectedMonths((prev) => {
      const isCurrentMonth = monthKey === format(currentMonth, "yyyy-MM");

      // Não permite desmarcar o mês atual
      if (isCurrentMonth && prev.includes(monthKey)) {
        return prev;
      }

      if (prev.includes(monthKey)) {
        return prev.filter((m) => m !== monthKey);
      } else {
        // Limita a 6 meses
        if (prev.length >= 6) {
          return prev;
        }
        return [...prev, monthKey].sort();
      }
    });
  };

  const historicalData = useMemo(() => {
    if (isBefore(currentMonth, BASE_DATE)) {
      return [];
    }

    const data = [];

    // Filtra apenas os meses selecionados
    selectedMonths.sort().forEach((monthKey) => {
      const [year, month] = monthKey.split("-");
      const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthName = format(monthDate, "MMM/yy", { locale: ptBR });

      const monthIncome = incomes
        .filter((income) => {
          try {
            const [day, m, y] = income.date.split("/");
            const incomeDate = new Date(
              parseInt(y),
              parseInt(m) - 1,
              parseInt(day),
            );

            if (isBefore(incomeDate, BASE_DATE)) return false;

            return isWithinInterval(incomeDate, {
              start: monthStart,
              end: monthEnd,
            });
          } catch {
            return false;
          }
        })
        .reduce((sum, income) => sum + income.value, 0);

      const monthExpenses = expenses
        .filter((expense) => {
          try {
            const [day, m, y] = expense.due_date.split("/");
            const expenseDate = new Date(
              parseInt(y),
              parseInt(m) - 1,
              parseInt(day),
            );

            if (isBefore(expenseDate, BASE_DATE)) return false;

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
        isFuture: isAfter(monthStart, today),
      });
    });

    return data;
  }, [expenses, incomes, selectedMonths]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isFuture = payload[0]?.payload?.isFuture;

      return (
        <div className="bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
          <p className="text-white font-heading font-black text-xs uppercase tracking-widest mb-3 border-b border-white/5 pb-2 flex items-center gap-2">
            {label}
            {isFuture && (
              <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                Futuro
              </span>
            )}
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

  if (historicalData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8"
        data-testid="historical-chart"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-xl sm:rounded-2xl">
              <BarChart3 className="text-primary" size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-heading text-white">
                Histórico Consolidado
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-body">
                Selecione os meses para visualizar
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMonthSelector(true)}
            className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
            title="Selecionar Meses"
          >
            <Settings size={18} className="text-white/70" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <BarChart3
              size={32}
              className="sm:w-10 sm:h-10 text-muted-foreground opacity-20"
            />
          </div>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            Selecione meses para visualizar o gráfico
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8"
        data-testid="historical-chart"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-xl sm:rounded-2xl">
              <BarChart3 className="text-primary" size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight font-heading text-white">
                Histórico Consolidado
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-body">
                {selectedMonths.length}{" "}
                {selectedMonths.length === 1
                  ? "mês selecionado"
                  : "meses selecionados"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMonthSelector(true)}
            className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all flex-shrink-0"
            title="Selecionar Meses"
          >
            <Settings size={18} className="text-white/70" />
          </button>
        </div>

        <div className="h-[250px] sm:h-[300px] lg:h-[320px] w-full relative overflow-hidden">
          <ResponsiveContainer
            width="99%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
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
                  fontSize: 9,
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
                  fontSize: 9,
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
                  paddingBottom: "20px",
                  fontSize: "10px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              />
              <Bar
                dataKey="Receitas"
                fill="#22c55e"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="Despesas"
                fill="#f43f5e"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Month Selector Modal */}
      <AnimatePresence>
        {showMonthSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMonthSelector(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-extrabold text-white font-heading">
                    Selecionar Meses
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Máximo 6 meses • {selectedMonths.length}/6 selecionados
                  </p>
                </div>
                <button
                  onClick={() => setShowMonthSelector(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {availableMonths.map((month) => {
                  const isSelected = selectedMonths.includes(month.key);
                  const isDisabled = !isSelected && selectedMonths.length >= 6;

                  return (
                    <button
                      key={month.key}
                      onClick={() => !isDisabled && toggleMonth(month.key)}
                      disabled={isDisabled}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                        isSelected
                          ? "bg-primary/20 border-2 border-primary"
                          : isDisabled
                            ? "bg-white/5 border border-white/5 opacity-50 cursor-not-allowed"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-white/20"
                          }`}
                        >
                          {isSelected && (
                            <Check
                              size={14}
                              className="text-white"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white capitalize">
                            {month.label}
                          </p>
                          <div className="flex gap-2 mt-0.5">
                            {month.isCurrent && (
                              <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                                Atual
                              </span>
                            )}
                            {month.isFuture && (
                              <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                                Futuro
                              </span>
                            )}
                            {month.isPast && (
                              <span className="text-[9px] bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full">
                                Passado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => setShowMonthSelector(false)}
                  className="w-full btn-primary"
                >
                  Aplicar Seleção
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
});

export default HistoricalChart;
