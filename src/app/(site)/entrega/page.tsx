import type { Metadata } from "next";
import { AgendaEntrega } from "@/components/entrega/AgendaEntrega";
import { listarPontos, obterPrazoEntrega } from "@/lib/dados/conteudo";
import { rotuloDia } from "@/lib/entrega/agenda";

export const metadata: Metadata = {
  title: "Entrega dos presentes",
  description: "Escolha o ponto de coleta, o dia e o horário para levar o presente da cartinha que você adotou.",
};

export default async function PaginaEntrega() {
  const [pontos, prazo] = await Promise.all([listarPontos(), obterPrazoEntrega()]);
  const ate = rotuloDia(prazo).data;
  return (
    <div className="flex flex-col gap-6 pt-8 pb-8 md:pt-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-5xl md:text-7xl">Entrega</h1>
        <p className="max-w-prose">
          Escolha o ponto mais perto de você e marque o dia e a hora em que vai levar o presente. Recebemos até{" "}
          <strong>{ate}</strong>, das 9h às 21h.
        </p>
        <p className="max-w-prose text-tinta-suave">
          Para reservar, tenha em mãos o código da cartinha e o WhatsApp que você usou na adoção.
        </p>
      </header>
      {pontos.length ? (
        <AgendaEntrega pontos={pontos} prazo={prazo} />
      ) : (
        <p className="vidro p-5">Os pontos de entrega serão divulgados em breve.</p>
      )}
    </div>
  );
}
