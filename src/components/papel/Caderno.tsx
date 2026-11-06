/** Margem vermelha da folha de caderno. Decorativa: fica atrás do conteúdo. */
export function MargemCaderno() {
  return (
    <div
      aria-hidden
      data-testid="margem-caderno"
      className="pointer-events-none fixed inset-y-0 z-0 w-0.5 bg-margem"
      style={{ left: "var(--margem-x)" }}
    />
  );
}

/** Área de conteúdo que começa depois da margem. */
export function Folha({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative z-10 mx-auto w-full max-w-5xl pr-4 md:pr-10"
      style={{ paddingLeft: "var(--recuo-conteudo)", paddingBottom: "calc(var(--altura-menu) + 2rem)" }}
    >
      {children}
    </div>
  );
}
