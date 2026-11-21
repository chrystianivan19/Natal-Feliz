"use client";

import { useRef } from "react";
import { CONTATOS_AJUDA, linkAjuda } from "@/lib/contato/ajuda";

/**
 * Botão fixo "Ajuda": celular no canto de cima (embaixo ficam o menu e o "Quero apadrinhar"),
 * computador no canto de baixo. Abre a lista de WhatsApps da equipe.
 */
export function BotaoAjuda() {
  const painel = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => painel.current?.showModal()}
        aria-haspopup="dialog"
        className="vidro vidro-interativo fixed top-[calc(env(safe-area-inset-top)+0.75rem)] right-4 z-40 flex min-h-11 items-center gap-1.5 rounded-full py-1.5 pr-4 pl-2 font-semibold text-pinheiro md:top-auto md:right-6 md:bottom-6"
      >
        <span aria-hidden className="flex size-7 items-center justify-center rounded-full bg-pinheiro text-base leading-none text-papel">
          ?
        </span>
        Ajuda
      </button>

      <dialog
        ref={painel}
        aria-labelledby="titulo-ajuda"
        className="mx-auto mt-auto mb-0 w-full max-w-md rounded-t-3xl bg-papel p-0 text-tinta backdrop:bg-tinta/60 md:my-auto md:rounded-3xl"
      >
        <div className="flex flex-col gap-4 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <div className="flex items-start justify-between gap-4">
            <h2 id="titulo-ajuda" className="text-4xl leading-tight">Precisa de ajuda?</h2>
            <button
              type="button"
              onClick={() => painel.current?.close()}
              className="min-h-11 min-w-11 rounded-full border border-tinta/20 px-3 font-semibold hover:border-vermelho"
            >
              Fechar
            </button>
          </div>
          <p>
            Ficou com dúvida sobre a cartinha, o presente ou a entrega? Chame alguém da equipe no WhatsApp. A gente
            responde assim que puder.
          </p>
          <ul className="flex flex-col gap-2">
            {CONTATOS_AJUDA.map((c) => (
              <li key={c.numero}>
                <a
                  href={linkAjuda(c.numero)}
                  target="_blank"
                  rel="noopener"
                  className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-tinta/15 bg-white px-4 font-semibold transition-colors hover:border-pinheiro"
                >
                  <span className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" aria-hidden className="size-6 fill-pinheiro">
                      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.2-.2-.5-.3z" />
                    </svg>
                    {c.rotulo}
                  </span>
                  <span className="text-sm font-normal text-tinta-suave">Abrir WhatsApp</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
