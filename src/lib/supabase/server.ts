import "server-only";
import { createServerClient as criar } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/db";

/** Cliente com a sessão do usuário (cookies). Respeita RLS. */
export async function createServerClient() {
  const loja = await cookies();
  return criar<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => loja.getAll(),
        setAll: (lista) => {
          try {
            lista.forEach(({ name, value, options }) => loja.set(name, value, options));
          } catch {
            // Chamado de um Server Component: o proxy.ts renova a sessão.
          }
        },
      },
    },
  );
}
