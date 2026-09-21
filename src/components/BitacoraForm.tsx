import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { RotateCcw, Plus, Trash2 } from "lucide-react";
import { bitacoraSchema, type BitacoraSchema } from "../lib/schemas";
import { useBitacoraStore } from "../store/useBitacoraStore";
import { TurnoSelector } from "./TurnoSelector";
import { generatePDF } from "../lib/generatePDF";
import { cn } from "../lib/utils";

export function BitacoraForm() {
  const storeData = useBitacoraStore((s) => s.data);
  const setData = useBitacoraStore((s) => s.setData);
  const resetData = useBitacoraStore((s) => s.resetData);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<BitacoraSchema>({
    resolver: zodResolver(bitacoraSchema) as never,
    defaultValues: storeData,
    mode: "onChange",
  });

  const watchedData = watch();

  const {
    fields: conceptoFields,
    append: appendConcepto,
    remove: removeConcepto,
  } = useFieldArray({
    control,
    name: "conceptos",
  });

  const handleReset = useCallback(() => {
    if (
      window.confirm(
        "Limpiar toda la bitacora? Esta accion no se puede deshacer.",
      )
    ) {
      const fresh = {
        nombre: "Pepina",
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toTimeString().slice(0, 5),
        turno: "mananero" as const,
        parlayTotal: 0,
        ticketsOperaciones: 0,
        premiosBalance: 0,
        conceptos: [],
        observaciones: "",
      };
      reset(fresh);
      resetData();
      setData(fresh);
    }
  }, [reset, resetData, setData]);

  const onSubmit = (formData: BitacoraSchema) => {
    setData(formData);
    generatePDF(formData);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-8 rounded-[var(--radius-3xl)] border border-ink bg-cream p-6 sm:p-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[var(--text-heading-sm)] font-medium tracking-display text-ink">
          Nueva Bitacora
        </h2>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 rounded-[var(--radius-3xl)] border border-ink px-4 py-2 text-[var(--text-caption)] font-medium text-ink transition-colors hover:bg-sunshine/30 cursor-pointer"
        >
          <RotateCcw size={14} />
          Limpiar
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="nombre"
            className="text-[var(--text-caption)] text-graphite font-medium"
          >
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            {...register("nombre")}
            className="rounded-[var(--radius-md)] border border-ink bg-cream px-3 py-2 text-[var(--text-body-sm)]"
          />
          {errors.nombre && (
            <span className="text-[var(--text-caption)] text-red-600">
              {errors.nombre.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <label
              htmlFor="fecha"
              className="text-[var(--text-caption)] text-graphite font-medium"
            >
              Fecha
            </label>
            <input
              id="fecha"
              type="date"
              {...register("fecha")}
              className="rounded-[var(--radius-md)] border border-ink bg-cream px-3 py-2 text-[var(--text-body-sm)]"
            />
            {errors.fecha && (
              <span className="text-[var(--text-caption)] text-red-600">
                {errors.fecha.message}
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <label
              htmlFor="hora"
              className="text-[var(--text-caption)] text-graphite font-medium"
            >
              Hora
            </label>
            <input
              id="hora"
              type="time"
              {...register("hora")}
              className="rounded-[var(--radius-md)] border border-ink bg-cream px-3 py-2 text-[var(--text-body-sm)]"
            />
            {errors.hora && (
              <span className="text-[var(--text-caption)] text-red-600">
                {errors.hora.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[var(--text-caption)] text-graphite font-medium">
            Turno Laboral
          </label>
          <TurnoSelector
            value={watchedData.turno}
            onChange={(val) =>
              setValue("turno", val, { shouldValidate: true })
            }
          />
          {errors.turno && (
            <span className="text-[var(--text-caption)] text-red-600">
              {errors.turno.message}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-[var(--text-subheading)] font-medium text-ink border-b border-ink pb-2">
          Datos Operativos
        </h3>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <label
              htmlFor="parlayTotal"
              className="text-[var(--text-caption)] text-graphite font-medium"
            >
              Cantidad de parlays realizadas
            </label>
            <input
              id="parlayTotal"
              type="number"
              step="0.01"
              {...register("parlayTotal")}
              className="rounded-[var(--radius-md)] border border-ink bg-cream px-3 py-2 text-[var(--text-body-sm)]"
              placeholder="0.00"
            />
            {errors.parlayTotal && (
              <span className="text-[var(--text-caption)] text-red-600">
                {errors.parlayTotal.message}
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <label
              htmlFor="ticketsOperaciones"
              className="text-[var(--text-caption)] text-graphite font-medium"
            >
              Tickets
            </label>
            <input
              id="ticketsOperaciones"
              type="number"
              {...register("ticketsOperaciones")}
              className="rounded-[var(--radius-md)] border border-ink bg-cream px-3 py-2 text-[var(--text-body-sm)]"
              placeholder="0"
            />
            {errors.ticketsOperaciones && (
              <span className="text-[var(--text-caption)] text-red-600">
                {errors.ticketsOperaciones.message}
              </span>
            )}
          </div>
          
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-[var(--text-body-sm)] font-medium text-ink">
            Conceptos Adicionales
          </h4>
          {conceptoFields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-2 rounded-[var(--radius-3xl)] border border-ink p-4 sm:flex-row sm:items-end"
            >
              <div className="flex flex-1 flex-col gap-1">
                <label
                  htmlFor={`conceptos.${index}.descripcion`}
                  className="text-[var(--text-caption)] text-graphite font-medium"
                >
                  Descripcion
                </label>
                <input
                  id={`conceptos.${index}.descripcion`}
                  type="text"
                  {...register(`conceptos.${index}.descripcion`)}
                  className="rounded-[var(--radius-md)] border border-ink bg-cream px-3 py-2 text-[var(--text-body-sm)] placeholder:text-graphite/50"
                  placeholder="Concepto..."
                />
                {errors.conceptos?.[index]?.descripcion && (
                  <span className="text-[var(--text-caption)] text-red-600">
                    {errors.conceptos?.[index]?.descripcion?.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 sm:w-40">
                <label
                  htmlFor={`conceptos.${index}.monto`}
                  className="text-[var(--text-caption)] text-graphite font-medium"
                >
                  Monto
                </label>
                <input
                  id={`conceptos.${index}.monto`}
                  type="number"
                  step="0.01"
                  {...register(`conceptos.${index}.monto`)}
                  className="rounded-[var(--radius-md)] border border-ink bg-cream px-3 py-2 text-[var(--text-body-sm)] placeholder:text-graphite/50"
                  placeholder="0.00"
                />
                {errors.conceptos?.[index]?.monto && (
                  <span className="text-[var(--text-caption)] text-red-600">
                    {errors.conceptos?.[index]?.monto?.message}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeConcepto(index)}
                className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-3xl)] border border-ink text-ink transition-colors hover:bg-sunshine/30 cursor-pointer self-end"
                aria-label="Eliminar concepto"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              appendConcepto({
                id: crypto.randomUUID(),
                descripcion: "",
                monto: 0,
              })
            }
            className="flex items-center gap-2 self-start rounded-[var(--radius-3xl)] border border-ink px-5 py-2 text-[var(--text-body-sm)] font-medium text-ink transition-colors hover:bg-sunshine/30 cursor-pointer"
          >
            <Plus size={16} />
            Agregar concepto
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="observaciones"
          className="text-[var(--text-caption)] text-graphite font-medium"
        >
          Observaciones del Dia
        </label>
        <textarea
          id="observaciones"
          {...register("observaciones")}
          rows={5}
          className="rounded-[var(--radius-md)] border border-ink bg-cream px-3 py-2 text-[var(--text-body-sm)] resize-y"
          placeholder="Incidencias, novedades operativas, mensajes de entrega de guardia..."
        />
      </div>

      <button
        type="submit"
        disabled={hasErrors}
        className={cn(
          "flex items-center justify-center gap-2 rounded-[var(--radius-3xl)] px-6 py-3 text-[var(--text-body-sm)] font-medium text-ink transition-colors",
          !hasErrors
            ? "bg-sunshine hover:bg-sunshine/80 cursor-pointer"
            : "bg-graphite/20 text-graphite cursor-not-allowed",
        )}
      >
        Descargar PDF
      </button>
    </form>
  );
}
