import { ArrowRight, Leaf, FlaskConical, Handshake, Globe2, Star } from "lucide-react";
import heroImage from "@/assets/pentariva-homepage-hero.png";

const TRUST_ITEMS = [
  { icon: Leaf, label: "PŘÍRODNÍ RECEPTURY" },
  { icon: FlaskConical, label: "MODERNÍ VÝVOJ" },
  { icon: Handshake, label: "PARTNERSKÁ KOMUNITA" },
  { icon: Globe2, label: "EVROPSKÝ ROZMĚR" },
] as const;

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-forest-deep text-cream">
      <div className="relative w-full">
        {/* Background photograph */}
        <img
          src={heroImage.src}
          alt="PENTARIVA — bylinné produkty, herbář a digitální ekosystém"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover object-center"
          fetchPriority="high"
        />

        {/* Text scrim: stronger on mobile where text overlaps products, subtle on desktop */}
        <div className="hero-text-scrim absolute inset-0" />
        {/* Subtle bottom vignette to anchor the trust bar */}
        <div
          className="absolute inset-x-0 bottom-0 h-44"
          style={{
            background: "linear-gradient(180deg, rgba(10,18,12,0) 0%, rgba(10,18,12,0.5) 100%)",
          }}
        />

        {/* Content — overlaid on the left of the photograph, 1:1 with reference */}
        <div className="relative mx-auto flex min-h-[92svh] max-w-[1500px] flex-col justify-between px-6 pb-10 pt-16 lg:px-16 lg:pb-14 lg:pt-20">
          <div className="relative max-w-[40rem]">
            {/* Extra soft, localized glow behind the text block — lifts it without a visible box */}
            <div className="hero-text-glow absolute -inset-x-6 -inset-y-5 rounded-[36px] lg:-inset-x-10" />
            <div className="relative">
              <h1
                className="mt-10 font-serif-display text-cream"
                style={{
                  fontSize: "clamp(2rem, 4.2vw, 4.25rem)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.02em",
                  textShadow:
                    "0 1px 2px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.25)",
                }}
              >
                Z hlubin kořenů.
                <br />
                Rozvíjíme svět
                <br />
                přirozené vitality.
              </h1>

              <p
                className="mt-8 max-w-xl text-[15px] leading-relaxed text-cream/95 sm:text-base"
                style={{
                  textShadow:
                    "0 1px 2px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.3), 0 8px 20px rgba(0,0,0,0.25)",
                }}
              >
                Spojujeme tradiční bylinné receptury, moderní vývoj, digitální technologie a
                evropskou partnerskou komunitu do jednoho živého ekosystému péče o člověka.
              </p>

              <div className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
                <a
                  href="/produkty"
                  className="group inline-flex items-center gap-3 whitespace-nowrap bg-gold/80 px-10 py-4 text-[11px] text-forest-deep transition-all hover:bg-gold-soft/80"
                  style={{ letterSpacing: "0.28em", fontWeight: 600 }}
                >
                  OBJEVIT PRODUKTY PENTARIVA
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    strokeWidth={1.6}
                  />
                </a>
                <a
                  href="/svet-pentariva"
                  className="group inline-flex items-center gap-3 whitespace-nowrap border border-gold/80 px-10 py-4 text-[11px] text-cream transition-all hover:bg-gold-soft/80 hover:text-forest-deep"
                  style={{
                    letterSpacing: "0.28em",
                    fontWeight: 600,
                    textShadow: "0 1px 2px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  VSTOUPIT DO SVĚTA PENTARIVA
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    strokeWidth={1.6}
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Trust bar — bottom edge, over the photo */}
          <div className="mt-16 flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-10 sm:gap-y-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                ))}
              </div>
              <span
                className="text-[10.5px] text-cream/90"
                style={{ letterSpacing: "0.28em", fontWeight: 500 }}
              >
                DŮVĚRA ZAČÍNÁ KVALITOU.
              </span>
            </div>

            <ul className="flex flex-wrap gap-x-8 gap-y-4 sm:gap-x-10">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-cream/85">
                  <Icon className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.4} />
                  <span
                    className="text-[10.5px]"
                    style={{ letterSpacing: "0.22em", fontWeight: 500 }}
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
