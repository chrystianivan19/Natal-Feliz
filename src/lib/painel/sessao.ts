import "server-only";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

/** Garante voluntário logado em Server Components e Server Actions do painel. */
export async function exigirVoluntario() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) redirect("/painel/login");
  const { data: linha } = await supabase.from("voluntarios").select("email, nome").limit(1).maybeSingle();
  if (!linha) redirect("/painel/login?erro=acesso");
  return { supabase, email: linha.email, nome: linha.nome };
}
