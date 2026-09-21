import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useRef } from "react";
import { RotateCcw, Trash2, ImagePlus, Pencil } from "lucide-react";
import { bitacoraSchema, type BitacoraSchema } from "../lib/schemas";
import { useBitacoraStore } from "../store/useBitacoraStore";
import { TurnoSelector } from "./TurnoSelector";
import { generatePDF } from "../lib/generatePDF";
import { cn } from "../lib/utils";

export function BitacoraForm() {
  const storeData = useBitacoraStore((s) => s.data);
  const setData = useBitacoraStore((s) => s.setData);
  const resetData = useBitacoraStore((s) => s.resetData);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const imagenes = watchedData.imagenes || [];

  const {
    fields: imagenFields,
    append: appendImagen,
    remove: removeImagen,
  } = useFieldArray({
    control,
    name: "imagenes",
  });

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          appendImagen({
            id: crypto.randomUUID(),
            src: ev.target?.result as string,
            descripcion: "",
          });
        };
        reader.readAsDataURL(file);
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [appendImagen],
  );

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
        imagenes: [],
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
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-[var(--text-body-sm)] font-medium text-ink">
          Imagenes
        </h4>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 self-start rounded-[var(--radius-3xl)] border border-ink px-5 py-2 text-[var(--text-body-sm)] font-medium text-ink transition-colors hover:bg-sunshine/30 cursor-pointer"
        >
          <ImagePlus size={16} />
          Agregar imagen
        </button>

        {imagenFields.length > 0 && (
          <div className="flex flex-col gap-4">
            {imagenFields.map((field, index) => (
              <ImagenCard
                key={field.id}
                index={index}
                src={imagenes[index]?.src || ""}
                descripcion={imagenes[index]?.descripcion || ""}
                onRemove={() => removeImagen(index)}
                onEditDescripcion={(desc) =>
                  setValue(`imagenes.${index}.descripcion`, desc, {
                    shouldDirty: true,
                    shouldTouch: true,
                  })
                }
              />
            ))}
          </div>
        )}
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

function ImagenCard({
  index,
  src,
  descripcion,
  onRemove,
  onEditDescripcion,
}: {
  index: number;
  src: string;
  descripcion: string;
  onRemove: () => void;
  onEditDescripcion: (desc: string) => void;
}) {
  const inputId = `imagen-desc-${index}`;

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-3xl)] border border-ink p-4">
      <div className="flex items-start gap-3">
        <img
          src={src}
          alt={`Imagen ${index + 1}`}
          className="h-24 w-24 flex-shrink-0 rounded-[var(--radius-xl)] border border-ink object-cover"
        />
        <div className="flex flex-1 flex-col gap-2">
          <label
            htmlFor={inputId}
            className="text-[var(--text-caption)] text-graphite font-medium flex items-center gap-1"
          >
            <Pencil size={12} />
            Descripcion
          </label>
          <textarea
            id={inputId}
            value={descripcion}
            onChange={(e) => onEditDescripcion(e.target.value)}
            rows={2}
            className="rounded-[var(--radius-md)] border border-ink bg-cream px-3 py-2 text-[var(--text-body-sm)] resize-y"
            placeholder="Describe la imagen..."
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-3xl)] border border-ink text-ink transition-colors hover:bg-sunshine/30 cursor-pointer"
          aria-label="Eliminar imagen"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
