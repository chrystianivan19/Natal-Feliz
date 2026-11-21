import { describe, expect, test } from "vitest";
import { contarCaixas } from "@/lib/bombom/caixas";

describe("contarCaixas", () => {
  test("uma caixa por cartinha; faltam = cartinhas - temos", () => {
    expect(contarCaixas(11, 4)).toEqual({ total: 11, temos: 4, faltam: 7 });
  });
  test("sem caixas ainda", () => {
    expect(contarCaixas(11, 0)).toEqual({ total: 11, temos: 0, faltam: 11 });
  });
  test("mais caixas que crianças: faltam 0, temos mostra o que chegou", () => {
    expect(contarCaixas(11, 13)).toEqual({ total: 11, temos: 13, faltam: 0 });
  });
  test("valor estranho vira 0", () => {
    expect(contarCaixas(11, -2)).toEqual({ total: 11, temos: 0, faltam: 11 });
    expect(contarCaixas(11, Number.NaN)).toEqual({ total: 11, temos: 0, faltam: 11 });
  });
});
