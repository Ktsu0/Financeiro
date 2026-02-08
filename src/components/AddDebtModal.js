import React, { useState } from "react";
import {
  X,
  Plus,
  Calendar,
  Target,
  DollarSign,
  Wallet,
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

const AddDebtModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    total_amount: "",
    paid_amount: "0",
    installment_value: "",
    due_date: "",
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      total_amount: parseFloat(formData.total_amount),
      paid_amount: parseFloat(formData.paid_amount),
      installment_value: parseFloat(formData.installment_value),
      due_date: formData.due_date,
    });
    setFormData({
      name: "",
      total_amount: "",
      paid_amount: "0",
      installment_value: "",
      due_date: "",
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
        data-testid="add-debt-modal"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-destructive/10 rounded-full blur-3xl" />

        <div className="flex items-center justify-between mb-10 relative">
          <div>
            <h2 className="text-3xl font-black font-heading text-white tracking-tight">
              Nova Dívida
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Registre um novo compromisso de longo prazo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all"
            data-testid="close-debt-modal"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Descrição do Compromisso
            </label>
            <div className="relative">
              <Target
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
                className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-destructive focus:ring-4 focus:ring-destructive/10 rounded-2xl h-14 pl-12 pr-4 w-full transition-all outline-none"
                placeholder="Ex: Empréstimo Bancário"
                data-testid="debt-name-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Valor Total
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-destructive"
                  size={18}
                />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.total_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, total_amount: e.target.value })
                  }
                  className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-destructive focus:ring-4 focus:ring-destructive/10 rounded-2xl h-14 pl-12 pr-4 w-full transition-all outline-none font-mono font-bold"
                  placeholder="0.00"
                  data-testid="debt-total-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Total Já Pago
              </label>
              <div className="relative">
                <Wallet
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                  size={18}
                />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.paid_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, paid_amount: e.target.value })
                  }
                  className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-destructive focus:ring-4 focus:ring-destructive/10 rounded-2xl h-14 pl-12 pr-4 w-full transition-all outline-none font-mono font-bold"
                  placeholder="0.00"
                  data-testid="debt-paid-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Valor da Parcela
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                  size={18}
                />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.installment_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      installment_value: e.target.value,
                    })
                  }
                  className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-destructive focus:ring-4 focus:ring-destructive/10 rounded-2xl h-14 pl-12 pr-4 w-full transition-all outline-none font-mono font-bold"
                  placeholder="0.00"
                  data-testid="debt-installment-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Data de Vencimento
              </label>
              <div className="relative group">
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-destructive transition-colors"
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
                  className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-destructive focus:ring-4 focus:ring-destructive/10 rounded-2xl h-14 pl-12 pr-14 w-full transition-all outline-none"
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
                        className="p-2 hover:bg-white/10 rounded-xl text-muted-foreground hover:text-destructive transition-all"
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

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="flex-1 btn-destructive">
              <Plus size={20} strokeWidth={3} />
              Criar Compromisso
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddDebtModal;
