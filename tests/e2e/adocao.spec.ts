import { expect, test } from "@playwright/test";

// Pré-condição: C001 disponível (resetar com supabase/tests/resetar-e2e.sql antes de rodar).
// Roda em série porque a adoção muda o estado da C001.
test.describe.configure({ mode: "serial" });

test.describe("página da cartinha e adoção", () => {
  test.skip(({ isMobile }) => !isMobile, "só no projeto mobile");

  test("mostra dados da criança e botão fixo no rodapé", async ({ page }) => {
    await page.goto("/cartinhas/C001");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ana");
    await expect(page.getByText("7 anos")).toBeVisible();
    await expect(page.getByText("Boneca com acessórios")).toBeVisible();
    await expect(page.getByText("Roupa: 8")).toBeVisible();
    await expect(page.getByText("Calçado: 30")).toBeVisible();
    const botao = page.getByRole("button", { name: "Quero apadrinhar" });
    await expect(botao).toBeVisible();
    const caixa = await botao.boundingBox();
    expect(caixa!.height).toBeGreaterThanOrEqual(48);
    expect(caixa!.y).toBeGreaterThan(page.viewportSize()!.height - 200); // ao alcance do polegar
  });

  test("visualizador abre em tela cheia e fecha com Esc e com o botão", async ({ page }) => {
    await page.goto("/cartinhas/C001");
    await page.getByRole("button", { name: "Ampliar cartinha" }).click();
    const dialogo = page.getByRole("dialog", { name: "Cartinha C001" });
    await expect(dialogo).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialogo).toBeHidden();
    await page.getByRole("button", { name: "Ampliar cartinha" }).click();
    await dialogo.getByRole("button", { name: "Fechar" }).click();
    await expect(dialogo).toBeHidden();
  });

  test("formulário vazio mostra os erros", async ({ page }) => {
    await page.goto("/cartinhas/C001");
    await page.getByRole("button", { name: "Quero apadrinhar" }).click();
    const form = page.getByRole("dialog", { name: "Apadrinhar a cartinha C001" });
    await form.getByRole("button", { name: "Confirmar" }).click();
    await expect(form.getByText("Escreva seu nome.")).toBeVisible();
    await expect(form.getByText("Confirme o compromisso de entrega.")).toBeVisible();
  });

  test("adota a C001 e vê a confirmação", async ({ page }) => {
    await page.goto("/cartinhas/C001");
    await page.getByRole("button", { name: "Quero apadrinhar" }).click();
    const form = page.getByRole("dialog", { name: "Apadrinhar a cartinha C001" });
    const zap = form.getByLabel("WhatsApp");
    expect(await zap.getAttribute("type")).toBe("tel");
    expect(await zap.getAttribute("inputmode")).toBe("numeric");
    expect(await form.getByLabel("E-mail").getAttribute("type")).toBe("email");
    await form.getByLabel("Seu nome").fill("Padrinho E2E");
    await zap.fill("61 99999-0000");
    await form.getByLabel("E-mail").fill("e2e@teste.dev");
    await form.getByLabel(/Me comprometo/).check();
    await form.getByRole("button", { name: "Confirmar" }).click();
    await expect(page.getByText("Recebemos seu pedido")).toBeVisible();
    await expect(page.getByText(/23\/12/).first()).toBeVisible();
    await expect(page.getByTestId("confirmacao")).toContainText("C001");
  });

  test("depois da adoção, a C001 aparece aguardando e sem botão", async ({ page }) => {
    await page.goto("/cartinhas/C001");
    await expect(page.getByText("Aguardando confirmação").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Quero apadrinhar" })).toHaveCount(0);
    await page.goto("/cartinhas");
    // Espera a lista com filtros substituir o fallback do Suspense.
    await expect(page.getByRole("searchbox", { name: "Buscar cartinha" })).toBeVisible();
    await expect(page.getByTestId("card-cartinha")).toHaveCount(12);
    await expect(page.getByTestId("card-cartinha").filter({ hasText: "C001" })).toContainText("Aguardando confirmação");
  });

  test("cartinha apadrinhada mostra carimbo e não tem botão", async ({ page }) => {
    await page.goto("/cartinhas/C008");
    await expect(page.getByText("Apadrinhada").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Quero apadrinhar" })).toHaveCount(0);
  });

  test("código inexistente mostra página de não encontrada", async ({ page }) => {
    const r = await page.goto("/cartinhas/C777");
    expect(r?.status()).toBe(404);
  });
});
