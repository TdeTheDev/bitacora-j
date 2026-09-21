import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { BitacoraSchema } from "./schemas";

const turnoLabel: Record<string, string> = {
  mananero: "Mananero",
  nocturno: "Nocturno",
};

export function generatePDF(data: BitacoraSchema) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  const contentW = pageW - margin * 2;
  let y = margin;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Bitacora Laboral", margin, y + 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(112, 112, 112);
  doc.text("Registro diario de operaciones", margin, y + 34);

  // Yellow badge for turno
  const badgeText = turnoLabel[data.turno] || "—";
  const badgeW = doc.getTextWidth(badgeText) + 12;
  doc.setFillColor(255, 218, 110);
  doc.roundedRect(pageW - margin - badgeW, y + 4, badgeW, 18, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(badgeText, pageW - margin - badgeW + 6, y + 16);

  y += 50;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 20;

  // Meta info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(112, 112, 112);

  const metaItems = [
    ["Nombre", data.nombre || "—"],
    ["Fecha", data.fecha || "—"],
    ["Hora", data.hora || "—"],
    ["Turno", turnoLabel[data.turno] || "—"],
  ];

  for (const [label, value] of metaItems) {
    doc.text(label, margin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(value, margin + 80, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(112, 112, 112);
    y += 16;
  }

  y += 10;

  // Section: Datos Operativos
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Datos Operativos", margin, y);
  y += 4;
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 16;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Concepto", "Monto"]],
    body: [
      ["Total Parlay / Apuestas", `$${Number(data.parlayTotal || 0).toFixed(2)}`],
      ["Tickets / Operaciones generadas", `${Number(data.ticketsOperaciones || 0)}`],
      ["Premios pagados / Balance en caja", `$${Number(data.premiosBalance || 0).toFixed(2)}`],
    ],
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: {
      fillColor: [248, 245, 237],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      lineWidth: 0.25,
      lineColor: [112, 112, 112],
    },
    alternateRowStyles: { fillColor: [248, 245, 237] },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;

  // Conceptos adicionales
  if (data.conceptos.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Conceptos Adicionales", margin, y);
    y += 4;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 16;

    const totalConceptos = data.conceptos.reduce(
      (sum, c) => sum + Number(c.monto || 0),
      0,
    );

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Descripcion", "Monto"]],
      body: [
        ...data.conceptos.map((c) => [
          c.descripcion || "—",
          `$${Number(c.monto || 0).toFixed(2)}`,
        ]),
        ["Subtotal Conceptos", `$${totalConceptos.toFixed(2)}`],
      ],
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: {
        fillColor: [248, 245, 237],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        lineWidth: 0.25,
        lineColor: [112, 112, 112],
      },
      alternateRowStyles: { fillColor: [248, 245, 237] },
    });

    y =
      (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 20;
  }

  // Observaciones
  if (data.observaciones) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Observaciones del Dia", margin, y);
    y += 4;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 12;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    const obsLines = doc.splitTextToSize(data.observaciones, contentW - 16);
    const obsH = obsLines.length * 14 + 16;
    doc.roundedRect(margin, y, contentW, obsH, 4, 4, "S");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(112, 112, 112);
    doc.text(obsLines, margin + 8, y + 14);
    y += obsH + 20;
  }

  // Signature section
  const sigY = Math.max(y + 40, doc.internal.pageSize.getHeight() - 80);
  const sigW = contentW * 0.4;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);

  // Pepina signature
  doc.line(margin, sigY, margin + sigW, sigY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(112, 112, 112);
  doc.text("FIRMA DE PEPINA", margin, sigY + 14, { align: "center" });

  // Supervisor signature
  doc.line(pageW - margin - sigW, sigY, pageW - margin, sigY);
  doc.text(
    "Vo. Bo. SUPERVISOR",
    pageW - margin - sigW / 2,
    sigY + 14,
    { align: "center" },
  );

  doc.save(`bitacora-${data.fecha || "sin-fecha"}.pdf`);
}
