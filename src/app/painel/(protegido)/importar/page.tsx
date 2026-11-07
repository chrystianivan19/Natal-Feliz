import type { Metadata } from "next";
import { exigirVoluntario } from "@/lib/painel/sessao";
import { Importador } from "@/components/painel/Importador";

export const metadata: Metadata = { title: "Importar cartinhas · Painel" };
export const instant = false;

export default async function PaginaImportar() {
  await exigirVoluntario();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl">Importar em lote</h1>
      <ol className="list-decimal space-y-1 pl-5">
        <li>No Google Sheets, abra <strong>Cartinhas 2026 - dados</strong> → Arquivo → Fazer download → <strong>CSV</strong>.</li>
        <li>Baixe as fotos da pasta <strong>Cartinhas 2026</strong> do Drive (C001.jpg, C002.jpg…).</li>
        <li>Escolha o CSV e todas as fotos abaixo. Nada é gravado antes de você conferir.</li>
      </ol>
      <Importador />
    </div>
  );
}
