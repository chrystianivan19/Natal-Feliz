import Image from "next/image";
import Link from "next/link";
import { Fita } from "@/components/papel/Fita";
import type { Edicao } from "@/lib/dados/conteudo";

/** Um cartão por ano, com os números e a primeira foto presa com fita. Some sem edições. */
export function Edicoes({ edicoes }: { edicoes: Edicao[] }) {
  if (!edicoes.length) return null;
  return (
    <section aria-labelledby="titulo-edicoes" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="titulo-edicoes" className="text-4xl">Edições anteriores</h2>
        <Link href="/galeria" className="inline-flex min-h-11 items-center font-semibold text-vermelho underline underline-offset-4">
          Ver fotos
        </Link>
      </div>
      <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pt-3 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {edicoes.map((e) => (
          <li key={e.id} className="vidro flex w-64 shrink-0 snap-start flex-col gap-3 p-4 md:w-auto">
            {e.fotos[0] && (
              <Fita className="mx-1">
                <div className="relative aspect-[4/3]">
                  <Image src={e.fotos[0].url} alt={e.fotos[0].alt} fill sizes="(max-width: 767px) 256px, 30vw" className="object-cover" />
                </div>
              </Fita>
            )}
            <p className="manuscrita text-3xl leading-none">
              {e.ano}
              {e.numero ? <span className="ml-2 text-xl text-tinta-suave">{e.numero}ª edição</span> : null}
            </p>
            {(e.criancas !== null || e.presentes !== null) && (
              <dl className="flex gap-6">
                {e.criancas !== null && (
                  <div>
                    <dd className="manuscrita text-3xl text-pinheiro tabular-nums">{e.criancas}</dd>
                    <dt className="text-xs uppercase tracking-wide text-tinta-suave">crianças</dt>
                  </div>
                )}
                {e.presentes !== null && (
                  <div>
                    <dd className="manuscrita text-3xl text-vermelho tabular-nums">{e.presentes}</dd>
                    <dt className="text-xs uppercase tracking-wide text-tinta-suave">presentes</dt>
                  </div>
                )}
              </dl>
            )}
            {e.texto && <p className="text-sm leading-snug">{e.texto}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
