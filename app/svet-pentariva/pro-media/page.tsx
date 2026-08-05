import type { ComponentType } from "react";
import { ArrowDownToLine, BookOpen, Camera, Check, FileText, Mic2 } from "lucide-react";
import pavelPortrait from "@/assets/pavel-boucek-media-portrait.png";
import pavelPresentation from "@/assets/pavel-boucek-media-presentation.png";
const brandBookPdfUrl = "/downloads/PENTARIVA-Brand-Book.pdf";
import { GoldOrnament } from "@/components/pentariva/GoldOrnament";
import { PublicPage, SectionHeading, TextLink } from "@/components/pentariva/PublicPage";

const BRAND_FACTS = [
  {
    number: "01",
    title: "České kořeny",
    body: "PENTARIVA vyrůstá z českého prostředí, rodinného příběhu a úcty k tradičnímu bylinoznalectví.",
  },
  {
    number: "02",
    title: "Celý člověk",
    body: "Značka spojuje tělo, mysl, smysly, každodenní rytmus a prostředí do jednoho přirozeného celku.",
  },
  {
    number: "03",
    title: "Pět pilířů",
    body: "Čistota, důvěra, odbornost, péče a vize určují způsob, jakým PENTARIVA přemýšlí, tvoří a buduje vztahy.",
  },
  {
    number: "04",
    title: "Evropský směr",
    body: "Produkty, vzdělávání, komunita, poradenství a digitální prostředí tvoří propojený ekosystém s evropskou ambicí.",
  },
] as const;

const EDITORIAL_RULES = [
  "Uvádějte název značky vždy v podobě PENTARIVA.",
  "Používejte schválený slogan: Z hlubin kořenů - pro celý život.",
  "Rozlišujte dostupné služby od produktů a projektů ve vývoji.",
  "Zachovávejte věcný kontext a vyhýbejte se nepodloženým zdravotním tvrzením.",
  "Fotografie publikujte v původním poměru stran a s uvedením jména zobrazené osoby.",
] as const;

type DownloadCardProps = {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
  href: string;
  fileName: string;
};

function DownloadCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  meta,
  href,
  fileName,
}: DownloadCardProps) {
  return (
    <article className="group flex h-full flex-col border border-forest-deep/15 bg-ivory p-7 transition-colors hover:border-gold-deep/55 lg:p-8">
      <div className="flex items-start justify-between gap-6">
        <Icon className="h-5 w-5 text-gold-deep" strokeWidth={1.35} />
        <span
          className="text-[0.58rem] uppercase text-forest-deep/45"
          style={{ letterSpacing: "0.22em" }}
        >
          {meta}
        </span>
      </div>
      <p
        className="mt-8 text-[0.62rem] uppercase text-gold-deep"
        style={{ letterSpacing: "0.25em" }}
      >
        {eyebrow}
      </p>
      <h3 className="mt-3 font-serif-display text-3xl leading-tight text-forest-deep">{title}</h3>
      <p className="mt-4 flex-1 text-sm leading-[1.75] text-ink/65">{description}</p>
      <a
        href={href}
        download={fileName}
        className="mt-8 inline-flex w-fit items-center gap-3 border-b border-gold-deep/35 pb-1.5 text-[0.67rem] uppercase text-forest-deep transition-colors hover:border-gold-deep hover:text-gold-deep"
        style={{ letterSpacing: "0.22em" }}
      >
        Stáhnout soubor
        <ArrowDownToLine
          className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5"
          strokeWidth={1.5}
        />
      </a>
    </article>
  );
}


