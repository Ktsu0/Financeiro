import React, { useState, useMemo } from "react";
import {
  Edit2,
  Trash2,
  Check,
  X,
  Calendar,
  Tag,
  ChevronRight,
  Search,
  CheckSquare,
  Square,
  Calculator,
  RotateCcw,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "../utils";

const FinancialGrid = React.memo(
  ({ expenses, onUpdateExpense, onDeleteExpense, onCloneExpense }) => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [statusFilter, setStatusFilter] = useState("all"); // "all", "paid", "pending"

    // Filtered data based on search and status
    const filteredExpenses = useMemo(() => {
      return expenses.filter((exp) => {
        const matchesSearch =
          exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exp.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || exp.status === statusFilter;

        return matchesSearch && matchesStatus;
      });
    }, [expenses, searchTerm, statusFilter]);

    const totalSelected = useMemo(() => {
      return Array.from(selectedIds).reduce((sum, id) => {
        const exp = expenses.find((e) => e.id === id);
        return sum + (exp ? Number(exp.value) : 0);
      }, 0);
    }, [selectedIds, expenses]);

    const toggleSelect = (id) => {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelectedIds(newSelected);
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
      const newStatus = expense.status === "paid" ? "pending" : "paid";
      onUpdateExpense(expense.id, { status: newStatus });
    };

    const handleBulkStatusUpdate = (newStatus) => {
      selectedIds.forEach((id) => {
        onUpdateExpense(id, { status: newStatus });
      });
      setSelectedIds(new Set());
    };

    return (
      <div
        className="glass-card rounded-3xl p-6 sm:p-8"
        data-testid="financial-grid"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight font-heading text-white">
              Fluxo de Despesas
            </h2>
            <p className="text-sm text-muted-foreground mt-1 font-body">
              Gerencie e some seus compromissos
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input inline */}
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <input
                type="text"
                placeholder="Procurar despesa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white outline-none focus:border-primary/50 transition-all font-body"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  setStatusFilter(statusFilter === "paid" ? "all" : "paid")
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  statusFilter === "paid"
                    ? "bg-primary/20 border-primary"
                    : "bg-white/5 border-white/5 opacity-50 hover:opacity-100"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-bold uppercase text-white tracking-wider">
                  Pagos
                </span>
              </button>
              <button
                onClick={() =>
                  setStatusFilter(statusFilter === "pending" ? "all" : "pending")
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  statusFilter === "pending"
                    ? "bg-destructive/20 border-destructive"
                    : "bg-white/5 border-white/5 opacity-50 hover:opacity-100"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span className="text-[10px] font-bold uppercase text-white tracking-wider">
                  Pendentes
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Calculator Sum Bar */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                  <Calculator size={18} strokeWidth={3} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-primary/70 mb-0.5">
                    Soma Selecionada
                  </p>
                  <p className="text-xl font-black font-heading text-white">
                    {formatCurrency(totalSelected)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleBulkStatusUpdate("paid")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase tracking-tight transition-all hover:scale-105 active:scale-95"
                >
                  <Check size={14} strokeWidth={3} />
                  Marcar como Pago
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white/50 rounded-xl transition-all"
                  title="Limpar seleção"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10 opacity-50">
              <Search size={24} className="text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-xs font-bold uppercase">
                Nenhum resultado
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredExpenses.map((expense) => (
                <motion.div
                  layout
                  key={expense.id}
                  onClick={() => toggleSelect(expense.id)}
                  className={`rounded-2xl p-4 border transition-all cursor-pointer ${
                    selectedIds.has(expense.id)
                      ? "bg-primary/10 border-primary/30"
                      : "bg-white/5 border-white/5"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`transition-colors ${selectedIds.has(expense.id) ? "text-primary" : "text-white/20"}`}
                      >
                        {selectedIds.has(expense.id) ? (
                          <CheckSquare size={18} />
                        ) : (
                          <Square size={18} />
                        )}
                      </div>
                      <p className="text-sm font-bold text-white">
                        {expense.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                       {onCloneExpense && (
                         <button 
                            onClick={(e) => { e.stopPropagation(); onCloneExpense(expense.id); }}
                            className="p-1.5 bg-white/5 text-white/60 rounded-lg"
                            title="Replicar para mês atual"
                         >
                           <Copy size={12} />
                         </button>
                       )}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(expense);
                        }}
                        className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                          expense.status === "paid"
                            ? "bg-primary/20 text-primary"
                            : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {expense.status === "paid" ? "Pago" : "Pendente"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end border-t border-white/5 pt-3">
                    <p className="text-base font-black font-mono text-white">
                      {formatCurrency(expense.value)}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-white/40">
                      <Calendar size={10} />
                      <span>{expense.due_date}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <th className="pb-3 px-4 w-12">#</th>
                <th className="pb-3 px-4">Descrição</th>
                <th className="pb-3 px-4">Valor</th>
                <th className="pb-3 px-4 text-center">Vencimento</th>
                <th className="pb-3 px-4 text-center">Status</th>
                <th className="pb-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center opacity-40">
                    <p className="text-sm font-bold uppercase tracking-widest">
                      Nada encontrado para "{searchTerm}"
                    </p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredExpenses.map((expense, index) => (
                    <motion.tr
                      layout
                      key={expense.id}
                      className={`group hover:bg-white/[0.04] transition-all cursor-pointer ${
                        selectedIds.has(expense.id)
                          ? "bg-primary/5"
                          : "bg-white/[0.02]"
                      }`}
                      onClick={() => toggleSelect(expense.id)}
                    >
                      <td className="py-3 px-4 first:rounded-l-2xl border-l border-y border-transparent">
                        <div
                          className={`transition-colors ${selectedIds.has(expense.id) ? "text-primary" : "text-white/20"}`}
                        >
                          {selectedIds.has(expense.id) ? (
                            <CheckSquare size={18} />
                          ) : (
                            <Square size={18} />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-y border-transparent">
                        {editingId === expense.id ? (
                          <input
                            type="text"
                            onClick={(e) => e.stopPropagation()}
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="bg-slate-900 border border-white/20 text-white text-xs rounded-lg h-8 px-2 w-full"
                            autoFocus
                          />
                        ) : (
                          <div>
                            <p className="text-sm font-bold text-white leading-none mb-1">
                              {expense.name}
                            </p>
                            <p className="text-[9px] uppercase font-black text-white/30 tracking-tight">
                              {expense.category}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 border-y border-transparent">
                        <span className="text-sm font-black font-mono text-white">
                          {formatCurrency(expense.value)}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-y border-transparent text-center">
                        <span className="text-[10px] font-bold text-white/40">
                          {expense.due_date}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-y border-transparent text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(expense);
                          }}
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            expense.status === "paid"
                              ? "bg-primary/20 text-primary"
                              : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {expense.status === "paid" ? "Pago" : "Pendente"}
                        </button>
                      </td>
                      <td className="py-3 px-4 border-y border-transparent border-r last:rounded-r-2xl text-right">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          {editingId === expense.id ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSave();
                                }}
                                className="p-2 bg-primary/20 text-primary rounded-lg"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancel();
                                }}
                                className="p-2 bg-destructive/20 text-destructive rounded-lg"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              {onCloneExpense && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); onCloneExpense(expense.id); }}
                                  className="p-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10"
                                  title="Replicar para mês atual"
                                >
                                  <Copy size={14} />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(expense);
                                }}
                                className="p-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteExpense(expense.id);
                                }}
                                className="p-2 bg-destructive/10 text-destructive/60 rounded-lg hover:bg-destructive/20"
                              >
                                <Trash2 size={14} />
                              </button>
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
