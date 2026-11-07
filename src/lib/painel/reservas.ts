import "server-only";
import type { exigirVoluntario } from "./sessao";

type Supa = Awaited<ReturnType<typeof exigirVoluntario>>["supabase"];

export type Reserva = {
  id: string;
  dia: string;
  hora: number;
  pontoId: string;
  ponto: string;
  codigo: string;
  crianca: string;
  pedido: string;
  padrinho: string;
  whatsapp: string;
};

export type SemHorario = { id: string; codigo: string; padrinho: string; whatsapp: string };

/** Reservas de adoções ativas, em ordem de dia e hora. */
export async function listarReservas(supabase: Supa): Promise<Reserva[]> {
  const { data, error } = await supabase
    .from("reservas_entrega")
    .select("id, dia, hora, ponto_id, pontos_entrega(nome), adocoes!inner(status, padrinho_nome, padrinho_whatsapp, cartinhas(codigo, primeiro_nome, pedido))")
    .eq("adocoes.status", "aprovada")
    .order("dia")
    .order("hora");
  if (error) throw new Error(`Falha ao listar reservas: ${error.message}`);
  return (data ?? []).map((r) => ({
    id: r.id,
    dia: r.dia,
    hora: r.hora,
    pontoId: r.ponto_id,
    ponto: r.pontos_entrega?.nome ?? "",
    codigo: r.adocoes?.cartinhas?.codigo ?? "",
    crianca: r.adocoes?.cartinhas?.primeiro_nome ?? "",
    pedido: r.adocoes?.cartinhas?.pedido ?? "",
    padrinho: r.adocoes?.padrinho_nome ?? "",
    whatsapp: r.adocoes?.padrinho_whatsapp ?? "",
  }));
}

/** Padrinhos com adoção ativa que ainda não marcaram horário. */
export async function listarSemHorario(supabase: Supa): Promise<SemHorario[]> {
  const { data, error } = await supabase
    .from("adocoes")
    .select("id, padrinho_nome, padrinho_whatsapp, cartinhas(codigo), reservas_entrega(id)")
    .eq("status", "aprovada")
    .order("criado_em");
  if (error) throw new Error(`Falha ao listar adoções: ${error.message}`);
  return (data ?? [])
    .filter((a) => !a.reservas_entrega)
    .map((a) => ({ id: a.id, codigo: a.cartinhas?.codigo ?? "", padrinho: a.padrinho_nome, whatsapp: a.padrinho_whatsapp }));
}
