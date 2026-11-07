import type { Metadata } from "next";
import Link from "next/link";
import { exigirVoluntario } from "@/lib/painel/sessao";

export const metadata: Metadata = { title: "Patrocinadores · Painel" };
export const instant = false;

export default async function PaginaPatrocinadores() {
  const { supabase } = await exigirVoluntario();
  const { data } = await supabase.from("patrocinadores").select("id, nome, link, ativo").order("ordem");
  return (
    <div className="flex flex-col gap-4">
      <Link href="/painel/conteudo" className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">← Conteúdo</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Patrocinadores</h1>
        <Link href="/painel/conteudo/patrocinadores/novo" className="inline-flex min-h-11 items-center rounded-full bg-pinheiro px-5 font-semibold text-papel hover:bg-pinheiro-escuro">
          Novo patrocinador
        </Link>
      </div>
      {!data?.length && <p className="rounded-2xl border border-tinta/10 bg-white p-4">Nenhum patrocinador cadastrado. A seção fica escondida no site.</p>}
      <ul className="flex flex-col gap-2">
        {(data ?? []).map((p) => (
          <li key={p.id}>
            <Link href={`/painel/conteudo/patrocinadores/${p.id}`} className="flex flex-col rounded-2xl border border-tinta/10 bg-white p-4 hover:border-pinheiro">
              <span className="font-semibold">
                {p.nome} {!p.ativo && <span className="ml-1 rounded-full bg-papel-escuro px-2 py-0.5 text-xs">fora do site</span>}
              </span>
              {p.link && <span className="text-sm text-tinta-suave">{p.link}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
