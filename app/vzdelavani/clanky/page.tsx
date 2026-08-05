import { Check, Search, ShieldAlert } from "lucide-react";
import {
  EducationArticleLayout,
  EducationCallout,
  EducationEditorialFeature,
  EducationMeta,
  EducationSection,
  EducationSources,
} from "@/components/pentariva/EducationContentLayout";
import {
  ConceptNotice,
  EditorialHero,
  PublicPage,
  TextLink,
} from "@/components/pentariva/PublicPage";

const TOC = [
  { id: "co-je-doplnek", label: "Co doplněk skutečně je" },
  { id: "etiketa", label: "Jak číst etiketu" },
  { id: "bylinna-slozka", label: "Jak rozumět bylinné složce" },
  { id: "tvrzeni", label: "Tvrzení a důkazy" },
  { id: "bezpecnost", label: "Bezpečnost a souvislosti" },
  { id: "kontrolni-seznam", label: "Kontrolní seznam" },
] as const;

const SOURCES = [
  {
    label: "SZPI — Doplňky stravy: základní informace pro spotřebitele",
    href: "https://www.szpi.gov.cz/clanek/doplnky-stravy.aspx",
  },
  {
    label: "Evropská komise — registr výživových a zdravotních tvrzení",
    href: "https://food.ec.europa.eu/food-safety/labelling-and-nutrition/nutrition-and-health-claims/eu-register-health-claims_en",
  },
  {
    label: "EUR-Lex — nařízení (EU) č. 1169/2011 o informacích o potravinách",
    href: "https://eur-lex.europa.eu/eli/reg/2011/1169/oj",
  },
] as const;


