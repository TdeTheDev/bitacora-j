import type { BitacoraData } from "../lib/types";

interface PreviewPanelProps {
  data: BitacoraData;
}

const turnoLabel: Record<string, string> = {
  mananero: "Mañanero",
  nocturno: "Nocturno",
};

export function PreviewPanel({ data }: PreviewPanelProps) {
  return (
    <div className="flex flex-col gap-6 rounded-[var(--radius-3xl)] border border-ink bg-cream p-6">
      <h2 className="text-[var(--text-heading-sm)] font-medium tracking-display text-ink">
        Vista Previa
      </h2>

      <div className="flex flex-col gap-3 text-[var(--text-body-sm)]">
        <div className="flex justify-between border-b border-graphite/20 pb-2">
          <span className="text-graphite">Nombre</span>
          <span className="font-medium text-ink">{data.nombre || "—"}</span>
        </div>
        <div className="flex justify-between border-b border-graphite/20 pb-2">
          <span className="text-graphite">Fecha</span>
          <span className="font-medium text-ink">{data.fecha || "—"}</span>
        </div>
        <div className="flex justify-between border-b border-graphite/20 pb-2">
          <span className="text-graphite">Hora</span>
          <span className="font-medium text-ink">{data.hora || "—"}</span>
        </div>
        <div className="flex justify-between border-b border-graphite/20 pb-2">
          <span className="text-graphite">Turno</span>
          <span className="font-medium text-ink">
            {turnoLabel[data.turno] || "—"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-[var(--text-subheading)] font-medium text-ink">
          Datos Operativos
        </h3>
        <div className="flex justify-between border-b border-graphite/20 pb-2 text-[var(--text-body-sm)]">
          <span className="text-graphite">Parlays</span>
          <span className="font-medium text-ink">
            {Number(data.parlayTotal || 0)}
          </span>
        </div>
        <div className="flex justify-between border-b border-graphite/20 pb-2 text-[var(--text-body-sm)]">
          <span className="text-graphite">Tickets</span>
          <span className="font-medium text-ink">
            {Number(data.ticketsOperaciones || 0)}
          </span>
        </div>
      </div>

      {(data.imagenes || []).length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-[var(--text-subheading)] font-medium text-ink">
            Imagenes ({(data.imagenes || []).length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {(data.imagenes || []).map((img) => (
              <div
                key={img.id}
                className="flex flex-col gap-2 rounded-[var(--radius-xl)] border border-ink p-2"
              >
                <img
                  src={img.src}
                  alt={img.descripcion || "Imagen"}
                  className="h-28 w-full rounded object-cover"
                />
                {img.descripcion && (
                  <p className="text-[var(--text-caption)] text-graphite px-1 truncate">
                    {img.descripcion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.observaciones && (
        <div className="flex flex-col gap-2">
          <h3 className="text-[var(--text-subheading)] font-medium text-ink">
            Observaciones
          </h3>
          <p className="text-[var(--text-body-sm)] text-graphite whitespace-pre-wrap rounded-[var(--radius-xl)] border border-ink p-3">
            {data.observaciones}
          </p>
        </div>
      )}
    </div>
  );
}
