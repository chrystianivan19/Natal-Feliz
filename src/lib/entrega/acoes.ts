"use server";

import { createPublicClient } from "@/lib/supabase/publico";
import { hashIp } from "@/lib/rede/ip";
import { validarReserva, type CampoReserva } from "./agenda";

export type EstadoReserva =
  | { resultado: "inicial" }
  | { resultado: "ok"; codigo: string; dia: string; hora: number }
  | { resultado: "nao_encontrada" | "dia_invalido" | "horario_invalido" | "ponto_invalido" | "limite" | "erro" }
  | { resultado: "invalido"; erros: Partial<Record<CampoReserva, string>> };

/** Server Action do agendamento de entrega (ponto, dia, hora, código e WhatsApp vêm do formulário). */
export async function reservar(_anterior: EstadoReserva, form: FormData): Promise<EstadoReserva> {
  const v = validarReserva(Object.fromEntries(form.entries()));
  if (!v.ok) return { resultado: "invalido", erros: v.erros };
  try {
    const { data, error } = await createPublicClient().rpc("reservar_entrega", {
      p_codigo: v.dados.codigo,
      p_whatsapp: v.dados.whatsapp,
      p_ponto: v.dados.ponto,
      p_dia: v.dados.dia,
      p_hora: v.dados.hora,
      p_ip_hash: await hashIp(),
    });
    if (error) {
      console.error("reservar_entrega falhou", error.code, error.message);
      return { resultado: "erro" };
    }
    if (data === "ok") return { resultado: "ok", codigo: v.dados.codigo, dia: v.dados.dia, hora: v.dados.hora };
    if (data === "nao_encontrada" || data === "dia_invalido" || data === "horario_invalido" || data === "ponto_invalido" || data === "limite")
      return { resultado: data };
    return { resultado: "erro" };
  } catch (e) {
    console.error("reservar: erro inesperado", e instanceof Error ? e.message : e);
    return { resultado: "erro" };
  }
}
