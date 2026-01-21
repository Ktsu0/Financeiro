import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddDebtModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    total_amount: '',
    paid_amount: '0',
    installment_value: '',
    due_date: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      total_amount: parseFloat(formData.total_amount),
      paid_amount: parseFloat(formData.paid_amount),
      installment_value: parseFloat(formData.installment_value),
      due_date: formData.due_date
    });
    setFormData({
      name: '',
      total_amount: '',
      paid_amount: '0',
      installment_value: '',
      due_date: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" data-testid="add-debt-modal">
      <div className="glass-card rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold font-heading text-white">Adicionar Dívida</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
            data-testid="close-debt-modal"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
              Nome
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[#020c1b] border border-[#1E293B] text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg h-10 px-4 w-full"
              placeholder="Ex: Cartão de Crédito"
              data-testid="debt-name-input"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
              Valor Total (R$)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.total_amount}
              onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
              className="bg-[#020c1b] border border-[#1E293B] text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg h-10 px-4 w-full"
              placeholder="0.00"
              data-testid="debt-total-input"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
              Já Pago (R$)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.paid_amount}
              onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
              className="bg-[#020c1b] border border-[#1E293B] text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg h-10 px-4 w-full"
              placeholder="0.00"
              data-testid="debt-paid-input"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
              Valor da Parcela (R$)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.installment_value}
              onChange={(e) => setFormData({ ...formData, installment_value: e.target.value })}
              className="bg-[#020c1b] border border-[#1E293B] text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg h-10 px-4 w-full"
              placeholder="0.00"
              data-testid="debt-installment-input"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
              Vencimento
            </label>
            <input
              type="text"
              required
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="bg-[#020c1b] border border-[#1E293B] text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg h-10 px-4 w-full"
              placeholder="DD/MM/YYYY"
              data-testid="debt-due-date-input"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-transparent border border-slate-600 text-slate-400 hover:bg-white/5 font-medium rounded-full px-6 py-2"
              data-testid="cancel-debt-btn"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-[#00CC76] font-bold shadow-[0_0_15px_rgba(0,255,148,0.4)] hover:scale-105 active:scale-95 rounded-full px-6 py-2"
              data-testid="submit-debt-btn"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDebtModal;
