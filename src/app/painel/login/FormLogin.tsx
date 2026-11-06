"use client";

import { useActionState, useSyncExternalStore } from "react";
import { enviarLink, type EstadoLogin } from "@/lib/painel/login";

const ERROS: Record<string, string> = {
  acesso: "Este e-mail não tem acesso ao painel.",
  link: "O link expirou ou já foi usado. Peça um novo.",
};

const semAssinatura = () => () => {};

export function FormLogin() {
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(enviarLink, { enviado: false });
  const erroUrl = useSyncExternalStore(
    semAssinatura,
    () => new URLSearchParams(window.location.search).get("erro") ?? "",
    () => "",
  );

  if (estado.enviado) {
    return (
      <div role="status" className="vidro p-5">
        <p className="font-semibold">Confira sua caixa de entrada.</p>
        <p className="mt-1">Se este e-mail estiver na lista de voluntários, o link de acesso chega em alguns minutos. Veja também o spam.</p>
      </div>
    );
  }

  return (
    <form action={acao} className="vidro flex flex-col gap-4 p-5">
      {erroUrl && ERROS[erroUrl] && (
        <p role="alert" className="rounded-xl bg-vermelho/10 p-3 font-semibold text-vermelho-escuro">{ERROS[erroUrl]}</p>
      )}
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="font-semibold">Seu e-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          className="min-h-12 rounded-xl border border-tinta/25 bg-white px-4 text-base outline-none focus:border-pinheiro"
        />
      </div>
      {estado.erro && <p role="alert" className="font-semibold text-vermelho">{estado.erro}</p>}
      <button
        type="submit"
        disabled={enviando}
        className="min-h-12 rounded-full bg-pinheiro px-6 font-semibold text-papel transition-colors hover:bg-pinheiro-escuro disabled:opacity-60"
      >
        {enviando ? "Enviando…" : "Receber link de acesso"}
      </button>
      <p className="text-sm text-tinta-suave">Sem senha: mandamos um link para o seu e-mail.</p>
    </form>
  );
}
