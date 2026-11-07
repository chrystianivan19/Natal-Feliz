// Concorrência real (várias conexões HTTP ao mesmo tempo) usando só a chave pública.
// Pré-condição: a carta C990 existe com status 'disponivel' (semeada por supabase/tests/semear-concorrencia.sql).
// Rodar com: npm run test:db
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "vitest";

const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

test("10 adoções simultâneas da mesma carta: só 1 ok, 9 indisponivel", async () => {
  const antes = await anon.from("cartinhas_publicas").select("status").eq("codigo", "C990").single();
  expect(antes.data?.status).toBe("disponivel");

  const respostas = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      anon.rpc("adotar_cartinha", {
        p_codigo: "C990",
        p_nome: "Padrinho Concorrência",
        p_whatsapp: `619555500${String(i).padStart(2, "0")}`,
        p_email: `conc${i}@teste.dev`,
        p_ip_hash: `teste-conc-${i}`,
      }),
    ),
  );
  for (const r of respostas) expect(r.error).toBeNull();
  const resultados = respostas.map((r) => r.data);
  expect(resultados.filter((r) => r === "ok")).toHaveLength(1);
  expect(resultados.filter((r) => r === "indisponivel")).toHaveLength(9);

  const depois = await anon.from("cartinhas_publicas").select("status").eq("codigo", "C990").single();
  expect(depois.data?.status).toBe("apadrinhada");
});
