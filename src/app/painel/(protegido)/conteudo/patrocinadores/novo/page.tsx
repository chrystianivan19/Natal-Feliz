import type { Metadata } from "next";
import { exigirVoluntario } from "@/lib/painel/sessao";
import { FormPatrocinador } from "@/components/painel/FormsConteudo";

export const metadata: Metadata = { title: "Novo patrocinador · Painel" };
export const instant = false;

export default async function NovoPatrocinador() {
  await exigirVoluntario();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl">Novo patrocinador</h1>
      <FormPatrocinador v={{ id: "", nome: "", link: "", ordem: 0, ativo: true, logoUrl: null }} />
    </div>
  );
}
