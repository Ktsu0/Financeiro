import React from "react";
import { motion } from "framer-motion";
import {
  X,
  Settings,
  Shield,
  Cloud,
  Download,
  Upload,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import ExportButtons from "./ExportButtons";

const SettingsModal = ({
  isOpen,
  onClose,
  expenses,
  debts,
  incomes,
  cloudUrl,
  isSyncing,
  onUpdateCloudUrl,
  showPet,
  onUpdatePetVisibility,
  onExportJSON,
  onImportJSON,
}) => {
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
        className="relative w-[92%] max-w-2xl max-h-[90vh] sm:max-h-[85vh] glass-card rounded-[2rem] p-[6%] sm:p-8 overflow-hidden shadow-2xl border border-white/10 flex flex-col"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

        {/* Header - Fixed at top */}
        <div className="flex items-center justify-between mb-8 relative shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Settings className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-heading text-white tracking-tight">
                Configurações
              </h2>
              <p className="text-muted-foreground text-[11px] sm:text-sm mt-1">
                Gerencie seus dados e sincronização
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

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 relative">
          {/* Information Section */}
          <section className="bg-white/5 border border-white/5 rounded-3xl p-[6%] sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-primary" size={20} />
              <h3 className="text-base sm:text-lg font-bold text-white">
                Privacidade e Dados
              </h3>
            </div>
            <p className="text-[0.8rem] sm:text-sm text-slate-400 leading-relaxed">
              Suas informações são armazenadas localmente no seu navegador por
              padrão. Para maior segurança e acesso em outros dispositivos,
              configure a sincronização com a nuvem abaixo.
            </p>
          </section>

          {/* Personalization Section */}
          <section className="bg-white/5 border border-white/5 rounded-3xl p-[6%] sm:p-6">
            <div className="flex items-center justify-between font-body gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Sparkles className="text-primary shrink-0" size={20} />
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">
                    Assistente Visual
                  </h3>
                  <p className="text-[0.75rem] sm:text-sm text-slate-400 truncate">
                    Ativar o pet animado
                  </p>
                </div>
              </div>
              <button
                onClick={() => onUpdatePetVisibility(!showPet)}
                className={`w-14 h-7 rounded-full transition-all duration-300 relative shrink-0 ${
                  showPet ? "bg-primary" : "bg-white/10"
                }`}
              >
                <motion.div
                  animate={{
                    x: showPet ? 30 : 4,
                  }}
                  className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                />
              </button>
            </div>
          </section>

          {/* Tools Section */}
          <section className="space-y-4">
            <h3 className="text-[11px] sm:text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">
              Exportação e Backup
            </h3>
            <div className="bg-white/5 border border-white/5 rounded-3xl p-5 sm:p-6">
              <ExportButtons
                expenses={expenses}
                debts={debts}
                incomes={incomes}
                cloudUrl={cloudUrl}
                isSyncing={isSyncing}
                onUpdateCloudUrl={onUpdateCloudUrl}
                onExportJSON={onExportJSON}
                onImportJSON={onImportJSON}
              />
            </div>
          </section>

          <footer className="pt-6 pb-2 flex justify-center w-full">
            <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.2em] text-center w-full">
              Meu Financeiro v2.0 • 100% Local & Seguro
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
