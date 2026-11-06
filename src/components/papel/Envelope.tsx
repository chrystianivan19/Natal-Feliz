/** Envelope fechado com lacre, para a tela de confirmação. Decorativo. */
export function Envelope({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" aria-hidden className={className} role="presentation">
      <rect x="2" y="2" width="116" height="76" rx="6" fill="#fff" stroke="var(--color-dourado)" strokeWidth="2" />
      <path d="M4 6 L60 46 L116 6" fill="none" stroke="var(--color-dourado)" strokeWidth="2" />
      <circle cx="60" cy="46" r="9" fill="var(--color-vermelho)" />
      <path d="M56 46 l3 3 l6 -7" fill="none" stroke="var(--color-papel)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
