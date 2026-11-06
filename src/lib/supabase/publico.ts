import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/db";

/**
 * Cliente anônimo sem cookies, para leituras públicas em cache e para a RPC de adoção.
 * O projeto não usa a chave service_role: tudo passa pelas regras do banco (RLS).
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
