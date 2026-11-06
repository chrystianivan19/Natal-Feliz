/** Carimbo inclinado (ex.: "Apadrinhada"). */
export function Carimbo({ texto, className = "" }: { texto: string; className?: string }) {
  return (
    <span
      className={`manuscrita inline-block -rotate-12 rounded-md border-[3px] border-double border-vermelho px-3 py-0.5 text-2xl uppercase tracking-wide text-vermelho opacity-90 ${className}`}
    >
      {texto}
    </span>
  );
}
