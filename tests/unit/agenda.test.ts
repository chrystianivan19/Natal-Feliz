import { describe, expect, test } from "vitest";
import { HORAS, diasDisponiveis, horaJaPassou, rotuloDia, rotuloHora, validarReserva } from "@/lib/entrega/agenda";

describe("horários", () => {
  test("12 faixas de uma hora, das 9h às 21h", () => {
    expect(HORAS).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(rotuloHora(9)).toBe("09:00 – 10:00");
    expect(rotuloHora(20)).toBe("20:00 – 21:00");
  });

  test("horário de hoje que já começou não vale", () => {
    const agora = new Date("2026-12-10T14:30:00-03:00");
    expect(horaJaPassou("2026-12-10", 14, agora)).toBe(true);
    expect(horaJaPassou("2026-12-10", 15, agora)).toBe(false);
    expect(horaJaPassou("2026-12-11", 9, agora)).toBe(false);
  });
});

describe("diasDisponiveis", () => {
  test("de hoje até o prazo, no horário de Brasília", () => {
    // 13:00 UTC do dia 20 = 10:00 em Brasília
    const dias = diasDisponiveis(new Date("2026-12-20T13:00:00Z"), "2026-12-23");
    expect(dias).toEqual(["2026-12-20", "2026-12-21", "2026-12-22", "2026-12-23"]);
  });

  test("depois das 20h o dia de hoje sai da lista", () => {
    expect(diasDisponiveis(new Date("2026-12-22T20:10:00-03:00"), "2026-12-23")).toEqual(["2026-12-23"]);
  });

  test("passou do prazo: lista vazia", () => {
    expect(diasDisponiveis(new Date("2026-12-24T10:00:00-03:00"), "2026-12-23")).toEqual([]);
  });

  test("atravessa a virada do mês", () => {
    const dias = diasDisponiveis(new Date("2026-11-29T10:00:00-03:00"), "2026-12-02");
    expect(dias).toEqual(["2026-11-29", "2026-11-30", "2026-12-01", "2026-12-02"]);
  });
});

describe("rotuloDia", () => {
  test("dia da semana e data curta", () => {
    expect(rotuloDia("2026-12-23")).toEqual({ semana: "qua", data: "23/12", completo: "quarta-feira, 23/12" });
    expect(rotuloDia("2026-12-20").semana).toBe("dom");
  });
});

describe("validarReserva", () => {
  const ok = { codigo: " c002 ", whatsapp: "(61) 99999-8888", ponto: "a1b2c3d4-0000-4000-8000-000000000001", dia: "2026-12-20", hora: "14" };

  test("normaliza código, WhatsApp e hora", () => {
    expect(validarReserva(ok)).toEqual({
      ok: true,
      dados: { codigo: "C002", whatsapp: "61999998888", ponto: ok.ponto, dia: "2026-12-20", hora: 14 },
    });
  });

  test("aponta cada campo errado", () => {
    const r = validarReserva({ codigo: "x", whatsapp: "123", ponto: "", dia: "20/12", hora: "8" });
    expect(r).toEqual({
      ok: false,
      erros: {
        codigo: "Escreva o código da cartinha, como C002.",
        whatsapp: "Use o WhatsApp que você informou ao adotar.",
        ponto: "Escolha um ponto de entrega.",
        dia: "Escolha o dia.",
        hora: "Escolha o horário.",
      },
    });
  });
});