export default function MediaPage() {
  return (
    <PublicPage className="bg-ivory text-ink">
      <section className="relative overflow-hidden bg-forest-deep text-cream">
        <div className="mx-auto grid min-h-[760px] max-w-[1720px] lg:grid-cols-[0.86fr_1.14fr]">
          <div className="relative z-10 flex flex-col justify-center px-6 py-20 lg:px-12 lg:py-28 xl:px-20">
            <GoldOrnament className="text-gold" width={136} />
            <p className="mt-9 text-eyebrow text-gold" style={{ letterSpacing: "0.32em" }}>
              Pro média
            </p>
            <h1
              className="mt-6 max-w-3xl font-serif-display text-cream"
              style={{ fontSize: "clamp(3rem, 6vw, 6.2rem)", lineHeight: 0.96 }}
            >
              Silný příběh.
              <br />
              Přesný jazyk.
            </h1>
            <p className="mt-8 max-w-xl font-serif-display text-2xl leading-snug text-gold-soft sm:text-3xl">
              PENTARIVA má duši. Mediální centrum dává jejímu příběhu srozumitelný kontext a ověřené
              podklady.
            </p>
            <p className="mt-7 max-w-xl text-base leading-[1.85] text-cream/68">
              Najdete zde základní fakta o značce, redakční materiály, fotografie a dokumenty
              připravené pro profesionální komunikaci.
            </p>
            <a
              href="#ke-stazeni"
              className="mt-10 inline-flex w-fit items-center gap-3 border border-gold/45 px-6 py-4 text-[0.68rem] uppercase text-gold transition-colors hover:border-gold hover:bg-gold/5"
              style={{ letterSpacing: "0.22em" }}
            >
              Přejít k materiálům
              <ArrowDownToLine className="h-4 w-4" strokeWidth={1.4} />
            </a>
          </div>

          <figure className="relative min-h-[520px] overflow-hidden lg:min-h-[760px]">
            <img
              src={pavelPresentation.src}
              width={1402}
              height={1122}
              fetchPriority="high"
              alt="Pavel Bouček při prezentaci značky PENTARIVA."
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-forest-deep to-transparent lg:block" />
            <figcaption className="absolute bottom-7 right-7 border border-gold/30 bg-forest-deep/88 px-5 py-4 text-right shadow-xl backdrop-blur-sm">
              <span
                className="block text-[0.58rem] uppercase text-gold"
                style={{ letterSpacing: "0.24em" }}
              >
                Média · kultura · partnerství
              </span>
              <span className="mt-1.5 block font-serif-display text-2xl text-cream">
                Pavel Bouček
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="bg-ivory py-24 lg:py-32">
        <div className="mx-auto max-w-[1520px] px-6 lg:px-12">
          <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-24 xl:gap-32">
            <figure>
              <div className="relative overflow-hidden bg-forest-deep/5">
                <img
                  src={pavelPortrait.src}
                  width={1254}
                  height={1254}
                  loading="lazy"
                  decoding="async"
                  alt="Pavel Bouček, spolumajitel PENTARIVA."
                  className="aspect-square h-auto w-full object-cover"
                />
              </div>
              <figcaption
                className="mt-4 text-[0.6rem] uppercase text-forest-deep/50"
                style={{ letterSpacing: "0.22em" }}
              >
                Pavel Bouček · spolumajitel PENTARIVA
              </figcaption>
            </figure>

            <div>
              <p className="text-eyebrow text-gold-deep" style={{ letterSpacing: "0.3em" }}>
                Osobnost a přesah
              </p>
              <h2
                className="mt-5 font-serif-display text-forest-deep"
                style={{ fontSize: "clamp(2.6rem, 4.5vw, 4.8rem)", lineHeight: 1 }}
              >
                Věda dává přesnost. Média dávají hlas.
              </h2>
              <div className="mt-8 space-y-5 text-base leading-[1.85] text-ink/72">
                <p>
                  Pavel Bouček vystudoval fyziku a část své profesní dráhy působil jako gymnaziální
                  profesor. Vědecké vzdělání mu otevřelo pohled do podstaty přírody, vesmíru a
                  souvislostí, které formují lidské hledání smyslu.
                </p>
                <p>
                  Více než třicet let se pohybuje v médiích, managementu, televizním prostředí a
                  hudební produkci. Jeho zkušenost zahrnuje hlavní televizní kanály, rozvoj
                  hudebních projektů, podporu mladých interpretů, festivaly i prostředí filmu a
                  televize.
                </p>
                <p>
                  V PENTARIVA propojuje analytické myšlení, obchodní zkušenost, cit pro obsah a
                  kulturní přesah. Přináší značce schopnost vyprávět silné myšlenky s přesností,
                  respektem a porozuměním pro současná média.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-7 border-y border-gold-deep/25 py-9 lg:grid-cols-[minmax(15rem,0.42fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
            <p
              className="text-[0.62rem] uppercase text-gold-deep"
              style={{ letterSpacing: "0.24em" }}
            >
              Pavelův pohled na PENTARIVA
            </p>
            <p className="max-w-4xl font-serif-display text-2xl leading-snug text-forest-deep sm:text-3xl lg:text-[2.15rem]">
              Příroda je v jeho pohledu největší dar a PENTARIVA přirozeným průsečíkem poznání,
              médií, hudby, podnikání a hledání smyslu.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-forest-deep py-24 text-cream lg:py-32">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full border border-gold/10" />
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <SectionHeading
            eyebrow="PENTARIVA v kostce"
            title="Jedna značka. Jasně čitelné souvislosti."
            body="Základní orientační body pro redakční texty, rozhovory, partnerské materiály a veřejnou komunikaci."
            dark
          />

          <div className="mt-16 grid gap-px bg-gold/15 sm:grid-cols-2 lg:grid-cols-4">
            {BRAND_FACTS.map((fact) => (
              <article key={fact.number} className="min-h-[280px] bg-forest-deep p-7 lg:p-8">
                <span className="font-serif-display text-2xl text-gold">{fact.number}</span>
                <h3 className="mt-8 font-serif-display text-3xl text-cream">{fact.title}</h3>
                <p className="mt-4 text-sm leading-[1.75] text-cream/65">{fact.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="ke-stazeni" className="scroll-mt-24 bg-ivory-warm py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <SectionHeading
                eyebrow="Ke stažení"
                title="Podklady připravené pro profesionální práci."
                body="Dokumenty přibližují identitu, příběh a směr PENTARIVA. Fotografie jsou k dispozici v původní kvalitě a poměru stran."
              />
            </div>
            <p className="text-sm leading-[1.75] text-ink/60 lg:col-span-4 lg:col-start-9">
              Při publikaci fotografií uvádějte jméno Pavel Bouček a značku PENTARIVA. Úpravy, které
              mění význam, barevnost nebo proporce snímku, vynechte.
            </p>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2">
            <DownloadCard
              icon={BookOpen}
              eyebrow="Značka a příběh"
              title="Brand Book PENTARIVA"
              description="Emotivní příběh kořenů, hodnot, člověka a vize značky v jednom uceleném dokumentu."
              meta="PDF · 4,9 MB"
              href={brandBookPdfUrl}
              fileName="PENTARIVA-Brand-Book.pdf"
            />
            <DownloadCard
              icon={FileText}
              eyebrow="Firemní profil"
              title="Business Profile"
              description="Přehled identity, ekosystému, principů spolupráce a evropského směru PENTARIVA."
              meta="PDF · 3,0 MB"
              href="/downloads/PENTARIVA-Business-Profile.pdf"
              fileName="PENTARIVA-Business-Profile.pdf"
            />
            <DownloadCard
              icon={Camera}
              eyebrow="Portrét"
              title="Pavel Bouček III"
              description="Čtvercový portrét spolumajitele PENTARIVA vhodný pro medailonky, rozhovory a profesní profily."
              meta="PNG · 1254 × 1254"
              href={pavelPortrait.src}
              fileName="PENTARIVA-Pavel-Boucek-portret.png"
            />
            <DownloadCard
              icon={Mic2}
              eyebrow="Média a prezentace"
              title="Pavel Bouček IV"
              description="Horizontální prezentační fotografie vhodná pro články, tiskové materiály a témata spojená s médii."
              meta="PNG · 1402 × 1122"
              href={pavelPresentation.src}
              fileName="PENTARIVA-Pavel-Boucek-media.png"
            />
          </div>
        </div>
      </section>

      <section className="bg-ivory py-24 lg:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-14 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-5">
            <p className="text-eyebrow text-gold-deep" style={{ letterSpacing: "0.3em" }}>
              Redakční rámec
            </p>
            <h2
              className="mt-5 font-serif-display text-forest-deep"
              style={{ fontSize: "clamp(2.5rem, 4vw, 4.2rem)", lineHeight: 1.02 }}
            >
              Přesnost chrání důvěru.
            </h2>
            <p className="mt-7 max-w-xl text-base leading-[1.8] text-ink/68">
              Jednotný jazyk pomáhá zachovat význam, původ i současný stav každého tématu PENTARIVA.
            </p>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <ul className="divide-y divide-forest-deep/12 border-y border-forest-deep/12">
              {EDITORIAL_RULES.map((rule) => (
                <li key={rule} className="flex gap-5 py-5 text-sm leading-[1.75] text-ink/70">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-gold-deep" strokeWidth={1.5} />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-7">
              <TextLink href="/svet-pentariva/veda-a-vyvoj">Věda a vývoj</TextLink>
              <TextLink href="/svet-pentariva/kvalita">Standard kvality</TextLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gold/15 bg-forest-deep py-16 text-cream">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div>
            <p className="text-eyebrow text-gold" style={{ letterSpacing: "0.28em" }}>
              Další souvislosti
            </p>
            <p className="mt-3 font-serif-display text-3xl text-cream sm:text-4xl">
              Kořeny dávají příběhu směr.
            </p>
          </div>
          <div className="flex flex-wrap gap-7">
            <TextLink href="/svet-pentariva/pribeh" dark>
              Poznat náš příběh
            </TextLink>
            <TextLink href="/svet-pentariva/hodnoty" dark>
              Poznat hodnoty
            </TextLink>
            <TextLink href="/svet-pentariva" dark>
              Otevřít Svět PENTARIVA
            </TextLink>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
