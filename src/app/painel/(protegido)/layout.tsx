import Link from "next/link";
import { sair } from "@/lib/painel/login";

const ITENS = [
  { href: "/painel/padrinhos", rotulo: "Padrinhos" },
  { href: "/painel/reservas", rotulo: "Reservas" },
  { href: "/painel/cartinhas", rotulo: "Cartinhas" },
  { href: "/painel/importar", rotulo: "Importar" },
  { href: "/painel/conteudo", rotulo: "Conteúdo" },
  { href: "/painel/historico", rotulo: "Histórico" },
];

export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-papel/90">
      <header className="sticky top-0 z-20 border-b border-tinta/10 bg-papel/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 pt-3">
          <Link href="/painel" className="manuscrita text-2xl text-vermelho">Painel · Natal Feliz</Link>
          <form action={sair}>
            <button type="submit" className="min-h-11 rounded-full border border-tinta/20 px-4 text-sm font-semibold hover:border-vermelho">
              Sair
            </button>
          </form>
        </div>
        <nav aria-label="Seções do painel" className="mx-auto max-w-5xl overflow-x-auto px-2 [scrollbar-width:none]">
          <ul className="flex gap-1 py-2">
            {ITENS.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="flex min-h-11 items-center rounded-full px-4 text-sm font-semibold whitespace-nowrap hover:bg-pinheiro/10">
                  {i.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
