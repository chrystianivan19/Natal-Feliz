import { describe, expect, test } from "vitest";
import { haQuanto, faltaQuanto } from "@/lib/tempo/relativo";

const agora = new Date("2026-12-10T12:00:00-03:00");

describe("haQuanto", () => {
  test.each([
    ["2026-12-10T11:59:40-03:00", "agora"],
    ["2026-12-10T11:45:00-03:00", "há 15 min"],
    ["2026-12-10T09:00:00-03:00", "há 3 h"],
    ["2026-12-08T12:00:00-03:00", "há 2 dias"],
  ])("%s → %s", (iso, esperado) => expect(haQuanto(iso, agora)).toBe(esperado));
});

describe("faltaQuanto", () => {
  test.each([
    ["2026-12-11T09:00:00-03:00", "expira em 21 h"],
    ["2026-12-10T12:40:00-03:00", "expira em 40 min"],
    ["2026-12-10T11:00:00-03:00", "expirada"],
  ])("%s → %s", (iso, esperado) => expect(faltaQuanto(iso, agora)).toBe(esperado));
});
