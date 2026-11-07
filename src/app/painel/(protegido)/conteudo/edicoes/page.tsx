import type { Metadata } from "next";
import Link from "next/link";
import { exigirVoluntario } from "@/lib/painel/sessao";

export const metadata: Metadata = { title: "Edições anteriores · Painel" };
export const instant = false;

export default async function PaginaEdicoes() {
  const { supabase } = await exigirVoluntario();
  const { data } = await supabase
    .from("edicoes")
    .select("id, ano, edicao_numero, criancas_atendidas, presentes_entregues, edicao_fotos(id)")
    .order("ano", { ascending: false });
  return (
    <div className="flex flex-col gap-4">
      <Link href="/painel/conteudo" className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">← Conteúdo</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Edições anteriores</h1>
        <Link href="/painel/conteudo/edicoes/nova" className="inline-flex min-h-11 items-center rounded-full bg-pinheiro px-5 font-semibold text-papel hover:bg-pinheiro-escuro">
          Nova edição
        </Link>
      </div>
      {!data?.length && <p className="rounded-2xl border border-tinta/10 bg-white p-4">Nenhuma edição cadastrada. A Galeria mostra fotos provisórias enquanto isso.</p>}
      <ul className="flex flex-col gap-2">
        {(data ?? []).map((e) => (
          <li key={e.id}>
            <Link href={`/painel/conteudo/edicoes/${e.id}`} className="flex flex-col rounded-2xl border border-tinta/10 bg-white p-4 hover:border-pinheiro">
              <span className="font-semibold">
                {e.ano}
                {e.edicao_numero ? ` · ${e.edicao_numero}ª edição` : ""}
              </span>
              <span className="text-sm text-tinta-suave">
                {e.criancas_atendidas ?? "–"} crianças · {e.presentes_entregues ?? "–"} presentes · {e.edicao_fotos?.length ?? 0} fotos
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
