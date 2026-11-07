import type { Metadata } from "next";
import Link from "next/link";
import { exigirVoluntario } from "@/lib/painel/sessao";
import { AcoesLista } from "@/components/painel/AcoesCartinhas";

export const metadata: Metadata = { title: "Cartinhas · Painel" };
export const instant = false;

const STATUS = { disponivel: "Disponível", pendente: "Aguardando", apadrinhada: "Apadrinhada" } as const;

export default async function PainelCartinhas() {
  const { supabase } = await exigirVoluntario();
  const { data } = await supabase
    .from("cartinhas")
    .select("codigo, primeiro_nome, idade, genero, pedido, status, teste, imagem_path")
    .order("codigo");
  const lista = data ?? [];
  const testes = lista.filter((c) => c.teste).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl">Cartinhas</h1>
          <p className="text-tinta-suave">
            {lista.length} no total · {testes} de teste · {lista.filter((c) => !c.imagem_path).length} sem foto
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/painel/importar" className="inline-flex min-h-11 items-center rounded-full border border-pinheiro px-5 font-semibold text-pinheiro">
            Importar em lote
          </Link>
          <Link href="/painel/cartinhas/nova" className="inline-flex min-h-11 items-center rounded-full bg-pinheiro px-5 font-semibold text-papel">
            Nova cartinha
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-tinta/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-papel-escuro/60">
            <tr>
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Criança</th>
              <th className="px-3 py-2">Pedido</th>
              <th className="px-3 py-2">Situação</th>
              <th className="px-3 py-2"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tinta/10">
            {lista.map((c) => (
              <tr key={c.codigo}>
                <td className="px-3 py-2 font-semibold whitespace-nowrap">
                  {c.codigo}
                  {c.teste && <span className="ml-1 rounded bg-dourado/20 px-1 text-xs text-dourado-escuro">teste</span>}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{c.primeiro_nome}, {c.idade}</td>
                <td className="px-3 py-2">{c.pedido}{!c.imagem_path && <span className="ml-1 text-xs text-vermelho">sem foto</span>}</td>
                <td className="px-3 py-2 whitespace-nowrap">{STATUS[c.status]}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <Link href={`/painel/cartinhas/${c.codigo}`} className="inline-flex min-h-11 items-center font-semibold text-pinheiro underline underline-offset-4">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {testes > 0 && <AcoesLista testes={testes} />}
    </div>
  );
}
