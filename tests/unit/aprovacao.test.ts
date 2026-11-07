import { describe, expect, test } from "vitest";
import { linkWhatsappAprovacao } from "@/lib/adocao/whatsapp";
import { montarEmailAprovacao } from "@/lib/email/aprovacao";

const adocao = {
  padrinhoNome: "Maria Souza",
  padrinhoWhatsapp: "61999998888",
  codigo: "C001",
  primeiroNome: "Ana",
  pedido: "Boneca com acessórios",
  tamanhoRoupa: "8",
  tamanhoCalcado: "30",
};
const pontos = [
  { id: "1", nome: "Igreja Central", endereco: "Setor Leste, Gama", horario: "seg a sex, 8h–18h", mapsUrl: "https://maps" },
];

describe("linkWhatsappAprovacao", () => {
  test("abre conversa com o número do padrinho e a mensagem pronta", () => {
    const link = linkWhatsappAprovacao(adocao);
    expect(link.startsWith("https://wa.me/5561999998888?text=")).toBe(true);
    const texto = decodeURIComponent(link.split("text=")[1]);
    expect(texto).toContain("Maria");
    expect(texto).toContain("C001");
    expect(texto).toContain("23/12");
  });
});

describe("montarEmailAprovacao", () => {
  test("assunto e texto com código, pedido, tamanhos, prazo e pontos", () => {
    const e = montarEmailAprovacao(adocao, pontos);
    expect(e.assunto).toBe("Cartinha C001 confirmada · Natal Feliz");
    for (const trecho of ["C001", "Boneca com acessórios", "Roupa: 8", "Calçado: 30", "23/12", "Igreja Central", "Setor Leste, Gama"]) {
      expect(e.texto).toContain(trecho);
      expect(e.html).toContain(trecho);
    }
  });

  test("sem pontos cadastrados avisa que serão divulgados", () => {
    const e = montarEmailAprovacao(adocao, []);
    expect(e.texto).toContain("Os pontos de entrega serão divulgados em breve");
  });

  test("escapa HTML vindo dos dados", () => {
    const e = montarEmailAprovacao({ ...adocao, padrinhoNome: "<script>x</script>" }, pontos);
    expect(e.html).not.toContain("<script>");
    expect(e.html).toContain("&lt;script&gt;");
  });
});
