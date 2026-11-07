"use client";

import { useEffect, useRef, useState } from "react";
import { calcularContagem, type Contagem } from "@/lib/tempo/contagem";

const dois = (n: number) => String(n).padStart(2, "0");

/** Contagem até o evento. Atualiza a cada segundo só enquanto está visível na tela. */
export function Cronometro({ alvo, dataTexto }: { alvo: string; dataTexto: string }) {
  const caixa = useRef<HTMLElement>(null);
  const [c, setC] = useState<Contagem | null>(null);

  useEffect(() => {
    const destino = new Date(alvo);
    let timer: ReturnType<typeof setInterval> | undefined;
    const tick = () => setC(calcularContagem(new Date(), destino));
    const parar = () => timer && clearInterval(timer);
    const obs = new IntersectionObserver(([e]) => {
      parar();
      if (e.isIntersecting) {
        tick();
        timer = setInterval(tick, 1000);
      }
    });
    if (caixa.current) obs.observe(caixa.current);
    tick();
    return () => {
      parar();
      obs.disconnect();
    };
  }, [alvo]);

  if (c?.encerrado) {
    return (
      <section ref={caixa} className="vidro p-5 text-center">
        <p className="text-lg">A entrega aconteceu em {dataTexto}. Obrigado a quem participou.</p>
      </section>
    );
  }

  const partes: [string, number | undefined][] = [
    ["dias", c?.dias],
    ["horas", c?.horas],
    ["min", c?.minutos],
    ["seg", c?.segundos],
  ];
  return (
    <section ref={caixa} data-testid="cronometro" aria-labelledby="titulo-cronometro" className="vidro flex flex-col gap-2 p-5 text-center">
      <h2 id="titulo-cronometro" className="text-3xl">Contagem para a entrega às crianças</h2>
      <p className="text-tinta-suave">{dataTexto}</p>
      <div role="timer" aria-live="off" className="flex justify-center gap-2 tabular-nums sm:gap-4">
        {partes.map(([rotulo, valor]) => (
          <div key={rotulo} className="flex min-w-16 flex-col rounded-xl border border-dashed border-dourado bg-papel px-2 py-1">
            <span className="manuscrita text-4xl leading-none text-vermelho">{valor === undefined ? "--" : rotulo === "dias" ? valor : dois(valor)}</span>
            <span className="text-xs uppercase tracking-wide text-tinta-suave">{rotulo}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
