import { expect, test } from "@playwright/test";
import { CARTINHA_E2E as T } from "./apoio";

// Usa só a cartinha de teste C980.
// Antes: supabase/tests/semear-e2e.sql · Depois: supabase/tests/limpar-e2e.sql
test.describe.configure({ mode: "serial" });

test.describe("página da cartinha e adoção", () => {
  test.skip(({ isMobile }) => !isMobile, "só no projeto mobile");

  test("mostra dados da criança e botão fixo no rodapé", async ({ page }) => {
    await page.goto(`/cartinhas/${T.codigo}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(T.nome);
    await expect(page.getByText(`${T.idade} anos`)).toBeVisible();
    await expect(page.getByText(T.pedido)).toBeVisible();
    await expect(page.getByText(`Roupa: ${T.roupa}`)).toBeVisible();
    await expect(page.getByText(`Calçado: ${T.calcado}`)).toBeVisible();
    const botao = page.getByRole("button", { name: "Quero apadrinhar" });
    await expect(botao).toBeVisible();
    const caixa = await botao.boundingBox();
    expect(caixa!.height).toBeGreaterThanOrEqual(48);
    expect(caixa!.y).toBeGreaterThan(page.viewportSize()!.height - 200);
  });

  test("visualizador abre em tela cheia e fecha com Esc e com o botão", async ({ page }) => {
    await page.goto(`/cartinhas/${T.codigo}`);
    await page.getByRole("button", { name: "Ampliar cartinha" }).click();
    const dialogo = page.getByRole("dialog", { name: `Cartinha ${T.codigo}` });
    await expect(dialogo).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialogo).toBeHidden();
    await page.getByRole("button", { name: "Ampliar cartinha" }).click();
    await dialogo.getByRole("button", { name: "Fechar" }).click();
    await expect(dialogo).toBeHidden();
  });

  test("formulário vazio mostra os erros", async ({ page }) => {
    await page.goto(`/cartinhas/${T.codigo}`);
    await page.getByRole("button", { name: "Quero apadrinhar" }).click();
    const form = page.getByRole("dialog", { name: `Apadrinhar a cartinha ${T.codigo}` });
    await form.getByRole("button", { name: "Confirmar" }).click();
    await expect(form.getByText("Escreva seu nome.")).toBeVisible();
    await expect(form.getByText("Confirme o compromisso de entrega.")).toBeVisible();
  });

  test("adota e vê a confirmação", async ({ page }) => {
    await page.goto(`/cartinhas/${T.codigo}`);
    await page.getByRole("button", { name: "Quero apadrinhar" }).click();
    const form = page.getByRole("dialog", { name: `Apadrinhar a cartinha ${T.codigo}` });
    const zap = form.getByLabel("WhatsApp");
    expect(await zap.getAttribute("type")).toBe("tel");
    expect(await zap.getAttribute("inputmode")).toBe("numeric");
    expect(await form.getByLabel("E-mail").getAttribute("type")).toBe("email");
    await form.getByLabel("Seu nome").fill("Padrinho E2E");
    await zap.fill("61 99999-0980");
    await form.getByLabel("E-mail").fill("e2e@teste.dev");
    await form.getByLabel(/Me comprometo/).check();
    await form.getByRole("button", { name: "Confirmar" }).click();
    await expect(page.getByText("A cartinha é sua")).toBeVisible();
    await expect(page.getByText(/23\/12/).first()).toBeVisible();
    await expect(page.getByTestId("confirmacao")).toContainText(T.codigo);
  });

  test("depois da adoção, aparece apadrinhada, com carimbo e sem botão", async ({ page }) => {
    await page.goto(`/cartinhas/${T.codigo}`);
    await expect(page.getByText("Apadrinhada").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Quero apadrinhar" })).toHaveCount(0);
    await page.goto("/cartinhas");
    await expect(page.getByRole("searchbox", { name: "Buscar cartinha" })).toBeVisible();
    await expect(page.getByTestId("card-cartinha").filter({ hasText: T.codigo })).toContainText("Apadrinhada");
  });

  test("código inexistente mostra página de não encontrada", async ({ page }) => {
    const r = await page.goto("/cartinhas/C777");
    expect(r?.status()).toBe(404);
  });
});
