import { Download } from "lucide-react";
import { GoldOrnament } from "@/components/pentariva/GoldOrnament";
import { PublicPage, SectionHeading, TextLink } from "@/components/pentariva/PublicPage";
const brandBookPdfUrl = "/downloads/PENTARIVA-Brand-Book.pdf";
import openPage from "@/assets/story-open-page.jpg";
import rootsPage from "@/assets/story-roots-page.jpg";

const STORY_STEPS = [
  {
    number: "01",
    title: "Rodinný zápis",
    body: "Bylinný deník uchovává receptury, postřehy a zkušenosti zapsané s trpělivostí a úctou k přírodě.",
  },
  {
    number: "02",
    title: "Životní zkušenost",
    body: "Osobní péče, vzdělávání a práce s lidmi převádějí tradici do současného a srozumitelného jazyka.",
  },
  {
    number: "03",
    title: "Společná vize",
    body: "Společná vize propojuje péči o člověka se strategií, systémem a odpovědným růstem.",
  },
  {
    number: "04",
    title: "PENTARIVA",
    body: "Rodinný kořen získává podobu značky, která propojuje péči o celého člověka s pevnými hodnotami.",
  },
  {
    number: "05",
    title: "Živý ekosystém",
    body: "Produkty, vzdělávání, poradenství, technologie a vztahy nesou příběh PENTARIVA do každodenního života.",
  },
] as const;

const STORY_PRINCIPLES = [
  {
    title: "Kořeny",
    body: "Tradice dává rozhodnutím hloubku, paměť a pevný hodnotový základ.",
  },
  {
    title: "Člověk",
    body: "Každý produkt, služba i vztah začíná porozuměním skutečnému životu člověka.",
  },
  {
    title: "Poznání",
    body: "Zkušenost, odbornost a srozumitelné vzdělávání vytvářejí prostor pro dobrá rozhodnutí.",
  },
  {
    title: "Péče",
    body: "Důvěra roste z pozornosti, otevřené komunikace a kvality každého detailu.",
  },
  {
    title: "Růst",
    body: "Produkty, technologie a partnerství získávají sílu ve vzájemném propojení.",
  },
] as const;


