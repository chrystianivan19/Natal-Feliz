// Apoio aos testes de tela: lê as cartinhas públicas do banco para calcular o esperado,
// em vez de depender de cartinhas específicas.
import { readFileSync } from "node:fs";
import type { CartinhaPublica } from "../../src/lib/cartinhas/filtrar";

function lerEnv() {
  const env: Record<string, string> = { ...process.env } as Record<string, string>;
  try {
    for (const linha of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const m = linha.match(/^([A-Z_]+)=(.*)$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  } catch {
    /* sem .env.local: usa só process.env */
  }
  return env;
}

export async function cartinhasPublicas(): Promise<CartinhaPublica[]> {
  const env = lerEnv();
  const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/cartinhas_publicas?select=codigo,primeiro_nome,idade,genero,pedido,tamanho_roupa,tamanho_calcado,imagem_path,status&order=codigo`;
  const r = await fetch(url, { headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY } });
  if (!r.ok) throw new Error(`Falha ao ler cartinhas: ${r.status}`);
  const linhas = (await r.json()) as Record<string, unknown>[];
  return linhas.map((l) => ({
    codigo: l.codigo as string,
    primeiroNome: l.primeiro_nome as string,
    idade: l.idade as number,
    genero: l.genero as "menino" | "menina",
    pedido: l.pedido as string,
    tamanhoRoupa: (l.tamanho_roupa as string) ?? null,
    tamanhoCalcado: (l.tamanho_calcado as string) ?? null,
    imagemUrl: (l.imagem_path as string) ?? null,
    status: l.status as CartinhaPublica["status"],
  }));
}

/** Cartinha só de teste, criada por supabase/tests/semear-e2e.sql e apagada por limpar-e2e.sql. */
export const CARTINHA_E2E = { codigo: "C980", nome: "Teste", idade: 7, pedido: "Boneca de teste", roupa: "8", calcado: "30" };

export async function pontosAtivos(): Promise<{ id: string; nome: string }[]> {
  const env = lerEnv();
  const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/pontos_entrega?select=id,nome&ativo=eq.true&order=ordem`;
  const r = await fetch(url, { headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY } });
  if (!r.ok) throw new Error(`Falha ao ler pontos: ${r.status}`);
  return r.json();
}

/** Cartinha C981 já adotada (semear-e2e.sql), usada no teste de agendamento. */
export const ADOCAO_E2E = { codigo: "C981", whatsapp: "61 99999-0981" };
