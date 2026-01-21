import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parse, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const HistoricalChart = ({ expenses, incomes }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Generate last 6 months data
  const generateHistoricalData = () => {
    const data = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthName = format(monthDate, 'MMM/yy', { locale: ptBR });

      // Calculate total income for this month
      const monthIncome = incomes
        .filter(income => {
          try {
            const [day, month, year] = income.date.split('/');
            const incomeDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return isWithinInterval(incomeDate, { start: monthStart, end: monthEnd });
          } catch {
            return false;
          }
        })
        .reduce((sum, income) => sum + income.value, 0);

      // Calculate total expenses for this month
      const monthExpenses = expenses
        .filter(expense => {
          try {
            const [day, month, year] = expense.due_date.split('/');
            const expenseDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd });
          } catch {
            return false;
          }
        })
        .reduce((sum, expense) => sum + expense.value, 0);

      data.push({
        month: monthName,
        Receitas: monthIncome,
        Despesas: monthExpenses
      });
    }

    return data;
  };

  const historicalData = generateHistoricalData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0A192F] border border-[#1E293B] rounded-lg p-4 shadow-xl">
          <p className="text-white font-heading font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-body" style={{ color: entry.color }}>
              {entry.name}: <span className="font-mono font-bold">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-xl p-6" data-testid="historical-chart">
      <h2 className="text-2xl font-semibold tracking-tight font-heading text-white mb-6">
        Comparação Mensal (Últimos 6 Meses)
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={historicalData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
          <XAxis 
            dataKey="month" 
            stroke="#94A3B8"
            style={{ fontSize: '12px', fontFamily: 'Inter' }}
          />
          <YAxis 
            stroke="#94A3B8"
            style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
            tickFormatter={(value) => `R$ ${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{
              fontSize: '14px',
              fontFamily: 'Inter',
              color: '#94A3B8'
            }}
          />
          <Bar dataKey="Receitas" fill="#00FF94" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Despesas" fill="#FF0055" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoricalChart;
