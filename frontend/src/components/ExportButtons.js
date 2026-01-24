import { useRef, useState } from "react";
import {
  Download,
  FileText,
  Table,
  FileJson,
  Upload,
  Cloud,
  RefreshCw,
  Check,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "../utils";

const ExportButtons = ({
  expenses,
  debts,
  incomes,
  cloudUrl,
  isSyncing,
  onUpdateCloudUrl,
  onExportJSON,
  onImportJSON,
}) => {
  const fileInputRef = useRef(null);
  const [showCloudInput, setShowCloudInput] = useState(false);
  const [tempUrl, setTempUrl] = useState(cloudUrl || "");

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (content) onImportJSON(content);
      };
      reader.readAsText(file);
    }
    event.target.value = "";
  };

  const handleCloudSubmit = (e) => {
    e.preventDefault();
    onUpdateCloudUrl(tempUrl);
    setShowCloudInput(false);
  };

  const exportToCSV = () => {
    const expensesCSV = expenses.map((exp) => ({
      Tipo: "Despesa",
      Nome: exp.name || "-",
      Categoria: exp.category || "-",
      Valor: exp.value || 0,
      Data: exp.due_date || "-",
      Status: exp.status === "paid" ? "Pago" : "Pendente",
      Fixa: exp.is_fixed ? "Sim" : "Não",
    }));

    const debtsCSV = debts.map((debt) => ({
      Tipo: "Dívida",
      Nome: debt.name || "-",
      Categoria: "-",
      "Valor Total": debt.total_amount || 0,
      "Valor Pago": debt.paid_amount || 0,
      "Valor Restante": (debt.total_amount || 0) - (debt.paid_amount || 0),
      "Valor Parcela": debt.installment_value || 0,
      Vencimento: debt.due_date || "-",
    }));

    const incomesCSV = incomes.map((inc) => ({
      Tipo: "Receita",
      Nome: inc.name || "-",
      Valor: inc.value || 0,
      Data: inc.date || "-",
    }));

    // Prefix with UTF-8 BOM for Excel compatibility
    const csvContent =
      "\uFEFF" +
      [
        "DESPESAS",
        "Nome;Categoria;Valor;Data;Status;Fixa",
        ...expensesCSV.map(
          (exp) =>
            `${exp.Nome};${exp.Categoria};"${exp.Valor}";${exp.Data};${exp.Status};${exp.Fixa}`,
        ),
        "",
        "DÍVIDAS",
        "Nome;Valor Total;Valor Pago;Valor Restante;Valor Parcela;Vencimento",
        ...debtsCSV.map(
          (debt) =>
            `${debt.Nome};"${debt["Valor Total"]}";"${debt["Valor Pago"]}";"${debt["Valor Restante"]}";"${debt["Valor Parcela"]}";${debt.Vencimento}`,
        ),
        "",
        "RECEITAS",
        "Nome;Valor;Data",
        ...incomesCSV.map((inc) => `${inc.Nome};"${inc.Valor}";${inc.Data}`),
      ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `financas_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(34, 197, 94);
      doc.text("NEONFINANCE", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Relatório Consolidado - Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
        14,
        28,
      );

      let yPosition = 40;

      if (expenses && expenses.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Relatório de Despesas", 14, yPosition);
        yPosition += 5;
        autoTable(doc, {
          startY: yPosition,
          head: [
            ["Nome", "Categoria", "Valor", "Vencimento", "Status", "Fixa"],
          ],
          body: expenses.map((exp) => [
            exp.name || "-",
            exp.category || "-",
            formatCurrency(exp.value || 0),
            exp.due_date || "-",
            exp.status === "paid" ? "Pago" : "Pendente",
            exp.is_fixed ? "Sim" : "Não",
          ]),
          theme: "striped",
          headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255] },
        });
        yPosition = doc.lastAutoTable.finalY + 15;
      }

      if (debts && debts.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Relatório de Dívidas", 14, yPosition);
        yPosition += 5;
        autoTable(doc, {
          startY: yPosition,
          head: [
            ["Nome", "Total", "Pago", "Restante", "Parcela", "Vencimento"],
          ],
          body: debts.map((debt) => [
            debt.name || "-",
            formatCurrency(debt.total_amount || 0),
            formatCurrency(debt.paid_amount || 0),
            formatCurrency((debt.total_amount || 0) - (debt.paid_amount || 0)),
            formatCurrency(debt.installment_value || 0),
            debt.due_date || "-",
          ]),
          theme: "striped",
          headStyles: { fillColor: [244, 63, 94], textColor: [255, 255, 255] },
        });
        yPosition = doc.lastAutoTable.finalY + 15;
      }

      if (incomes && incomes.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Relatório de Receitas", 14, yPosition);
        yPosition += 5;
        autoTable(doc, {
          startY: yPosition,
          head: [["Nome", "Valor", "Data"]],
          body: incomes.map((inc) => [
            inc.name || "-",
            formatCurrency(inc.value || 0),
            inc.date || "-",
          ]),
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        });
      }

      doc.save(`financas_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Erro ao gerar PDF. Verifique se os dados estão corretos.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

        {/* Cloud Sync Status/Config */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCloudInput(!showCloudInput)}
            className={`btn-secondary flex items-center gap-2 ${cloudUrl ? "border-primary/50" : "border-slate-700"}`}
          >
            {isSyncing ? (
              <RefreshCw size={18} className="text-primary animate-spin" />
            ) : cloudUrl ? (
              <Cloud size={18} className="text-primary" />
            ) : (
              <Cloud size={18} className="text-slate-500" />
            )}
            <span className="text-xs sm:text-sm">
              {cloudUrl ? "Nuvem Ativa" : "Configurar Nuvem"}
            </span>
          </motion.button>

          {cloudUrl && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Check size={12} className="text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                Sincronizado
              </span>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-slate-800 mx-2 hidden sm:block" />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onExportJSON}
          className="btn-secondary border-purple-500/30 hover:border-purple-500/50"
        >
          <FileJson size={18} className="text-purple-400" />
          <span className="text-xs sm:text-sm">Backup JSON</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleImportClick}
          className="btn-secondary border-orange-500/30 hover:border-orange-500/50"
        >
          <Upload size={18} className="text-orange-400" />
          <span className="text-xs sm:text-sm">Importar</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportToCSV}
          className="btn-secondary"
        >
          <Table size={18} className="text-primary" />
          <span className="text-xs sm:text-sm">CSV</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportToPDF}
          className="btn-secondary"
        >
          <FileText size={18} className="text-blue-400" />
          <span className="text-xs sm:text-sm">PDF</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showCloudInput && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleCloudSubmit}
            className="overflow-hidden"
          >
            <div className="glass-card p-4 rounded-xl border-primary/20 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={18}
                  className="text-warning mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cole aqui a <b>URL do App da Web</b> gerada no Google Apps
                  Script. Isso ativará a sincronização automática com sua
                  planilha na nuvem.
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-primary outline-none transition-all"
                />
                <button
                  type="submit"
                  className="btn-primary py-2 px-4 text-xs rounded-lg"
                >
                  Salvar Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempUrl("");
                    onUpdateCloudUrl("");
                    setShowCloudInput(false);
                  }}
                  className="px-3 py-2 text-xs text-slate-500 hover:text-destructive transition-colors"
                >
                  Remover
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportButtons;
