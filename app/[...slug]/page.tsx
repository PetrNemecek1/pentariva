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
  "svet-pentariva/pribeh": {
    eyebrow: "Svět PENTARIVA",
    title: "Náš příběh",
    summary:
      "Připravujeme ucelený příběh vzniku značky, jejích kořenů a směru, kterým chce růst.",
    parentLabel: "Svět PENTARIVA",
    parentHref: "/svet-pentariva",
    items: SHARED_ITEMS,
  },
  "svet-pentariva/veda-a-vyvoj": {
    eyebrow: "Svět PENTARIVA",
    title: "Věda a vývoj",
    summary:
      "Tato část vysvětlí budoucí proces vývoje, odborné kontroly a práci s důkazy.",
    parentLabel: "Svět PENTARIVA",
    parentHref: "/svet-pentariva",
    items: SHARED_ITEMS,
  },
  "svet-pentariva/kvalita": {
    eyebrow: "Svět PENTARIVA",
    title: "Kvalita",
    summary:
      "Připravujeme transparentní popis nároků na suroviny, dokumentaci, výrobu a kontrolu.",
    parentLabel: "Svět PENTARIVA",
    parentHref: "/svet-pentariva",
    items: SHARED_ITEMS,
  },
  "svet-pentariva/udrzitelnost": {
    eyebrow: "Svět PENTARIVA",
    title: "Udržitelnost",
    summary:
      "Budoucí stránka popíše konkrétní principy a měřitelné kroky, nikoliv obecná zelená prohlášení.",
    parentLabel: "Svět PENTARIVA",
    parentHref: "/svet-pentariva",
    items: SHARED_ITEMS,
  },
  "svet-pentariva/pro-media": {
    eyebrow: "Svět PENTARIVA",
    title: "Pro média",
    summary:
      "Připravujeme ověřené podklady, příběh značky, kontakty a materiály pro redakční využití.",
    parentLabel: "Svět PENTARIVA",
    parentHref: "/svet-pentariva",
    items: SHARED_ITEMS,
  },
  "produkty/potreby": {
    eyebrow: "Produkty",
    title: "Produkty podle potřeb",
    summary:
      "Tato cesta bude pomáhat začít u životní situace a porozumět dostupným možnostem bez tlaku na nákup.",
    parentLabel: "Produkty",
    parentHref: "/produkty",
    items: SHARED_ITEMS,
  },
  "produkty/kolekce": {
    eyebrow: "Produkty",
    title: "Kolekce PENTARIVA",
    summary:
      "Kolekce zveřejníme až s reálným, odborně a legislativně připraveným portfoliem.",
    parentLabel: "Produkty",
    parentHref: "/produkty",
    items: SHARED_ITEMS,
  },
  "vzdelavani/clanky": {
    eyebrow: "Znalostní centrum",
    title: "Odborné články",
    summary:
      "Připravujeme první redakční témata a proces odborné kontroly před zveřejněním.",
    parentLabel: "Vzdělávání",
    parentHref: "/vzdelavani",
    items: SHARED_ITEMS,
  },
  "vzdelavani/pruvodci": {
    eyebrow: "Znalostní centrum",
    title: "Průvodci",
    summary:
      "Vzniknou praktické a srozumitelné cesty od otázky k informovanému rozhodnutí.",
    parentLabel: "Vzdělávání",
    parentHref: "/vzdelavani",
    items: SHARED_ITEMS,
  },
  "vzdelavani/webinare": {
    eyebrow: "Znalostní centrum",
    title: "Webináře",
    summary:
      "Program spustíme až s ověřenými tématy, odbornými hosty a skutečnými termíny.",
    parentLabel: "Vzdělávání",
    parentHref: "/vzdelavani",
    items: SHARED_ITEMS,
  },
  "vzdelavani/slovnik": {
    eyebrow: "Znalostní centrum",
    title: "Slovník pojmů",
    summary:
      "Slovník bude vysvětlovat odborné i produktové pojmy klidným a přesným jazykem.",
    parentLabel: "Vzdělávání",
    parentHref: "/vzdelavani",
    items: SHARED_ITEMS,
  },
  "vzdelavani/faq": {
    eyebrow: "Znalostní centrum",
    title: "Nejčastější otázky",
    summary:
      "Odpovědi budeme doplňovat podle skutečných dotazů a stavu služeb PENTARIVA.",
    parentLabel: "Vzdělávání",
    parentHref: "/vzdelavani",
    items: SHARED_ITEMS,
  },
  "komunita/o-komunite": {
    eyebrow: "Komunita",
    title: "O komunitě",
    summary:
      "Podrobný členský model zveřejníme společně s reálnými službami a pravidly.",
    parentLabel: "Komunita",
    parentHref: "/komunita",
    items: SHARED_ITEMS,
  },
  "komunita/clenske-vyhody": {
    eyebrow: "Komunita",
    title: "Členské výhody",
    summary:
      "Výhody představíme až ve chvíli, kdy budou skutečně dostupné a dlouhodobě udržitelné.",
    parentLabel: "Komunita",
    parentHref: "/komunita",
    items: SHARED_ITEMS,
  },
  "komunita/udalosti": {
    eyebrow: "Komunita",
    title: "Události",
    summary:
      "Kalendář zveřejníme s prvními potvrzenými online nebo osobními setkáními.",
    parentLabel: "Komunita",
    parentHref: "/komunita",
    items: SHARED_ITEMS,
  },
  "komunita/ambasadorsky-program": {
    eyebrow: "Komunita",
    title: "Ambasadorský program",
    summary:
      "Program je v návrhu. Zatím nenabízíme provize, doporučovací odkazy ani příjmové přísliby.",
    parentLabel: "Komunita",
    parentHref: "/komunita",
    items: SHARED_ITEMS,
  },
  "komunita/b2b-spoluprace": {
    eyebrow: "Komunita",
    title: "B2B spolupráce",
    summary:
      "Partnerský model připravíme až společně s reálným portfoliem a jasnými obchodními podmínkami.",
    parentLabel: "Komunita",
    parentHref: "/komunita",
    items: SHARED_ITEMS,
  },
  "komunita/registrace": {
    eyebrow: "Komunita",
    title: "Registrace",
    summary:
      "Bezpečnou registraci spustíme společně s Online kanceláří a transparentními pravidly práce s údaji.",
    parentLabel: "Komunita",
    parentHref: "/komunita",
    items: SHARED_ITEMS,
  },
  "poradna/faq": {
    eyebrow: "Poradna",
    title: "Časté otázky",
    summary:
      "Odpovědi vzniknou z reálných dotazů a budou odpovídat skutečně dostupným službám.",
    parentLabel: "Poradna",
    parentHref: "/poradna",
    items: SHARED_ITEMS,
  },
  partnerstvi: {
    eyebrow: "PENTARIVA",
    title: "Partnerství",
    summary:
      "Budoucí partnerskou nabídku zveřejníme až s produkty, podporou a konkrétními podmínkami.",
    parentLabel: "Komunita",
    parentHref: "/komunita",
    items: SHARED_ITEMS,
  },
  vyhledavani: {
    eyebrow: "PENTARIVA",
    title: "Vyhledávání",
    summary:
      "Vyhledávání spustíme, až bude web obsahovat dostatek plnohodnotných stránek a znalostních materiálů.",
    parentLabel: "Hlavní strana",
    parentHref: "/",
    items: SHARED_ITEMS,
  },
  "pravni/obchodni-podminky": {
    eyebrow: "Právní informace",
    title: "Obchodní podmínky",
    summary:
      "Obchodní podmínky zveřejníme před spuštěním skutečného prodeje nebo placených služeb.",
    parentLabel: "Hlavní strana",
    parentHref: "/",
    items: SHARED_ITEMS,
  },
  "pravni/ochrana-udaju": {
    eyebrow: "Právní informace",
    title: "Ochrana osobních údajů",
    summary:
      "Úplné zásady zveřejníme před spuštěním registrace, formulářů a dalších způsobů zpracování údajů.",
    parentLabel: "Hlavní strana",
    parentHref: "/",
    items: SHARED_ITEMS,
  },
  "pravni/cookies": {
    eyebrow: "Právní informace",
    title: "Cookies",
    summary:
      "Informace a případné nastavení souhlasů doplníme podle technologií, které bude veřejný web skutečně používat.",
    parentLabel: "Hlavní strana",
    parentHref: "/",
    items: SHARED_ITEMS,
  },
};

