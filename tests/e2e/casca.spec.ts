import { expect, test } from "@playwright/test";

test.describe("casca do site no celular", () => {
  test.skip(({ isMobile }) => !isMobile, "só no projeto mobile");

  test("menu inferior tem 5 links com área de toque ≥ 44px", async ({ page }) => {
    await page.goto("/");
    const menu = page.getByRole("navigation", { name: "Menu principal" });
    await expect(menu).toBeVisible();
    const links = menu.getByRole("link");
    await expect(links).toHaveCount(5);
    await expect(links.nth(0)).toHaveText(/Início/);
    await expect(links.nth(1)).toHaveText(/Cartinhas/);
    await expect(links.nth(2)).toHaveText(/Entrega/);
    await expect(links.nth(3)).toHaveText(/Galeria/);
    await expect(links.nth(4)).toHaveText(/Apoiar/);
    for (let i = 0; i < 5; i++) {
      const caixa = await links.nth(i).boundingBox();
      expect(caixa!.width).toBeGreaterThanOrEqual(44);
      expect(caixa!.height).toBeGreaterThanOrEqual(44);
    }
    const menuCaixa = await menu.boundingBox();
    const altura = page.viewportSize()!.height;
    expect(menuCaixa!.y + menuCaixa!.height).toBeGreaterThan(altura - 2); // colado no rodapé
  });

  test("sem rolagem horizontal a 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    const largura = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(largura[0]).toBeLessThanOrEqual(largura[1]);
  });

  test("card informativo não tem cursor de ponteiro; o link principal tem", async ({ page }) => {
    await page.goto("/");
    const info = page.getByTestId("card-info").first();
    await expect(info).toBeVisible();
    expect(await info.evaluate((el) => getComputedStyle(el).cursor)).not.toBe("pointer");
    const cta = page.getByRole("link", { name: "Ler cartinhas" });
    expect(await cta.evaluate((el) => getComputedStyle(el).cursor)).toBe("pointer");
  });

  test("fundo de caderno com margem vermelha", async ({ page }) => {
    await page.goto("/");
    const fundo = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);
    expect(fundo).toContain("linear-gradient");
    await expect(page.getByTestId("margem-caderno")).toBeAttached();
  });

  test("idioma pt-BR e título da ação", async ({ page }) => {
    await page.goto("/");
    expect(await page.getAttribute("html", "lang")).toBe("pt-BR");
    await expect(page).toHaveTitle(/NATAL FELIZ/);
  });
});
