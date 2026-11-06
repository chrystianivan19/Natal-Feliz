import { describe, expect, test } from "vitest";
import { gerarCsvPadrinhos, type LinhaPadrinho } from "@/lib/exportacao/csv";

const linha = (extra: Partial<LinhaPadrinho> = {}): LinhaPadrinho => ({
  codigo: "C001",
  crianca: "Ana",
  pedido: "Boneca",
  padrinho: "Maria Souza",
  whatsapp: "61999998888",
  email: "maria@exemplo.com",
  status: "aprovada",
  pedidoEm: "2026-12-01T10:00:00-03:00",
  decididoEm: "2026-12-01T12:00:00-03:00",
  decididoPor: "vol@exemplo.com",
  ...extra,
});

describe("gerarCsvPadrinhos", () => {
  test("começa com BOM e usa ; com cabeçalho fixo", () => {
    const csv = gerarCsvPadrinhos([linha()]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv.slice(1).split("\r\n")[0]).toBe(
      "codigo;crianca;pedido;padrinho;whatsapp;email;status;pedido_em;decidido_em;decidido_por",
    );
  });

  test("datas no horário de Brasília e WhatsApp formatado", () => {
    const [, l] = gerarCsvPadrinhos([linha()]).slice(1).split("\r\n");
    expect(l).toContain("01/12/2026 10:00");
    expect(l).toContain("(61) 99999-8888");
  });

  test("escapa ; e aspas", () => {
    const [, l] = gerarCsvPadrinhos([linha({ pedido: 'Bola "oficial"; nº 5' })]).slice(1).split("\r\n");
    expect(l).toContain('"Bola ""oficial""; nº 5"');
  });

  test("neutraliza fórmula no começo do campo", () => {
    for (const perigo of ["=HYPERLINK(1)", "+1", "-2", "@x"]) {
      const [, l] = gerarCsvPadrinhos([linha({ padrinho: perigo })]).slice(1).split("\r\n");
      expect(l).toContain(`'${perigo}`);
    }
  });

  test("campos vazios ficam vazios", () => {
    const [, l] = gerarCsvPadrinhos([linha({ decididoEm: null, decididoPor: null })]).slice(1).split("\r\n");
    expect(l.endsWith(";;")).toBe(true);
  });
});
