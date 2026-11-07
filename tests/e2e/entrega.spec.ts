import { expect, test } from "@playwright/test";
import { ADOCAO_E2E as A, pontosAtivos } from "./apoio";

// Usa a adoção de teste da C981. Antes: supabase/tests/semear-e2e.sql · Depois: limpar-e2e.sql
test.describe.configure({ mode: "serial" });

test.describe("entrega e agendamento", () => {
  test.skip(({ isMobile }) => !isMobile, "só no projeto mobile");

  test("mostra um cartão por ponto ativo", async ({ page }) => {
    const pontos = await pontosAtivos();
    await page.goto("/entrega");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Entrega");
    await expect(page.getByTestId("card-ponto")).toHaveCount(pontos.length);
    await expect(page.getByTestId("card-ponto").first()).toContainText(pontos[0].nome);
  });

  test("abre o ponto com 12 horários das 9h às 21h", async ({ page }) => {
    const [p] = await pontosAtivos();
    await page.goto("/entrega");
    await page.getByRole("button", { name: `Escolher horário em ${p.nome}` }).click();
    const d = page.getByRole("dialog", { name: `Agendar entrega em ${p.nome}` });
    await expect(d).toBeVisible();
    await expect(d.getByRole("radio", { name: /\d\d:00 – \d\d:00/ })).toHaveCount(12);
    await expect(d.getByText("09:00 – 10:00")).toBeVisible();
    await expect(d.getByText("20:00 – 21:00")).toBeVisible();
    await expect(d.getByRole("link", { name: "Ver no mapa" })).toBeVisible();
  });

  test("sem horário escolhido mostra o erro; WhatsApp errado não reserva", async ({ page }) => {
    const [p] = await pontosAtivos();
    await page.goto(`/entrega?codigo=${A.codigo}`);
    await page.getByRole("button", { name: `Escolher horário em ${p.nome}` }).click();
    const d = page.getByRole("dialog", { name: `Agendar entrega em ${p.nome}` });
    await expect(d.getByLabel("Código da cartinha")).toHaveValue(A.codigo);
    await d.getByLabel("WhatsApp").fill("61 98888-0000");
    await d.getByRole("button", { name: "Reservar horário" }).click();
    await expect(d.getByText("Escolha o horário.")).toBeVisible();
    await d.getByRole("radio").nth(1).check({ force: true }); // segundo dia
    await d.getByText("14:00 – 15:00").click();
    await d.getByRole("button", { name: "Reservar horário" }).click();
    await expect(d.getByRole("alert")).toContainText("Não achamos uma adoção");
  });

  test("reserva com código e WhatsApp da adoção", async ({ page }) => {
    const [p] = await pontosAtivos();
    await page.goto(`/entrega?codigo=${A.codigo}`);
    await page.getByRole("button", { name: `Escolher horário em ${p.nome}` }).click();
    const d = page.getByRole("dialog", { name: `Agendar entrega em ${p.nome}` });
    await d.getByRole("radio").nth(1).check({ force: true }); // segundo dia: todos os horários livres
    await d.getByText("14:00 – 15:00").click();
    await d.getByLabel("WhatsApp").fill(A.whatsapp);
    await d.getByRole("button", { name: "Reservar horário" }).click();
    const ok = d.getByTestId("reserva-ok");
    await expect(ok).toContainText("Horário reservado");
    await expect(ok).toContainText(p.nome);
    await expect(ok).toContainText("14:00 às 15:00");
    await expect(ok).toContainText(A.codigo);
  });
});
