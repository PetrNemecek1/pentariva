import { ArrowRight } from "lucide-react";
import { GoldOrnament } from "./GoldOrnament";
import communityImageAsset from "@/assets/card-community.png.asset.json";

const HIGHLIGHTS = [
  {
    label: "Jedna registrace",
    text: "Jeden účet a jedna digitální identita pro celý ekosystém PENTARIVA.",
  },
  {
    label: "Postupně se rozšiřující role",
    text: "Od člena přes zákazníka a ambasadora až po mentora, lídra a B2B partnera.",
  },
  {
    label: "Hodnota před odměnou",
    text: "Členství staví na vzdělávání, službách a událostech, ne na tlaku na výkon.",
  },
] as const;

export function CommunitySection() {
  return (
    <section className="relative bg-ivory py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[18px] shadow-[0_30px_60px_-30px_rgba(30,42,28,0.55)]">
              <img
                src={communityImageAsset.url}
                alt="Členové komunity PENTARIVA v otevřeném rozhovoru"
                loading="lazy"
                width={800}
                height={1000}
                className="h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(20,30,20,0) 55%, rgba(20,30,20,0.65) 100%)",
                }}
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden max-w-[260px] border border-gold/30 bg-forest-deep p-6 text-cream shadow-[0_20px_40px_-20px_rgba(30,42,28,0.6)] sm:block">
              <p
                className="text-[10.5px] text-gold"
                style={{ letterSpacing: "0.3em", fontWeight: 500 }}
              >
                ČLENSKÝ EKOSYSTÉM
              </p>
              <p
                className="mt-3 font-serif-display text-cream"
                style={{ fontSize: "1.2rem", lineHeight: 1.25 }}
              >
                „Nejsme fórum pod články. Jsme společný svět.“
              </p>
            </div>
          </div>

          <div>
            <GoldOrnament className="text-gold-deep" width={120} />
            <p
              className="mt-8 text-eyebrow text-gold-deep"
              style={{ letterSpacing: "0.32em" }}
            >
              KOMUNITA PENTARIVA
            </p>
            <h2
              className="mt-6 font-serif-display text-forest-deep"
              style={{
                fontSize: "clamp(1.9rem, 3.6vw, 3rem)",
                lineHeight: 1.1,
              }}
            >
              Jeden ekosystém.
              <br />
              Jedna registrace.
              <br />
              <span className="italic">Postupně se rozšiřující svět.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70">
              Každý registrovaný uživatel bude vstupovat do stejného členského
              prostředí. Sám rozhodne, jaké výhody, vzdělávání a formy spolupráce
              využije — bez nutnosti zakládat další účty.
            </p>

            <ul className="mt-10 space-y-6">
              {HIGHLIGHTS.map((h) => (
                <li key={h.label} className="grid grid-cols-[auto_1fr] gap-5">
                  <div className="mt-1 h-px w-10 shrink-0 bg-gold-deep/70" />
                  <div>
                    <p
                      className="text-[11px] text-gold-deep"
                      style={{ letterSpacing: "0.24em", fontWeight: 500 }}
                    >
                      {h.label.toUpperCase()}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink/75">{h.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <a
                href="/komunita/registrace"
                className="group inline-flex items-center gap-3 bg-forest-deep px-7 py-3.5 text-[11px] text-cream transition-colors hover:bg-forest"
                style={{ letterSpacing: "0.26em", fontWeight: 500 }}
              >
                JAK BUDE FUNGOVAT REGISTRACE
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                  strokeWidth={1.6}
                />
              </a>
              <a
                href="/komunita/clenske-vyhody"
                className="text-[11px] text-forest transition-colors hover:text-gold-deep"
                style={{ letterSpacing: "0.24em", fontWeight: 500 }}
              >
                ZOBRAZIT ČLENSKÉ VÝHODY →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
