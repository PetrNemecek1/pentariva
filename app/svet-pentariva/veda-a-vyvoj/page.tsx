import type { ComponentType } from "react";
import {
  BookOpenCheck,
  ClipboardCheck,
  Factory,
  FileCheck2,
  FlaskConical,
  HandHeart,
  Leaf,
  Search,
  ShieldCheck,
} from "lucide-react";
import scienceImage from "@/assets/svet-veda.jpg";
import { GoldOrnament } from "@/components/pentariva/GoldOrnament";
import {
  ConceptNotice,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/pentariva/PublicPage";

type ProcessStep = {
  number: string;
  title: string;
  body: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    number: "01",
    title: "Přírodní surovina",
    body: "Výchozím bodem je přesně určená surovina, její původ, vlastnosti, kvalita a zamýšlená role v receptuře.",
    icon: Leaf,
  },
  {
    number: "02",
    title: "Odborné posouzení",
    body: "Dostupné poznatky, bezpečnostní souvislosti a účel produktu získávají společný odborný rámec.",
    icon: Search,
  },
  {
    number: "03",
    title: "Receptura",
    body: "Složení vzniká jako promyšlený celek s jasnou rolí jednotlivých složek, způsobem použití a srozumitelným zadáním.",
    icon: FlaskConical,
  },
  {
    number: "04",
    title: "Výroba",
    body: "Výrobní zadání převádí recepturu do opakovatelného procesu s definovanými vstupy, postupy a odpovědnostmi.",
    icon: Factory,
  },
  {
    number: "05",
    title: "Kontrola",
    body: "Dokumentace propojuje specifikaci surovin, průběh výroby, kontrolní body a informace určené uživateli.",
    icon: ClipboardCheck,
  },
  {
    number: "06",
    title: "Každodenní používání",
    body: "Srozumitelný návod, bezpečný kontext a přirozené místo v denním rytmu završují cestu produktu k člověku.",
    icon: HandHeart,
  },
] as const;

const METHOD_PRINCIPLES = [
  {
    title: "Účel předchází složení",
    body: "Každé rozhodnutí vychází ze skutečné potřeby, zamýšleného způsobu používání a role produktu v ekosystému.",
  },
  {
    title: "Rozhodnutí mají stopu",
    body: "Zadání, revize a schválení vytvářejí dohledatelnou cestu od prvního návrhu k výsledné dokumentaci.",
  },
  {
    title: "Bezpečnost drží hranice",
    body: "Složení, informace i doporučený způsob použití procházejí kontrolou přiměřenou konkrétní kategorii produktu.",
  },
  {
    title: "Zkušenost vrací poznání",
    body: "Srozumitelnost, používání a zpětná vazba přinášejí podněty pro další odbornou a produktovou práci.",
  },
] as const;


