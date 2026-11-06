"use client";

import { useState, useTransition } from "react";
import { decidir, type ResultadoDecisao } from "@/lib/painel/acoes-adocao";
import { formatarWhatsapp } from "@/lib/adocao/normalizar";
import { faltaQuanto, haQuanto } from "@/lib/tempo/relativo";

export type Pendente = {
  id: string;
  codigo: string;
  crianca: string;
  pedido: string;
  padrinho: string;
  whatsapp: string;
  email: string;
  criadoEm: string;
  expiraEm: string;
};

/** Lista de pendentes. O aviso do resultado fica aqui (no pai), porque a linha decidida some da lista. */
export function ListaPendentes({ pendentes }: { pendentes: Pendente[] }) {
  const [aviso, setAviso] = useState<ResultadoDecisao | null>(null);
  const [emAndamento, iniciar] = useTransition();
  const [ocupado, setOcupado] = useState<string | null>(null);

  function agir(id: string, acao: "aprovar" | "recusar") {
    if (acao === "recusar" && !window.confirm("Recusar esta adoção? A cartinha volta para a lista.")) return;
    setOcupado(id);
    iniciar(async () => {
      setAviso(await decidir(id, acao));
      setOcupado(null);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {aviso && (
        <div role="status" className={`rounded-2xl border p-4 ${aviso.ok ? (aviso.emailOk === false ? "border-dourado bg-dourado/10" : "border-pinheiro bg-pinheiro/10") : "border-vermelho bg-vermelho/10"}`}>
          <p className="font-semibold">{aviso.mensagem}</p>
          {aviso.whatsapp && (
            <a href={aviso.whatsapp} target="_blank" rel="noopener" className="mt-2 inline-flex min-h-11 items-center rounded-full bg-pinheiro px-5 font-semibold text-papel">
              Avisar no WhatsApp
            </a>
          )}
        </div>
      )}

      {pendentes.length === 0 ? (
        <p className="vidro p-5">Nenhuma adoção aguardando confirmação.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {pendentes.map((p) => (
            <li key={p.id} className="rounded-2xl border border-tinta/10 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-lg font-semibold">
                  {p.codigo} · {p.crianca}
                </p>
                <p className="text-sm text-tinta-suave">
                  {haQuanto(p.criadoEm)} · {faltaQuanto(p.expiraEm)}
                </p>
              </div>
              <p className="text-sm">{p.pedido}</p>
              <p className="mt-2">
                <span className="font-semibold">{p.padrinho}</span>
                <br />
                <a className="underline underline-offset-2" href={`https://wa.me/55${p.whatsapp}`} target="_blank" rel="noopener">
                  {formatarWhatsapp(p.whatsapp)}
                </a>{" "}
                · <a className="underline underline-offset-2" href={`mailto:${p.email}`}>{p.email}</a>
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={emAndamento}
                  onClick={() => agir(p.id, "aprovar")}
                  className="min-h-11 rounded-full bg-pinheiro px-5 font-semibold text-papel hover:bg-pinheiro-escuro disabled:opacity-50"
                >
                  {ocupado === p.id ? "Salvando…" : "Aprovar"}
                </button>
                <button
                  type="button"
                  disabled={emAndamento}
                  onClick={() => agir(p.id, "recusar")}
                  className="min-h-11 rounded-full border border-vermelho px-5 font-semibold text-vermelho hover:bg-vermelho/10 disabled:opacity-50"
                >
                  Recusar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
