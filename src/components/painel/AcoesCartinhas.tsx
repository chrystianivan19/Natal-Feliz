"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { apagarCartinhasTeste, excluirCartinha } from "@/lib/painel/acoes-cartinhas";

/** "Apagar cartinhas de teste": exige digitar APAGAR. */
export function AcoesLista({ testes }: { testes: number }) {
  const [confirmacao, setConfirmacao] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  return (
    <section className="rounded-2xl border border-vermelho/40 bg-vermelho/5 p-4">
      <h2 className="text-2xl">Apagar cartinhas de teste</h2>
      <p className="text-sm">Remove as {testes} cartinhas marcadas como teste, com fotos e adoções. Não dá para desfazer.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          placeholder="Digite APAGAR"
          aria-label="Digite APAGAR para confirmar"
          className="min-h-11 rounded-xl border border-tinta/25 bg-white px-3"
        />
        <button
          type="button"
          disabled={pendente || confirmacao.trim().toUpperCase() !== "APAGAR"}
          onClick={() => iniciar(async () => setMsg((await apagarCartinhasTeste(confirmacao)).mensagem))}
          className="min-h-11 rounded-full bg-vermelho px-5 font-semibold text-papel disabled:opacity-40"
        >
          {pendente ? "Apagando…" : "Apagar cartinhas de teste"}
        </button>
      </div>
      {msg && <p role="status" className="mt-2 font-semibold">{msg}</p>}
    </section>
  );
}

export function BotaoExcluir({ codigo, status }: { codigo: string; status: string }) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  function excluir() {
    const aviso = status === "disponivel" ? "" : " Ela tem adoção registrada, que também será apagada.";
    if (!window.confirm(`Excluir a cartinha ${codigo}?${aviso}`)) return;
    iniciar(async () => {
      await excluirCartinha(codigo);
      router.push("/painel/cartinhas");
    });
  }
  return (
    <button type="button" onClick={excluir} disabled={pendente} className="min-h-11 rounded-full border border-vermelho px-5 font-semibold text-vermelho disabled:opacity-50">
      {pendente ? "Excluindo…" : "Excluir cartinha"}
    </button>
  );
}
