import type { Contagem } from "@/lib/dados/contador";

/** Contador informativo (sem hover). Cabe numa linha a 360px. */
export function Contador({ total, apadrinhadas, faltam }: Contagem) {
  const pct = total ? Math.round((apadrinhadas / total) * 100) : 0;
  return (
    <section data-testid="contador" aria-label="Andamento da campanha" className="vidro px-4 py-3">
      <dl data-testid="contador-numeros" className="flex items-baseline justify-between gap-2 text-center">
        <div>
          <dt className="text-xs uppercase tracking-wide text-tinta-suave">cartinhas</dt>
          <dd className="manuscrita text-3xl text-tinta tabular-nums">{total}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-tinta-suave">{apadrinhadas === 1 ? "apadrinhada" : "apadrinhadas"}</dt>
          <dd className="manuscrita text-3xl text-pinheiro tabular-nums">{apadrinhadas}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-tinta-suave">faltam</dt>
          <dd className="manuscrita text-3xl text-vermelho tabular-nums">{faltam}</dd>
        </div>
      </dl>
      <div
        role="progressbar"
        aria-label="Cartinhas apadrinhadas"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={apadrinhadas}
        aria-valuetext={`${apadrinhadas} de ${total} apadrinhadas`}
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-papel-escuro"
      >
        <div className="h-full rounded-full bg-pinheiro transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
    </section>
  );
}
