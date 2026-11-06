import { expect, test } from "@playwright/test";

// Sem chave secreta não criamos sessão de teste: aqui só o comportamento de quem NÃO está logado.
// O login real (link mágico) é verificado à mão com o e-mail de um voluntário.
test.describe("acesso ao painel", () => {
  test.skip(({ isMobile }) => !isMobile, "só no projeto mobile");

  for (const rota of ["/painel", "/painel/padrinhos", "/painel/cartinhas", "/painel/importar", "/painel/conteudo/pix"]) {
    test(`anônimo em ${rota} vai para o login`, async ({ page }) => {
      await page.goto(rota);
      await expect(page).toHaveURL(/\/painel\/login/);
      await expect(page.getByRole("heading", { name: "Painel dos voluntários" })).toBeVisible();
    });
  }

  test("CSV de padrinhos não abre sem login", async ({ request }) => {
    const r = await request.get("/painel/padrinhos/csv", { maxRedirects: 0 });
    expect([302, 303, 307, 308, 401]).toContain(r.status());
  });

  test("login pede e-mail com teclado de e-mail e não é indexado", async ({ page }) => {
    const r = await page.goto("/painel/login");
    expect(r?.headers()["x-robots-tag"]).toContain("noindex");
    const email = page.getByLabel("Seu e-mail");
    expect(await email.getAttribute("type")).toBe("email");
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });

  test("robots.txt bloqueia /painel", async ({ request }) => {
    const r = await request.get("/robots.txt");
    expect(await r.text()).toMatch(/Disallow: \/painel/);
  });
});
