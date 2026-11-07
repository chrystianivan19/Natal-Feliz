import { describe, expect, test } from "vitest";
import { crc16, gerarPayloadPix } from "@/lib/pix/brcode";
import { qrPix } from "@/lib/pix/qr";

/** Lê o payload EMV em pares id → valor (um nível). */
function campos(payload: string) {
  const m = new Map<string, string>();
  let i = 0;
  while (i < payload.length) {
    const id = payload.slice(i, i + 2);
    const tam = Number(payload.slice(i + 2, i + 4));
    m.set(id, payload.slice(i + 4, i + 4 + tam));
    i += 4 + tam;
  }
  return m;
}

describe("crc16", () => {
  test("CRC-16/CCITT-FALSE de referência", () => {
    expect(crc16("123456789")).toBe("29B1");
  });
  test("4 dígitos hex maiúsculos, com zero à esquerda", () => {
    expect(crc16("")).toMatch(/^[0-9A-F]{4}$/);
  });
});

describe("gerarPayloadPix", () => {
  const p = gerarPayloadPix({ chave: "natalfeliz@exemplo.com", recebedor: "Associação Natal Feliz do Gama", cidade: "Brasília" });
  const c = campos(p);

  test("estrutura BR Code estático", () => {
    expect(p.startsWith("000201")).toBe(true);
    expect(c.get("26")).toContain("br.gov.bcb.pix");
    expect(campos(c.get("26")!).get("01")).toBe("natalfeliz@exemplo.com");
    expect(c.get("52")).toBe("0000");
    expect(c.get("53")).toBe("986");
    expect(c.get("58")).toBe("BR");
  });

  test("termina em 6304 + CRC do resto", () => {
    expect(p.slice(-8, -4)).toBe("6304");
    expect(p.slice(-4)).toBe(crc16(p.slice(0, -4)));
  });

  test("recebedor sem acento e até 25 caracteres; cidade até 15", () => {
    expect(c.get("59")).toBe("ASSOCIACAO NATAL FELIZ DO".slice(0, 25));
    expect(c.get("59")!.length).toBeLessThanOrEqual(25);
    expect(c.get("60")).toBe("BRASILIA");
    const longa = campos(gerarPayloadPix({ chave: "x@y.com", recebedor: "A", cidade: "São Sebastião do Paraíso" }));
    expect(longa.get("60")).toBe("SAO SEBASTIAO D");
  });

  test("txid padrão *** e personalizado", () => {
    expect(campos(c.get("62")!).get("05")).toBe("***");
    const t = campos(gerarPayloadPix({ chave: "x@y.com", recebedor: "A", cidade: "B", txid: "NATAL2026" }));
    expect(campos(t.get("62")!).get("05")).toBe("NATAL2026");
  });

  test("chave de telefone ganha +55 e CPF/CNPJ fica só com dígitos", () => {
    expect(campos(campos(gerarPayloadPix({ chave: "(61) 99999-8888", recebedor: "A", cidade: "B" })).get("26")!).get("01")).toBe("+5561999998888");
    expect(campos(campos(gerarPayloadPix({ chave: "123.456.789-09", recebedor: "A", cidade: "B" })).get("26")!).get("01")).toBe("12345678909");
  });
});

describe("qrPix", () => {
  test("gera SVG", async () => {
    const svg = await qrPix(gerarPayloadPix({ chave: "x@y.com", recebedor: "A", cidade: "B" }));
    expect(svg.startsWith("<svg")).toBe(true);
  });
});
