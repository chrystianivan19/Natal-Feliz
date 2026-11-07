"use client";

import { useState, useTransition } from "react";
import { decidir } from "@/lib/painel/acoes-adocao";

export function BotaoCancelar({ id, codigo }: { id: string; codigo: string }) {
  const [pendente, iniciar] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <>
      <button
        type="button"
        disabled={pendente}
        onClick={() => {
          if (!window.confirm(`Cancelar a adoção da ${codigo}? A cartinha volta para a lista.`)) return;
          iniciar(async () => setMsg((await decidir(id, "cancelar")).mensagem));
        }}
        className="min-h-11 rounded-full border border-vermelho px-4 text-sm font-semibold text-vermelho disabled:opacity-50"
      >
        {pendente ? "Cancelando…" : "Cancelar adoção"}
      </button>
      {msg && <p role="status" className="w-full text-sm font-semibold">{msg}</p>}
    </>
  );
}
