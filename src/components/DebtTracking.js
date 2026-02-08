import React, { useState } from "react";
import {
  Edit2,
  Trash2,
  Check,
  X,
  Plus,
  Calendar,
  Target,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "../utils";

const DebtTracking = React.memo(({ debts, onUpdateDebt, onDeleteDebt }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

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
      debt.total_amount,
    );
    onUpdateDebt(debt.id, { paid_amount: newPaidAmount });
  };

  const calculateProgress = (debt) => {
    return (debt.paid_amount / debt.total_amount) * 100;
  };

  return (
    <div className="glass-card rounded-3xl p-8" data-testid="debt-tracking">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-destructive/10 rounded-2xl">
          <Target className="text-destructive" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight font-heading text-white">
            Gestão de Dívidas
          </h2>
          <p className="text-sm text-muted-foreground font-body">
            Acompanhe seu progresso de liquidação
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {debts.length === 0 ? (
          <div className="md:col-span-2 py-16 text-center bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Target size={32} className="text-destructive opacity-50" />
            </div>
            <p
              className="text-muted-foreground font-medium"
              data-testid="no-debts-message"
            >
              Você não possui dívidas registradas no momento.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {debts.map((debt, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                key={debt.id}
                className="relative overflow-hidden bg-white/5 border border-white/5 rounded-2xl p-6 group hover:bg-white/[0.08] transition-all duration-300"
                data-testid={`debt-card-${debt.id}`}
              >
                {/* Background Accent */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-destructive/5 rounded-full blur-2xl group-hover:bg-destructive/10 transition-colors" />

                <div className="relative flex items-start justify-between mb-6">
                  <div className="flex-1">
                    {editingId === debt.id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="bg-background border border-border text-white text-sm rounded-lg h-9 px-3 w-full mb-2"
                        autoFocus
                      />
                    ) : (
                      <h3
                        className="text-lg font-bold text-white group-hover:text-destructive transition-colors"
                        data-testid={`debt-name-${debt.id}`}
                      >
                        {debt.name}
                      </h3>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md">
                        <Calendar size={12} className="text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          {debt.due_date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all items-center">
                    {editingId === debt.id ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="w-8 h-8 flex items-center justify-center bg-primary/20 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="w-8 h-8 flex items-center justify-center bg-destructive/20 text-destructive rounded-xl hover:bg-destructive hover:text-white transition-all"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handlePayInstallment(debt)}
                          disabled={debt.paid_amount >= debt.total_amount}
                          className="w-8 h-8 flex items-center justify-center hover:bg-primary/20 text-primary rounded-xl disabled:opacity-30 transition-all font-bold"
                          title="Pagar Parcela"
                        >
                          <TrendingUp size={14} strokeWidth={3} />
                        </button>
                        <button
                          onClick={() => handleEdit(debt)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-white/50 rounded-xl transition-all"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteDebt(debt.id)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-destructive/10 text-destructive/50 rounded-xl transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                      Total
                    </p>
                    {editingId === debt.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.total_amount}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            total_amount: parseFloat(e.target.value),
                          })
                        }
                        className="bg-background border border-border text-white text-xs rounded-md h-7 px-2 w-full"
                      />
                    ) : (
                      <p className="text-sm font-black font-mono text-white/80">
                        {formatCurrency(debt.total_amount)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                      Restante
                    </p>
                    <p className="text-sm font-black font-mono text-destructive">
                      {formatCurrency(debt.total_amount - debt.paid_amount)}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                      Valor Parcela
                    </p>
                    {editingId === debt.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.installment_value}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            installment_value: parseFloat(e.target.value),
                          })
                        }
                        className="bg-background border border-border text-white text-xs rounded-md h-7 px-2 w-full"
                      />
                    ) : (
                      <p className="text-sm font-black font-mono text-white">
                        {formatCurrency(debt.installment_value)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative pt-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Amortização
                    </span>
                    <span className="text-[10px] font-black text-primary">
                      {calculateProgress(debt).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress(debt)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-gradient-to-r from-primary to-primary/50 h-full rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                      data-testid={`debt-progress-${debt.id}`}
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
});

export default DebtTracking;
