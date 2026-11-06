"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/", rotulo: "Início", icone: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" },
  { href: "/cartinhas", rotulo: "Cartinhas", icone: "M3 6h18v12H3z M3 6l9 7 9-7" },
  { href: "/entrega", rotulo: "Entrega", icone: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" },
  { href: "/galeria", rotulo: "Galeria", icone: "M4 5h16v14H4z M4 16l5-5 4 4 3-3 4 4" },
  { href: "/apoiar", rotulo: "Apoiar", icone: "M12 20s-8-4.6-8-10.2A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.8C20 15.4 12 20 12 20z" },
] as const;

/**
 * Celular: barra fixa no rodapé, ao alcance do polegar.
 * Desktop (≥768px): barra no topo da página.
 */
export function MenuInferior() {
  const atual = usePathname();
  return (
    <nav
      aria-label="Menu principal"
      className="vidro fixed inset-x-0 bottom-0 z-40 rounded-none border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)] md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b"
    >
      <ul className="mx-auto flex max-w-3xl items-stretch justify-around md:justify-end md:gap-2 md:px-6">
        {ITENS.map((item) => {
          const ativo = item.href === "/" ? atual === "/" : atual.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1 md:flex-none">
              <Link
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`flex min-h-16 min-w-11 flex-col items-center justify-center gap-0.5 px-1 text-xs font-semibold transition-colors md:min-h-14 md:flex-row md:gap-2 md:px-4 md:text-base ${
                  ativo ? "text-vermelho" : "text-tinta-suave hover:text-tinta"
                }`}
              >
                <svg viewBox="0 0 24 24" aria-hidden className="size-6 fill-none stroke-current" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round">
                  <path d={item.icone} />
                </svg>
                <span>{item.rotulo}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
