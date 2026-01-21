import React from 'react';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { parse } from 'papaparse';

const ExportButtons = ({ expenses, debts, incomes }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const exportToCSV = () => {
    // Prepare expenses data
    const expensesCSV = expenses.map(exp => ({
      Tipo: 'Despesa',
      Nome: exp.name,
      Categoria: exp.category,
      Valor: exp.value,
      Data: exp.due_date,
      Status: exp.status === 'paid' ? 'Pago' : 'Pendente',
      Fixa: exp.is_fixed ? 'Sim' : 'Não'
    }));

    // Prepare debts data
    const debtsCSV = debts.map(debt => ({
      Tipo: 'Dívida',
      Nome: debt.name,
      Categoria: '-',
      'Valor Total': debt.total_amount,
      'Valor Pago': debt.paid_amount,
      'Valor Restante': debt.total_amount - debt.paid_amount,
      'Valor Parcela': debt.installment_value,
      Vencimento: debt.due_date
    }));

    // Prepare incomes data
    const incomesCSV = incomes.map(inc => ({
      Tipo: 'Receita',
      Nome: inc.name,
      Valor: inc.value,
      Data: inc.date
    }));

    // Convert to CSV format
    const csvContent = [
      // Expenses section
      'DESPESAS',
      'Nome,Categoria,Valor,Data,Status,Fixa',
      ...expensesCSV.map(exp => `${exp.Nome},${exp.Categoria},${exp.Valor},${exp.Data},${exp.Status},${exp.Fixa}`),
      '',
      // Debts section
      'DÍVIDAS',
      'Nome,Valor Total,Valor Pago,Valor Restante,Valor Parcela,Vencimento',
      ...debtsCSV.map(debt => `${debt.Nome},${debt['Valor Total']},${debt['Valor Pago']},${debt['Valor Restante']},${debt['Valor Parcela']},${debt.Vencimento}`),
      '',
      // Incomes section
      'RECEITAS',
      'Nome,Valor,Data',
      ...incomesCSV.map(inc => `${inc.Nome},${inc.Valor},${inc.Data}`)
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financas_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 255, 148);
    doc.text('NEONFINANCE', 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Relatório Financeiro', 14, 28);
    
    let yPosition = 40;

    // Expenses table
    if (expenses.length > 0) {
      doc.setFontSize(14);
      doc.text('Despesas', 14, yPosition);
      yPosition += 5;

      doc.autoTable({
        startY: yPosition,
        head: [['Nome', 'Categoria', 'Valor', 'Vencimento', 'Status', 'Fixa']],
        body: expenses.map(exp => [
          exp.name,
          exp.category,
          formatCurrency(exp.value),
          exp.due_date,
          exp.status === 'paid' ? 'Pago' : 'Pendente',
          exp.is_fixed ? 'Sim' : 'Não'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [0, 255, 148], textColor: [0, 0, 0] },
        margin: { top: 10 }
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
      doc.text('Dívidas', 14, yPosition);
      yPosition += 5;

      doc.autoTable({
        startY: yPosition,
        head: [['Nome', 'Total', 'Pago', 'Restante', 'Parcela', 'Vencimento']],
        body: debts.map(debt => [
          debt.name,
          formatCurrency(debt.total_amount),
          formatCurrency(debt.paid_amount),
          formatCurrency(debt.total_amount - debt.paid_amount),
          formatCurrency(debt.installment_value),
          debt.due_date
        ]),
        theme: 'grid',
        headStyles: { fillColor: [255, 0, 85], textColor: [255, 255, 255] },
        margin: { top: 10 }
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
      doc.text('Receitas', 14, yPosition);
      yPosition += 5;

      doc.autoTable({
        startY: yPosition,
        head: [['Nome', 'Valor', 'Data']],
        body: incomes.map(inc => [
          inc.name,
          formatCurrency(inc.value),
          inc.date
        ]),
        theme: 'grid',
        headStyles: { fillColor: [0, 255, 148], textColor: [0, 0, 0] },
        margin: { top: 10 }
      });
    }

    // Save the PDF
    doc.save(`financas_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="flex gap-3" data-testid="export-buttons">
      <button
        onClick={exportToCSV}
        className="flex items-center gap-2 bg-transparent border border-primary text-primary hover:bg-primary/10 font-medium rounded-full px-6 py-2 font-heading"
        data-testid="export-csv-btn"
      >
        <Download size={16} strokeWidth={1.5} />
        Exportar CSV
      </button>
      <button
        onClick={exportToPDF}
        className="flex items-center gap-2 bg-transparent border border-primary text-primary hover:bg-primary/10 font-medium rounded-full px-6 py-2 font-heading"
        data-testid="export-pdf-btn"
      >
        <Download size={16} strokeWidth={1.5} />
        Exportar PDF
      </button>
    </div>
  );
};

export default ExportButtons;
