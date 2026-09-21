import type { BitacoraData } from "../lib/types";

interface PreviewPanelProps {
  data: BitacoraData;
}

const turnoLabel: Record<string, string> = {
  mananero: "Mananero",
  nocturno: "Nocturno",
};

function fmt(n: unknown) {
  return Number(n || 0).toFixed(2);
}

export function PreviewPanel({ data }: PreviewPanelProps) {
  const totalConceptos = data.conceptos.reduce(
    (sum: number, c: BitacoraData["conceptos"][number]) => sum + Number(c.monto || 0),
    0,
  );

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
          <span className="text-graphite">Total Parlay</span>
          <span className="font-medium text-ink">
            ${fmt(data.parlayTotal)}
          </span>
        </div>
        <div className="flex justify-between border-b border-graphite/20 pb-2 text-[var(--text-body-sm)]">
          <span className="text-graphite">Tickets / Operaciones</span>
          <span className="font-medium text-ink">
            {Number(data.ticketsOperaciones || 0)}
          </span>
        </div>
        <div className="flex justify-between border-b border-graphite/20 pb-2 text-[var(--text-body-sm)]">
          <span className="text-graphite">Premios / Balance</span>
          <span className="font-medium text-ink">
            ${fmt(data.premiosBalance)}
          </span>
        </div>
      </div>

      {data.conceptos.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-[var(--text-subheading)] font-medium text-ink">
            Conceptos Adicionales
          </h3>
          {data.conceptos.map((c: BitacoraData["conceptos"][number]) => (
            <div
              key={c.id}
              className="flex justify-between border-b border-graphite/20 pb-2 text-[var(--text-body-sm)]"
            >
              <span className="text-graphite">{c.descripcion || "—"}</span>
              <span className="font-medium text-ink">
                ${fmt(c.monto)}
              </span>
            </div>
          ))}
          <div className="flex justify-between border-t-2 border-ink pt-2 text-[var(--text-body-sm)]">
            <span className="font-medium text-ink">Subtotal Conceptos</span>
            <span className="font-medium text-ink">
              ${fmt(totalConceptos)}
            </span>
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
