import { ArrowRight } from "lucide-react";
import { GoldOrnament } from "./GoldOrnament";
import cardProductsAsset from "@/assets/card-products.jpg.asset.json";
import cardEducationAsset from "@/assets/card-education.png.asset.json";
import cardCommunityAsset from "@/assets/card-community.png.asset.json";
import cardAdvisoryAsset from "@/assets/card-advisory.png.asset.json";
import cardWorldAsset from "@/assets/card-world.png.asset.json";

const PATHS = [
  {
    number: "01",
    title: "Produkty",
    description:
      "Objevte bylinné receptury vytvořené pro každodenní péči, rovnováhu, dlouhodobou vitalitu a životní styl v souladu s přírodou.",
    cta: "Objevit produkty",
    to: "/produkty",
    image: cardProductsAsset.url,
    alt: "Bylinné produkty PENTARIVA v tmavě zelených lahvích se zlatými víčky",
  },
  {
    number: "02",
    title: "Vzdělávání",
    description:
      "Získejte srozumitelné a ověřené informace, které pomáhají lépe porozumět produktům i vlastnímu životnímu stylu.",
    cta: "Začít se vzdělávat",
    to: "/vzdelavani",
    image: cardEducationAsset.url,
    alt: "Otevřený herbář a tablet znalostního centra PENTARIVA",
  },
  {
    number: "03",
    title: "Komunita",
    description:
      "Staňte se součástí členského ekosystému založeného na zkušenostech, inspiraci, spolupráci a dlouhodobém rozvoji.",
    cta: "Vstoupit do komunity",
    to: "/komunita",
    image: cardCommunityAsset.url,
    alt: "Členové komunity PENTARIVA v otevřeném rozhovoru u společného stolu",
  },
  {
    number: "04",
    title: "PENTARIVA poradna",
    description:
      "Získejte rychlou odpověď, zákaznickou podporu nebo individuální pomoc při výběru vhodného řešení.",
    cta: "Potřebuji poradit",
    to: "/poradna",
    image: cardAdvisoryAsset.url,
    alt: "Poradkyně PENTARIVA v osobní konzultaci s klientkou",
  },
  {
    number: "05",
    title: "Svět PENTARIVA",
    description:
      "Poznejte náš příběh, filozofii, hodnoty a způsob, jakým propojujeme tradiční bylinné poznání s moderním vývojem.",
    cta: "Poznat PENTARIVA",
    to: "/svet-pentariva",
    image: cardWorldAsset.url,
    alt: "Herbář a evropská krajina — symbol Světa PENTARIVA",
  },
] as const;

export function PathSection() {
  return (
    <section className="relative bg-ivory py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="flex flex-col items-center text-center">
          <GoldOrnament className="text-gold-deep" width={140} />
          <h2
            className="mt-8 max-w-4xl font-serif-display text-forest-deep"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.1,
            }}
          >
            Vyberte si svou cestu světem <span className="tracking-[0.04em]">PENTARIVA</span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink/70 sm:text-lg">
            Produkty, vzdělávání, komunita, poradenství a příběh značky tvoří jeden propojený
            ekosystém. Začněte tam, kde právě potřebujete.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {PATHS.map((path) => (
            <a
              key={path.number}
              href={path.to}
              className="group relative flex flex-col overflow-hidden rounded-[18px] bg-forest-deep text-cream shadow-[0_8px_30px_-8px_rgba(30,42,28,0.35)] ring-1 ring-gold/25 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-10px_rgba(30,42,28,0.55)] hover:ring-gold/60"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <img
                  src={path.image}
                  alt={path.alt}
                  loading="lazy"
                  width={800}
                  height={1066}
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
              </div>

              <div className="relative -mt-px flex flex-1 flex-col gap-3 bg-forest-deep px-7 pb-7 pt-2">
                <span
                  className="font-serif-display text-cream/60"
                  style={{ fontSize: "0.95rem", letterSpacing: "0.05em" }}
                >
                  {path.number}
                </span>
                <h3
                  className="font-serif-display text-cream"
                  style={{ fontSize: "1.55rem", lineHeight: 1.15 }}
                >
                  {path.title}
                </h3>
                <p className="text-[13.5px] leading-relaxed text-cream/70">{path.description}</p>
                <div className="mt-4">
                  <span className="inline-flex items-center gap-2 text-[13.5px] text-gold transition-colors group-hover:text-gold-soft">
                    {path.cta}
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      strokeWidth={1.5}
                    />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
