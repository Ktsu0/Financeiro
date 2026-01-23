import React, { useState } from "react";
import {
  X,
  Plus,
  Calendar,
  DollarSign,
  Wallet,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { formatDateMask, formatDateDisplay, parseDate } from "../utils";

const AddIncomeModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    date: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      value: parseFloat(formData.value),
      date: formData.date,
    });
    setFormData({
      name: "",
      value: "",
      date: "",
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
        data-testid="add-income-modal"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="flex items-center justify-between mb-10 relative">
          <div>
            <h2 className="text-3xl font-black font-heading text-white tracking-tight">
              Nova Receita
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Gere um novo registro de entrada financeira
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all"
            data-testid="close-income-modal"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Descrição
            </label>
            <div className="relative">
              <TrendingUp
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
                className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl h-14 pl-12 pr-4 w-full transition-all outline-none"
                placeholder="Ex: Salário Mensal"
                data-testid="income-name-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Valor
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
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
                  className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl h-14 pl-12 pr-4 w-full transition-all outline-none font-mono font-bold"
                  placeholder="0.00"
                  data-testid="income-value-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Data
              </label>
              <div className="relative group">
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  required
                  value={formData.date}
                  onChange={(e) => {
                    const masked = formatDateMask(e.target.value);
                    setFormData({ ...formData, date: masked });
                  }}
                  className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl h-14 pl-12 pr-14 w-full transition-all outline-none"
                  placeholder="DD/MM/YYYY"
                  maxLength={10}
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="p-2 hover:bg-white/10 rounded-xl text-muted-foreground hover:text-blue-500 transition-all"
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
                        selected={parseDate(formData.date)}
                        onSelect={(date) => {
                          if (date) {
                            setFormData({
                              ...formData,
                              date: formatDateDisplay(date),
                            });
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

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 btn-base bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20"
            >
              <Plus size={20} strokeWidth={3} />
              Adicionar Receita
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddIncomeModal;
