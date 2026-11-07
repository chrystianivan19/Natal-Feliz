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
