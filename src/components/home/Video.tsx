"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Celular: capa + botão de play, nada baixa antes do toque (preload="none").
 * Desktop: mudo, começa sozinho só ao entrar na tela e se a pessoa não pediu menos movimento.
 */
export function Video({ url, capa }: { url: string; capa: string | null }) {
  const video = useRef<HTMLVideoElement>(null);
  const [tocando, setTocando] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!desktop || calmo) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    obs.observe(v);
    return () => obs.disconnect();
  }, []);

  return (
    <section aria-labelledby="titulo-video" className="flex flex-col gap-3">
      <h2 id="titulo-video" className="text-4xl">Como foi no ano passado</h2>
      <div className="vidro relative overflow-hidden p-0">
        <video
          ref={video}
          src={url}
          poster={capa ?? undefined}
          preload="none"
          muted
          playsInline
          loop
          controls={tocando}
          onPlay={() => setTocando(true)}
          className="aspect-video w-full bg-tinta object-cover"
        />
        {!tocando && (
          <button
            type="button"
            onClick={() => video.current?.play()}
            aria-label="Assistir ao vídeo"
            className="absolute inset-0 flex items-center justify-center bg-tinta/20 transition-colors hover:bg-tinta/30"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-papel shadow-[var(--shadow-elevado)]">
              <svg viewBox="0 0 24 24" aria-hidden className="ml-1 size-8 fill-vermelho">
                <path d="M7 4.5v15l12.5-7.5z" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
