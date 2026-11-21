import { describe, expect, test } from "vitest";
import { CONTATOS_AJUDA, linkAjuda } from "@/lib/contato/ajuda";

describe("ajuda", () => {
  test("os três números de ajuda, formatados", () => {
    expect(CONTATOS_AJUDA.map((c) => c.rotulo)).toEqual(["(61) 99652-6275", "(61) 99105-3587", "(61) 99166-3337"]);
  });

  test("link abre o WhatsApp com +55 e mensagem pronta", () => {
    const link = linkAjuda(CONTATOS_AJUDA[0].numero);
    expect(link.startsWith("https://wa.me/5561996526275?text=")).toBe(true);
    expect(decodeURIComponent(link.split("text=")[1])).toBe("Oi! Tenho uma dúvida sobre o Natal Feliz.");
  });
});
