import { BitacoraForm } from "./components/BitacoraForm";
import { PreviewPanel } from "./components/PreviewPanel";
import { useBitacoraStore } from "./store/useBitacoraStore";

export default function App() {
  const { data } = useBitacoraStore();

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-ink">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-[var(--text-heading)] font-medium tracking-display text-ink">
              Bitacora Laboral
            </h1>
            <p className="text-[var(--text-caption)] text-graphite">
              Registro diario de operaciones
            </p>
          </div>
          <div className="rounded-[var(--radius-pill)] bg-mint px-3 py-1">
            <span className="text-[var(--text-caption)] font-medium text-ink">
              Activo
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-8 sm:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <div className="flex-1 min-w-0">
            <BitacoraForm />
          </div>
          <div className="w-full lg:w-[380px] lg:shrink-0">
            <div className="lg:sticky lg:top-8">
              <PreviewPanel data={data} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
