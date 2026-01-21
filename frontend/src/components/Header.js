import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const Header = ({ summary }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <header className="border-b border-[#1E293B] bg-card">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight font-heading text-white mb-2" data-testid="app-title">
              NEON<span className="text-primary">FINANCE</span>
            </h1>
            <p className="text-sm text-slate-400 font-body">Controle Financeiro Pessoal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available Salary */}
          <div className="glass-card rounded-xl p-6 neon-green" data-testid="available-salary-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Salário Disponível</p>
                <p className="text-4xl font-bold font-mono tracking-tight text-primary" data-testid="available-salary-value">
                  {formatCurrency(summary.available_salary)}
                </p>
                <p className="text-sm text-slate-400 mt-2 font-body">
                  Receita Total: {formatCurrency(summary.total_income)}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="text-primary" size={24} strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Total Committed */}
          <div className="glass-card rounded-xl p-6 neon-red" data-testid="total-committed-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Total Comprometido</p>
                <p className="text-4xl font-bold font-mono tracking-tight text-destructive" data-testid="total-committed-value">
                  {formatCurrency(summary.total_committed)}
                </p>
                <p className="text-sm text-slate-400 mt-2 font-body">
                  Despesas: {formatCurrency(summary.total_expenses)} + Dívidas: {formatCurrency(summary.total_debt)}
                </p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg">
                <TrendingDown className="text-destructive" size={24} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
