"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";
import { adotar, type EstadoAdocao } from "@/lib/adocao/acoes";
import type { PontoEntrega } from "@/lib/dados/conteudo";
import { Confirmacao } from "./Confirmacao";

const MSG = {
  indisponivel: "Essa cartinha acabou de ser escolhida por outra pessoa.",
  limite: "Você já tem 3 cartinhas aguardando confirmação. Fale com a gente pelo WhatsApp para adotar mais.",
  erro: "Não conseguimos registrar agora. Tente em alguns minutos ou fale com a gente pelo WhatsApp.",
};

function Campo(props: {
  id: string;
  rotulo: string;
  erro?: string;
  valor?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const { id, rotulo, erro, valor, ...resto } = props;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-semibold">{rotulo}</label>
      <input
        id={id}
        name={id}
        defaultValue={valor}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : undefined}
        className={`min-h-12 rounded-xl border bg-white px-4 text-base outline-none focus:border-pinheiro ${erro ? "border-vermelho" : "border-tinta/25"}`}
        {...resto}
      />
      {erro && <p id={`${id}-erro`} className="text-sm font-semibold text-vermelho">{erro}</p>}
    </div>
  );
}

/** Botão fixo "Quero apadrinhar" + formulário em painel deslizante (bottom sheet). */
export function FormAdocao({ codigo, pontos, disponivel }: { codigo: string; pontos: PontoEntrega[]; disponivel: boolean }) {
  const painel = useRef<HTMLDialogElement>(null);
  const [estado, acao, enviando] = useActionState<EstadoAdocao, FormData>(adotar.bind(null, codigo), { resultado: "inicial" });
  const erros = estado.resultado === "invalido" ? estado.erros : {};
  const valores = estado.resultado === "invalido" ? estado.valores : undefined;

  return (
    <>
      {disponivel && estado.resultado !== "ok" && <div
        className="fixed inset-x-0 z-30 px-4 pb-3 md:static md:p-0"
        style={{ bottom: "calc(var(--altura-menu) + env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={() => painel.current?.showModal()}
          className="min-h-14 w-full rounded-full bg-vermelho px-6 text-lg font-semibold text-papel shadow-[var(--shadow-elevado)] transition-colors hover:bg-vermelho-escuro md:w-auto"
        >
          Quero apadrinhar
        </button>
      </div>}

      <dialog
        ref={painel}
        aria-label={`Apadrinhar a cartinha ${codigo}`}
        className="mx-auto mt-auto mb-0 max-h-[92dvh] w-full max-w-lg rounded-t-3xl bg-papel p-0 text-tinta backdrop:bg-tinta/60 md:my-auto md:rounded-3xl"
      >
        <div className="flex flex-col gap-4 overflow-y-auto p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <div className="flex items-start justify-between gap-4">
            <p className="manuscrita text-3xl">{estado.resultado === "ok" ? "Tudo certo" : `Cartinha ${codigo}`}</p>
            <button type="button" onClick={() => painel.current?.close()} className="min-h-11 min-w-11 rounded-full border border-tinta/20 px-3 font-semibold">
              Fechar
            </button>
          </div>

          {estado.resultado === "ok" ? (
            <Confirmacao codigo={codigo} pontos={pontos} />
          ) : estado.resultado === "indisponivel" ? (
            <div className="flex flex-col gap-3">
              <p role="alert">{MSG.indisponivel}</p>
              <Link href="/cartinhas" className="inline-flex min-h-12 items-center justify-center rounded-full bg-pinheiro px-6 font-semibold text-papel">
                Ver outras cartinhas
              </Link>
            </div>
          ) : (
            <form action={acao} noValidate className="flex flex-col gap-4">
              <p className="text-tinta-suave">Deixe seu contato para receber as instruções de entrega. Seus dados não aparecem no site.</p>
              <Campo id="nome" rotulo="Seu nome" autoComplete="name" required valor={valores?.nome} erro={erros.nome} />
              <Campo
                id="whatsapp"
                rotulo="WhatsApp"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(61) 99999-9999"
                required
                valor={valores?.whatsapp}
                erro={erros.whatsapp}
              />
              <Campo id="email" rotulo="E-mail" type="email" inputMode="email" autoComplete="email" required valor={valores?.email} erro={erros.email} />
              {/* honeypot: invisível para pessoas */}
              <div aria-hidden className="absolute -left-[9999px]">
                <label htmlFor="site">Site</label>
                <input id="site" name="site" tabIndex={-1} autoComplete="off" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="flex min-h-11 items-start gap-3">
                  <input
                    type="checkbox"
                    name="compromisso"
                    aria-invalid={erros.compromisso ? true : undefined}
                    aria-describedby={erros.compromisso ? "compromisso-erro" : undefined}
                    className="mt-1 size-6 shrink-0 accent-pinheiro"
                  />
                  <span>Me comprometo a entregar o presente até 23/12 em um dos pontos de coleta.</span>
                </label>
                {erros.compromisso && <p id="compromisso-erro" className="text-sm font-semibold text-vermelho">{erros.compromisso}</p>}
              </div>
              {(estado.resultado === "limite" || estado.resultado === "erro") && (
                <p role="alert" className="rounded-xl bg-vermelho/10 p-3 font-semibold text-vermelho-escuro">{MSG[estado.resultado]}</p>
              )}
              <button
                type="submit"
                disabled={enviando}
                className="min-h-14 rounded-full bg-vermelho px-6 text-lg font-semibold text-papel transition-colors hover:bg-vermelho-escuro disabled:opacity-60"
              >
                {enviando ? "Enviando…" : "Confirmar"}
              </button>
              <p className="sr-only" aria-live="polite">{enviando ? "Enviando" : ""}</p>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
