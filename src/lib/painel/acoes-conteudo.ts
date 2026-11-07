"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { exigirVoluntario } from "./sessao";
import { normalizarWhatsapp } from "@/lib/adocao/normalizar";

export type EstadoConteudo = { erro?: string; ok?: string };

const texto = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const ouNull = (s: string) => (s ? s : null);
const numOuNull = (s: string) => (s && Number.isFinite(Number(s)) ? Math.trunc(Number(s)) : null);

/* ---------- Geral: Pix, contato, evento, prazo e vídeo ---------- */

export async function salvarGeral(_anterior: EstadoConteudo, f: FormData): Promise<EstadoConteudo> {
  const { supabase } = await exigirVoluntario();
  const zap = texto(f, "whatsapp_contato");
  const zapNorm = zap ? normalizarWhatsapp(zap) : null;
  if (zap && !zapNorm) return { erro: "WhatsApp de contato inválido. Use DDD + número." };
  const data = texto(f, "evento_data");
  const hora = texto(f, "evento_hora") || "09:00";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return { erro: "Escolha a data do evento." };
  if (!/^\d{2}:\d{2}$/.test(hora)) return { erro: "Hora do evento inválida." };
  const prazo = texto(f, "prazo_entrega");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(prazo)) return { erro: "Escolha o prazo de entrega." };
  const video = texto(f, "video_url");
  if (video && !/^https:\/\//.test(video)) return { erro: "O link do vídeo precisa começar com https://" };
  const tipo = texto(f, "pix_tipo");

  const { error } = await supabase
    .from("configuracoes")
    .update({
      pix_chave: ouNull(texto(f, "pix_chave")),
      pix_tipo: ouNull(["email", "telefone", "cpf", "cnpj", "aleatoria"].includes(tipo) ? tipo : ""),
      pix_recebedor: ouNull(texto(f, "pix_recebedor")),
      pix_cidade: ouNull(texto(f, "pix_cidade")),
      pix_banco: ouNull(texto(f, "pix_banco")),
      whatsapp_contato: zapNorm,
      evento_data_hora: `${data}T${hora}:00-03:00`,
      prazo_entrega: prazo,
      video_url: ouNull(video),
      ...(texto(f, "video_capa_path") ? { video_capa_path: texto(f, "video_capa_path") } : {}),
      ...(f.get("remover_capa") === "on" ? { video_capa_path: null } : {}),
    })
    .eq("id", 1);
  if (error) return { erro: "Não foi possível salvar." };
  updateTag("config");
  return { ok: "Salvo. O site já mostra as mudanças." };
}

/* ---------- Patrocinadores ---------- */

export async function salvarPatrocinador(_anterior: EstadoConteudo, f: FormData): Promise<EstadoConteudo> {
  const { supabase } = await exigirVoluntario();
  if (!texto(f, "nome")) return { erro: "Escreva o nome do patrocinador." };
  const link = texto(f, "link");
  if (link && !/^https?:\/\//.test(link)) return { erro: "O link precisa começar com https://" };
  const dados = {
    nome: texto(f, "nome"),
    link: ouNull(link),
    ordem: Number(texto(f, "ordem")) || 0,
    ativo: f.get("ativo") === "on",
    ...(texto(f, "logo_path") ? { logo_path: texto(f, "logo_path") } : {}),
  };
  const id = texto(f, "id");
  const { error } = id
    ? await supabase.from("patrocinadores").update(dados).eq("id", id)
    : await supabase.from("patrocinadores").insert(dados);
  if (error) return { erro: "Não foi possível salvar." };
  updateTag("patrocinadores");
  redirect("/painel/conteudo/patrocinadores");
}

export async function excluirPatrocinador(id: string) {
  const { supabase } = await exigirVoluntario();
  const { data } = await supabase.from("patrocinadores").select("logo_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("patrocinadores").delete().eq("id", id);
  if (error) return { ok: false, mensagem: "Não foi possível excluir." };
  if (data?.logo_path) await supabase.storage.from("patrocinadores").remove([data.logo_path]);
  updateTag("patrocinadores");
  return { ok: true, mensagem: "Patrocinador excluído." };
}

/* ---------- Edições anteriores e fotos ---------- */

export async function salvarEdicao(_anterior: EstadoConteudo, f: FormData): Promise<EstadoConteudo> {
  const { supabase } = await exigirVoluntario();
  const ano = Number(texto(f, "ano"));
  if (!Number.isInteger(ano) || ano < 2000 || ano > 2100) return { erro: "Ano inválido." };
  const dados = {
    ano,
    edicao_numero: numOuNull(texto(f, "edicao_numero")),
    criancas_atendidas: numOuNull(texto(f, "criancas_atendidas")),
    presentes_entregues: numOuNull(texto(f, "presentes_entregues")),
    texto: ouNull(texto(f, "texto")),
  };
  const id = texto(f, "id");
  const r = id
    ? await supabase.from("edicoes").update(dados).eq("id", id).select("id").single()
    : await supabase.from("edicoes").insert(dados).select("id").single();
  if (r.error) return { erro: r.error.code === "23505" ? `Já existe a edição de ${ano}.` : "Não foi possível salvar." };
  updateTag("edicoes");
  redirect(`/painel/conteudo/edicoes/${r.data.id}`);
}

export async function excluirEdicao(id: string) {
  const { supabase } = await exigirVoluntario();
  const { data: fotos } = await supabase.from("edicao_fotos").select("foto_path").eq("edicao_id", id);
  const { error } = await supabase.from("edicoes").delete().eq("id", id);
  if (error) return { ok: false, mensagem: "Não foi possível excluir." };
  const caminhos = (fotos ?? []).map((x) => x.foto_path);
  if (caminhos.length) await supabase.storage.from("galeria").remove(caminhos);
  updateTag("edicoes");
  return { ok: true, mensagem: "Edição excluída." };
}

/** Registra fotos já enviadas ao Storage pelo navegador. */
export async function adicionarFotos(edicaoId: string, caminhos: string[]) {
  const { supabase } = await exigirVoluntario();
  const { data: ultima } = await supabase
    .from("edicao_fotos")
    .select("ordem")
    .eq("edicao_id", edicaoId)
    .order("ordem", { ascending: false })
    .limit(1)
    .maybeSingle();
  const base = (ultima?.ordem ?? 0) + 1;
  const { error } = await supabase
    .from("edicao_fotos")
    .insert(caminhos.map((foto_path, i) => ({ edicao_id: edicaoId, foto_path, ordem: base + i })));
  if (error) return { ok: false, mensagem: "As fotos subiram, mas não foi possível registrá-las." };
  updateTag("edicoes");
  return { ok: true, mensagem: `${caminhos.length} ${caminhos.length === 1 ? "foto adicionada" : "fotos adicionadas"}.` };
}

export async function atualizarFoto(id: string, alt: string, ordem: number) {
  const { supabase } = await exigirVoluntario();
  await supabase.from("edicao_fotos").update({ alt: alt.trim() || null, ordem }).eq("id", id);
  updateTag("edicoes");
}

export async function removerFoto(id: string) {
  const { supabase } = await exigirVoluntario();
  const { data } = await supabase.from("edicao_fotos").select("foto_path").eq("id", id).maybeSingle();
  await supabase.from("edicao_fotos").delete().eq("id", id);
  if (data?.foto_path) await supabase.storage.from("galeria").remove([data.foto_path]);
  updateTag("edicoes");
}
