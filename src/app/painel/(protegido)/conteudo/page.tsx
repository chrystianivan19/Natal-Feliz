import type { Metadata } from "next";
import Link from "next/link";
import { exigirVoluntario } from "@/lib/painel/sessao";

export const metadata: Metadata = { title: "Conteúdo · Painel" };
export const instant = false;

export default async function PaginaConteudo() {
  const { supabase } = await exigirVoluntario();
  const { data: pontos } = await supabase.from("pontos_entrega").select("id, nome, endereco, telefone, ativo").order("ordem");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl">Conteúdo do site</h1>
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl">Pontos de entrega</h2>
          <Link href="/painel/conteudo/pontos/novo" className="inline-flex min-h-11 items-center rounded-full bg-pinheiro px-5 font-semibold text-papel hover:bg-pinheiro-escuro">
            Novo ponto
          </Link>
        </div>
        {!pontos?.length && <p className="rounded-2xl border border-tinta/10 bg-white p-4">Nenhum ponto cadastrado.</p>}
        <ul className="flex flex-col gap-2">
          {(pontos ?? []).map((p) => (
            <li key={p.id}>
              <Link href={`/painel/conteudo/pontos/${p.id}`} className="flex flex-col rounded-2xl border border-tinta/10 bg-white p-4 hover:border-pinheiro">
                <span className="font-semibold">
                  {p.nome} {!p.ativo && <span className="ml-1 rounded-full bg-papel-escuro px-2 py-0.5 text-xs">fora do site</span>}
                </span>
                <span className="text-sm text-tinta-suave">
                  {p.endereco}
                  {p.telefone ? ` · ${p.telefone}` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <p className="rounded-2xl border border-dashed border-dourado bg-papel p-4 text-tinta-suave">
        Pix, patrocinadores, edições anteriores e WhatsApp de contato chegam aqui em seguida.
      </p>
    </div>
  );
}
