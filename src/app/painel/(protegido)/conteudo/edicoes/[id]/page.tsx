import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirVoluntario } from "@/lib/painel/sessao";
import { BotaoExcluir, FormEdicao, FotosEdicao } from "@/components/painel/FormsConteudo";
import { urlImagem } from "@/lib/dados/cartinhas";

export const metadata: Metadata = { title: "Editar edição · Painel" };
export const instant = false;

const s = (n: number | null) => (n === null ? "" : String(n));

export default async function EditarEdicao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await exigirVoluntario();
  const { data: e } = await supabase.from("edicoes").select("*, edicao_fotos(id, foto_path, alt, ordem)").eq("id", id).maybeSingle();
  if (!e) notFound();
  const fotos = [...(e.edicao_fotos ?? [])]
    .sort((a, b) => a.ordem - b.ordem)
    .map((f) => ({ id: f.id, url: urlImagem("galeria", f.foto_path)!, alt: f.alt ?? "", ordem: f.ordem }));
  return (
    <div className="flex flex-col gap-6">
      <Link href="/painel/conteudo/edicoes" className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">← Edições</Link>
      <h1 className="text-4xl">Natal Feliz {e.ano}</h1>
      <FormEdicao v={{ id: e.id, ano: e.ano, numero: s(e.edicao_numero), criancas: s(e.criancas_atendidas), presentes: s(e.presentes_entregues), texto: e.texto ?? "" }} />
      <FotosEdicao edicaoId={e.id} ano={e.ano} fotos={fotos} />
      <BotaoExcluir tipo="edicao" id={e.id} nome={String(e.ano)} />
    </div>
  );
}
