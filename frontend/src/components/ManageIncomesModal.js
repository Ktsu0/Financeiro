import React, { useState } from "react";
import {
  X,
  Edit2,
  Trash2,
  Check,
  TrendingUp,
  Calendar,
  DollarSign,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "../utils";

const ManageIncomesModal = ({
  isOpen,
  onClose,
  incomes,
  onUpdateIncome,
  onDeleteIncome,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (income) => {
    setEditingId(income.id);
    setEditForm(income);
  };

  const handleSave = () => {
    onUpdateIncome(editingId, editForm);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl glass-card rounded-[2.5rem] p-8 overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[85vh]"
        data-testid="manage-incomes-modal"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

        <div className="flex items-center justify-between mb-8 relative shrink-0">
          <div>
            <h2 className="text-2xl font-black font-heading text-white tracking-tight">
              Gerenciar Receitas
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Edite ou remova suas entradas financeiras
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
          {incomes.length === 0 ? (
            <div className="py-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p className="text-muted-foreground font-medium">
                Nenhuma receita registrada.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {incomes.map((income) => (
                <motion.div
                  layout
                  key={income.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 group hover:bg-white/[0.08] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <TrendingUp size={18} className="text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {editingId === income.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white w-full"
                          placeholder="Descrição"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editForm.value}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                value: parseFloat(e.target.value),
                              })
                            }
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white w-24"
                            placeholder="Valor"
                          />
                          <input
                            type="text"
                            value={editForm.date}
                            onChange={(e) =>
                              setEditForm({ ...editForm, date: e.target.value })
                            }
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white w-28"
                            placeholder="Data"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-white truncate">
                          {income.name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <DollarSign size={10} />
                            <span className="text-primary font-mono font-bold">
                              {formatCurrency(income.value)}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            {income.date}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {editingId === income.id ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="w-8 h-8 flex items-center justify-center bg-primary/20 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="w-8 h-8 flex items-center justify-center bg-destructive/20 text-destructive rounded-xl hover:bg-destructive hover:text-white transition-all"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(income)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-white rounded-xl transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteIncome(income.id)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-xl transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ManageIncomesModal;
