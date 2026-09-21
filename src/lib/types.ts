export type Turno = "mananero" | "nocturno";

export interface ImagenBitacora {
  id: string;
  src: string;
  descripcion: string;
}

export interface BitacoraData {
  nombre: string;
  fecha: string;
  hora: string;
  turno: Turno;
  parlayTotal: number;
  ticketsOperaciones: number;
  imagenes: ImagenBitacora[];
  observaciones: string;
}

export const defaultBitacoraData: BitacoraData = {
  nombre: "Pepina",
  fecha: new Date().toISOString().split("T")[0],
  hora: new Date().toTimeString().slice(0, 5),
  turno: "mananero",
  parlayTotal: 0,
  ticketsOperaciones: 0,
  imagenes: [],
  observaciones: "",
};
