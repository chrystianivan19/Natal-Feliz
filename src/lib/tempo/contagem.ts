export type Contagem = { dias: number; horas: number; minutos: number; segundos: number; encerrado: boolean };

/** Tempo que falta até o alvo, em partes inteiras. No alvo ou depois: tudo zero e encerrado. */
export function calcularContagem(agora: Date, alvo: Date): Contagem {
  const total = Math.floor((alvo.getTime() - agora.getTime()) / 1000);
  if (total <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0, encerrado: true };
  return {
    dias: Math.floor(total / 86400),
    horas: Math.floor((total % 86400) / 3600),
    minutos: Math.floor((total % 3600) / 60),
    segundos: total % 60,
    encerrado: false,
  };
}
