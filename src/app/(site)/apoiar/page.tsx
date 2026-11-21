import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BlocoPix } from "@/components/home/BlocoPix";
import { BlocoBombom } from "@/components/apoiar/BlocoBombom";
import { obterContador } from "@/lib/dados/contador";
import { rotuloDia } from "@/lib/entrega/agenda";
import { listarPatrocinadores, obterConfiguracoes } from "@/lib/dados/conteudo";

export const metadata: Metadata = {
  title: "Apoiar",
  description: "Doe uma caixa de bombom, faça um Pix ou patrocine o Natal Feliz no Gama-DF.",
};

export default async function PaginaApoiar() {
  const [config, patrocinadores, contagem] = await Promise.all([obterConfiguracoes(), listarPatrocinadores(), obterContador()]);
  const zap = config.whatsappContato;
  const linkZap = zap
    ? `https://wa.me/55${zap}?text=${encodeURIComponent("Oi! Quero saber como patrocinar o Natal Feliz.")}`
    : null;

  return (
    <div className="flex flex-col gap-10 pt-8 pb-8 md:pt-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-5xl md:text-7xl">Apoiar</h1>
        <p className="max-w-prose">
          Nem todo mundo consegue adotar uma cartinha, e tudo bem. Dá para ajudar com uma caixa de bombom, com uma doação
          ou com a sua empresa.
        </p>
      </header>

      <BlocoBombom pix={config.pix} valor={config.bombomValor} criancas={contagem.total} prazo={rotuloDia(config.prazoEntrega).data} />

      <BlocoPix pix={config.pix} titulo="Doe qualquer valor" />

      {!config.pix && (
        <p className="max-w-prose">
          Ainda não abrimos doações em dinheiro. A melhor forma de ajudar agora é{" "}
          <Link href="/cartinhas" className="font-semibold text-vermelho underline underline-offset-4">adotar uma cartinha</Link>.
        </p>
      )}

      {patrocinadores.length > 0 && (
        <section aria-labelledby="titulo-patrocinadores" className="flex flex-col gap-4">
          <h2 id="titulo-patrocinadores" className="text-4xl">Quem apoia</h2>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {patrocinadores.map((p) => {
              const conteudo = p.logoUrl ? (
                <span className="relative block aspect-[3/2]">
                  <Image src={p.logoUrl} alt={p.nome} fill sizes="(max-width: 767px) 50vw, 25vw" className="object-contain p-3" />
                </span>
              ) : (
                <span className="flex aspect-[3/2] items-center justify-center p-3 text-center font-semibold">{p.nome}</span>
              );
              return (
                <li key={p.id}>
                  {p.link ? (
                    <a href={p.link} target="_blank" rel="noopener" aria-label={`${p.nome} (abre em nova aba)`} className="vidro vidro-interativo block p-0">
                      {conteudo}
                    </a>
                  ) : (
                    <div className="vidro p-0">{conteudo}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {linkZap && (
        <section className="vidro flex flex-col gap-3 p-5">
          <h2 className="text-3xl">Quer patrocinar?</h2>
          <p>Empresas e comércios do Gama podem doar presentes, lanche para o dia da entrega ou ser ponto de coleta.</p>
          <a
            href={linkZap}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-12 items-center justify-center self-start rounded-full bg-pinheiro px-6 font-semibold text-papel transition-colors hover:bg-pinheiro-escuro"
          >
            Falar no WhatsApp
          </a>
        </section>
      )}
    </div>
  );
}
