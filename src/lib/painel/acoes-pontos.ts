"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { exigirVoluntario } from "./sessao";

export type EstadoPonto = { erro?: string };

const texto = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const ouNull = (s: string) => (s ? s : null);

export async function salvarPonto(_anterior: EstadoPonto, f: FormData): Promise<EstadoPonto> {
  const { supabase } = await exigirVoluntario();
  if (!texto(f, "nome")) return { erro: "Escreva o nome do lugar." };
  if (!texto(f, "endereco")) return { erro: "Escreva o endereço." };
  const maps = texto(f, "maps_url");
  if (maps && !/^https:\/\//.test(maps)) return { erro: "O link do mapa precisa começar com https://" };

  const dados = {
    nome: texto(f, "nome"),
    endereco: texto(f, "endereco"),
    maps_url: ouNull(maps),
    telefone: ouNull(texto(f, "telefone")),
    referencia: ouNull(texto(f, "referencia")),
    ordem: Number(texto(f, "ordem")) || 0,
    ativo: f.get("ativo") === "on",
    ...(texto(f, "logo_path") ? { logo_path: texto(f, "logo_path") } : {}),
  };
  const id = texto(f, "id");
  const { error } = id
    ? await supabase.from("pontos_entrega").update(dados).eq("id", id)
    : await supabase.from("pontos_entrega").insert(dados);
  if (error) return { erro: "Não foi possível salvar." };
  updateTag("pontos");
  redirect("/painel/conteudo/pontos");
}

export async function excluirPonto(id: string): Promise<{ ok: boolean; mensagem: string }> {
  const { supabase } = await exigirVoluntario();
  const { data } = await supabase.from("pontos_entrega").select("logo_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("pontos_entrega").delete().eq("id", id);
  if (error) {
    return {
      ok: false,
      mensagem:
        error.code === "23503"
          ? "Esse ponto já tem reservas. Desmarque “Aparece no site” em vez de excluir."
          : "Não foi possível excluir.",
    };
  }
  if (data?.logo_path) await supabase.storage.from("pontos").remove([data.logo_path]);
  updateTag("pontos");
  return { ok: true, mensagem: "Ponto excluído." };
}
