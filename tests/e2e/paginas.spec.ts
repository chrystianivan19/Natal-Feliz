import { expect, test } from "@playwright/test";

test.describe("Home, Galeria e Apoiar", () => {
  test.skip(({ isMobile }) => !isMobile, "só no projeto mobile");

  test("cronômetro cabe numa linha a 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto("/");
    const timer = page.getByRole("timer");
    await timer.scrollIntoViewIfNeeded();
    await expect(timer).not.toContainText("--");
    const caixas = await timer.locator(":scope > div").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
    expect(new Set(caixas.map(Math.round)).size).toBe(1);
    const largura = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(largura).toBeLessThanOrEqual(360);
  });

  test("galeria: fotos ou 6 provisórias", async ({ page }) => {
    await page.goto("/galeria");
    const provisorias = page.getByTestId("fotos-provisorias");
    if (await provisorias.count()) {
      await expect(provisorias.getByText("Foto provisória")).toHaveCount(6);
      return;
    }
    // com fotos: lightbox abre, navega com as setas e fecha com Esc
    await page.getByRole("button", { name: /^Ampliar:/ }).first().click();
    const d = page.getByRole("dialog");
    await expect(d).toBeVisible();
    await expect(d.getByText(/^1 \//)).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(d.getByText(/^(2|1) \//)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(d).toBeHidden();
  });

  test("Pix: copiar mostra 'Chave copiada' (se houver chave)", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/apoiar");
    const bloco = page.getByTestId("bloco-pix");
    test.skip((await bloco.count()) === 0, "sem chave Pix cadastrada");
    await bloco.getByRole("button", { name: "Copiar chave Pix" }).click();
    await expect(bloco.getByRole("button", { name: "Chave copiada" })).toBeVisible();
    const chave = await bloco.locator("dd").first().innerText();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(chave);
    await expect(bloco.getByRole("button", { name: "Copiar chave Pix" })).toBeVisible({ timeout: 4000 });
  });

  test("Entrega: Ver no mapa aponta para o Google Maps", async ({ page }) => {
    await page.goto("/entrega");
    const cartao = page.getByTestId("card-ponto").first();
    test.skip((await cartao.count()) === 0, "sem pontos");
    await cartao.getByRole("button").click();
    await expect(page.getByRole("dialog").getByRole("link", { name: "Ver no mapa" })).toHaveAttribute("href", /google\.com\/maps|maps\.app\.goo\.gl/);
  });
});
