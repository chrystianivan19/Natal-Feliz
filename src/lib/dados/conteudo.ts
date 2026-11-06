import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/publico";

export type PontoEntrega = { id: string; nome: string; endereco: string; horario: string | null; mapsUrl: string };

export function linkMaps(endereco: string, mapsUrl?: string | null) {
  return mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
}

export async function listarPontos(): Promise<PontoEntrega[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("pontos");
  const { data, error } = await createPublicClient()
    .from("pontos_entrega")
    .select("id, nome, endereco, horario, maps_url")
    .eq("ativo", true)
    .order("ordem");
  if (error) throw new Error(`Falha ao listar pontos: ${error.message}`);
  return (data ?? []).map((p) => ({
    id: p.id,
    nome: p.nome,
    endereco: p.endereco,
    horario: p.horario,
    mapsUrl: linkMaps(p.endereco, p.maps_url),
  }));
}
