import { z } from "zod";

export const conceptoSchema = z.object({
  id: z.string(),
  descripcion: z.string().min(1, "La descripcion es requerida"),
  monto: z.coerce.number().min(0, "El monto no puede ser negativo"),
});

export const bitacoraSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  fecha: z.string().min(1, "La fecha es requerida"),
  hora: z.string().min(1, "La hora es requerida"),
  turno: z.enum(["mananero", "nocturno"], {
    message: "Selecciona un turno",
  }),
  parlayTotal: z.coerce.number().min(0, "El total no puede ser negativo"),
  ticketsOperaciones: z.coerce
    .number()
    .int("Debe ser un entero")
    .min(0, "No puede ser negativo"),
  premiosBalance: z.coerce.number().min(0, "El balance no puede ser negativo"),
  conceptos: z.array(conceptoSchema),
  observaciones: z.string(),
});

export type BitacoraSchema = z.infer<typeof bitacoraSchema>;
