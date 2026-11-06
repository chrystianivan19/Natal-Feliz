"use client";

import Image from "next/image";
import { useRef } from "react";

/**
 * Imagem da carta com leitura em tela cheia (<dialog>), zoom por pinça e botão de fechar grande.
 * A imagem em resolução cheia só carrega quando o visualizador abre.
 */
export function Visualizador({ codigo, src, alt }: { codigo: string; src: string | null; alt: string }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const gatilho = useRef<HTMLButtonElement>(null);
  const imagem = src ?? "/cartinha-provisoria.svg";

  function fechar() {
    dialogo.current?.close();
  }

  return (
    <>
      <button
        ref={gatilho}
        type="button"
        aria-label="Ampliar cartinha"
        onClick={() => dialogo.current?.showModal()}
        className="vidro vidro-interativo relative block aspect-[3/4] w-full overflow-hidden p-0"
      >
        <Image src={imagem} alt={alt} fill priority sizes="(max-width: 767px) 92vw, 480px" className="object-contain" unoptimized={!src} />
        <span className="absolute right-3 bottom-3 rounded-full bg-tinta/80 px-3 py-1.5 text-sm font-semibold text-papel">
          Toque para ampliar
        </span>
      </button>

      <dialog
        ref={dialogo}
        aria-label={`Cartinha ${codigo}`}
        onClose={() => gatilho.current?.focus()}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-tinta p-0 backdrop:bg-tinta/90"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-2 text-papel">
            <span className="text-sm">Use dois dedos para dar zoom</span>
            <button
              type="button"
              onClick={fechar}
              className="min-h-12 min-w-12 rounded-full bg-papel px-5 text-base font-semibold text-tinta"
            >
              Fechar
            </button>
          </div>
          <div className="flex-1 overflow-auto [touch-action:pinch-zoom_pan-x_pan-y]">
            {/* eslint-disable-next-line @next/next/no-img-element -- resolução cheia sob demanda, com zoom nativo */}
            <img src={imagem} alt={alt} loading="lazy" className="mx-auto h-auto w-full max-w-3xl" />
          </div>
        </div>
      </dialog>
    </>
  );
}
