/** Envolve uma foto com um pedaço de fita adesiva no topo. */
export function Fita({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <figure className={`relative rotate-[-1.5deg] bg-white p-2 pb-6 shadow-[var(--shadow-papel)] ${className}`}>
      <span aria-hidden className="fita" />
      {children}
    </figure>
  );
}
