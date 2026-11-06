export type DadosAprovacao = {
  padrinhoNome: string;
  padrinhoWhatsapp: string;
  codigo: string;
  primeiroNome: string;
  pedido: string;
  tamanhoRoupa: string | null;
  tamanhoCalcado: string | null;
};

export function primeiroNomeDe(nome: string) {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

/** Link wa.me com a mensagem de confirmação pronta para o voluntário enviar. */
export function linkWhatsappAprovacao(a: DadosAprovacao) {
  const tamanhos = [a.tamanhoRoupa && `roupa ${a.tamanhoRoupa}`, a.tamanhoCalcado && `calçado ${a.tamanhoCalcado}`]
    .filter(Boolean)
    .join(", ");
  const texto =
    `Oi, ${primeiroNomeDe(a.padrinhoNome)}! Aqui é da equipe do Natal Feliz. ` +
    `Sua adoção da cartinha ${a.codigo} (${a.primeiroNome}) está confirmada. ` +
    `Pedido: ${a.pedido}${tamanhos ? ` (${tamanhos})` : ""}. ` +
    `Escreva ${a.codigo} no pacote e entregue até 23/12 num ponto de coleta: natalfeliz2026.vercel.app/entrega. Obrigado!`;
  return `https://wa.me/55${a.padrinhoWhatsapp}?text=${encodeURIComponent(texto)}`;
}
