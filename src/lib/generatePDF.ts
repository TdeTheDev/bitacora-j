import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { BitacoraSchema } from "./schemas";

const turnoLabel: Record<string, string> = {
  mananero: "Mañanero",
  nocturno: "Nocturno",
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function generatePDF(data: BitacoraSchema) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
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
    head: [["Concepto", "Valor"]],
    body: [
      ["Parlays realizadas", `${Number(data.parlayTotal || 0)}`],
      ["Tickets generados", `${Number(data.ticketsOperaciones || 0)}`],
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

  // Imagenes
  if ((data.imagenes || []).length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Imagenes (${data.imagenes.length})`, margin, y);
    y += 4;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 16;

    const imgW = (contentW - 8) / 2;
    const imgH = 120;
    let col = 0;

    for (const img of data.imagenes || []) {
      try {
        const loaded = await loadImage(img.src);
        const x = margin + col * (imgW + 8);

        if (y + imgH + 30 > pageH - 60) {
          doc.addPage();
          y = margin;
        }

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.roundedRect(x, y, imgW, imgH, 3, 3, "S");

        const ratio = Math.min(imgW / loaded.width, imgH / loaded.height);
        const drawW = loaded.width * ratio;
        const drawH = loaded.height * ratio;
        const drawX = x + (imgW - drawW) / 2;
        const drawY = y + (imgH - drawH) / 2;

        doc.addImage(loaded, "JPEG", drawX, drawY, drawW, drawH);

        if (img.descripcion) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(112, 112, 112);
          const descLines = doc.splitTextToSize(img.descripcion, imgW - 4);
          doc.text(descLines, x + 2, y + imgH + 10);
        }

        col++;
        if (col === 2) {
          col = 0;
          y += imgH + 30;
        }
      } catch {
        // skip broken images
      }
    }

    if (col > 0) y += imgH + 30;
    y += 10;
  }

  // Observaciones
  if (data.observaciones) {
    if (y + 80 > pageH - 60) {
      doc.addPage();
      y = margin;
    }

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

  doc.save(`bitacora-${data.fecha || "sin-fecha"}.pdf`);
}
