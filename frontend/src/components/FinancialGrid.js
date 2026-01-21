import React, { useState } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { format, parse } from 'date-fns';

const FinancialGrid = ({ expenses, onUpdateExpense, onDeleteExpense }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setEditForm(expense);
  };

  const handleSave = () => {
    onUpdateExpense(editingId, editForm);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleToggleStatus = (expense) => {
    const newStatus = expense.status === 'paid' ? 'pending' : 'paid';
    onUpdateExpense(expense.id, { status: newStatus });
  };

  return (
    <div className="glass-card rounded-xl p-6" data-testid="financial-grid">
      <h2 className="text-2xl font-semibold tracking-tight font-heading text-white mb-6">
        Despesas do Mês
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1E293B]">
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">Nome</th>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">Categoria</th>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">Valor</th>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">Vencimento</th>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">Fixa</th>
              <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-400" data-testid="no-expenses-message">
                  Nenhuma despesa cadastrada
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-[#1E293B] hover:bg-white/5" data-testid={`expense-row-${expense.id}`}>
                  <td className="py-4 px-4">
                    {editingId === expense.id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-[#020c1b] border border-[#1E293B] text-white rounded-lg h-8 px-3 w-full"
                        data-testid="edit-expense-name"
                      />
                    ) : (
                      <span className="text-white font-body" data-testid={`expense-name-${expense.id}`}>{expense.name}</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {editingId === expense.id ? (
                      <input
                        type="text"
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="bg-[#020c1b] border border-[#1E293B] text-white rounded-lg h-8 px-3 w-full"
                        data-testid="edit-expense-category"
                      />
                    ) : (
                      <span className="text-slate-400 font-body text-sm" data-testid={`expense-category-${expense.id}`}>{expense.category}</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {editingId === expense.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.value}
                        onChange={(e) => setEditForm({ ...editForm, value: parseFloat(e.target.value) })}
                        className="bg-[#020c1b] border border-[#1E293B] text-white rounded-lg h-8 px-3 w-full"
                        data-testid="edit-expense-value"
                      />
                    ) : (
                      <span className="text-destructive font-mono font-semibold" data-testid={`expense-value-${expense.id}`}>
                        {formatCurrency(expense.value)}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {editingId === expense.id ? (
                      <input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        value={editForm.due_date}
                        onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                        className="bg-[#020c1b] border border-[#1E293B] text-white rounded-lg h-8 px-3 w-full"
                        data-testid="edit-expense-due-date"
                      />
                    ) : (
                      <span className="text-slate-400 font-body text-sm" data-testid={`expense-due-date-${expense.id}`}>{expense.due_date}</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleStatus(expense)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        expense.status === 'paid'
                          ? 'bg-primary/10 text-primary border border-primary/30'
                          : 'bg-destructive/10 text-destructive border border-destructive/30'
                      }`}
                      data-testid={`expense-status-toggle-${expense.id}`}
                    >
                      {expense.status === 'paid' ? 'Pago' : 'Pendente'}
                    </button>
                  </td>
                  <td className="py-4 px-4">
                    {editingId === expense.id ? (
                      <input
                        type="checkbox"
                        checked={editForm.is_fixed}
                        onChange={(e) => setEditForm({ ...editForm, is_fixed: e.target.checked })}
                        className="w-4 h-4"
                        data-testid="edit-expense-fixed"
                      />
                    ) : (
                      <span className="text-slate-400 font-body text-sm" data-testid={`expense-fixed-${expense.id}`}>
                        {expense.is_fixed ? 'Sim' : 'Não'}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2 justify-end">
                      {editingId === expense.id ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="p-2 hover:bg-primary/10 rounded-lg text-primary"
                            data-testid={`save-expense-${expense.id}`}
                          >
                            <Check size={16} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-destructive/10 rounded-lg text-destructive"
                            data-testid={`cancel-edit-expense-${expense.id}`}
                          >
                            <X size={16} strokeWidth={1.5} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
                            data-testid={`edit-expense-${expense.id}`}
                          >
                            <Edit2 size={16} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(expense.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg text-destructive"
                            data-testid={`delete-expense-${expense.id}`}
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialGrid;
