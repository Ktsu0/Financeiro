import React from "react";
import { Download, FileText, Table } from "lucide-react";
// Imports removed for dynamic loading
import { motion } from "framer-motion";
import { formatCurrency } from "../utils";

const ExportButtons = ({ expenses, debts, incomes }) => {
  const exportToCSV = () => {
    // Prepare expenses data
    const expensesCSV = expenses.map((exp) => ({
      Tipo: "Despesa",
      Nome: exp.name,
      Categoria: exp.category,
      Valor: exp.value,
      Data: exp.due_date,
      Status: exp.status === "paid" ? "Pago" : "Pendente",
      Fixa: exp.is_fixed ? "Sim" : "Não",
    }));

    // Prepare debts data
    const debtsCSV = debts.map((debt) => ({
      Tipo: "Dívida",
      Nome: debt.name,
      Categoria: "-",
      "Valor Total": debt.total_amount,
      "Valor Pago": debt.paid_amount,
      "Valor Restante": debt.total_amount - debt.paid_amount,
      "Valor Parcela": debt.installment_value,
      Vencimento: debt.due_date,
    }));

    // Prepare incomes data
    const incomesCSV = incomes.map((inc) => ({
      Tipo: "Receita",
      Nome: inc.name,
      Valor: inc.value,
      Data: inc.date,
    }));

    // Convert to CSV format
    const csvContent = [
      "DESPESAS",
      "Nome,Categoria,Valor,Data,Status,Fixa",
      ...expensesCSV.map(
        (exp) =>
          `${exp.Nome},${exp.Categoria},${exp.Valor},${exp.Data},${exp.Status},${exp.Fixa}`,
      ),
      "",
      "DÍVIDAS",
      "Nome,Valor Total,Valor Pago,Valor Restante,Valor Parcela,Vencimento",
      ...debtsCSV.map(
        (debt) =>
          `${debt.Nome},${debt["Valor Total"]},${debt["Valor Pago"]},${debt["Valor Restante"]},${debt["Valor Parcela"]},${debt.Vencimento}`,
      ),
      "",
      "RECEITAS",
      "Nome,Valor,Data",
      ...incomesCSV.map((inc) => `${inc.Nome},${inc.Valor},${inc.Data}`),
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
    const { default: jsPDF } = await import("jspdf");
    await import("jspdf-autotable");
    const doc = new jsPDF();

    // Title
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

    // Expenses table
    if (expenses.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Relatório de Despesas", 14, yPosition);
      yPosition += 5;

      doc.autoTable({
        startY: yPosition,
        head: [["Nome", "Categoria", "Valor", "Vencimento", "Status", "Fixa"]],
        body: expenses.map((exp) => [
          exp.name,
          exp.category,
          formatCurrency(exp.value),
          exp.due_date,
          exp.status === "paid" ? "Pago" : "Pendente",
          exp.is_fixed ? "Sim" : "Não",
        ]),
        theme: "striped",
        headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255] },
        margin: { top: 10 },
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Debts table
    if (debts.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Relatório de Dívidas", 14, yPosition);
      yPosition += 5;

      doc.autoTable({
        startY: yPosition,
        head: [["Nome", "Total", "Pago", "Restante", "Parcela", "Vencimento"]],
        body: debts.map((debt) => [
          debt.name,
          formatCurrency(debt.total_amount),
          formatCurrency(debt.paid_amount),
          formatCurrency(debt.total_amount - debt.paid_amount),
          formatCurrency(debt.installment_value),
          debt.due_date,
        ]),
        theme: "striped",
        headStyles: { fillColor: [244, 63, 94], textColor: [255, 255, 255] },
        margin: { top: 10 },
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Incomes table
    if (incomes.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Relatório de Receitas", 14, yPosition);
      yPosition += 5;

      doc.autoTable({
        startY: yPosition,
        head: [["Nome", "Valor", "Data"]],
        body: incomes.map((inc) => [
          inc.name,
          formatCurrency(inc.value),
          inc.date,
        ]),
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        margin: { top: 10 },
      });
    }

    doc.save(`financas_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="flex gap-3 flex-wrap" data-testid="export-buttons">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={exportToCSV}
        className="btn-secondary"
        data-testid="export-csv-btn"
      >
        <Table size={18} className="text-primary" />
        <span>Exportar CSV</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={exportToPDF}
        className="btn-secondary"
        data-testid="export-pdf-btn"
      >
        <FileText size={18} className="text-blue-400" />
        <span>Gerar Relatório PDF</span>
      </motion.button>
    </div>
  );
};

export default ExportButtons;
