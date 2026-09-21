export type Turno = "mananero" | "nocturno";

export interface ConceptoDinamico {
  id: string;
  descripcion: string;
  monto: number;
}

export interface BitacoraData {
  nombre: string;
  fecha: string;
  hora: string;
  turno: Turno;
  parlayTotal: number;
  ticketsOperaciones: number;
  premiosBalance: number;
  conceptos: ConceptoDinamico[];
  observaciones: string;
}

export const defaultBitacoraData: BitacoraData = {
  nombre: "Pepina",
  fecha: new Date().toISOString().split("T")[0],
  hora: new Date().toTimeString().slice(0, 5),
  turno: "mananero",
  parlayTotal: 0,
  ticketsOperaciones: 0,
  premiosBalance: 0,
  conceptos: [],
  observaciones: "",
};