export default function StoryPage() {
  return (
    <PublicPage className="bg-ivory text-forest-deep">
      <section className="relative overflow-hidden bg-forest-deep text-cream">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full border border-gold/10"
        />
        <div className="relative mx-auto max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
          <div className="max-w-4xl">
            <GoldOrnament className="text-gold" width={140} />
            <p className="mt-8 text-eyebrow text-gold" style={{ letterSpacing: "0.32em" }}>
              Náš příběh
            </p>
            <h1
              className="mt-6 font-serif-display text-cream"
              style={{ fontSize: "clamp(3rem, 6vw, 6rem)", lineHeight: 0.98 }}
            >
              Kořeny, které dostaly
              <br />
              společný směr.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-cream/72">
              PENTARIVA vyrůstá z rodinného bylinného deníku, z úcty k přírodě a z přesvědčení, že
              skutečná hodnota dozrává v čase. Tyto kořeny nesou společnou vizi pro člověka,
              vzdělávání, produkty a partnerství.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-5">
              <p className="font-serif-display text-8xl leading-none text-gold-deep/22 sm:text-9xl">
                60+
              </p>
              <p className="mt-4 text-eyebrow text-gold-deep" style={{ letterSpacing: "0.28em" }}>
                Let uchované zkušenosti
              </p>
            </div>
            <div className="space-y-6 text-base leading-[1.85] text-ink/72 lg:col-span-6 lg:col-start-7">
              <h2 className="font-serif-display text-4xl leading-tight text-forest-deep sm:text-5xl">
                Každý příběh začíná jediným zápisem.
              </h2>
              <p>
                Před více než šedesáti lety začaly v rodinném bylinném deníku vznikat zápisy
                zkušeností, receptur a poznatků shromažďovaných během života.
              </p>
              <p>
                Deník byl po letech znovu objeven na půdě. Jeho stránky vrátily rodinným zkušenostem
                hlas a staly se jedním z kořenů PENTARIVA.
              </p>
              <p className="border-l border-gold-deep/45 pl-6 font-serif-display text-2xl leading-snug text-gold-deep">
                První stránku napsala tradice.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory-warm py-24 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <SectionHeading
            eyebrow="Od zápisu ke značce"
            title="Zkušenost získává tvar krok za krokem."
            body="Pět etap spojuje rodinnou zkušenost, společnou vizi a živý ekosystém PENTARIVA."
          />

          <div className="mt-16 grid gap-px bg-gold-deep/18 md:grid-cols-2 xl:grid-cols-5">
            {STORY_STEPS.map((step) => (
              <article
                key={step.number}
                className="relative overflow-hidden bg-ivory-warm p-8 lg:p-9"
              >
                <span className="absolute right-5 top-1 font-serif-display text-7xl text-gold-deep/10">
                  {step.number}
                </span>
                <p
                  className="relative text-eyebrow text-gold-deep"
                  style={{ letterSpacing: "0.24em" }}
                >
                  {step.number}
                </p>
                <h3 className="relative mt-10 font-serif-display text-3xl text-forest-deep">
                  {step.title}
                </h3>
                <p className="relative mt-5 text-sm leading-relaxed text-ink/68">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-6 lg:grid-cols-12 lg:gap-20 lg:px-12">
          <figure className="lg:col-span-7">
            <div className="aspect-[4/3] overflow-hidden bg-ivory-warm">
              <img
                src={rootsPage.src}
                width={828}
                height={1170}
                loading="lazy"
                decoding="async"
                alt="Rozmarýn s hlubokými kořeny v kameni s rytinou znaku PENTARIVA."
                className="h-full w-full object-cover object-bottom"
              />
            </div>
            <figcaption
              className="mt-4 text-[0.62rem] uppercase text-forest-deep/45"
              style={{ letterSpacing: "0.22em" }}
            >
              Kořeny a směr · jeden živý celek
            </figcaption>
          </figure>

          <div className="lg:col-span-5">
            <p className="text-eyebrow text-gold-deep" style={{ letterSpacing: "0.3em" }}>
              Růst začíná spojením
            </p>
            <h2 className="mt-6 font-serif-display text-5xl leading-[1.02] text-forest-deep sm:text-6xl">
              PENTARIVA má duši.
            </h2>
            <div className="mt-8 space-y-5 text-base leading-[1.85] text-ink/72">
              <p>
                Strategická, vzdělávací a lidská zkušenost týmu dává rodinnému kořenu současný směr.
              </p>
              <p>
                Příběh značky propojuje bylinné poznání, odpovědný vývoj, digitální technologie,
                vzdělávání a partnerské vztahy. Každá oblast má vlastní úlohu a sdílí stejný
                standard kvality, péče a důvěry.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-forest-deep py-24 text-cream lg:py-28">
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gold/8"
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1400px] px-6 lg:px-12">
          <SectionHeading
            eyebrow="Pět pevných bodů"
            title="Jeden příběh. Pět principů."
            body="Kořeny PENTARIVA se promítají do každého rozhodnutí, služby i vztahu."
            centered
            dark
          />
          <div className="mt-16 grid gap-px bg-gold/16 sm:grid-cols-2 lg:grid-cols-5">
            {STORY_PRINCIPLES.map((principle, index) => (
              <article key={principle.title} className="bg-forest-deep p-7 text-center lg:p-8">
                <span className="font-serif-display text-4xl text-gold/35">0{index + 1}</span>
                <h3 className="mt-5 font-serif-display text-2xl text-gold-soft">
                  {principle.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-cream/62">{principle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory-warm py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="relative overflow-hidden">
            <div className="aspect-[16/9] min-h-[28rem] overflow-hidden">
              <img
                src={openPage.src}
                width={900}
                height={1600}
                loading="lazy"
                decoding="async"
                alt="Otevřený deník vedle původní bylinné knihy v teplém přirozeném světle."
                className="h-full w-full object-cover object-bottom"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/88 via-forest-deep/72 to-forest-deep/10" />
            <div className="absolute inset-0 flex items-center px-7 py-12 sm:px-12 lg:px-20">
              <div className="max-w-2xl text-cream">
                <p className="text-eyebrow text-gold" style={{ letterSpacing: "0.3em" }}>
                  Otevřená stránka
                </p>
                <h2 className="mt-6 font-serif-display text-4xl leading-tight sm:text-6xl">
                  První stránku napsala tradice.
                  <br />
                  Další píšeme společně.
                </h2>
                <p className="mt-7 max-w-xl text-base leading-relaxed text-cream/75">
                  Příběh PENTARIVA pokračuje každou zkušeností, která přináší hodnotu člověku a může
                  být předána dál.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-5">
                  <a
                    href={brandBookPdfUrl}
                    download="PENTARIVA-Brand-Book.pdf"
                    className="inline-flex items-center gap-3 border border-gold/70 px-5 py-3 text-[0.66rem] uppercase text-gold transition-colors hover:bg-gold hover:text-forest-deep"
                    style={{ letterSpacing: "0.2em" }}
                  >
                    Stáhnout Brand Book
                    <Download className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                  <TextLink href="/svet-pentariva" dark>
                    Poznat svět PENTARIVA
                  </TextLink>
                  <TextLink href="/svet-pentariva/hodnoty" dark>
                    Poznat hodnoty
                  </TextLink>
                  <TextLink href="/svet-pentariva/pro-media" dark>
                    Pro média
                  </TextLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
