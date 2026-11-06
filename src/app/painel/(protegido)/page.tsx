import type { Metadata } from "next";
import { exigirVoluntario } from "@/lib/painel/sessao";
import { ListaPendentes, type Pendente } from "@/components/painel/ListaPendentes";

export const metadata: Metadata = { title: "Pendentes · Painel" };
export const instant = false; // sempre com dados da sessão

export default async function PaginaPendentes() {
  const { supabase } = await exigirVoluntario();
  const { data } = await supabase
    .from("adocoes")
    .select("id, padrinho_nome, padrinho_whatsapp, padrinho_email, criado_em, expira_em, cartinhas(codigo, primeiro_nome, pedido)")
    .eq("status", "pendente")
    .order("criado_em");

  const pendentes: Pendente[] = (data ?? []).map((a) => ({
    id: a.id,
    codigo: a.cartinhas?.codigo ?? "?",
    crianca: a.cartinhas?.primeiro_nome ?? "",
    pedido: a.cartinhas?.pedido ?? "",
    padrinho: a.padrinho_nome,
    whatsapp: a.padrinho_whatsapp,
    email: a.padrinho_email,
    criadoEm: a.criado_em,
    expiraEm: a.expira_em,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-4xl">Aguardando confirmação</h1>
        <p className="text-tinta-suave">
          {pendentes.length} {pendentes.length === 1 ? "pedido" : "pedidos"}. Pedidos sem resposta em 24 h voltam sozinhos para a lista.
        </p>
      </div>
      <ListaPendentes pendentes={pendentes} />
    </div>
  );
}
