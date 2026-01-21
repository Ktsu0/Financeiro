import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddIncomeModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    date: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      value: parseFloat(formData.value),
      date: formData.date
    });
    setFormData({
      name: '',
      value: '',
      date: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" data-testid="add-income-modal">
      <div className="glass-card rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold font-heading text-white">Adicionar Receita</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
            data-testid="close-income-modal"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
              Descrição
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[#020c1b] border border-[#1E293B] text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg h-10 px-4 w-full"
              placeholder="Ex: Salário"
              data-testid="income-name-input"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="bg-[#020c1b] border border-[#1E293B] text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg h-10 px-4 w-full"
              placeholder="0.00"
              data-testid="income-value-input"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
              Data
            </label>
            <input
              type="text"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-[#020c1b] border border-[#1E293B] text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg h-10 px-4 w-full"
              placeholder="DD/MM/YYYY"
              data-testid="income-date-input"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-transparent border border-slate-600 text-slate-400 hover:bg-white/5 font-medium rounded-full px-6 py-2"
              data-testid="cancel-income-btn"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-[#00CC76] font-bold shadow-[0_0_15px_rgba(0,255,148,0.4)] hover:scale-105 active:scale-95 rounded-full px-6 py-2"
              data-testid="submit-income-btn"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIncomeModal;
