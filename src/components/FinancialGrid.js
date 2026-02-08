import React, { useState } from "react";
import {
  Edit2,
  Trash2,
  Check,
  X,
  Calendar,
  Tag,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "../utils";

const FinancialGrid = React.memo(
  ({ expenses, onUpdateExpense, onDeleteExpense }) => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

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
      const newStatus = expense.status === "paid" ? "pending" : "paid";
      onUpdateExpense(expense.id, { status: newStatus });
    };

    return (
      <div className="glass-card rounded-3xl p-8" data-testid="financial-grid">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight font-heading text-white">
              Fluxo de Despesas
            </h2>
            <p className="text-sm text-muted-foreground mt-1 font-body">
              Lista detalhada de seus compromissos mensais
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-bold uppercase text-white/50 tracking-wider">
                Pago
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-xs font-bold uppercase text-white/50 tracking-wider">
                Pendente
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-8 px-8">
          <table className="w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left">
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Nome & Categoria
                </th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Valor
                </th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">
                  Vencimento
                </th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">
                  Status
                </th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">
                  Fixa
                </th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8">
                    <div className="flex flex-col items-center justify-center py-16 bg-white/5 rounded-3xl border border-dashed border-white/10">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Tag
                          size={32}
                          className="text-muted-foreground opacity-20"
                        />
                      </div>
                      <p
                        className="text-muted-foreground font-medium"
                        data-testid="no-expenses-message"
                      >
                        Nenhuma despesa para exibir.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {expenses.map((expense, index) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      key={expense.id}
                      className="group bg-white/5 hover:bg-white/[0.08] transition-all duration-200"
                      data-testid={`expense-row-${expense.id}`}
                    >
                      <td className="py-4 px-4 first:rounded-l-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Tag
                              size={16}
                              className="text-muted-foreground group-hover:text-primary transition-colors"
                            />
                          </div>
                          <div>
                            {editingId === expense.id ? (
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    name: e.target.value,
                                  })
                                }
                                className="bg-background border border-border text-white text-sm rounded-lg h-8 px-2 w-full focus:ring-1 focus:ring-primary"
                                autoFocus
                              />
                            ) : (
                              <p className="text-sm font-bold text-white leading-none mb-1">
                                {expense.name}
                              </p>
                            )}
                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                              {expense.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {editingId === expense.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.value}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                value: parseFloat(e.target.value),
                              })
                            }
                            className="bg-background border border-border text-white text-sm rounded-lg h-8 px-2 w-full"
                          />
                        ) : (
                          <span className="text-sm font-black font-mono text-white">
                            {formatCurrency(expense.value)}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar size={12} />
                          <span>{expense.due_date}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(expense)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                            expense.status === "paid"
                              ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                              : "bg-destructive/10 text-destructive border border-destructive/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                          }`}
                        >
                          {expense.status === "paid" ? "Liquidado" : "Pendente"}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div
                          className={`w-2 h-2 rounded-full mx-auto ${expense.is_fixed ? "bg-blue-400" : "bg-white/10"}`}
                        />
                      </td>
                      <td className="py-4 px-4 text-right last:rounded-r-2xl">
                        <div className="flex gap-2 justify-end items-center h-full">
                          {editingId === expense.id ? (
                            <>
                              <button
                                onClick={handleSave}
                                className="w-8 h-8 flex items-center justify-center bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground rounded-xl transition-all"
                                title="Salvar"
                              >
                                <Check size={14} strokeWidth={3} />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="w-8 h-8 flex items-center justify-center bg-destructive/20 hover:bg-destructive text-destructive hover:text-white rounded-xl transition-all"
                                title="Cancelar"
                              >
                                <X size={14} strokeWidth={3} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(expense)}
                                className="w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-xl text-slate-400 transition-all"
                                title="Editar"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => onDeleteExpense(expense.id)}
                                className="w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded-xl text-destructive/60 hover:text-destructive transition-all"
                                title="Excluir"
                              >
                                <Trash2 size={14} />
                              </button>
                              <div className="w-8 h-8 flex items-center justify-center group-hover:hidden transition-all">
                                <ChevronRight
                                  size={16}
                                  className="text-white/20"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);

export default FinancialGrid;
