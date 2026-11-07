import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/publico";
import { urlImagem } from "@/lib/dados/cartinhas";

export type PontoEntrega = {
  id: string;
  nome: string;
  endereco: string;
  horario: string | null;
  mapsUrl: string;
  telefone: string | null;
  referencia: string | null;
  logoUrl: string | null;
};

export function linkMaps(endereco: string, mapsUrl?: string | null) {
  return mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
}

export async function listarPontos(): Promise<PontoEntrega[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("pontos");
  const { data, error } = await createPublicClient()
    .from("pontos_entrega")
    .select("id, nome, endereco, horario, maps_url, telefone, referencia, logo_path")
    .eq("ativo", true)
    .order("ordem");
  if (error) throw new Error(`Falha ao listar pontos: ${error.message}`);
  return (data ?? []).map((p) => ({
    id: p.id,
    nome: p.nome,
    endereco: p.endereco,
    horario: p.horario,
    mapsUrl: linkMaps(p.endereco, p.maps_url),
    telefone: p.telefone,
    referencia: p.referencia,
    logoUrl: urlImagem("pontos", p.logo_path),
  }));
}

/** Prazo final de entrega (AAAA-MM-DD), editável no painel. */
export async function obterPrazoEntrega(): Promise<string> {
  "use cache";
  cacheLife("hours");
  cacheTag("config");
  const { data } = await createPublicClient().from("configuracoes_publicas").select("prazo_entrega").maybeSingle();
  return data?.prazo_entrega ?? "2026-12-23";
}

export type Patrocinador = { id: string; nome: string; link: string | null; logoUrl: string | null };

export async function listarPatrocinadores(): Promise<Patrocinador[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("patrocinadores");
  const { data, error } = await createPublicClient()
    .from("patrocinadores")
    .select("id, nome, link, logo_path")
    .eq("ativo", true)
    .order("ordem");
  if (error) throw new Error(`Falha ao listar patrocinadores: ${error.message}`);
  return (data ?? []).map((p) => ({ id: p.id, nome: p.nome, link: p.link, logoUrl: urlImagem("patrocinadores", p.logo_path) }));
}

export type FotoEdicao = { id: string; url: string; alt: string };
export type Edicao = {
  id: string;
  ano: number;
  numero: number | null;
  criancas: number | null;
  presentes: number | null;
  texto: string | null;
  fotos: FotoEdicao[];
};

/** Edições anteriores, da mais recente para a mais antiga, com as fotos em ordem. */
export async function listarEdicoes(): Promise<Edicao[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("edicoes");
  const { data, error } = await createPublicClient()
    .from("edicoes")
    .select("id, ano, edicao_numero, criancas_atendidas, presentes_entregues, texto, ordem, edicao_fotos(id, foto_path, alt, ordem)")
    .order("ano", { ascending: false });
  if (error) throw new Error(`Falha ao listar edições: ${error.message}`);
  return (data ?? []).map((e) => ({
    id: e.id,
    ano: e.ano,
    numero: e.edicao_numero,
    criancas: e.criancas_atendidas,
    presentes: e.presentes_entregues,
    texto: e.texto,
    fotos: [...(e.edicao_fotos ?? [])]
      .sort((a, b) => a.ordem - b.ordem)
      .map((f) => ({ id: f.id, url: urlImagem("galeria", f.foto_path)!, alt: f.alt || `Foto do Natal Feliz ${e.ano}` })),
  }));
}

export type Configuracoes = {
  pix: { chave: string; tipo: string | null; recebedor: string; cidade: string; banco: string | null } | null;
  whatsappContato: string | null;
  eventoDataHora: string;
  prazoEntrega: string;
  videoUrl: string | null;
  videoCapaUrl: string | null;
};

export async function obterConfiguracoes(): Promise<Configuracoes> {
  "use cache";
  cacheLife("hours");
  cacheTag("config");
  const { data } = await createPublicClient().from("configuracoes_publicas").select("*").maybeSingle();
  const c = data ?? null;
  return {
    pix: c?.pix_chave
      ? { chave: c.pix_chave, tipo: c.pix_tipo, recebedor: c.pix_recebedor || "Natal Feliz", cidade: c.pix_cidade || "Gama", banco: c.pix_banco }
      : null,
    whatsappContato: c?.whatsapp_contato ?? null,
    eventoDataHora: c?.evento_data_hora ?? "2026-12-29T09:00:00-03:00",
    prazoEntrega: c?.prazo_entrega ?? "2026-12-23",
    videoUrl: c?.video_url ?? null,
    videoCapaUrl: urlImagem("galeria", c?.video_capa_path ?? null),
  };
}
