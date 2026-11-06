import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirVoluntario } from "@/lib/painel/sessao";
import { FormCartinha } from "@/components/painel/FormCartinha";
import { BotaoExcluir } from "@/components/painel/AcoesCartinhas";
import { urlImagem } from "@/lib/dados/cartinhas";

export const metadata: Metadata = { title: "Editar cartinha · Painel" };
export const instant = false;

export default async function EditarCartinha({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const { supabase } = await exigirVoluntario();
  const { data: c } = await supabase.from("cartinhas").select("*").eq("codigo", codigo.toUpperCase()).maybeSingle();
  if (!c) notFound();
  const imagemUrl = urlImagem("cartinhas", c.imagem_path);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl">Cartinha {c.codigo}</h1>
      {imagemUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- prévia simples no painel
        <img src={`${imagemUrl}?v=${encodeURIComponent(c.atualizado_em)}`} alt={`Foto atual da cartinha ${c.codigo}`} className="max-h-72 w-auto self-start rounded-xl border border-tinta/10" />
      )}
      <FormCartinha
        editando
        valores={{
          codigo: c.codigo,
          primeiroNome: c.primeiro_nome,
          idade: c.idade,
          genero: c.genero,
          pedido: c.pedido,
          tamanhoRoupa: c.tamanho_roupa ?? "",
          tamanhoCalcado: c.tamanho_calcado ?? "",
          observacoes: c.observacoes ?? "",
          teste: c.teste,
          imagemUrl,
        }}
      />
      <div className="border-t border-tinta/10 pt-4">
        <BotaoExcluir codigo={c.codigo} status={c.status} />
      </div>
    </div>
  );
}