export default function ScienceAndDevelopmentPage() {
  return (
    <PublicPage className="bg-ivory text-ink">
      <section className="relative overflow-hidden bg-forest-deep text-cream">
        <div className="mx-auto grid min-h-[760px] max-w-[1720px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative z-10 flex flex-col justify-center px-6 py-20 lg:px-12 lg:py-28 xl:px-20">
            <GoldOrnament className="text-gold" width={136} />
            <p className="mt-9 text-eyebrow text-gold" style={{ letterSpacing: "0.32em" }}>
              Věda a vývoj
            </p>
            <h1
              className="mt-6 max-w-3xl font-serif-display text-cream"
              style={{ fontSize: "clamp(3rem, 5.7vw, 6rem)", lineHeight: 0.96 }}
            >
              Poznání dává přírodě přesný tvar.
            </h1>
            <p className="mt-8 max-w-xl font-serif-display text-2xl leading-snug text-gold-soft sm:text-3xl">
              Od přírodní suroviny k promyšlenému každodennímu rituálu.
            </p>
            <p className="mt-7 max-w-xl text-base leading-[1.85] text-cream/70">
              Vývoj PENTARIVA propojuje tradiční zkušenost, současné poznatky, odborné posouzení a
              dokumentovaný proces. Každý krok má vlastní účel, odpovědnost a místo v celku.
            </p>
            <a
              href="#cesta-vyvoje"
              className="mt-10 inline-flex w-fit items-center gap-3 border border-gold/45 px-6 py-4 text-[0.68rem] uppercase text-gold transition-colors hover:border-gold hover:bg-gold/5"
              style={{ letterSpacing: "0.22em" }}
            >
              Projít cestu vývoje
              <span aria-hidden>↓</span>
            </a>
          </div>

          <figure className="relative min-h-[540px] overflow-hidden lg:min-h-[760px]">
            <img
              src={scienceImage.src}
              width={928}
              height={1152}
              fetchPriority="high"
              alt="Pečlivé vážení a dokumentace bylin při vývoji PENTARIVA."
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[38%] bg-gradient-to-r from-forest-deep to-transparent lg:block" />
            <figcaption className="absolute bottom-7 right-7 border border-gold/30 bg-forest-deep/88 px-5 py-4 text-right shadow-xl backdrop-blur-sm">
              <span
                className="block text-[0.58rem] uppercase text-gold"
                style={{ letterSpacing: "0.24em" }}
              >
                Příroda · přesnost · souvislosti
              </span>
              <span className="mt-1.5 block font-serif-display text-2xl text-cream">
                Metodika PENTARIVA
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="cesta-vyvoje" className="scroll-mt-24 bg-ivory py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <SectionHeading
                eyebrow="Cesta produktu"
                title="Šest navazujících kroků. Jedna odpovědnost."
                body="Vývoj tvoří souvislá cesta, ve které každý krok zpřesňuje následující rozhodnutí a současně zachovává dohledatelnou vazbu k původnímu záměru."
              />
            </div>
            <p className="text-sm leading-[1.8] text-ink/62 lg:col-span-4 lg:col-start-9">
              Metodika popisuje způsob práce napříč produktovými kategoriemi. Konkrétní požadavky se
              vždy řídí typem produktu, jeho složením a platným odborným i legislativním rámcem.
            </p>
          </div>

          <ol className="mt-16 grid gap-px bg-forest-deep/12 md:grid-cols-2 lg:grid-cols-3">
            {PROCESS_STEPS.map(({ number, title, body, icon: Icon }) => (
              <li key={number} className="min-h-[310px] bg-ivory p-7 lg:p-9">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-gold-deep" strokeWidth={1.3} />
                  <span className="font-serif-display text-2xl text-gold-deep/65">{number}</span>
                </div>
                <h2 className="mt-10 font-serif-display text-3xl text-forest-deep">{title}</h2>
                <p className="mt-5 text-sm leading-[1.78] text-ink/66">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative overflow-hidden bg-forest-deep py-24 text-cream lg:py-32">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full border border-gold/10" />
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-5">
              <p className="text-eyebrow text-gold" style={{ letterSpacing: "0.3em" }}>
                Dvě znalostní vrstvy
              </p>
              <h2
                className="mt-6 font-serif-display text-cream"
                style={{ fontSize: "clamp(2.8rem, 5vw, 5.2rem)", lineHeight: 0.98 }}
              >
                Tradice přináší zkušenost. Odbornost přináší přesnost.
              </h2>
            </div>
            <div className="grid gap-px bg-gold/15 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
              <article className="bg-forest-deep p-8 lg:p-10">
                <BookOpenCheck className="h-6 w-6 text-gold" strokeWidth={1.25} />
                <h3 className="mt-7 font-serif-display text-3xl text-cream">Paměť a zkušenost</h3>
                <p className="mt-5 text-sm leading-[1.8] text-cream/68">
                  Tradiční bylinné poznání uchovává vztah k surovině, rytmu používání a praktické
                  zkušenosti předávané mezi generacemi.
                </p>
              </article>
              <article className="bg-forest-deep p-8 lg:p-10">
                <ShieldCheck className="h-6 w-6 text-gold" strokeWidth={1.25} />
                <h3 className="mt-7 font-serif-display text-3xl text-cream">Posouzení a kontext</h3>
                <p className="mt-5 text-sm leading-[1.8] text-cream/68">
                  Současná odborná práce zpřesňuje identitu surovin, bezpečnostní souvislosti,
                  formulaci receptury a odpovědnou komunikaci.
                </p>
              </article>
            </div>
          </div>

          <p className="mt-16 max-w-5xl border-l border-gold/45 pl-7 font-serif-display text-2xl leading-snug text-gold-soft sm:text-3xl lg:text-4xl">
            PENTARIVA převádí poznání do systému, kterému lze rozumět, který lze dokumentovat a
            který zachovává respekt k člověku i přírodě.
          </p>
        </div>
      </section>

      <section className="bg-ivory-warm py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <SectionHeading
            eyebrow="Principy metodiky"
            title="Dobré rozhodnutí má důvod, souvislost a záznam."
            body="Čtyři principy pomáhají držet společný jazyk mezi produktovým zadáním, odbornou revizí, výrobou, vzděláváním a komunikací."
          />

          <div className="mt-16 grid gap-5 sm:grid-cols-2">
            {METHOD_PRINCIPLES.map((principle, index) => (
              <article
                key={principle.title}
                className="grid gap-6 border border-forest-deep/12 bg-ivory p-7 sm:grid-cols-[3rem_1fr] lg:p-9"
              >
                <span className="font-serif-display text-2xl text-gold-deep">0{index + 1}</span>
                <div>
                  <h3 className="font-serif-display text-2xl text-forest-deep">
                    {principle.title}
                  </h3>
                  <p className="mt-4 text-sm leading-[1.75] text-ink/65">{principle.body}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12">
            <ConceptNotice title="Veřejný stav podkladů">
              Veřejná dokumentace uvádí pouze potvrzené údaje. Jména odborníků, výrobních pracovišť,
              laboratorní výsledky a certifikace se stávají součástí stránky po jejich odborném,
              smluvním a legislativním potvrzení.
            </ConceptNotice>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-20">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-8 px-6 lg:flex-row lg:items-center lg:px-12">
          <div className="flex items-center gap-5">
            <FileCheck2 className="h-6 w-6 text-gold-deep" strokeWidth={1.25} />
            <div>
              <p className="font-serif-display text-3xl text-forest-deep sm:text-4xl">
                Vývoj pokračuje standardem kvality.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink/62">
                Poznejte principy surovin, výroby, dokumentace a transparentní komunikace.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-7">
            <TextLink href="/svet-pentariva/kvalita">Otevřít kvalitu</TextLink>
            <TextLink href="/produkty">Produktové koncepty</TextLink>
            <TextLink href="/vzdelavani">Vzdělávání</TextLink>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
