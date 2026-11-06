import Image from "next/image";
import Link from "next/link";
import { Carimbo } from "@/components/papel/Carimbo";
import type { CartinhaPublica } from "@/lib/cartinhas/filtrar";

export function altCartinha(c: Pick<CartinhaPublica, "codigo" | "idade">) {
  return `Cartinha ${c.codigo}, criança de ${c.idade} ${c.idade === 1 ? "ano" : "anos"}`;
}

export function CardCartinha({ c, prioridade = false }: { c: CartinhaPublica; prioridade?: boolean }) {
  const indisponivel = c.status !== "disponivel";
  return (
    <li data-testid="card-cartinha" data-codigo={c.codigo}>
      <Link
        href={`/cartinhas/${c.codigo}`}
        aria-label={`Ler a cartinha de ${c.primeiroNome}, ${c.idade} anos${c.status === "apadrinhada" ? ", já apadrinhada" : c.status === "pendente" ? ", aguardando confirmação" : ""}`}
        className="vidro vidro-interativo flex h-full flex-col overflow-hidden p-0"
      >
        <div className="relative aspect-[3/4] bg-white">
          <Image
            src={c.imagemUrl ?? "/cartinha-provisoria.svg"}
            alt={altCartinha(c)}
            fill
            sizes="(max-width: 767px) 50vw, 25vw"
            className={`object-cover ${indisponivel ? "opacity-60" : ""}`}
            priority={prioridade}
            unoptimized={!c.imagemUrl}
          />
          {c.status === "apadrinhada" && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Carimbo texto="Apadrinhada" className="bg-papel/80 text-xl" />
            </span>
          )}
          {c.status === "pendente" && (
            <span className="absolute inset-x-2 bottom-2 rounded-md border border-dashed border-dourado bg-papel/95 px-2 py-1 text-center text-xs font-semibold leading-tight text-dourado-escuro">
              Aguardando confirmação
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <p className="manuscrita text-2xl leading-none">{c.primeiroNome}</p>
          <p className="text-sm leading-snug text-tinta-suave">
            {c.idade} {c.idade === 1 ? "ano" : "anos"} · {c.codigo}
          </p>
          <p className="line-clamp-2 text-sm leading-snug">{c.pedido}</p>
          <span className="mt-auto pt-2 text-sm font-semibold text-vermelho underline decoration-2 underline-offset-4">
            Ler cartinha
          </span>
        </div>
      </Link>
    </li>
  );
}

/** Lista renderizada só no servidor (sem hidratação). Os filtros escondem itens por `hidden`. */
export function ListaCartas({ lista }: { lista: CartinhaPublica[] }) {
  return (
    <ul id="grade-cartinhas" className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
      {lista.map((c, i) => (
        <CardCartinha key={c.codigo} c={c} prioridade={i < 2} />
      ))}
    </ul>
  );
}
