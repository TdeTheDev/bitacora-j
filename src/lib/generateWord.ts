import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel,
  BorderStyle,
  ImageRun,
  type ITableCellOptions,
} from "docx";
import { saveAs } from "file-saver";
import type { BitacoraSchema } from "./schemas";

const turnoLabel: Record<string, string> = {
  mananero: "Mananero",
  nocturno: "Nocturno",
};

function loadImage(src: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(async (blob) => {
        if (!blob) return reject(new Error("No blob"));
        resolve(await blob.arrayBuffer());
      }, "image/jpeg");
    };
    img.onerror = reject;
    img.src = src;
  });
}

const cellBorder: ITableCellOptions["borders"] = {
  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
};

export async function generateWord(data: BitacoraSchema) {
  const children: (Paragraph | Table)[] = [];

  // Header
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 100 },
      children: [
        new TextRun({ text: "Bitacora Laboral", bold: true, size: 40 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Registro diario de operaciones",
          color: "707070",
          size: 18,
        }),
      ],
    }),
  );

  // Meta table
  const metaRows = [
    ["Nombre", data.nombre || "—"],
    ["Fecha", data.fecha || "—"],
    ["Hora", data.hora || "—"],
    ["Turno", turnoLabel[data.turno] || "—"],
  ];

  children.push(
    new Table({
      width: { size: 50, type: WidthType.PERCENTAGE },
      rows: metaRows.map(
        ([label, value]) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: label,
                        color: "707070",
                        size: 18,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: value, bold: true, size: 18 }),
                    ],
                  }),
                ],
              }),
            ],
          }),
      ),
    }),
    new Paragraph({ spacing: { before: 200 } }),
  );

  // Datos Operativos
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({ text: "Datos Operativos", bold: true, size: 24 }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        ["Parlays realizadas", `${Number(data.parlayTotal || 0)}`],
        ["Tickets generados", `${Number(data.ticketsOperaciones || 0)}`],
      ].map(
        ([label, value]) =>
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorder,
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: label, color: "707070", size: 18 }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                borders: cellBorder,
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: value, bold: true, size: 18 }),
                    ],
                  }),
                ],
              }),
            ],
          }),
      ),
    }),
    new Paragraph({ spacing: { before: 200 } }),
  );

  // Imagenes
  const imagenes = data.imagenes || [];
  if (imagenes.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: `Imagenes (${imagenes.length})`,
            bold: true,
            size: 24,
          }),
        ],
      }),
    );

    for (const img of imagenes) {
      try {
        const buf = await loadImage(img.src);
        children.push(
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [
              new ImageRun({
                data: buf,
                transformation: { width: 300, height: 200 },
                type: "jpg",
              }),
            ],
          }),
        );
        if (img.descripcion) {
          children.push(
            new Paragraph({
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: img.descripcion,
                  color: "707070",
                  size: 18,
                  italics: true,
                }),
              ],
            }),
          );
        }
      } catch {
        // skip broken images
      }
    }

    children.push(new Paragraph({ spacing: { before: 200 } }));
  }

  // Observaciones
  if (data.observaciones) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: "Observaciones del Dia",
            bold: true,
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({ text: data.observaciones, color: "707070", size: 18 }),
        ],
      }),
    );
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `bitacora-${data.fecha || "sin-fecha"}.docx`);
}
