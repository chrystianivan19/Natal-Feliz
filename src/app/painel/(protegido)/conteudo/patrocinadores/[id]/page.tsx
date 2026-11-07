import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirVoluntario } from "@/lib/painel/sessao";
import { BotaoExcluir, FormPatrocinador } from "@/components/painel/FormsConteudo";
import { urlImagem } from "@/lib/dados/cartinhas";

export const metadata: Metadata = { title: "Editar patrocinador · Painel" };
export const instant = false;

export default async function EditarPatrocinador({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await exigirVoluntario();
  const { data: p } = await supabase.from("patrocinadores").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl">{p.nome}</h1>
      <FormPatrocinador v={{ id: p.id, nome: p.nome, link: p.link ?? "", ordem: p.ordem, ativo: p.ativo, logoUrl: urlImagem("patrocinadores", p.logo_path) }} />
      <BotaoExcluir tipo="patrocinador" id={p.id} nome={p.nome} />
    </div>
  );
}
