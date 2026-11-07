import "server-only";
import type { LinhaPadrinho } from "@/lib/exportacao/csv";
import type { exigirVoluntario } from "./sessao";

type Supa = Awaited<ReturnType<typeof exigirVoluntario>>["supabase"];
export type Padrinho = LinhaPadrinho & { id: string; tamanhoRoupa: string | null; tamanhoCalcado: string | null };

export async function listarPadrinhos(supabase: Supa, status?: string): Promise<Padrinho[]> {
  let q = supabase
    .from("adocoes")
    .select("id, padrinho_nome, padrinho_whatsapp, padrinho_email, status, criado_em, decidido_em, decidido_por, cartinhas(codigo, primeiro_nome, pedido, tamanho_roupa, tamanho_calcado)")
    .order("criado_em", { ascending: false });
  if (status && ["pendente", "aprovada", "recusada", "expirada", "cancelada"].includes(status)) {
    q = q.eq("status", status as "pendente");
  }
  const { data } = await q;
  return (data ?? []).map((a) => ({
    id: a.id,
    codigo: a.cartinhas?.codigo ?? "",
    crianca: a.cartinhas?.primeiro_nome ?? "",
    pedido: a.cartinhas?.pedido ?? "",
    tamanhoRoupa: a.cartinhas?.tamanho_roupa ?? null,
    tamanhoCalcado: a.cartinhas?.tamanho_calcado ?? null,
    padrinho: a.padrinho_nome,
    whatsapp: a.padrinho_whatsapp,
    email: a.padrinho_email,
    status: a.status,
    pedidoEm: a.criado_em,
    decididoEm: a.decidido_em,
    decididoPor: a.decidido_por,
  }));
}
