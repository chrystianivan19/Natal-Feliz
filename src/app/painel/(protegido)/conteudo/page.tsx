import type { Metadata } from "next";
import Link from "next/link";
import { exigirVoluntario } from "@/lib/painel/sessao";

export const metadata: Metadata = { title: "Conteúdo · Painel" };
export const instant = false;

export default async function PaginaConteudo() {
  const { supabase } = await exigirVoluntario();
  const [pontos, patrocinadores, edicoes, { data: config }] = await Promise.all([
    supabase.from("pontos_entrega").select("id", { count: "exact", head: true }),
    supabase.from("patrocinadores").select("id", { count: "exact", head: true }),
    supabase.from("edicoes").select("id", { count: "exact", head: true }),
    supabase.from("configuracoes").select("pix_chave, whatsapp_contato, video_url").eq("id", 1).maybeSingle(),
  ]);
  const itens = [
    {
      href: "/painel/conteudo/geral",
      titulo: "Pix, contato e datas",
      resumo: [config?.pix_chave ? "Pix ok" : "sem Pix", config?.whatsapp_contato ? "contato ok" : "sem contato", config?.video_url ? "vídeo ok" : "sem vídeo"].join(" · "),
    },
    { href: "/painel/conteudo/pontos", titulo: "Pontos de entrega", resumo: `${pontos.count ?? 0} cadastrados` },
    { href: "/painel/conteudo/patrocinadores", titulo: "Patrocinadores", resumo: `${patrocinadores.count ?? 0} cadastrados` },
    { href: "/painel/conteudo/edicoes", titulo: "Edições anteriores e fotos", resumo: `${edicoes.count ?? 0} edições` },
  ];
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl">Conteúdo do site</h1>
      <p className="text-tinta-suave">Bloco vazio não aparece no site. Preencheu, aparece na hora.</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {itens.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="flex min-h-24 flex-col justify-center rounded-2xl border border-tinta/10 bg-white p-4 hover:border-pinheiro">
              <span className="text-2xl">{i.titulo}</span>
              <span className="text-sm text-tinta-suave">{i.resumo}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