export default async function PreparationPageView({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const page = PAGES[slug.join("/")];
  if (!page) notFound();

  return (
    <PublicPage>
      <EditorialHero
        eyebrow={page.eyebrow}
        title={page.title}
        status="Připravujeme"
        lead={
          <>
            <p>{page.summary}</p>
            <p className="mt-4">
              Odkaz ponecháváme viditelný, protože patří do cílové struktury
              webu. Plnohodnotný obsah doplníme v další fázi.
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
              body="Nechceme nahrazovat skutečný obsah prázdnou šablonou nebo zdánlivě funkčním prvkem. Proto zde otevřeně ukazujeme stav přípravy."
            />
          </div>
          <div className="space-y-5 lg:col-span-6 lg:col-start-7">
            {page.items.map((item, index) => {
              const Icon = index === 0 ? Layers3 : Sparkles;
              return (
                <div
                  key={item}
                  className="flex gap-5 border border-forest-deep/10 bg-ivory p-6"
                >
                  <Icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep"
                    strokeWidth={1.3}
                  />
                  <p className="text-sm leading-relaxed text-ink/70">{item}</p>
                </div>
              );
            })}
            <div className="pt-4">
              <TextLink href={page.parentHref}>
                Zpět: {page.parentLabel}
              </TextLink>
            </div>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
