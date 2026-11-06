import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Visualizador } from "@/components/cartinhas/Visualizador";
import { FormAdocao } from "@/components/cartinhas/FormAdocao";
import { altCartinha } from "@/components/cartinhas/CardCartinha";
import { Carimbo } from "@/components/papel/Carimbo";
import { CardVidro } from "@/components/vidro/CardVidro";
import { listarCartinhas, obterCartinha } from "@/lib/dados/cartinhas";
import { listarPontos } from "@/lib/dados/conteudo";

type Props = { params: Promise<{ codigo: string }> };

// Rota bloqueante de propósito: código inexistente responde 404 de verdade.
// As cartinhas conhecidas saem pré-renderizadas por generateStaticParams.
export const instant = false;

export async function generateStaticParams() {
  const lista = await listarCartinhas();
  return lista.map((c) => ({ codigo: c.codigo }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { codigo } = await params;
  const c = await obterCartinha(codigo);
  if (!c) return { title: "Cartinha não encontrada" };
  // Sem o nome da criança no título compartilhado.
  return {
    title: `Cartinha ${c.codigo}`,
    description: `Criança de ${c.idade} anos pediu: ${c.pedido}. Apadrinhe e entregue até 23/12.`,
  };
}

export default async function PaginaCartinha({ params }: Props) {
  const { codigo } = await params;
  const [c, pontos] = await Promise.all([obterCartinha(codigo), listarPontos()]);
  if (!c) notFound();

  return (
    <div className="flex flex-col gap-5 pt-6 pb-24 md:grid md:grid-cols-[minmax(0,480px)_1fr] md:items-start md:gap-10 md:pt-12 md:pb-0">
      <Link href="/cartinhas" className="inline-flex min-h-11 items-center text-sm font-semibold text-tinta-suave underline underline-offset-4 md:col-span-2">
        ← Todas as cartinhas
      </Link>

      <Visualizador codigo={c.codigo} src={c.imagemUrl} alt={altCartinha(c)} />

      <div className="flex flex-col gap-4">
        <header>
          <p className="text-sm text-tinta-suave">Cartinha {c.codigo}</p>
          <h1 className="text-6xl">{c.primeiroNome}</h1>
        </header>
        <CardVidro>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-tinta-suave">Idade</dt>
              <dd className="font-semibold">{c.idade} {c.idade === 1 ? "ano" : "anos"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-tinta-suave">{c.genero === "menina" ? "Menina" : "Menino"}</dt>
              <dd className="font-semibold">{c.codigo}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs uppercase tracking-wide text-tinta-suave">Pedido</dt>
              <dd className="text-lg font-semibold">{c.pedido}</dd>
            </div>
            {(c.tamanhoRoupa || c.tamanhoCalcado) && (
              <div className="col-span-2">
                <dt className="text-xs uppercase tracking-wide text-tinta-suave">Tamanhos</dt>
                <dd className="flex gap-4">
                  {c.tamanhoRoupa && <span>Roupa: {c.tamanhoRoupa}</span>}
                  {c.tamanhoCalcado && <span>Calçado: {c.tamanhoCalcado}</span>}
                </dd>
              </div>
            )}
          </dl>
        </CardVidro>

        {/* Sempre montado: depois da adoção a página re-renderiza como "pendente" e a confirmação precisa continuar aberta. */}
        <FormAdocao codigo={c.codigo} pontos={pontos} disponivel={c.status === "disponivel"} />
        {c.status === "pendente" && (
          <p className="rounded-xl border border-dashed border-dourado bg-papel p-4 font-semibold text-dourado-escuro">
            Aguardando confirmação. Alguém já pediu esta cartinha.
          </p>
        )}
        {c.status === "apadrinhada" && (
          <div className="flex items-center gap-4">
            <Carimbo texto="Apadrinhada" />
            <Link href="/cartinhas?disp=1" className="font-semibold text-vermelho underline underline-offset-4">
              Ver cartinhas disponíveis
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
