import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Renova a sessão do Supabase e barra quem não é voluntário em /painel/*.
 * É uma checagem otimista: a segurança de verdade são as regras do banco (RLS).
 */
export async function proxy(request: NextRequest) {
  let resposta = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (lista) => {
          lista.forEach(({ name, value }) => request.cookies.set(name, value));
          resposta = NextResponse.next({ request });
          lista.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();
  const caminho = request.nextUrl.pathname;
  if (caminho === "/painel/login") return resposta;

  const login = (erro?: string) => {
    const url = request.nextUrl.clone();
    url.pathname = "/painel/login";
    url.search = erro ? `?erro=${erro}` : "";
    return NextResponse.redirect(url);
  };

  if (!data.user) return login();
  // Voluntário enxerga a própria linha em `voluntarios`; os demais não enxergam nada (RLS).
  const { data: linha } = await supabase.from("voluntarios").select("email").limit(1).maybeSingle();
  if (!linha) return login("acesso");
  return resposta;
}

export const config = {
  matcher: ["/painel/:path*"],
};
