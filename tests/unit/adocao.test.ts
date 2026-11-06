import { describe, expect, test } from "vitest";
import { normalizarWhatsapp } from "@/lib/adocao/normalizar";
import { validarAdocao } from "@/lib/adocao/schema";

describe("normalizarWhatsapp", () => {
  test.each([
    ["(61) 9 9999-8888", "61999998888"],
    ["+55 61 99999-8888", "61999998888"],
    ["5561999998888", "61999998888"],
    ["61999998888", "61999998888"],
    ["61 9999-8888", "61999998888"], // sem o 9: acrescenta
    [" 061 99999 8888 ", "61999998888"], // zero de operadora na frente
  ])("%s → %s", (entrada, esperado) => {
    expect(normalizarWhatsapp(entrada)).toBe(esperado);
  });

  test.each(["123", "", "abc", "9999-8888", "00 99999-8888"])("%s → null", (entrada) => {
    expect(normalizarWhatsapp(entrada)).toBeNull();
  });
});

const ok = { nome: "Maria Souza", whatsapp: "(61) 99999-8888", email: "maria@exemplo.com", compromisso: "on", site: "" };

describe("validarAdocao", () => {
  test("aceita dados válidos e devolve WhatsApp normalizado e e-mail minúsculo", () => {
    const r = validarAdocao({ ...ok, email: " Maria@Exemplo.com " });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.dados.whatsapp).toBe("61999998888");
      expect(r.dados.email).toBe("maria@exemplo.com");
      expect(r.dados.nome).toBe("Maria Souza");
    }
  });

  test("honeypot preenchido → robo", () => {
    const r = validarAdocao({ ...ok, site: "http://spam" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.robo).toBe(true);
  });

  test("sem compromisso → erro no campo compromisso", () => {
    const r = validarAdocao({ ...ok, compromisso: undefined });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.compromisso).toBe("Confirme o compromisso de entrega.");
  });

  test("nome curto, WhatsApp e e-mail inválidos → três mensagens", () => {
    const r = validarAdocao({ ...ok, nome: "A", whatsapp: "123", email: "maria@" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.erros.nome).toBe("Escreva seu nome.");
      expect(r.erros.whatsapp).toBe("Confira o WhatsApp com DDD.");
      expect(r.erros.email).toBe("Confira o e-mail.");
    }
  });
});
