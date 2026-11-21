export type ContagemCaixas = { total: number; temos: number; faltam: number };

/** Uma caixa de bombom por cartinha. "Temos" vem do painel; "faltam" nunca fica negativo. */
export function contarCaixas(cartinhas: number, recebidas: number): ContagemCaixas {
  const temos = Number.isFinite(recebidas) && recebidas > 0 ? Math.floor(recebidas) : 0;
  return { total: cartinhas, temos, faltam: Math.max(cartinhas - temos, 0) };
}
