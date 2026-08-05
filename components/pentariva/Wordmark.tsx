interface WordmarkProps {
  className?: string;
  tagline?: boolean;
  tone?: "cream" | "ink";
}

/**
 * PENTARIVA wordmark: letter-spaced serif caps with an optional gold
 * ornament divider and tagline underneath.
 */
export function Wordmark({ className = "", tagline = true, tone = "cream" }: WordmarkProps) {
  const textColor = tone === "cream" ? "text-cream" : "text-forest-deep";
  const taglineColor = tone === "cream" ? "text-gold-soft" : "text-gold-deep";

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <span
        className={`font-serif-display ${textColor} text-2xl sm:text-3xl`}
        style={{ letterSpacing: "0.22em", fontWeight: 500 }}
      >
        PENTARIVA
      </span>
      {tagline && (
        <div className="mt-2 flex items-center gap-3">
          <span
            className={`h-px w-8 ${tone === "cream" ? "bg-gold-soft/70" : "bg-gold-deep/70"}`}
          />
          <span
            className={`text-[10px] sm:text-[11px] ${taglineColor}`}
            style={{ letterSpacing: "0.32em", fontWeight: 500 }}
          >
            Z HLUBIN KOŘENŮ · PRO CELÝ ŽIVOT
          </span>
        </div>
      )}
    </div>
  );
}
