"use client";

import { useActionState, useTransition } from "react";
import { adicionarVoluntario, alternarVoluntario, type EstadoVoluntario } from "@/lib/painel/acoes-voluntarios";

export function FormVoluntario() {
  const [estado, acao, enviando] = useActionState<EstadoVoluntario, FormData>(adicionarVoluntario, {});
  return (
    <form action={acao} className="flex flex-col gap-3 rounded-2xl border border-tinta/10 bg-white p-4 md:flex-row md:items-end">
      <label className="flex flex-1 flex-col gap-1">
        <span className="font-semibold">E-mail</span>
        <input name="email" type="email" inputMode="email" required className="min-h-11 rounded-xl border border-tinta/25 px-3" />
      </label>
      <label className="flex flex-1 flex-col gap-1">
        <span className="font-semibold">Nome (opcional)</span>
        <input name="nome" className="min-h-11 rounded-xl border border-tinta/25 px-3" />
      </label>
      <button type="submit" disabled={enviando} className="min-h-11 rounded-full bg-pinheiro px-5 font-semibold text-papel disabled:opacity-50">
        Adicionar
      </button>
      {estado.erro && <p role="alert" className="font-semibold text-vermelho">{estado.erro}</p>}
      {estado.ok && <p role="status" className="font-semibold text-pinheiro">{estado.ok}</p>}
    </form>
  );
}

export function BotaoAtivo({ email, ativo }: { email: string; ativo: boolean }) {
  const [pendente, iniciar] = useTransition();
  return (
    <button
      type="button"
      disabled={pendente}
      onClick={() => iniciar(async () => { await alternarVoluntario(email, !ativo); })}
      className="min-h-11 rounded-full border border-tinta/20 px-4 text-sm font-semibold disabled:opacity-50"
    >
      {ativo ? "Desativar" : "Reativar"}
    </button>
  );
}
