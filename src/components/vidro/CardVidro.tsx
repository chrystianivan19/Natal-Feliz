import Link from "next/link";

type Base = { children: React.ReactNode; className?: string; "data-testid"?: string };

/** Cartão informativo: vidro sem hover, sem elevação, sem cursor de ponteiro. */
export function CardVidro({ children, className = "", ...resto }: Base) {
  return (
    <div className={`vidro p-5 ${className}`} {...resto}>
      {children}
    </div>
  );
}

/** Cartão clicável: o único que recebe hover e elevação. */
export function CardVidroLink({ href, children, className = "", ...resto }: Base & { href: string }) {
  return (
    <Link href={href} className={`vidro vidro-interativo block p-5 ${className}`} {...resto}>
      {children}
    </Link>
  );
}
