import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/publico";
import type { CartinhaPublica } from "@/lib/cartinhas/filtrar";
import type { Database } from "@/types/db";

type Linha = Database["public"]["Views"]["cartinhas_publicas"]["Row"];

export function urlImagem(bucket: string, path: string | null) {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

function mapear(l: Linha): CartinhaPublica {
  return {
    codigo: l.codigo!,
    primeiroNome: l.primeiro_nome!,
    idade: l.idade!,
    genero: l.genero!,
    pedido: l.pedido!,
    tamanhoRoupa: l.tamanho_roupa,
    tamanhoCalcado: l.tamanho_calcado,
    imagemUrl: urlImagem("cartinhas", l.imagem_path),
    status: l.status!,
  };
}

const COLUNAS = "codigo, primeiro_nome, idade, genero, pedido, tamanho_roupa, tamanho_calcado, imagem_path, status";

export async function listarCartinhas(): Promise<CartinhaPublica[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cartinhas");
  const { data, error } = await createPublicClient().from("cartinhas_publicas").select(COLUNAS).order("codigo");
  if (error) throw new Error(`Falha ao listar cartinhas: ${error.message}`);
  return (data ?? []).map((l) => mapear(l as Linha));
}

export async function obterCartinha(codigo: string): Promise<CartinhaPublica | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cartinhas", `cartinha:${codigo}`);
  const { data, error } = await createPublicClient()
    .from("cartinhas_publicas")
    .select(COLUNAS)
    .eq("codigo", codigo.toUpperCase())
    .maybeSingle();
  if (error) throw new Error(`Falha ao ler cartinha: ${error.message}`);
  return data ? mapear(data as Linha) : null;
}
