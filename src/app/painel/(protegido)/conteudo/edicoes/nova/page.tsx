import type { Metadata } from "next";
import { exigirVoluntario } from "@/lib/painel/sessao";
import { FormEdicao } from "@/components/painel/FormsConteudo";

export const metadata: Metadata = { title: "Nova edição · Painel" };
export const instant = false;

export default async function NovaEdicao() {
  await exigirVoluntario();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl">Nova edição</h1>
      <p className="text-tinta-suave">Depois de criar, você adiciona as fotos na próxima tela.</p>
      <FormEdicao v={{ id: "", ano: "", numero: "", criancas: "", presentes: "", texto: "" }} />
    </div>
  );
}
