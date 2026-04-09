import React, { useState, useMemo } from "react";
import { 
  X, 
  Calculator, 
  Search, 
  CheckSquare, 
  Square, 
  Plus, 
  TrendingDown,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "../utils";

const ExpenseCalculatorModal = ({ isOpen, onClose, expenses }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => 
      exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [expenses, searchTerm]);

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredExpenses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredExpenses.map(e => e.id)));
    }
  };

  const totalSelected = useMemo(() => {
    return Array.from(selectedIds).reduce((sum, id) => {
      const exp = expenses.find(e => e.id === id);
      return sum + (exp ? Number(exp.value) : 0);
    }, 0);
  }, [selectedIds, expenses]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative w-full max-w-2xl glass-card rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 pb-4 relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Calculator className="text-primary" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black font-heading text-white tracking-tight">
                  Calculadora de Gastos
                </h2>
                <p className="text-muted-foreground text-sm">
                  Selecione itens para somar o valor total
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou categoria (ex: Mercado)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white outline-none focus:border-primary/50 transition-all font-body"
            />
          </div>

          <div className="flex justify-between items-center px-2">
            <button 
              onClick={selectAll}
              className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
            >
              {selectedIds.size === filteredExpenses.length ? "Desmarcar Todos" : "Selecionar Todos da Busca"}
            </button>
            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
              {selectedIds.size} itens selecionados
            </span>
          </div>
        </div>

        {/* Expenses List */}
        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-2">
          {filteredExpenses.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center opacity-40">
              <TrendingDown size={48} className="mb-4" />
              <p className="font-heading font-bold">Nenhuma despesa encontrada</p>
            </div>
          ) : (
            filteredExpenses.map((exp) => (
              <motion.div
                key={exp.id}
                onClick={() => toggleSelect(exp.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                  selectedIds.has(exp.id) 
                    ? "bg-primary/20 border-primary/30" 
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                }`}
              >
                <div className={`shrink-0 transition-colors ${selectedIds.has(exp.id) ? "text-primary" : "text-white/20"}`}>
                  {selectedIds.has(exp.id) ? <CheckSquare size={22} /> : <Square size={22} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{exp.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">{exp.category} • {exp.due_date}</p>
                </div>
                
                <div className="text-right shrink-0">
                  <p className="text-white font-mono font-bold">{formatCurrency(exp.value)}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Total Footer */}
        <div className="p-8 bg-white/5 border-t border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mb-1">
                Soma dos Selecionados
              </p>
              <motion.p 
                key={totalSelected}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-black font-heading text-primary"
              >
                {formatCurrency(totalSelected)}
              </motion.p>
            </div>
            
            <button
              onClick={onClose}
              className="btn-primary px-8 h-14"
            >
              <span>Concluir</span>
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExpenseCalculatorModal;
