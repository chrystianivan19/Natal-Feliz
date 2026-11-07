import type { Metadata } from "next";
import { exigirVoluntario } from "@/lib/painel/sessao";
import { FormPonto } from "@/components/painel/FormPonto";

export const metadata: Metadata = { title: "Novo ponto · Painel" };
export const instant = false;

export default async function NovoPonto() {
  await exigirVoluntario();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl">Novo ponto de entrega</h1>
      <FormPonto valores={{ id: "", nome: "", endereco: "", mapsUrl: "", telefone: "", referencia: "", ordem: 0, ativo: true, logoUrl: null }} />
    </div>
  );
}
