import React, { useState } from 'react';
import { Edit2, Trash2, Check, X, Plus } from 'lucide-react';

const DebtTracking = ({ debts, onUpdateDebt, onDeleteDebt }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleEdit = (debt) => {
    setEditingId(debt.id);
    setEditForm(debt);
  };

  const handleSave = () => {
    onUpdateDebt(editingId, editForm);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handlePayInstallment = (debt) => {
    const newPaidAmount = Math.min(
      debt.paid_amount + debt.installment_value,
      debt.total_amount
    );
    onUpdateDebt(debt.id, { paid_amount: newPaidAmount });
  };

  const calculateProgress = (debt) => {
    return (debt.paid_amount / debt.total_amount) * 100;
  };

  return (
    <div className="glass-card rounded-xl p-6" data-testid="debt-tracking">
      <h2 className="text-2xl font-semibold tracking-tight font-heading text-white mb-6">
        Módulo de Dívidas
      </h2>

      <div className="space-y-4">
        {debts.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8" data-testid="no-debts-message">
            Nenhuma dívida cadastrada
          </p>
        ) : (
          debts.map((debt) => (
            <div key={debt.id} className="bg-secondary rounded-lg p-4 border border-[#1E293B]" data-testid={`debt-card-${debt.id}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  {editingId === debt.id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-[#020c1b] border border-[#1E293B] text-white rounded-lg h-8 px-3 w-full mb-2"
                      data-testid="edit-debt-name"
                    />
                  ) : (
                    <h3 className="text-lg font-heading font-semibold text-white" data-testid={`debt-name-${debt.id}`}>
                      {debt.name}
                    </h3>
                  )}
                  <div className="flex gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-slate-500 font-body">Total: </span>
                      {editingId === debt.id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.total_amount}
                          onChange={(e) => setEditForm({ ...editForm, total_amount: parseFloat(e.target.value) })}
                          className="bg-[#020c1b] border border-[#1E293B] text-white rounded-lg h-7 px-2 w-32"
                          data-testid="edit-debt-total"
                        />
                      ) : (
                        <span className="text-white font-mono font-semibold" data-testid={`debt-total-${debt.id}`}>
                          {formatCurrency(debt.total_amount)}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500 font-body">Pago: </span>
                      <span className="text-primary font-mono font-semibold" data-testid={`debt-paid-${debt.id}`}>
                        {formatCurrency(debt.paid_amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-body">Restante: </span>
                      <span className="text-destructive font-mono font-semibold" data-testid={`debt-remaining-${debt.id}`}>
                        {formatCurrency(debt.total_amount - debt.paid_amount)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="text-slate-500 font-body">Parcela: </span>
                    {editingId === debt.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.installment_value}
                        onChange={(e) => setEditForm({ ...editForm, installment_value: parseFloat(e.target.value) })}
                        className="bg-[#020c1b] border border-[#1E293B] text-white rounded-lg h-7 px-2 w-32"
                        data-testid="edit-debt-installment"
                      />
                    ) : (
                      <span className="text-white font-mono font-semibold" data-testid={`debt-installment-${debt.id}`}>
                        {formatCurrency(debt.installment_value)}
                      </span>
                    )}
                    <span className="text-slate-500 font-body ml-3">Vencimento: </span>
                    {editingId === debt.id ? (
                      <input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        value={editForm.due_date}
                        onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                        className="bg-[#020c1b] border border-[#1E293B] text-white rounded-lg h-7 px-2 w-32"
                        data-testid="edit-debt-due-date"
                      />
                    ) : (
                      <span className="text-slate-400 font-body" data-testid={`debt-due-date-${debt.id}`}>
                        {debt.due_date}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {editingId === debt.id ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="p-2 hover:bg-primary/10 rounded-lg text-primary"
                        data-testid={`save-debt-${debt.id}`}
                      >
                        <Check size={16} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 hover:bg-destructive/10 rounded-lg text-destructive"
                        data-testid={`cancel-edit-debt-${debt.id}`}
                      >
                        <X size={16} strokeWidth={1.5} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handlePayInstallment(debt)}
                        disabled={debt.paid_amount >= debt.total_amount}
                        className="p-2 hover:bg-primary/10 rounded-lg text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Pagar Parcela"
                        data-testid={`pay-installment-${debt.id}`}
                      >
                        <Plus size={16} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => handleEdit(debt)}
                        className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
                        data-testid={`edit-debt-${debt.id}`}
                      >
                        <Edit2 size={16} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => onDeleteDebt(debt.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg text-destructive"
                        data-testid={`delete-debt-${debt.id}`}
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-[#020c1b] rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${calculateProgress(debt)}%` }}
                    data-testid={`debt-progress-${debt.id}`}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-body text-right">
                  {calculateProgress(debt).toFixed(1)}% pago
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DebtTracking;
