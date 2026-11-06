import type { Metadata } from "next";
import { exigirVoluntario } from "@/lib/painel/sessao";

export const metadata: Metadata = { title: "Conteúdo · Painel" };
export const instant = false;

// Pontos de entrega, Pix, patrocinadores, edições e contato entram na Fase 3.
export default async function PaginaConteudo() {
  await exigirVoluntario();
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-4xl">Conteúdo do site</h1>
      <p className="vidro p-5">
        Aqui vão ficar os pontos de entrega, o Pix, os patrocinadores, as edições anteriores e o WhatsApp de contato. Chega na próxima fase.
      </p>
    </div>
  );
}
