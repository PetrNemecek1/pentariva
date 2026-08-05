import { Eye, Hand, Leaf, RotateCcw, ShieldCheck, TimerReset } from "lucide-react";
import {
  EducationArticleLayout,
  EducationCallout,
  EducationEditorialFeature,
  EducationMeta,
  EducationSection,
} from "@/components/pentariva/EducationContentLayout";
import { EditorialHero, PublicPage, TextLink } from "@/components/pentariva/PublicPage";

const TOC = [
  { id: "zamer", label: "Pojmenujte záměr" },
  { id: "jednoduchost", label: "Začněte jednoduše" },
  { id: "kotva", label: "Najděte pevný okamžik" },
  { id: "smysly", label: "Zapojte smysly" },
  { id: "bezpecnost", label: "Držte bezpečné hranice" },
  { id: "pozorovani", label: "Pozorujte a vyhodnocujte" },
] as const;

const STEPS = [
  {
    id: "zamer",
    number: "01",
    icon: Leaf,
    eyebrow: "Záměr",
    title: "Pojmenujte, proč rituál vzniká.",
    body: [
      "Rituál začíná otázkou. Hledáte klidnější přechod do večera, pravidelnou chvíli pro sebe nebo způsob, jak si připomínat to, co jste se rozhodli dělat?",
      "Konkrétní a realistický záměr jednoduše pojmenovává okamžik, který chcete ve svém dni kultivovat. Diagnózu a léčebný plán stanovuje kvalifikovaný zdravotník.",
    ],
    prompt: "Doplňte větu: Tento rituál mi má připomínat, že…",
  },
  {
    id: "jednoduchost",
    number: "02",
    icon: Hand,
    eyebrow: "Jednoduchost",
    title: "Začněte jedním krokem.",
    body: [
      "Nový návyk roste z jednoduchého základu. Vyberte jeden produkt nebo jeden úkon a nejprve ověřte, zda přirozeně zapadá do vašeho dne.",
      "Více nových produktů najednou ztěžuje orientaci v tom, co vám vyhovuje. Jednoduchý začátek je přehlednější, bezpečnější a snáze udržitelný.",
    ],
    prompt: "Co je nejmenší krok, který dokážete opakovat i v náročném dni?",
  },
  {
    id: "kotva",
    number: "03",
    icon: TimerReset,
    eyebrow: "Rytmus",
    title: "Připojte rituál k něčemu, co už existuje.",
    body: [
      "Místo hledání dalšího volného času využijte pevný bod: první ranní nápoj, přestávku po obědě, příchod domů nebo večerní ztišení světel.",
      "Stálý okamžik a stejné místo snižují potřebu každý den znovu rozhodovat. Rituál pak postupně získává vlastní rytmus.",
    ],
    prompt: "Po jaké běžné činnosti může váš nový krok následovat?",
  },
  {
    id: "smysly",
    number: "04",
    icon: Eye,
    eyebrow: "Pět smyslů",
    title: "Vytvořte okamžik, který lze skutečně vnímat.",
    body: [
      "Vědomě si všimněte barvy, vůně, chuti, teploty, struktury nebo zvuku prostředí. Smyslová pozornost může být jemná — stačí několik klidných vteřin věnovaných jediné činnosti.",
      "PENTARIVA chápe produkt jako jednu součást širší zkušenosti. Vizuální jazyk, dotek obalu, botanická vůně i vznikající zvuková identita vytvářejí rozpoznatelný přechod mezi běžným provozem a chvílí pozornosti.",
    ],
    prompt: "Který smyslový detail se stává přirozeným signálem začátku vašeho rituálu?",
  },
  {
    id: "bezpecnost",
    number: "05",
    icon: ShieldCheck,
    eyebrow: "Bezpečnost",
    title: "Řiďte se skutečnými informacemi, ne dojmem.",
    body: [
      "U každého produktu dodržujte doporučené použití a upozornění na obalu. Uvedené množství a frekvence určují bezpečný rámec každodenního rituálu.",
      "Pokud užíváte léky, řešíte zdravotní obtíže, jste těhotná nebo kojíte, vybíráte produkt pro dítě nebo si nejste jistí kombinací přípravků, poraďte se nejprve s lékařem či lékárníkem.",
    ],
    prompt: "Mám všechny informace potřebné pro bezpečné a odpovědné použití?",
  },
  {
    id: "pozorovani",
    number: "06",
    icon: RotateCcw,
    eyebrow: "Pozorování",
    title: "Pravidelně ověřujte, zda rituál stále dává smysl.",
    body: [
      "Jednou týdně se krátce zastavte: Daří se vám rituál opakovat? Je jeho čas a forma příjemná? Nezpůsobuje vám použitý produkt obtíže?",
      "Rituál je pružná opora každodennosti. Jeho podobu a čas průběžně přizpůsobujte své zkušenosti. Při neobvyklé reakci přestaňte produkt používat a podle situace vyhledejte odbornou radu.",
    ],
    prompt: "Co ponechám, co zjednoduším a co už nepotřebuji?",
  },
] as const;


