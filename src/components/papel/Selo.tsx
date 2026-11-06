/** Selo postal: borda picotada dourada. Informativo, sem hover. */
export function Selo({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-dourado bg-papel px-3 py-1.5 text-center shadow-[var(--shadow-papel)] ${className}`}
    >
      {children}
    </span>
  );
}
