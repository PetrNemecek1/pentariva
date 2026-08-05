import { ArrowRight } from "lucide-react";
import { GoldOrnament } from "./GoldOrnament";

export function OfficeGate() {
  return (
    <section className="relative bg-ivory-warm py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="relative overflow-hidden bg-forest-deep p-10 text-cream sm:p-16 lg:p-20">
          {/* subtle gold border accent */}
          <div className="pointer-events-none absolute inset-4 border border-gold/25" />

          <div className="relative grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <GoldOrnament className="text-gold" width={120} />
              <p className="mt-8 text-eyebrow text-gold" style={{ letterSpacing: "0.32em" }}>
                ONLINE KANCELÁŘ PENTARIVA
              </p>
              <h2
                className="mt-6 font-serif-display text-cream"
                style={{
                  fontSize: "clamp(1.9rem, 3.6vw, 3rem)",
                  lineHeight: 1.1,
                }}
              >
                Vaše osobní a pracovní prostředí v ekosystému PENTARIVA.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/75">
                Online kancelář vzniká jako společné místo pro objednávky, členské výhody,
                vzdělávání, události, dokumenty i přístup k Poradně. Její rozsah se přizpůsobuje
                roli každého uživatele.
              </p>
            </div>

            <div className="flex flex-col gap-5 lg:items-end">
              <a
                href="/prihlaseni"
                className="group inline-flex items-center gap-3 bg-gold px-8 py-4 text-[11px] text-forest-deep transition-all hover:bg-gold-soft"
                style={{ letterSpacing: "0.28em", fontWeight: 600 }}
              >
                PROHLÉDNOUT KONCEPT KANCELÁŘE
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  strokeWidth={1.6}
                />
              </a>
              <a
                href="/komunita/registrace"
                className="group inline-flex items-center gap-2 border-b border-gold/60 pb-1 text-[11px] text-gold transition-colors hover:border-gold hover:text-gold-soft"
                style={{ letterSpacing: "0.28em", fontWeight: 500 }}
              >
                JAK FUNGUJE ČLENSTVÍ
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                  strokeWidth={1.6}
                />
              </a>
              <p className="max-w-sm text-xs leading-relaxed text-cream/60 lg:text-right">
                Jedna registrace propojuje celý ekosystém. Vaše role se rozšiřují postupně pod
                jediným účtem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
