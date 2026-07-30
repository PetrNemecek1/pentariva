interface GoldOrnamentProps {
  className?: string;
  width?: number;
}

/**
 * Signature PENTARIVA gold ornament: two horizontal lines flanking a
 * diamond. Used above section headings across the ecosystem.
 */
export function GoldOrnament({ className = "", width = 140 }: GoldOrnamentProps) {
  return (
    <svg
      role="presentation"
      aria-hidden="true"
      viewBox="0 0 140 16"
      width={width}
      className={className}
      fill="none"
    >
      <line x1="0" y1="8" x2="58" y2="8" stroke="currentColor" strokeWidth="0.8" />
      <line x1="82" y1="8" x2="140" y2="8" stroke="currentColor" strokeWidth="0.8" />
      <path
        d="M70 2 L76 8 L70 14 L64 8 Z"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
