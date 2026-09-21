import type { Turno } from "../lib/types";
import { cn } from "../lib/utils";

interface TurnoSelectorProps {
  value: Turno;
  onChange: (value: Turno) => void;
}

const turnos: { value: Turno; label: string }[] = [
  { value: "mananero", label: "Mañanero" },
  { value: "nocturno", label: "Nocturno" },
];

export function TurnoSelector({ value, onChange }: TurnoSelectorProps) {
  return (
    <div className="flex gap-2">
      {turnos.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={cn(
            "rounded-[var(--radius-3xl)] border border-ink px-6 py-2 text-[var(--text-body-sm)] font-medium transition-colors cursor-pointer",
            value === t.value
              ? "bg-sunshine text-ink"
              : "bg-cream text-ink hover:bg-sunshine/30",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
