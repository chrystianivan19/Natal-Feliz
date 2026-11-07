/** Tamanho final da foto: no máximo `max` de largura, mantendo a proporção, nunca ampliando. */
export function dimensoesAlvo(largura: number, altura: number, max = 1600) {
  if (largura <= max) return { largura, altura };
  return { largura: max, altura: Math.round((altura * max) / largura) };
}
