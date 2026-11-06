"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirVoluntario } from "./sessao";

export type EstadoVoluntario = { erro?: string; ok?: string };

export async function adicionarVoluntario(_anterior: EstadoVoluntario, f: FormData): Promise<EstadoVoluntario> {
  const { supabase } = await exigirVoluntario();
  const email = z.email().safeParse(String(f.get("email") ?? "").trim().toLowerCase());
  if (!email.success) return { erro: "Confira o e-mail." };
  const nome = String(f.get("nome") ?? "").trim() || null;
  const { error } = await supabase.from("voluntarios").upsert({ email: email.data, nome, ativo: true });
  if (error) return { erro: "Não foi possível adicionar." };
  revalidatePath("/painel/voluntarios");
  return { ok: `${email.data} pode entrar no painel.` };
}

export async function alternarVoluntario(email: string, ativo: boolean) {
  const { supabase, email: eu } = await exigirVoluntario();
  if (email === eu && !ativo) return { erro: "Você não pode desativar o próprio acesso." };
  await supabase.from("voluntarios").update({ ativo }).eq("email", email);
  revalidatePath("/painel/voluntarios");
  return {};
}
