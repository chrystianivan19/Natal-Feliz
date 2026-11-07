"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Edicao } from "@/lib/dados/conteudo";

/** Abas por ano (mais recente primeiro), grade de fotos e lightbox com setas, Esc e deslizar. */
export function Galeria({ edicoes }: { edicoes: Edicao[] }) {
  const comFotos = edicoes.filter((e) => e.fotos.length);
  const [ano, setAno] = useState(comFotos[0]?.ano);
  const [indice, setIndice] = useState(0);
  const caixa = useRef<HTMLDialogElement>(null);
  const toque = useRef<number | null>(null);
  const atual = comFotos.find((e) => e.ano === ano) ?? comFotos[0];
  const fotos = atual?.fotos ?? [];

  const abrir = (i: number) => {
    setIndice(i);
    caixa.current?.showModal();
  };
  const mover = (d: number) => setIndice((i) => (i + d + fotos.length) % fotos.length);

  if (!atual) return null;
  const foto = fotos[indice];

  return (
    <>
      <div role="tablist" aria-label="Ano" className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {comFotos.map((e) => (
          <button
            key={e.ano}
            role="tab"
            type="button"
            aria-selected={e.ano === atual.ano}
            aria-controls="grade-galeria"
            onClick={() => setAno(e.ano)}
            className={`min-h-11 shrink-0 rounded-full border px-5 font-semibold transition-colors ${
              e.ano === atual.ano ? "border-pinheiro bg-pinheiro text-papel" : "border-tinta/20 bg-white hover:border-pinheiro"
            }`}
          >
            {e.ano}
          </button>
        ))}
      </div>

      <ul id="grade-galeria" role="tabpanel" aria-label={`Fotos de ${atual.ano}`} className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {fotos.map((f, i) => (
          <li key={f.id}>
            <button
              type="button"
              onClick={() => abrir(i)}
              aria-label={`Ampliar: ${f.alt}`}
              className="group relative block aspect-square w-full overflow-hidden rounded-xl bg-papel-escuro"
            >
              <Image src={f.url} alt={f.alt} fill sizes="(max-width: 767px) 50vw, 25vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={caixa}
        aria-label={`Foto ${indice + 1} de ${fotos.length}`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") mover(1);
          if (e.key === "ArrowLeft") mover(-1);
        }}
        onTouchStart={(e) => (toque.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (toque.current === null) return;
          const dx = e.changedTouches[0].clientX - toque.current;
          if (Math.abs(dx) > 40) mover(dx < 0 ? 1 : -1);
          toque.current = null;
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-tinta/95 p-0 text-papel backdrop:bg-tinta/80"
      >
        {foto && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 p-3">
              <p className="text-sm" aria-live="polite">{indice + 1} / {fotos.length}</p>
              <button type="button" onClick={() => caixa.current?.close()} className="min-h-11 min-w-11 rounded-full border border-papel/40 px-4 font-semibold hover:bg-papel/10">
                Fechar
              </button>
            </div>
            <div className="relative flex-1">
              <Image src={foto.url} alt={foto.alt} fill sizes="100vw" className="object-contain" />
            </div>
            <div className="flex justify-between gap-3 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <button type="button" onClick={() => mover(-1)} aria-label="Foto anterior" className="min-h-12 min-w-24 rounded-full border border-papel/40 font-semibold hover:bg-papel/10">
                ← Anterior
              </button>
              <button type="button" onClick={() => mover(1)} aria-label="Próxima foto" className="min-h-12 min-w-24 rounded-full border border-papel/40 font-semibold hover:bg-papel/10">
                Próxima →
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
