import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/** Volta do link mágico: troca o código pela sessão e segue para o painel. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const codigo = url.searchParams.get("code");
  const proximo = url.searchParams.get("next");
  const destino = proximo?.startsWith("/painel") ? proximo : "/painel";
  if (codigo) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) return NextResponse.redirect(new URL(destino, url.origin));
  }
  return NextResponse.redirect(new URL("/painel/login?erro=link", url.origin));
}
