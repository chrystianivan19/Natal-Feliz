import { expect, test } from "@playwright/test";

// Depende das cartinhas de teste C001–C012 (11 disponíveis, C008 apadrinhada).
test.describe("lista de cartinhas", () => {
  test.skip(({ isMobile }) => !isMobile, "só no projeto mobile");

  test("mostra contador numa linha a 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/cartinhas");
    const contador = page.getByTestId("contador");
    await expect(contador).toContainText("12");
    await expect(contador).toContainText("apadrinhada");
    const linhas = await page.getByTestId("contador-numeros").evaluate((el) => {
      const filhos = [...el.children] as HTMLElement[];
      return new Set(filhos.map((f) => f.offsetTop)).size;
    });
    expect(linhas).toBe(1);
    await expect(page.getByRole("progressbar")).toBeVisible();
  });

  test("filtro Menina reduz a lista e fica na URL", async ({ page }) => {
    await page.goto("/cartinhas");
    const cards = page.getByTestId("card-cartinha").filter({ visible: true });
    await expect(cards).toHaveCount(12);
    await page.getByRole("button", { name: "Menina", exact: true }).click();
    await expect(cards).toHaveCount(6);
    await expect(page).toHaveURL(/genero=menina/);
  });

  test("filtro de idade e só disponíveis", async ({ page }) => {
    await page.goto("/cartinhas?faixa=7-9");
    await expect(page.getByTestId("card-cartinha").filter({ visible: true })).toHaveCount(4);
    await page.getByRole("button", { name: "Só disponíveis" }).click();
    await expect(page.getByTestId("card-cartinha").filter({ visible: true })).toHaveCount(4);
  });

  test("busca por pedido", async ({ page }) => {
    await page.goto("/cartinhas");
    await page.getByRole("searchbox", { name: "Buscar cartinha" }).fill("bicicleta");
    await expect(page.getByTestId("card-cartinha").filter({ visible: true })).toHaveCount(1);
    await expect(page.getByTestId("card-cartinha").filter({ visible: true })).toContainText("Sofia");
  });

  test("apadrinhada tem carimbo e fica no fim", async ({ page }) => {
    await page.goto("/cartinhas");
    const cards = page.getByTestId("card-cartinha").filter({ visible: true });
    await expect(cards.nth(11)).toContainText("Apadrinhada");
    await expect(cards.nth(11)).toContainText("C008");
  });

  test("card abre a página da cartinha", async ({ page }) => {
    await page.goto("/cartinhas");
    await page.getByRole("link", { name: /Ler a cartinha de Ana/ }).click();
    await expect(page).toHaveURL(/\/cartinhas\/C001$/);
  });

  test("imagem tem alt sem o nome da criança", async ({ page }) => {
    await page.goto("/cartinhas");
    const alt = await page.getByTestId("card-cartinha").filter({ visible: true }).first().locator("img").getAttribute("alt");
    expect(alt).toMatch(/^Cartinha C\d{3}, criança de \d+ anos?$/);
  });
});
