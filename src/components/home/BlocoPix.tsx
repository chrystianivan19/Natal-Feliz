import type { Configuracoes } from "@/lib/dados/conteudo";
import { gerarPayloadPix, type TipoChave } from "@/lib/pix/brcode";
import { qrPix } from "@/lib/pix/qr";
import { BotaoCopiar } from "./BotaoCopiar";

/** QR + chave + botão de copiar. Some quando não há chave cadastrada. */
export async function BlocoPix({ pix, titulo = "Doe pelo Pix" }: { pix: Configuracoes["pix"]; titulo?: string }) {
  if (!pix) return null;
  const payload = gerarPayloadPix({ chave: pix.chave, tipo: pix.tipo as TipoChave | null, recebedor: pix.recebedor, cidade: pix.cidade });
  const svg = await qrPix(payload);
  return (
    <section data-testid="bloco-pix" aria-labelledby="titulo-pix" className="vidro flex flex-col gap-4 p-5 md:flex-row md:items-center md:gap-8">
      <div
        role="img"
        aria-label="QR Code do Pix"
        className="mx-auto w-48 shrink-0 rounded-xl bg-white p-2 md:mx-0 [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="flex flex-col gap-2">
        <h2 id="titulo-pix" className="text-4xl">{titulo}</h2>
        <p>Qualquer valor ajuda a comprar presentes para as cartinhas que sobrarem e a montar o dia da entrega.</p>
        <dl className="flex flex-col gap-1">
          <div>
            <dt className="text-xs uppercase tracking-wide text-tinta-suave">Chave</dt>
            <dd className="font-semibold break-all">{pix.chave}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-tinta-suave">Recebedor</dt>
            <dd>
              {pix.recebedor}
              {pix.banco ? ` · ${pix.banco}` : ""}
            </dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2 pt-1">
          <BotaoCopiar texto={pix.chave} rotulo="Copiar chave Pix" confirmacao="Chave copiada" />
          <BotaoCopiar texto={payload} rotulo="Copiar Pix copia e cola" confirmacao="Código copiado" secundario />
        </div>
      </div>
    </section>
  );
}
