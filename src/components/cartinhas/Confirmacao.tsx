import { Envelope } from "@/components/papel/Envelope";
import type { PontoEntrega } from "@/lib/dados/conteudo";

export function Confirmacao({ codigo, pontos }: { codigo: string; pontos: PontoEntrega[] }) {
  return (
    <div data-testid="confirmacao" className="flex flex-col gap-4">
      <Envelope className="mx-auto w-28" />
      <h2 className="text-center text-4xl">Recebemos seu pedido</h2>
      <p>
        A cartinha <strong>{codigo}</strong> fica reservada para você. A equipe confirma em até 24 horas por e-mail e
        WhatsApp.
      </p>
      <div className="rounded-xl border border-dashed border-dourado bg-papel p-4">
        <p className="font-semibold">O que fazer agora</p>
        <ol className="mt-1 list-decimal space-y-1 pl-5">
          <li>Compre o presente do pedido.</li>
          <li>Escreva o código <strong>{codigo}</strong> no pacote.</li>
          <li>Entregue até <strong>23/12</strong> num ponto de coleta.</li>
        </ol>
      </div>
      <div>
        <p className="font-semibold">Pontos de coleta</p>
        {pontos.length ? (
          <ul className="mt-1 space-y-2">
            {pontos.map((p) => (
              <li key={p.id}>
                <span className="font-semibold">{p.nome}</span> · {p.endereco}
                {p.horario ? ` · ${p.horario}` : ""}{" "}
                <a href={p.mapsUrl} target="_blank" rel="noopener" className="font-semibold text-vermelho underline underline-offset-4">
                  Ver no mapa
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-tinta-suave">Os pontos de entrega serão divulgados em breve.</p>
        )}
      </div>
    </div>
  );
}