export default function HerbalRitualGuide() {
  return (
    <PublicPage>
      <EditorialHero
        eyebrow="Znalostní centrum · průvodce"
        title={
          <>
            Jak vytvořit každodenní
            <br />
            bylinný rituál.
          </>
        }
        status="Redakční základ · k odborné revizi"
        lead={
          <>
            <p>
              Dobrý rituál roste z jednoduchosti, pravidelnosti a vědomí, proč má v našem dni své
              místo.
            </p>
            <p className="mt-4">
              Tento průvodce pracuje s návykem a smyslovou pozorností. Individuální zdravotní
              doporučení a léčebný plán poskytuje kvalifikovaný odborník.
            </p>
          </>
        }
      />

      <EducationEditorialFeature
        image="/images/vzdelavani/pruvodci-editorial-1536.webp"
        imageSmall="/images/vzdelavani/pruvodci-editorial-768.webp"
        alt="Ruce připravují bylinný nálev u otevřeného okna mezi živými bylinami a zápisníkem."
        eyebrow="Rituál v praxi"
        title="Jednoduchost vytváří pravidelnost."
        body={
          <>
            <p>
              Klidný okamžik vzniká z několika jasných kroků: zvolit čas, připravit prostředí,
              věnovat pozornost smyslům a vnímat vlastní zkušenost.
            </p>
            <p>
              Každodenní rituál PENTARIVA propojuje informovaný výběr s přirozeným rytmem dne a dává
              péči konkrétní, opakovatelnou podobu.
            </p>
          </>
        }
        caption="Redakční motiv · pravidelnost, pozornost a smyslová zkušenost"
      />

      <EducationMeta
        readingTime="7–9 minut"
        level="Praktický průvodce"
        review="Metodický základ · před finální odbornou revizí"
      />

      <EducationArticleLayout toc={TOC}>
        {STEPS.map(({ id, number, icon: Icon, eyebrow, title, body, prompt }) => (
          <EducationSection key={id} id={id} eyebrow={`${number} · ${eyebrow}`} title={title}>
            <div className="mb-7 flex h-12 w-12 items-center justify-center border border-gold-deep/30 text-gold-deep">
              <Icon className="h-5 w-5" strokeWidth={1.35} />
            </div>
            {body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <EducationCallout title="Otázka pro vás">{prompt}</EducationCallout>
          </EducationSection>
        ))}
      </EducationArticleLayout>

      <section className="bg-ivory-warm py-20">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-7">
            <p className="text-eyebrow text-gold-deep" style={{ letterSpacing: "0.28em" }}>
              Jednoduchý zápis
            </p>
            <h2 className="mt-4 font-serif-display text-4xl text-forest-deep">
              Můj rituál v jedné větě.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink/70">
              „Po <em>stávající činnosti</em> udělám <em>jeden konkrétní krok</em>, na chvíli si
              všimnu <em>jednoho smyslového detailu</em> a jednou týdně ověřím, zda mi tento způsob
              stále vyhovuje.“
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-6 lg:col-span-4 lg:col-start-9">
            <TextLink href="/vzdelavani/webinare">Téma spánku</TextLink>
            <TextLink href="/vzdelavani">Znalostní centrum</TextLink>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
