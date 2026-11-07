import type { Metadata } from "next";
import { exigirVoluntario } from "@/lib/painel/sessao";
import { FormCartinha } from "@/components/painel/FormCartinha";

export const metadata: Metadata = { title: "Nova cartinha · Painel" };
export const instant = false;

export default async function NovaCartinha() {
  await exigirVoluntario();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl">Nova cartinha</h1>
      <FormCartinha
        editando={false}
        valores={{ codigo: "", primeiroNome: "", idade: "", genero: "", pedido: "", tamanhoRoupa: "", tamanhoCalcado: "", observacoes: "", teste: false, imagemUrl: null }}
      />
    </div>
  );
}
