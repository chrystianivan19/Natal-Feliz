import { createBrowserClient as criar } from "@supabase/ssr";
import type { Database } from "@/types/db";

export function createBrowserClient() {
  return criar<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
