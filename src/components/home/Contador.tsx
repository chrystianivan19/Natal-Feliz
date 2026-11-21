import type { Contagem } from "@/lib/dados/contador";

type Rotulos = { total: string; feitas: [singular: string, plural: string]; faltam: string; barra: string; resumo: string; secao: string };

const CARTINHAS: Rotulos = {
  total: "cartinhas",
  feitas: ["apadrinhada", "apadrinhadas"],
  faltam: "faltam",
  barra: "Cartinhas apadrinhadas",
  resumo: "apadrinhadas",
  secao: "Andamento da campanha",
};

/** Contador informativo (sem hover). Cabe numa linha a 360px. Também serve para as caixas de bombom. */
export function Contador({
  total,
  apadrinhadas,
  faltam,
  rotulos = CARTINHAS,
  testId = "contador",
}: Contagem & { rotulos?: Rotulos; testId?: string }) {
  const pct = total ? Math.min(100, Math.round((apadrinhadas / total) * 100)) : 0;
  return (
    <section data-testid={testId} aria-label={rotulos.secao} className="vidro px-4 py-3">
      <dl data-testid={`${testId}-numeros`} className="flex items-baseline justify-between gap-2 text-center">
        <div>
          <dt className="text-xs uppercase tracking-wide text-tinta-suave">{rotulos.total}</dt>
          <dd className="manuscrita text-3xl text-tinta tabular-nums">{total}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-tinta-suave">{apadrinhadas === 1 ? rotulos.feitas[0] : rotulos.feitas[1]}</dt>
          <dd className="manuscrita text-3xl text-pinheiro tabular-nums">{apadrinhadas}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-tinta-suave">{rotulos.faltam}</dt>
          <dd className="manuscrita text-3xl text-vermelho tabular-nums">{faltam}</dd>
        </div>
      </dl>
      <div
        role="progressbar"
        aria-label={rotulos.barra}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={Math.min(apadrinhadas, total)}
        aria-valuetext={`${apadrinhadas} de ${total} ${rotulos.resumo}`}
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-papel-escuro"
      >
        <div className="h-full rounded-full bg-pinheiro transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
    </section>
  );
}

export const ROTULOS_CAIXAS: Rotulos = {
  total: "caixas",
  feitas: ["temos", "temos"],
  faltam: "faltam",
  barra: "Caixas de bombom garantidas",
  resumo: "caixas garantidas",
  secao: "Caixas de bombom",
};
