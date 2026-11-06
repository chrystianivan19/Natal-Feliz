"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { updateTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/publico";
import { validarAdocao, type CampoAdocao } from "./schema";

export type EstadoAdocao =
  | { resultado: "inicial" }
  | { resultado: "ok"; codigo: string }
  | { resultado: "indisponivel" | "limite" | "erro" }
  | { resultado: "invalido"; erros: Partial<Record<CampoAdocao, string>>; valores: Record<string, string> };

async function hashIp() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return createHash("sha256").update(`${ip}:${process.env.IP_HASH_SALT ?? ""}`).digest("hex");
}

/** Server Action do formulário "Quero apadrinhar". Usada com useActionState. */
export async function adotar(codigo: string, _anterior: EstadoAdocao, form: FormData): Promise<EstadoAdocao> {
  const entrada = Object.fromEntries(form.entries());
  const valores = {
    nome: String(entrada.nome ?? ""),
    whatsapp: String(entrada.whatsapp ?? ""),
    email: String(entrada.email ?? ""),
  };
  const v = validarAdocao(entrada);
  if (!v.ok) {
    // Robô (honeypot): responde como sucesso genérico sem gravar nada.
    if (v.robo) return { resultado: "ok", codigo };
    return { resultado: "invalido", erros: v.erros, valores };
  }

  try {
    const { data, error } = await createPublicClient().rpc("adotar_cartinha", {
      p_codigo: codigo,
      p_nome: v.dados.nome,
      p_whatsapp: v.dados.whatsapp,
      p_email: v.dados.email,
      p_ip_hash: await hashIp(),
    });
    if (error) {
      if (error.code === "22023") return { resultado: "invalido", erros: { whatsapp: "Confira os dados e tente de novo." }, valores };
      console.error("adotar_cartinha falhou", error.code, error.message);
      return { resultado: "erro" };
    }
    if (data === "ok") {
      updateTag("cartinhas");
      return { resultado: "ok", codigo };
    }
    if (data === "limite") return { resultado: "limite" };
    return { resultado: "indisponivel" };
  } catch (e) {
    console.error("adotar: erro inesperado", e instanceof Error ? e.message : e);
    return { resultado: "erro" };
  }
}
