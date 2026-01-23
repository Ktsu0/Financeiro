import React, { useState } from "react";
import {
  X,
  Plus,
  Minus,
  Calendar,
  Tag,
  DollarSign,
  Repeat,
  LayoutGrid,
  CalendarDays,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { formatDateMask, formatDateDisplay, parseDate } from "../utils";

const AddTransactionModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    value: "",
    due_date: "",
    status: "pending",
    is_fixed: false,
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      value: parseFloat(formData.value),
    });
    setFormData({
      name: "",
      category: "",
      value: "",
      due_date: "",
      status: "pending",
      is_fixed: false,
    });
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
        className="relative w-full max-w-lg glass-card rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl border border-white/10"
        data-testid="add-expense-modal"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

        <div className="flex items-center justify-between mb-10 relative">
          <div>
            <h2 className="text-3xl font-black font-heading text-white tracking-tight">
              Nova Despesa
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Gere um novo registro de saída financeira
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all"
            data-testid="close-expense-modal"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mr-1">
                Nome
              </label>
              <div className="relative">
                <Tag
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl h-14 pl-12 pr-4 w-full transition-all outline-none"
                  placeholder="Ex: Aluguel"
                  data-testid="expense-name-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Categoria
              </label>
              <div className="relative">
                <LayoutGrid
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl h-14 pl-12 pr-4 w-full transition-all outline-none"
                  placeholder="Ex: Moradia"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Valor
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                  size={18}
                />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl h-14 pl-12 pr-4 w-full transition-all outline-none font-mono font-bold"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Vencimento
              </label>
              <div className="relative group">
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  required
                  value={formData.due_date}
                  onChange={(e) => {
                    const masked = formatDateMask(e.target.value);
                    setFormData({ ...formData, due_date: masked });
                  }}
                  className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl h-14 pl-12 pr-14 w-full transition-all outline-none"
                  placeholder="DD/MM/YYYY"
                  maxLength={10}
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="p-2 hover:bg-white/10 rounded-xl text-muted-foreground hover:text-primary transition-all"
                      >
                        <CalendarDays size={20} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 border-white/10 bg-[#0f172a]"
                      align="end"
                    >
                      <CalendarPicker
                        mode="single"
                        selected={parseDate(formData.due_date)}
                        onSelect={(date) => {
                          if (date) {
                            setFormData({
                              ...formData,
                              due_date: formatDateDisplay(date),
                            });
                            setIsCalendarOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Status Inicial
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white appearance-none outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                >
                  <option value="pending" className="bg-[#0f172a]">
                    Pendente
                  </option>
                  <option value="paid" className="bg-[#0f172a]">
                    Pago
                  </option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.5 4.5L6 8L9.5 4.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div
              className="flex-1 flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 h-14 self-end hover:bg-white/[0.08] transition-all cursor-pointer"
              onClick={() =>
                setFormData({ ...formData, is_fixed: !formData.is_fixed })
              }
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.is_fixed ? "bg-primary border-primary" : "border-white/20"}`}
                >
                  {formData.is_fixed && (
                    <Check size={14} className="text-black stroke-[3]" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white leading-none">
                    Despesa Fixa
                  </span>
                  <span className="text-[8px] text-muted-foreground uppercase font-black mt-1">
                    Recorrente mensal
                  </span>
                </div>
                <Repeat
                  size={16}
                  className={`ml-auto transition-colors ${formData.is_fixed ? "text-primary" : "text-white/20"}`}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="flex-1 btn-primary">
              <Plus size={20} strokeWidth={3} />
              Salvar Registro
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddTransactionModal;
