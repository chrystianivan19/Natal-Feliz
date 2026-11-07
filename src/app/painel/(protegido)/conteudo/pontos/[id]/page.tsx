import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirVoluntario } from "@/lib/painel/sessao";
import { BotaoExcluirPonto, FormPonto } from "@/components/painel/FormPonto";
import { urlImagem } from "@/lib/dados/cartinhas";

export const metadata: Metadata = { title: "Editar ponto · Painel" };
export const instant = false;

export default async function EditarPonto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await exigirVoluntario();
  const { data: p } = await supabase.from("pontos_entrega").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl">{p.nome}</h1>
      <FormPonto
        valores={{
          id: p.id,
          nome: p.nome,
          endereco: p.endereco,
          mapsUrl: p.maps_url ?? "",
          telefone: p.telefone ?? "",
          referencia: p.referencia ?? "",
          ordem: p.ordem,
          ativo: p.ativo,
          logoUrl: urlImagem("pontos", p.logo_path),
        }}
      />
      <div className="border-t border-tinta/10 pt-4">
        <BotaoExcluirPonto id={p.id} nome={p.nome} />
      </div>
    </div>
  );
}
