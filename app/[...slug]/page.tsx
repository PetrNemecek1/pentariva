import { notFound } from "next/navigation";
import { Construction, Layers3, Sparkles } from "lucide-react";
import {
  EditorialHero,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/pentariva/PublicPage";

type PreparationPage = {
  eyebrow: string;
  title: string;
  summary: string;
  parentLabel: string;
  parentHref: string;
  items: readonly string[];
};

const SHARED_ITEMS = [
  "jasná role stránky v celém ekosystému",
  "plnohodnotný a odborně přiměřený obsah",
  "vizuální zpracování v jazyku PENTARIVA",
] as const;

const PAGES: Record<string, PreparationPage> = {
  "svet-pentariva/udrzitelnost": {
    eyebrow: "Svět PENTARIVA",
    title: "Udržitelnost",
    summary:
      "Stránka vzniká na konkrétních principech, měřitelných krocích a doložitelných údajích.",
    parentLabel: "Svět PENTARIVA",
    parentHref: "/svet-pentariva",
    items: SHARED_ITEMS,
  },
  "produkty/potreby": {
    eyebrow: "Produkty",
    title: "Produkty podle potřeb",
    summary: "Tato cesta začíná u životní situace a přehledně představuje dostupné možnosti.",
    parentLabel: "Produkty",
    parentHref: "/produkty",
    items: SHARED_ITEMS,
  },
  "produkty/kolekce": {
    eyebrow: "Produkty",
    title: "Kolekce PENTARIVA",
    summary:
      "Kolekce získávají prostor společně s reálným, odborně a legislativně ověřeným portfoliem.",
    parentLabel: "Produkty",
    parentHref: "/produkty",
    items: SHARED_ITEMS,
  },
  "vzdelavani/clanky": {
    eyebrow: "Znalostní centrum",
    title: "Odborné články",
    summary: "Rozvíjíme první redakční témata a proces odborné kontroly před zveřejněním.",
    parentLabel: "Vzdělávání",
    parentHref: "/vzdelavani",
    items: SHARED_ITEMS,
  },
  "vzdelavani/pruvodci": {
    eyebrow: "Znalostní centrum",
    title: "Průvodci",
    summary: "Praktické a srozumitelné cesty vedou od otázky k informovanému rozhodnutí.",
    parentLabel: "Vzdělávání",
    parentHref: "/vzdelavani",
    items: SHARED_ITEMS,
  },
  "vzdelavani/webinare": {
    eyebrow: "Znalostní centrum",
    title: "Webináře",
    summary:
      "Program vzniká z ověřených témat, spolupráce s odbornými hosty a potvrzených termínů.",
    parentLabel: "Vzdělávání",
    parentHref: "/vzdelavani",
    items: SHARED_ITEMS,
  },
  "vzdelavani/slovnik": {
    eyebrow: "Znalostní centrum",
    title: "Slovník pojmů",
    summary:
      "Strukturu slovníku stavíme na klidném a přesném vysvětlení odborných i produktových pojmů.",
    parentLabel: "Vzdělávání",
    parentHref: "/vzdelavani",
    items: SHARED_ITEMS,
  },
  "vzdelavani/faq": {
    eyebrow: "Znalostní centrum",
    title: "Nejčastější otázky",
    summary: "Odpovědi doplňujeme podle skutečných dotazů a aktuálního stavu služeb PENTARIVA.",
    parentLabel: "Vzdělávání",
    parentHref: "/vzdelavani",
    items: SHARED_ITEMS,
  },
  "komunita/o-komunite": {
    eyebrow: "Komunita",
    title: "O komunitě",
    summary: "Podrobný členský model propojujeme s reálnými službami a jasnými pravidly.",
    parentLabel: "Komunita",
    parentHref: "/komunita",
    items: SHARED_ITEMS,
  },
  "komunita/clenske-vyhody": {
    eyebrow: "Komunita",
    title: "Členské výhody",
    summary: "Členské výhody vážeme na skutečnou dostupnost a dlouhodobou udržitelnost.",
    parentLabel: "Komunita",
    parentHref: "/komunita",
    items: SHARED_ITEMS,
  },
  "komunita/udalosti": {
    eyebrow: "Komunita",
    title: "Události",
    summary: "Kalendář získává obsah z potvrzených online a osobních setkání.",
    parentLabel: "Komunita",
    parentHref: "/komunita",
    items: SHARED_ITEMS,
  },
  "komunita/ambasadorsky-program": {
    eyebrow: "Komunita",
    title: "Ambasadorský program",
    summary:
      "Program je ve vývoji a soustředí se na jasná pravidla, skutečnou podporu a odpovědnou spolupráci.",
    parentLabel: "Komunita",
    parentHref: "/komunita",
    items: SHARED_ITEMS,
  },
  "komunita/b2b-spoluprace": {
    eyebrow: "Komunita",
    title: "B2B spolupráce",
    summary:
      "Partnerský model vzniká společně s reálným portfoliem a jasnými obchodními podmínkami.",
    parentLabel: "Komunita",
    parentHref: "/komunita",
    items: SHARED_ITEMS,
  },
  "komunita/registrace": {
    eyebrow: "Komunita",
    title: "Registrace",
    summary:
      "Bezpečná registrace vzniká jako součást Online kanceláře a transparentních pravidel práce s údaji.",
    parentLabel: "Komunita",
    parentHref: "/komunita",
    items: SHARED_ITEMS,
  },
  "poradna/faq": {
    eyebrow: "Poradna",
    title: "Časté otázky",
    summary: "Odpovědi vycházejí z reálných dotazů a odpovídají skutečně dostupným službám.",
    parentLabel: "Poradna",
    parentHref: "/poradna",
    items: SHARED_ITEMS,
  },
  partnerstvi: {
    eyebrow: "PENTARIVA",
    title: "Partnerství",
    summary: "Partnerskou nabídku spojujeme s produkty, podporou a konkrétními podmínkami.",
    parentLabel: "Komunita",
    parentHref: "/komunita",
    items: SHARED_ITEMS,
  },
  vyhledavani: {
    eyebrow: "PENTARIVA",
    title: "Vyhledávání",
    summary:
      "Vyhledávání získává plný význam společně s růstem plnohodnotných stránek a znalostních materiálů.",
    parentLabel: "Hlavní strana",
    parentHref: "/",
    items: SHARED_ITEMS,
  },
  "pravni/obchodni-podminky": {
    eyebrow: "Právní informace",
    title: "Obchodní podmínky",
    summary: "Obchodní podmínky tvoří součást spuštění skutečného prodeje a placených služeb.",
    parentLabel: "Hlavní strana",
    parentHref: "/",
    items: SHARED_ITEMS,
  },
  "pravni/ochrana-udaju": {
    eyebrow: "Právní informace",
    title: "Ochrana osobních údajů",
    summary:
      "Úplné zásady tvoří součást aktivace registrace, formulářů a dalších způsobů zpracování údajů.",
    parentLabel: "Hlavní strana",
    parentHref: "/",
    items: SHARED_ITEMS,
  },
  "pravni/cookies": {
    eyebrow: "Právní informace",
    title: "Cookies",
    summary:
      "Rozsah informací a nastavení souhlasů odpovídá technologiím skutečně používaným na veřejném webu.",
    parentLabel: "Hlavní strana",
    parentHref: "/",
    items: SHARED_ITEMS,
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((path) => ({ slug: path.split("/") }));
}

export default async function PreparationPageView({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const page = PAGES[(await params).slug.join("/")];
  if (!page) notFound();

  return (
    <PublicPage>
      <EditorialHero
        eyebrow={page.eyebrow}
        title={page.title}
        status="Ve vývoji"
        lead={
          <>
            <p>{page.summary}</p>
            <p className="mt-4">
              Odkaz zůstává viditelný jako součást cílové struktury webu. Plnohodnotný obsah právě
              vzniká.
            </p>
          </>
        }
      />

      <section className="bg-ivory-warm py-24 lg:py-28">
        <div className="mx-auto grid max-w-[1100px] gap-14 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex h-16 w-16 items-center justify-center border border-gold-deep/30 text-gold-deep">
              <Construction className="h-6 w-6" strokeWidth={1.3} />
            </div>
            <SectionHeading
              eyebrow="Obsah ve vývoji"
              title="Místo je připravené. Obsah vzniká."
              body="Tato stránka otevřeně ukazuje skutečný stav přípravy a dává prostor plnohodnotnému obsahu."
            />
          </div>
          <div className="space-y-5 lg:col-span-6 lg:col-start-7">
            {page.items.map((item, index) => {
              const Icon = index === 0 ? Layers3 : Sparkles;
              return (
                <div key={item} className="flex gap-5 border border-forest-deep/10 bg-ivory p-6">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.3} />
                  <p className="text-sm leading-relaxed text-ink/70">{item}</p>
                </div>
              );
            })}
            <div className="pt-4">
              <TextLink href={page.parentHref}>Zpět: {page.parentLabel}</TextLink>
            </div>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
