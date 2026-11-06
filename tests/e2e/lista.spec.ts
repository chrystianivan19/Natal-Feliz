import { expect, test } from "@playwright/test";
import { filtrarCartinhas, type CartinhaPublica } from "../../src/lib/cartinhas/filtrar";
import { cartinhasPublicas } from "./apoio";

// Não depende de cartinhas específicas: lê o banco e calcula o esperado com a mesma função do site.
let lista: CartinhaPublica[] = [];
test.beforeAll(async () => {
  lista = await cartinhasPublicas();
});

const visiveis = (page: import("@playwright/test").Page) => page.getByTestId("card-cartinha").filter({ visible: true });

test.describe("lista de cartinhas", () => {
  test.skip(({ isMobile }) => !isMobile, "só no projeto mobile");

  test("há cartinhas para testar", () => {
    expect(lista.length).toBeGreaterThan(0);
  });

  test("contador mostra o total e cabe numa linha a 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/cartinhas");
    const contador = page.getByTestId("contador");
    await expect(contador).toContainText(String(lista.length));
    const linhas = await page.getByTestId("contador-numeros").evaluate((el) => new Set([...el.children].map((f) => (f as HTMLElement).offsetTop)).size);
    expect(linhas).toBe(1);
    await expect(page.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      String(lista.filter((c) => c.status === "apadrinhada").length),
    );
  });

  test("lista mostra todas as cartinhas", async ({ page }) => {
    await page.goto("/cartinhas");
    await expect(visiveis(page)).toHaveCount(lista.length);
  });

  for (const genero of ["menina", "menino"] as const) {
    test(`filtro ${genero} mostra a quantidade certa e fica na URL`, async ({ page }) => {
      await page.goto("/cartinhas");
      await expect(visiveis(page)).toHaveCount(lista.length);
      await page.getByRole("button", { name: genero === "menina" ? "Menina" : "Menino", exact: true }).click();
      await expect(visiveis(page)).toHaveCount(filtrarCartinhas(lista, { genero }).length);
      await expect(page).toHaveURL(new RegExp(`genero=${genero}`));
    });
  }

  test("faixa de idade pela URL e só disponíveis", async ({ page }) => {
    await page.goto("/cartinhas?faixa=7-9");
    await expect(visiveis(page)).toHaveCount(filtrarCartinhas(lista, { faixa: "7-9" }).length);
    await page.getByRole("button", { name: "Só disponíveis" }).click();
    await expect(visiveis(page)).toHaveCount(filtrarCartinhas(lista, { faixa: "7-9", soDisponiveis: true }).length);
  });

  test("busca pelo pedido de uma cartinha", async ({ page }) => {
    const alvo = lista[0];
    const termo = alvo.pedido.split(/\s+/)[0];
    await page.goto("/cartinhas");
    await page.getByRole("searchbox", { name: "Buscar cartinha" }).fill(termo);
    await expect(visiveis(page)).toHaveCount(filtrarCartinhas(lista, { busca: termo }).length);
    await expect(visiveis(page).filter({ hasText: alvo.codigo })).toHaveCount(1);
  });

  test("busca sem resultado mostra aviso", async ({ page }) => {
    await page.goto("/cartinhas");
    await page.getByRole("searchbox", { name: "Buscar cartinha" }).fill("xyzxyz-nada");
    await expect(visiveis(page)).toHaveCount(0);
    await expect(page.getByText("Nenhuma cartinha com esses filtros")).toBeVisible();
  });

  test("apadrinhadas ficam no fim com carimbo", async ({ page }) => {
    const apadrinhadas = lista.filter((c) => c.status === "apadrinhada").length;
    test.skip(apadrinhadas === 0, "nenhuma apadrinhada no momento");
    await page.goto("/cartinhas");
    await expect(visiveis(page).last()).toContainText("Apadrinhada");
  });

  test("card abre a página da cartinha", async ({ page }) => {
    const alvo = filtrarCartinhas(lista, {})[0];
    await page.goto("/cartinhas");
    await page.getByRole("link", { name: new RegExp(`Ler a cartinha de ${alvo.primeiroNome}`) }).first().click();
    await expect(page).toHaveURL(new RegExp(`/cartinhas/${alvo.codigo}$`));
  });

  test("imagens têm alt sem o nome da criança", async ({ page }) => {
    await page.goto("/cartinhas");
    const alts = await visiveis(page).locator("img").evaluateAll((imgs) => imgs.map((i) => i.getAttribute("alt") ?? ""));
    expect(alts.length).toBe(lista.length);
    for (const alt of alts) expect(alt).toMatch(/^Cartinha C\d{3,4}, criança de \d+ anos?$/);
  });
});
