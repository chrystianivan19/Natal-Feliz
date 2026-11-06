import type { Metadata } from "next";
import { exigirVoluntario } from "@/lib/painel/sessao";
import { haQuanto } from "@/lib/tempo/relativo";

export const metadata: Metadata = { title: "Histórico · Painel" };
export const instant = false;

const ACAO: Record<string, string> = {
  pedido: "Pedido de adoção",
  aprovada: "Aprovada",
  recusada: "Recusada",
  cancelada: "Cancelada",
  expirada: "Expirou (24 h sem resposta)",
};

export default async function PaginaHistorico() {
  const { supabase } = await exigirVoluntario();
  const { data } = await supabase
    .from("historico")
    .select("id, acao, voluntario_email, quando, detalhe, adocoes(cartinhas(codigo))")
    .order("quando", { ascending: false })
    .limit(200);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl">Histórico</h1>
      {!data?.length ? (
        <p className="vidro p-5">Nada registrado ainda.</p>
      ) : (
        <ul className="divide-y divide-tinta/10 rounded-2xl border border-tinta/10 bg-white">
          {data.map((h) => (
            <li key={h.id} className="flex flex-wrap justify-between gap-2 px-4 py-3">
              <span>
                <strong>{h.adocoes?.cartinhas?.codigo ?? h.detalhe ?? "—"}</strong> · {ACAO[h.acao] ?? h.acao}
                {h.voluntario_email ? ` · por ${h.voluntario_email}` : ""}
              </span>
              <span className="text-sm text-tinta-suave" title={new Date(h.quando).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}>
                {haQuanto(h.quando)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
