/** Ícone de lápis com brilho: "carta reescrita". Decorativo, o texto ao lado explica. */
function Icone({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`shrink-0 fill-none stroke-current ${className}`} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20l1-4L15.5 5.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z" />
      <path d="M19 14v4M17 16h4" />
    </svg>
  );
}

/** Etiqueta sobre a foto do cartão. Informativa: sem hover. */
export function SeloIa() {
  return (
    <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-papel/95 px-2 py-0.5 text-xs font-semibold text-pinheiro shadow-[var(--shadow-papel)]">
      <Icone className="size-3.5" />
      Refeita com IA
    </span>
  );
}

/** Explicação na página da cartinha. */
export function AvisoIa() {
  return (
    <aside data-testid="aviso-ia" className="flex gap-3 rounded-xl border border-dashed border-dourado bg-papel p-4">
      <Icone className="mt-0.5 size-6 text-pinheiro" />
      <div className="flex flex-col gap-1">
        <p className="font-semibold">Por que esta cartinha parece desenhada no computador?</p>
        <p className="text-sm leading-snug">
          A criança escreveu a carta, mas por causa da distância o papel não conseguiu chegar até nós. Para ela não ficar
          de fora, a equipe refez a imagem com inteligência artificial a partir do que ela escreveu. O pedido é dela.
        </p>
      </div>
    </aside>
  );
}
