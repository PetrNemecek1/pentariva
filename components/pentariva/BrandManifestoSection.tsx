import { ArrowRight } from "lucide-react";
import brandManifesto from "@/assets/brand-manifesto.png.asset.json";

export function BrandManifestoSection() {
  return (
    <section
      aria-labelledby="brand-manifesto-heading"
      className="relative overflow-hidden bg-ivory"
    >
      <div className="mx-auto max-w-[1500px] px-6 py-24 lg:px-12 lg:py-32">
        <div className="relative overflow-hidden rounded-[24px] bg-ivory-warm/40 ring-1 ring-forest-deep/5 shadow-[0_30px_60px_-40px_rgba(30,42,28,0.35)]">
          {/* Background image */}
          <img
            src={brandManifesto.url}
            alt="Rozmarýn s obnaženými kořeny na kameni s emblémem PENTARIVA a autentickým produktem — symbol pevných základů a přirozeného růstu značky."
            loading="lazy"
            width={1057}
            height={1487}
            className="block h-auto w-full object-cover"
          />

          {/* Very subtle readability wash — only top-left corner behind text */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(250,247,238,0.55)_0%,_rgba(250,247,238,0.15)_28%,_transparent_55%)]"
          />

          {/* Overlaid text — upper left */}
          <div className="absolute inset-0 flex items-start">
            <div className="w-full px-6 pt-10 sm:px-10 sm:pt-14 lg:px-16 lg:pt-20">
              <div className="max-w-xl animate-in fade-in duration-1000">
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-gold/70" />
                  <span
                    className="text-[10px] text-gold-deep sm:text-[11px]"
                    style={{ letterSpacing: "0.32em", fontWeight: 500 }}
                  >
                    PENTARIVA · MANIFEST
                  </span>
                </div>

                <h2
                  id="brand-manifesto-heading"
                  className="mt-5 font-serif-display text-forest-deep sm:mt-8"
                  style={{
                    fontSize: "clamp(1.6rem, 4vw, 3.75rem)",
                    lineHeight: 1.05,
                  }}
                >
                  To nejdůležitější
                  <br />
                  roste pod povrchem.
                </h2>

                <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/80 sm:mt-6 sm:text-base lg:max-w-lg lg:text-lg">
                  PENTARIVA vzniká z úcty k přírodě, důvěry mezi lidmi
                  a přesvědčení, že skutečná hodnota se buduje dlouhodobě.
                </p>

                <div className="mt-6 sm:mt-8 lg:mt-10">
                  <a
                    href="/svet-pentariva/pribeh"
                    className="group inline-flex items-center gap-2 border-b border-gold/40 pb-1 text-[11px] uppercase tracking-[0.24em] text-forest-deep transition-colors hover:border-gold hover:text-gold-deep sm:text-[12px]"
                  >
                    Poznat náš příběh
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      strokeWidth={1.5}
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
