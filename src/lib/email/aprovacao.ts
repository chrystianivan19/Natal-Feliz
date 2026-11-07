import type { DadosAprovacao } from "@/lib/adocao/whatsapp";
import { primeiroNomeDe } from "@/lib/adocao/whatsapp";
import type { PontoEntrega } from "@/lib/dados/conteudo";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** E-mail enviado ao padrinho quando a equipe aprova a adoção. */
export function montarEmailAprovacao(a: DadosAprovacao, pontos: PontoEntrega[]) {
  const assunto = `Cartinha ${a.codigo} confirmada · Natal Feliz`;
  const tamanhos = [a.tamanhoRoupa && `Roupa: ${a.tamanhoRoupa}`, a.tamanhoCalcado && `Calçado: ${a.tamanhoCalcado}`].filter(Boolean) as string[];
  const linhasPontos = pontos.length
    ? pontos.map((p) => `- ${p.nome}: ${p.endereco}${p.horario ? ` (${p.horario})` : ""}`)
    : ["Os pontos de entrega serão divulgados em breve no site."];

  const texto = [
    `Olá, ${primeiroNomeDe(a.padrinhoNome)}!`,
    "",
    `Sua adoção da cartinha ${a.codigo} está confirmada. Obrigado por participar do Natal Feliz.`,
    "",
    `Criança: ${a.primeiroNome}`,
    `Pedido: ${a.pedido}`,
    ...tamanhos,
    "",
    `Escreva o código ${a.codigo} no pacote e entregue até 23/12 num destes pontos:`,
    ...linhasPontos,
    "",
    "Dúvidas? Responda este e-mail ou veja natalfeliz2026.vercel.app/entrega.",
    "",
    "Equipe Natal Feliz · Gama-DF",
  ].join("\n");

  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#fbf6ea;font-family:Georgia,serif;color:#2b2620">
<div style="max-width:560px;margin:0 auto;padding:24px">
<p style="font-size:22px;color:#b3261e;margin:0 0 8px">Natal Feliz · 4ª edição</p>
<p>Olá, ${esc(primeiroNomeDe(a.padrinhoNome))}!</p>
<p>Sua adoção da cartinha <strong>${esc(a.codigo)}</strong> está confirmada. Obrigado por participar do Natal Feliz.</p>
<table style="border:1px dashed #b08d3c;background:#fff;padding:12px;border-radius:8px;width:100%">
<tr><td><strong>Criança:</strong> ${esc(a.primeiroNome)}</td></tr>
<tr><td><strong>Pedido:</strong> ${esc(a.pedido)}</td></tr>
${tamanhos.map((t) => `<tr><td>${esc(t)}</td></tr>`).join("")}
</table>
<p>Escreva o código <strong>${esc(a.codigo)}</strong> no pacote e entregue até <strong>23/12</strong>:</p>
<ul>${pontos.length ? pontos.map((p) => `<li><strong>${esc(p.nome)}</strong>: ${esc(p.endereco)}${p.horario ? ` (${esc(p.horario)})` : ""} · <a href="${esc(p.mapsUrl)}">Ver no mapa</a></li>`).join("") : "<li>Os pontos de entrega serão divulgados em breve no site.</li>"}</ul>
<p>Dúvidas? Responda este e-mail.</p>
<p style="color:#5c5248">Equipe Natal Feliz · Gama-DF</p>
</div></body></html>`;

  return { assunto, texto, html };
}
