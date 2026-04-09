import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency, parseDate } from "../utils";

const FullAnalysis = ({ isOpen, onClose, expenses, incomes, debts }) => {
  const analysisData = useMemo(() => {
    const months = new Set();
    const BASE_DATE = new Date(2026, 0, 1);

    [...expenses, ...incomes].forEach((item) => {
      const dateStr = item.due_date || item.date;
      const date = parseDate(dateStr);
      if (date) {
        months.add(format(date, "yyyy-MM"));
      }
    });

    const sortedMonths = Array.from(months).sort();

    return sortedMonths.map((monthKey) => {
      const [year, month] = monthKey.split("-");
      const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthIncome = incomes
        .filter((inc) => {
          try {
            const date = parseDate(inc.date);
            return date && isWithinInterval(date, { start: monthStart, end: monthEnd });
          } catch {
            return false;
          }
        })
        .reduce((sum, inc) => sum + (Number(inc.value) || 0), 0);

      const monthExpenses = expenses
        .filter((exp) => {
          try {
            const date = parseDate(exp.due_date);
            return date && isWithinInterval(date, { start: monthStart, end: monthEnd });
          } catch {
            return false;
          }
        })
        .reduce((sum, exp) => sum + (Number(exp.value) || 0), 0);

      const balance = monthIncome - monthExpenses;
      const margin = monthIncome > 0 ? (balance / monthIncome) * 100 : -100;

      return {
        month: format(monthDate, "MMM/yy", { locale: ptBR }),
        Receitas: monthIncome,
        Despesas: monthExpenses,
        Saldo: balance,
        Margem: margin.toFixed(1),
        rawDate: monthDate,
      };
    });
  }, [expenses, incomes]);

  const stats = useMemo(() => {
    if (analysisData.length === 0) return null;

    const totalIncome = analysisData.reduce((sum, d) => sum + d.Receitas, 0);
    const totalExpenses = analysisData.reduce((sum, d) => sum + d.Despesas, 0);
    const avgIncome = totalIncome / analysisData.length;
    const avgExpenses = totalExpenses / analysisData.length;

    const bestMonth = [...analysisData].sort((a, b) => b.Saldo - a.Saldo)[0];
    const worstMonth = [...analysisData].sort((a, b) => a.Saldo - b.Saldo)[0];

    return {
      totalIncome,
      totalExpenses,
      avgIncome,
      avgExpenses,
      bestMonth,
      worstMonth,
    };
  }, [analysisData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
          <p className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-3 border-b border-white/5 pb-2">{label}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-8">
              <span className="text-xs font-bold text-primary flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Receitas
              </span>
              <span className="text-xs font-mono font-black text-white">{formatCurrency(data.Receitas)}</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-xs font-bold text-destructive flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive" /> Despesas
              </span>
              <span className="text-xs font-mono font-black text-white text-right">{formatCurrency(data.Despesas)}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between gap-8">
              <span className="text-xs font-black text-blue-400 uppercase tracking-wider">Saldo</span>
              <span className={`text-sm font-mono font-black ${data.Saldo >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {formatCurrency(data.Saldo)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-[10px] font-bold text-white/30 uppercase">Margem de Lucro</span>
              <span className="text-xs font-mono font-bold text-white/60">{data.Margem}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 lg:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/95 backdrop-blur-2xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full h-full max-w-7xl bg-card border border-white/10 sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <PieChart className="text-primary" size={24} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight">
                Análise Financeira Completa
              </h2>
            </div>
            <p className="text-muted-foreground text-sm font-medium ml-1">
              Visão detalhada de performance, tendências e saúde do seu capital.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl transition-all border border-white/5 group"
          >
            <X size={24} className="text-white group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
          {analysisData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-8 bg-white/5 rounded-full mb-6">
                <Zap size={48} className="text-white/20" />
              </div>
              <p className="text-xl text-muted-foreground font-bold">
                Dados insuficientes para gerar análise.
              </p>
            </div>
          ) : (
            <>
              {/* Top Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                  title="Receita Total"
                  value={formatCurrency(stats.totalIncome)}
                  icon={TrendingUp}
                  color="text-primary"
                  bg="bg-primary/10"
                />
                <StatCard
                  title="Despesa Total"
                  value={formatCurrency(stats.totalExpenses)}
                  icon={TrendingDown}
                  color="text-destructive"
                  bg="bg-destructive/10"
                />
                <StatCard
                  title="Média Mensal (S)"
                  value={formatCurrency(stats.avgIncome)}
                  icon={ArrowUpRight}
                  color="text-blue-400"
                  bg="bg-blue-400/10"
                />
                <StatCard
                  title="Média Mensal (D)"
                  value={formatCurrency(stats.avgExpenses)}
                  icon={ArrowDownRight}
                  color="text-amber-400"
                  bg="bg-amber-400/10"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Comparative Chart */}
                <div className="lg:col-span-2 glass-card p-6 sm:p-8 rounded-[32px]">
                  <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                    <Calendar size={20} className="text-primary" />
                    Fluxo de Caixa por Período
                  </h3>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={analysisData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          interval={0}
                          tick={{ fill: "#ffffff40", fontSize: 10, fontWeight: 700 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#ffffff40", fontSize: 10, fontWeight: 700 }}
                          tickFormatter={(v) => `R$ ${v / 1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          verticalAlign="top"
                          align="right"
                          wrapperStyle={{ paddingBottom: 20, fontSize: 10, fontWeight: "bold" }}
                        />
                        <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        <Line
                          type="monotone"
                          dataKey="Saldo"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Performance Side Panel */}
                <div className="space-y-6">
                  <div className="glass-card p-6 sm:p-8 rounded-[32px] border-primary/10">
                    <h4 className="text-primary font-black text-[10px] uppercase tracking-widest mb-4">
                      Top Performance
                    </h4>
                    <div className="space-y-1">
                      <p className="text-2xl font-black text-white capitalize">{stats.bestMonth?.month}</p>
                      <p className="text-xs text-muted-foreground">Mês com maior superávit líquido</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs font-bold text-white/50">Saldo Final</span>
                      <span className="text-lg font-black text-primary">
                        {formatCurrency(stats.bestMonth?.Saldo)}
                      </span>
                    </div>
                  </div>

                  <div className="glass-card p-6 sm:p-8 rounded-[32px] border-destructive/10">
                    <h4 className="text-destructive font-black text-[10px] uppercase tracking-widest mb-4">
                      Atenção Necessária
                    </h4>
                    <div className="space-y-1">
                      <p className="text-2xl font-black text-white capitalize">{stats.worstMonth?.month}</p>
                      <p className="text-xs text-muted-foreground">Mês com maior pressão financeira</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs font-bold text-white/50">Saldo Final</span>
                      <span className="text-lg font-black text-destructive">
                        {formatCurrency(stats.worstMonth?.Saldo)}
                      </span>
                    </div>
                  </div>

                  <div className="glass-card p-6 sm:p-8 rounded-[32px]">
                    <h3 className="text-sm font-black text-white mb-6 flex items-center gap-2">
                       <Target size={16} className="text-blue-400" />
                       Eficiência Financeira
                    </h3>
                    <div className="space-y-4">
                        {analysisData.slice(-3).reverse().map((m, i) => (
                           <div key={i} className="flex flex-col gap-1">
                               <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted-foreground">
                                   <span>{m.month}</span>
                                   <span className={m.Saldo > 0 ? "text-primary" : "text-destructive"}>{m.Margem}%</span>
                               </div>
                               <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                   <div 
                                      className={`h-full rounded-full ${m.Saldo > 0 ? "bg-primary" : "bg-destructive"}`}
                                      style={{ width: `${Math.min(100, Math.max(0, m.Margem))}%` }}
                                   />
                               </div>
                           </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <div className="glass-card p-6 rounded-[28px] group hover:border-white/10 transition-all">
    <div className={`w-10 h-10 ${bg} rounded-2xl flex items-center justify-center mb-4`}>
      <Icon size={20} className={color} />
    </div>
    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">
      {title}
    </p>
    <p className={`text-2xl font-black ${color} truncate`}>{value}</p>
  </div>
);

export default FullAnalysis;