export default function HerbalCompositionArticle() {
  return (
    <PublicPage>
      <EditorialHero
        eyebrow="Znalostní centrum · článek"
        title={
          <>
            Jak rozumět složení
            <br />
            bylinných doplňků stravy.
          </>
        }
        status="Redakční základ · k odborné revizi"
        lead={
          <>
            <p>
              Kvalitu výrobku určuje použitá část rostliny, její forma, množství v denní dávce,
              transparentnost výrobce a přiměřenost tvrzení.
            </p>
            <p className="mt-4">
              Tento text vás učí klást správné otázky. Individuální doporučení poskytuje lékař,
              lékárník nebo jiný kvalifikovaný odborník.
            </p>
          </>
        }
      />

      <EducationEditorialFeature
        image="/images/vzdelavani/clanky-editorial-1536.webp"
        imageSmall="/images/vzdelavani/clanky-editorial-768.webp"
        alt="Byliny, lupa a čistý záznamový list na pracovním stole jako obraz přesného čtení složení."
        eyebrow="Přesnost v detailu"
        title="Etiketa je mapa rozhodnutí."
        body={
          <>
            <p>
              Každý údaj na obalu má konkrétní roli. Název rostliny, použitá část, forma zpracování,
              množství v denní dávce a upozornění společně vytvářejí srozumitelný obraz produktu.
            </p>
            <p>
              PENTARIVA vede čtenáře k pozornému výběru, ověřitelným informacím a otázkám, které
              podporují bezpečné používání.
            </p>
          </>
        }
        caption="Redakční motiv · složení, přesnost a transparentnost"
      />

      <EducationMeta
        readingTime="8–10 minut"
        review="Veřejné zdroje · před finální odbornou revizí"
      />

      <EducationArticleLayout toc={TOC}>
        <EducationSection
          id="co-je-doplnek"
          eyebrow="Začněme přesně"
          title="Doplněk stravy patří mezi potraviny."
        >
          <p>
            Doplněk stravy patří mezi potraviny. Jeho úkolem je doplňovat běžnou stravu
            koncentrovaným zdrojem živin nebo dalších látek s výživovým či fyziologickým účinkem.
            Diagnostiku, léčbu a prevenci onemocnění zajišťuje odpovídající zdravotní péče.
          </p>
          <p>
            Obal, reklama ani ústní doporučení by proto neměly vytvářet dojem, že doplněk vyřeší
            zdravotní problém nebo nahradí odbornou péči. Stejnou zdrženlivost je vhodné zachovat i
            při čtení zkušeností ostatních lidí: osobní zkušenost může být inspirací, nikoliv
            důkazem účinku.
          </p>
          <EducationCallout title="Jedna základní otázka">
            Dokážu z informací na obalu pochopit, co přesně výrobek obsahuje, kolik toho přijmu v
            doporučené denní dávce a jaká omezení se k použití vážou?
          </EducationCallout>
        </EducationSection>

        <EducationSection id="etiketa" eyebrow="Krok za krokem" title="Co hledat na etiketě.">
          <p>
            Začněte názvem a formou výrobku. Tobolka, kapky, čaj nebo prášek přinášejí odlišné
            složení, způsob dávkování a místo v každodenním režimu.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [
                "Seznam složek",
                "Složky jsou obvykle uvedeny v sestupném pořadí podle použitého množství.",
              ],
              [
                "Denní dávka",
                "Porovnávejte množství v doporučené denní dávce, ne pouze velikost jedné kapsle.",
              ],
              [
                "Podmínky použití",
                "Zkontrolujte doporučené dávkování, dobu použití a způsob přípravy.",
              ],
              [
                "Povinná upozornění",
                "Všímejte si omezení pro děti, těhotné, kojící a dalších konkrétních skupin.",
              ],
              [
                "Odpovědný subjekt",
                "Na obalu má být dohledatelný výrobce nebo provozovatel odpovědný za výrobek.",
              ],
              [
                "Šarže a trvanlivost",
                "Umožňují dohledatelnost konkrétní výroby a bezpečné použití.",
              ],
            ].map(([title, body]) => (
              <div key={title} className="border border-forest-deep/10 bg-ivory-warm/55 p-5">
                <p className="font-serif-display text-xl text-forest-deep">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/68">{body}</p>
              </div>
            ))}
          </div>
        </EducationSection>

        <EducationSection
          id="bylinna-slozka"
          eyebrow="Botanická přesnost"
          title="Název byliny je teprve začátek."
        >
          <p>
            Dvě etikety mohou uvádět stejnou bylinu, a přesto popisovat velmi odlišné suroviny. Pro
            hlubší porozumění sledujte botanický název, použitou část rostliny a formu zpracování.
          </p>
          <ul className="space-y-4">
            {[
              "Botanický název pomáhá přesně určit druh a omezit záměnu podobně pojmenovaných rostlin.",
              "Kořen, list, květ, plod nebo semeno mohou mít odlišné složení a tradiční způsob použití.",
              "Prášek z celé části rostliny a extrakt představují dvě odlišné formy. U extraktu je důležitý způsob výroby a jeho popis.",
              "Poměr extraktu nebo standardizace mají význam pouze tehdy, když je jasně vysvětleno, k čemu se vztahují.",
              "Smysluplnost receptury vyjadřuje role, množství a vzájemný vztah jednotlivých složek.",
            ].map((item) => (
              <li key={item} className="flex gap-4">
                <Check className="mt-1 h-4 w-4 shrink-0 text-gold-deep" strokeWidth={1.5} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <EducationCallout title="Pozor na zdánlivou přesnost">
            Technický údaj získává hodnotu společně s vysvětlením. Kvalitní komunikace uvádí číslo,
            jeho význam i hranice.
          </EducationCallout>
        </EducationSection>

        <EducationSection
          id="tvrzeni"
          eyebrow="Co výrobek slibuje"
          title="Rozlišujte informaci, tradici a zdravotní tvrzení."
        >
          <p>
            Zdravotní tvrzení popisuje vztah mezi potravinou nebo její složkou a zdravím. V komerční
            komunikaci se smějí používat pouze za podmínek stanovených evropskými pravidly. Léčebná
            tvrzení jsou u potravin a doplňků stravy zakázaná.
          </p>
          <div className="my-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Informace", "Co výrobek obsahuje, jak se používá a kdo za něj odpovídá."],
              [
                "Tradice",
                "Historický nebo kulturní kontext; klinický účinek vyžaduje samostatné odborné důkazy.",
              ],
              [
                "Tvrzení",
                "Konkrétní sdělení o vztahu složky ke zdraví, které musí splňovat příslušná pravidla.",
              ],
            ].map(([title, body]) => (
              <div key={title} className="border-t border-gold-deep/40 pt-5">
                <p className="font-serif-display text-2xl text-forest-deep">{title}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink/68">{body}</p>
              </div>
            ))}
          </div>
          <p>
            Zpozorněte u absolutních slibů, rychlých výsledků, vyvolávání strachu nebo tvrzení, že
            jeden výrobek řeší velké množství nesouvisejících problémů. Důvěryhodná komunikace jasně
            vyjadřuje míru jistoty a hranice dostupných podkladů.
          </p>
        </EducationSection>

        <EducationSection
          id="bezpecnost"
          eyebrow="Kontext člověka"
          title="Přírodní původ vyžaduje osobní posouzení vhodnosti."
        >
          <p>
            Bylinné složky mohou být nevhodné v těhotenství a při kojení, pro děti, před plánovaným
            zákrokem nebo při některých zdravotních potížích. Mohou se také ovlivňovat s léčivy nebo
            s dalšími doplňky.
          </p>
          <div className="flex gap-5 border border-gold-deep/25 bg-ivory-warm p-6">
            <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.4} />
            <div>
              <p className="font-serif-display text-xl text-forest-deep">
                Kdy se nejprve poradit s odborníkem
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                Pokud pravidelně užíváte léky, řešíte dlouhodobé obtíže, jste těhotná nebo kojíte,
                vybíráte produkt pro dítě, máte naplánovaný zákrok nebo potřebujete ověřit kombinaci
                více přípravků, obraťte se na lékaře či lékárníka.
              </p>
            </div>
          </div>
        </EducationSection>

        <EducationSection
          id="kontrolni-seznam"
          eyebrow="Před rozhodnutím"
          title="Sedm otázek pro klidnější výběr."
        >
          <ol className="space-y-4">
            {[
              "Rozumím tomu, k čemu je výrobek určen a co od něj realisticky očekávám?",
              "Je přesně uveden druh byliny, použitá část a forma zpracování?",
              "Znám množství jednotlivých složek v doporučené denní dávce?",
              "Jsou tvrzení konkrétní, přiměřená a dohledatelná?",
              "Přečetl(a) jsem dávkování, upozornění a podmínky použití?",
              "Mohu dohledat výrobce, šarži a datum minimální trvanlivosti?",
              "Nevyžaduje moje situace nejprve konzultaci s lékařem nebo lékárníkem?",
            ].map((question, index) => (
              <li
                key={question}
                className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-forest-deep/8 pb-4"
              >
                <span className="font-serif-display text-2xl text-gold-deep">{index + 1}</span>
                <span>{question}</span>
              </li>
            ))}
          </ol>
          <EducationSources sources={SOURCES} />
        </EducationSection>
      </EducationArticleLayout>

      <section className="bg-forest-deep py-20 text-cream">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-7">
            <h2 className="font-serif-display text-4xl">
              Informované rozhodnutí je součástí péče.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-cream/70">
              Obsah PENTARIVA vysvětluje souvislosti a pomáhá připravit správné otázky. Diagnózu,
              léčbu a individuální zdravotní doporučení poskytují kvalifikovaní zdravotničtí
              odborníci.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-6 lg:col-span-4 lg:col-start-9">
            <TextLink href="/vzdelavani/pruvodci" dark>
              Pokračovat průvodcem
            </TextLink>
            <TextLink href="/vzdelavani" dark>
              Znalostní centrum
            </TextLink>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
