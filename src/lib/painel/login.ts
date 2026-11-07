"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";

export type EstadoLogin = { enviado: boolean; erro?: string };

/** Envia o link mágico. A resposta é a mesma para qualquer e-mail (não revela quem é voluntário). */
export async function enviarLink(_anterior: EstadoLogin, form: FormData): Promise<EstadoLogin> {
  const email = z.email().safeParse(String(form.get("email") ?? "").trim().toLowerCase());
  if (!email.success) return { enviado: false, erro: "Confira o e-mail." };

  // Com senha: entra direto, sem e-mail (o e-mail gratuito do Supabase manda poucos links por hora).
  const senha = String(form.get("senha") ?? "");
  if (senha) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.data, password: senha });
    if (error) return { enviado: false, erro: "E-mail ou senha não conferem." };
    redirect("/painel");
  }

  const h = await headers();
  const origem = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { emailRedirectTo: `${origem}/auth/callback?next=/painel`, shouldCreateUser: true },
  });
  if (error) {
    console.error("signInWithOtp falhou", error.status, error.message);
    if (error.status === 429) return { enviado: false, erro: "Limite de e-mails por hora atingido. Entre com a senha ou tente daqui a uma hora." };
    return { enviado: false, erro: "Não conseguimos enviar agora. Tente de novo em alguns minutos." };
  }
  return { enviado: true };
}

export async function sair() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/painel/login");
}
