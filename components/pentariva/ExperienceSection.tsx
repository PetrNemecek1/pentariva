import { ArrowRight } from "lucide-react";
import { GoldOrnament } from "./GoldOrnament";
import exp01 from "@/assets/experience-01.jpg.asset.json";
import exp02 from "@/assets/experience-02.jpg.asset.json";
import exp03 from "@/assets/experience-03.jpg.asset.json";

type ExperienceCard = {
  id: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  image: string;
  imageAlt: string;
};

const CARDS: ExperienceCard[] = [
  {
    id: "poradna",
    title: "Individuální konzultace PENTARIVA",
    text: "Koncept Poradny propojuje srozumitelnou orientaci, naslouchání a jasné hranice odpovědnosti. Služba roste společně s odbornou a provozní připraveností.",
    cta: "Jak Poradna funguje",
    href: "/poradna",
    image: exp01.url,
    imageAlt:
      "Poradkyně PENTARIVA v klidné botanické konzultační místnosti s klientkou u dubového stolu",
  },
  {
    id: "komunita",
    title: "Komunita PENTARIVA",
    text: "Poznejte komunitu, která propojuje vzdělávání, osobní rozvoj, setkávání a postupně vznikající formy spolupráce. Členské prostředí i jeho pravidla vznikají právě teď.",
    cta: "Poznat komunitu",
    href: "/komunita",
    image: exp02.url,
    imageAlt: "Skupina lidí u dubového stolu v botanické kavárně s produkty PENTARIVA",
  },
  {
    id: "partnerstvi",
    title: "Partnerství PENTARIVA",
    text: "Partnerský model propojuje odborníky, provozy a firmy, které sdílejí hodnoty PENTARIVA. Konkrétní nabídka vzniká společně s reálným portfoliem a jasnými podmínkami.",
    cta: "Poznat směr partnerství",
    href: "/partnerstvi",
    image: exp03.url,
    imageAlt:
      "Elegantní konzultace v prémiovém wellness butiku s produkty PENTARIVA na dubových policích",
  },
];

export function ExperienceSection() {
  return (
    <section className="relative bg-ivory py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="flex flex-col items-center text-center">
          <GoldOrnament className="text-gold-deep" width={140} />
          <h2
            className="mt-8 max-w-4xl font-serif-display text-forest-deep"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.1 }}
          >
            Bylinné produkty v živém ekosystému
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink/70 sm:text-lg">
            PENTARIVA propojuje kvalitní bylinné receptury s osobním poradenstvím, aktivní komunitou
            a partnerstvím pro jednotlivce i firmy.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {CARDS.map((card) => (
            <ExperienceCardView key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperienceCardView({ card }: { card: ExperienceCard }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[20px] bg-cream ring-1 ring-forest-deep/8 shadow-[0_10px_30px_-18px_rgba(30,42,28,0.35)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_40px_-20px_rgba(30,42,28,0.45)]">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream">
        <img
          src={card.image}
          alt={card.imageAlt}
          loading="lazy"
          width={1408}
          height={1600}
          className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-5 px-8 pb-9 pt-8">
        <h3
          className="font-serif-display text-forest-deep"
          style={{ fontSize: "clamp(1.4rem, 1.6vw, 1.7rem)", lineHeight: 1.2 }}
        >
          {card.title}
        </h3>
        <p className="text-[14.5px] leading-relaxed text-ink/75">{card.text}</p>

        <div className="mt-auto pt-4">
          <a
            href={card.href}
            className="group/cta inline-flex items-center gap-2 border-b border-gold/40 pb-1 text-[12px] uppercase tracking-[0.22em] text-forest-deep transition-colors hover:border-gold hover:text-gold-deep"
          >
            {card.cta}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover/cta:translate-x-1"
              strokeWidth={1.5}
            />
          </a>
        </div>
      </div>
    </article>
  );
}
