"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { exigirVoluntario } from "./sessao";
import type { LinhaCartinha } from "@/lib/importacao/csv";

export type EstadoForm = { erro?: string };

const texto = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const ouNull = (s: string) => (s ? s : null);

export async function salvarCartinha(_anterior: EstadoForm, f: FormData): Promise<EstadoForm> {
  const { supabase } = await exigirVoluntario();
  const codigo = texto(f, "codigo").toUpperCase();
  const idade = Number(texto(f, "idade"));
  const genero = texto(f, "genero");
  if (!/^C\d{3,4}$/.test(codigo)) return { erro: "Código no formato C001." };
  if (!texto(f, "primeiro_nome")) return { erro: "Escreva o primeiro nome." };
  if (!Number.isInteger(idade) || idade < 0 || idade > 17) return { erro: "Idade entre 0 e 17." };
  if (genero !== "menino" && genero !== "menina") return { erro: "Escolha menino ou menina." };
  if (!texto(f, "pedido")) return { erro: "Escreva o pedido." };

  const dados = {
    codigo,
    primeiro_nome: texto(f, "primeiro_nome").split(/\s+/)[0],
    idade,
    genero: genero as "menino" | "menina",
    pedido: texto(f, "pedido"),
    tamanho_roupa: ouNull(texto(f, "tamanho_roupa")),
    tamanho_calcado: ouNull(texto(f, "tamanho_calcado")),
    observacoes: ouNull(texto(f, "observacoes")),
    teste: f.get("teste") === "on",
    ...(texto(f, "imagem_path") ? { imagem_path: texto(f, "imagem_path") } : {}),
  };
  const original = texto(f, "codigo_original");
  const { error } = original
    ? await supabase.from("cartinhas").update(dados).eq("codigo", original)
    : await supabase.from("cartinhas").insert(dados);
  if (error) return { erro: error.code === "23505" ? `Já existe uma cartinha ${codigo}.` : "Não foi possível salvar." };
  updateTag("cartinhas");
  redirect("/painel/cartinhas");
}

export async function excluirCartinha(codigo: string) {
  const { supabase } = await exigirVoluntario();
  const { data } = await supabase.from("cartinhas").select("imagem_path").eq("codigo", codigo).maybeSingle();
  if (data?.imagem_path) await supabase.storage.from("cartinhas").remove([data.imagem_path]);
  await supabase.from("cartinhas").delete().eq("codigo", codigo);
  updateTag("cartinhas");
}

export async function importarLote(linhas: (LinhaCartinha & { imagemPath: string | null })[]) {
  const { supabase } = await exigirVoluntario();
  const registros = linhas.map((l) => ({
    codigo: l.codigo,
    primeiro_nome: l.primeiroNome.split(/\s+/)[0],
    idade: l.idade,
    genero: l.genero,
    pedido: l.pedido,
    tamanho_roupa: l.tamanhoRoupa,
    tamanho_calcado: l.tamanhoCalcado,
    observacoes: l.observacoes,
    ...(l.imagemPath ? { imagem_path: l.imagemPath } : {}),
  }));
  const { error } = await supabase.from("cartinhas").upsert(registros, { onConflict: "codigo" });
  if (error) return { ok: false, mensagem: "Não foi possível importar. Nada foi gravado." };
  updateTag("cartinhas");
  return { ok: true, mensagem: `${registros.length} cartinhas importadas.` };
}

export async function apagarCartinhasTeste(confirmacao: string) {
  if (confirmacao.trim().toUpperCase() !== "APAGAR") return { ok: false, mensagem: 'Digite APAGAR para confirmar.' };
  const { supabase } = await exigirVoluntario();
  const { data } = await supabase.from("cartinhas").select("imagem_path").eq("teste", true);
  const fotos = (data ?? []).map((d) => d.imagem_path).filter((p): p is string => !!p);
  if (fotos.length) await supabase.storage.from("cartinhas").remove(fotos);
  const { error, count } = await supabase.from("cartinhas").delete({ count: "exact" }).eq("teste", true);
  if (error) return { ok: false, mensagem: "Não foi possível apagar." };
  updateTag("cartinhas");
  return { ok: true, mensagem: `${count ?? 0} cartinhas de teste apagadas.` };
}
