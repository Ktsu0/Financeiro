import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Progress } from './ui/progress';

const Sidebar = ({ expenses, debts, summary }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calculate spending by category
  const categoryData = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.name === expense.category);
    if (existing) {
      existing.value += expense.value;
    } else {
      acc.push({ name: expense.category, value: expense.value });
    }
    return acc;
  }, []);

  const COLORS = ['#00FF94', '#FF0055', '#64FFDA', '#FFBD2E', '#BD34FE'];

  // Calculate debt progress
  const totalDebtAmount = debts.reduce((sum, d) => sum + d.total_amount, 0);
  const totalPaidAmount = debts.reduce((sum, d) => sum + d.paid_amount, 0);
  const debtProgress = totalDebtAmount > 0 ? (totalPaidAmount / totalDebtAmount) * 100 : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0A192F] border border-[#1E293B] rounded-lg p-3 shadow-lg">
          <p className="text-white font-body text-sm">{payload[0].name}</p>
          <p className="text-primary font-mono font-bold">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <aside className="w-80 space-y-6" data-testid="sidebar">
      {/* Spending Distribution */}
      <div className="glass-card rounded-xl p-6" data-testid="spending-distribution-card">
        <h3 className="text-xl font-medium font-heading text-slate-200 mb-6">
          Distribuição de Gastos
        </h3>
        {categoryData.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8" data-testid="no-spending-data-message">
            Sem dados de gastos
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{
                  fontSize: '12px',
                  color: '#94A3B8'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Debt Payoff Progress */}
      <div className="glass-card rounded-xl p-6" data-testid="debt-progress-card">
        <h3 className="text-xl font-medium font-heading text-slate-200 mb-4">
          Progresso de Dívidas
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400 font-body">Pago</span>
              <span className="text-primary font-mono font-bold" data-testid="debt-paid-amount">
                {formatCurrency(totalPaidAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-slate-400 font-body">Total</span>
              <span className="text-white font-mono font-bold" data-testid="debt-total-amount">
                {formatCurrency(totalDebtAmount)}
              </span>
            </div>
            <Progress value={debtProgress} className="h-3" data-testid="debt-progress-bar" />
            <p className="text-center text-xs text-slate-500 mt-2 font-body">
              {debtProgress.toFixed(1)}% concluído
            </p>
          </div>
          <div className="pt-4 border-t border-[#1E293B]">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Restante</p>
            <p className="text-2xl font-bold font-mono tracking-tight text-destructive" data-testid="debt-remaining-amount">
              {formatCurrency(totalDebtAmount - totalPaidAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="glass-card rounded-xl p-6" data-testid="quick-stats-card">
        <h3 className="text-xl font-medium font-heading text-slate-200 mb-4">
          Resumo Rápido
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400 font-body">Total de Despesas</span>
            <span className="text-sm font-mono font-bold text-destructive" data-testid="quick-stat-expenses">
              {expenses.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400 font-body">Dívidas Ativas</span>
            <span className="text-sm font-mono font-bold text-destructive" data-testid="quick-stat-debts">
              {debts.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400 font-body">Despesas Pagas</span>
            <span className="text-sm font-mono font-bold text-primary" data-testid="quick-stat-paid">
              {expenses.filter(e => e.status === 'paid').length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400 font-body">Despesas Fixas</span>
            <span className="text-sm font-mono font-bold text-white" data-testid="quick-stat-fixed">
              {expenses.filter(e => e.is_fixed).length}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
