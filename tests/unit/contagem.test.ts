import { describe, expect, test } from "vitest";
import { calcularContagem } from "@/lib/tempo/contagem";

const alvo = new Date("2026-12-29T09:00:00-03:00");

describe("calcularContagem", () => {
  test("1 dia e 1 segundo antes", () => {
    expect(calcularContagem(new Date("2026-12-28T08:59:59-03:00"), alvo)).toEqual({ dias: 1, horas: 0, minutos: 0, segundos: 1, encerrado: false });
  });
  test("decompõe horas e minutos", () => {
    expect(calcularContagem(new Date("2026-12-29T06:28:15-03:00"), alvo)).toEqual({ dias: 0, horas: 2, minutos: 31, segundos: 45, encerrado: false });
  });
  test("no alvo e depois: tudo zero e encerrado", () => {
    const zero = { dias: 0, horas: 0, minutos: 0, segundos: 0, encerrado: true };
    expect(calcularContagem(alvo, alvo)).toEqual(zero);
    expect(calcularContagem(new Date("2026-12-30T00:00:00-03:00"), alvo)).toEqual(zero);
  });
});
