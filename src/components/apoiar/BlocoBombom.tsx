import Link from "next/link";
import type { Configuracoes } from "@/lib/dados/conteudo";
import { gerarPayloadPix, type TipoChave } from "@/lib/pix/brcode";
import { qrPix } from "@/lib/pix/qr";
import { BotaoCopiar } from "@/components/home/BotaoCopiar";
import { Selo } from "@/components/papel/Selo";

const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Caixa de bombom: uma por criança. Entrega no ponto de coleta ou Pix com valor fixo. */
export async function BlocoBombom({ pix, valor, criancas, prazo }: { pix: Configuracoes["pix"]; valor: number; criancas: number; prazo: string }) {
  const payload = pix
    ? gerarPayloadPix({ chave: pix.chave, tipo: pix.tipo as TipoChave | null, recebedor: pix.recebedor, cidade: pix.cidade, valor })
    : null;
  const svg = payload ? await qrPix(payload) : null;
  const comValor = valor > 0;

  return (
    <section data-testid="bloco-bombom" aria-labelledby="titulo-bombom" className="vidro flex flex-col gap-5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="manuscrita text-2xl text-vermelho">Além da cartinha</p>
          <h2 id="titulo-bombom" className="text-4xl leading-tight">Uma caixa de bombom para cada criança</h2>
        </div>
        {comValor && (
          <Selo className="shrink-0 rotate-3">
            <span className="manuscrita text-3xl leading-none text-pinheiro">{reais(valor).replace(",00", "")}</span>
            <span className="text-xs uppercase tracking-wider text-tinta-suave">uma caixa</span>
          </Selo>
        )}
      </div>

      <div className="flex max-w-prose flex-col gap-3">
        <p>
          No dia da entrega, junto com o presente da cartinha, cada criança vai ganhar também uma caixa de bombom. É o
          doce que se divide com os irmãos, que promete ir para a mesa do Ano-Novo e quase nunca chega até lá.
        </p>
        {criancas > 0 && (
          <p>
            Este ano são <strong>{criancas} {criancas === 1 ? "criança" : "crianças"}</strong>, então precisamos de{" "}
            <strong>{criancas} {criancas === 1 ? "caixa" : "caixas"}</strong>.
          </p>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-dashed border-dourado bg-papel p-4">
          <p className="font-semibold">Leve uma caixa</p>
          <p className="mt-1">
            Entregue a caixa de bombom em qualquer ponto de coleta até <strong>{prazo}</strong>, junto com o presente ou
            sozinha.
          </p>
          <Link href="/entrega" className="mt-2 inline-flex min-h-11 items-center font-semibold text-vermelho underline underline-offset-4">
            Ver pontos de coleta
          </Link>
        </div>

        {payload && svg && pix ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-dourado bg-papel p-4">
            <p className="font-semibold">Ou doe {comValor ? reais(valor) : "pelo Pix"}</p>
            <p>A gente compra a caixa e entrega por você.</p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <div
                role="img"
                aria-label={`QR Code do Pix${comValor ? ` de ${reais(valor)}` : ""} para a caixa de bombom`}
                className="w-40 shrink-0 rounded-xl bg-white p-2 [&>svg]:h-auto [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
              <div className="flex flex-col gap-2 self-stretch">
                <p className="text-sm text-tinta-suave">
                  Abra o app do banco, escolha Pix e leia o QR{comValor ? `: o valor de ${reais(valor)} já vem preenchido` : ""}. No celular, use o botão abaixo e cole em “Pix copia e cola”.
                </p>
                <BotaoCopiar texto={payload} rotulo={comValor ? `Copiar Pix de ${reais(valor)}` : "Copiar Pix copia e cola"} confirmacao="Código copiado" />
                <p className="text-sm">
                  Chave: <span className="font-semibold break-all">{pix.chave}</span>
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
