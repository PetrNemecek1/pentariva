import {
  BookOpenCheck,
  CalendarClock,
  MessageCircleQuestion,
  Moon,
  Presentation,
  ShieldCheck,
} from "lucide-react";
import {
  EducationArticleLayout,
  EducationCallout,
  EducationEditorialFeature,
  EducationMeta,
  EducationSection,
  EducationSources,
} from "@/components/pentariva/EducationContentLayout";
import { EditorialHero, PublicPage, TextLink } from "@/components/pentariva/PublicPage";

const TOC = [
  { id: "smysl", label: "Smysl tématu" },
  { id: "co-si-odnesete", label: "Co si odnesete" },
  { id: "program", label: "Program setkání" },
  { id: "hranice", label: "Otázky a bezpečné hranice" },
  { id: "termin", label: "Termín a dostupnost" },
] as const;

const SOURCES = [
  {
    label: "SZPI — informace o doplňcích stravy",
    href: "https://www.szpi.gov.cz/clanek/doplnky-stravy.aspx",
  },
  {
    label: "Evropská komise — zdravotní tvrzení o potravinách",
    href: "https://food.ec.europa.eu/food-safety/labelling-and-nutrition/nutrition-and-health-claims/health-claims_en",
  },
] as const;


export default function SleepWebinarPage() {
  return (
    <PublicPage>
      <EditorialHero
        eyebrow="Znalostní centrum · webinář"
        title={
          <>
            Rovnováha a spánek.
            <br />
            Souvislosti každodenního rytmu.
          </>
        }
        status="Program ve vývoji"
        lead={
          <>
            <p>
              Online setkání vysvětluje souvislosti večerního režimu, smyslového prostředí a
              bylinných produktů prostřednictvím střízlivých a konkrétních doporučení.
            </p>
            <p className="mt-4">
              Konkrétní termín, hosté a možnost účasti tvoří součást dokončené odborné a metodické
              přípravy.
            </p>
          </>
        }
      />

      <EducationEditorialFeature
        image="/images/vzdelavani/webinare-editorial-1536.webp"
        imageSmall="/images/vzdelavani/webinare-editorial-768.webp"
        alt="Klidné večerní pracovní místo s online setkáním, bylinným nálevem, zápisníkem a živými bylinami."
        eyebrow="Společný čas"
        title="Porozumění roste v rozhovoru."
        body={
          <>
            <p>
              Online setkání spojuje odborně připravený výklad, praktické souvislosti a prostor pro
              otázky. Účastník získává jasnou mapu tématu a konkrétní podněty pro svůj každodenní
              rytmus.
            </p>
            <p>
              Metodika PENTARIVA drží jednotný jazyk, bezpečné hranice a klidné tempo, ve kterém
              mají informace čas zapadnout do souvislostí.
            </p>
          </>
        }
        caption="Redakční motiv · odborný rozhovor, večerní rytmus a klidné prostředí"
      />

      <EducationMeta
        readingTime="Předpokládaná délka 60 minut"
        level="Úvodní online setkání"
        review="Metodiku tvoří tým PENTARIVA"
      />

      <EducationArticleLayout toc={TOC}>
        <EducationSection
          id="smysl"
          eyebrow="Proč toto téma"
          title="Spánek souvisí s rytmem celého dne."
        >
          <p>
            Večerní zklidnění souvisí s tím, jak vypadá celý den: s pravidelností, světlem,
            aktivitou, prostředím i návyky, které opakujeme bez větší pozornosti. Webinář proto
            pracuje s celým kontextem každodenního rytmu.
          </p>
          <p>
            Cílem je vytvořit srozumitelnou mapu tématu, ukázat prostor pro malé praktické změny a
            vysvětlit, kde končí obecné vzdělávání a začíná individuální zdravotní péče.
          </p>
          <EducationCallout title="Přístup PENTARIVA">
            Nejprve souvislosti. Potom realistický rituál. Produkt přichází až tehdy, když je jeho
            role srozumitelná a bezpečná.
          </EducationCallout>
        </EducationSection>

        <EducationSection
          id="co-si-odnesete"
          eyebrow="Výstupy"
          title="Čemu by měl účastník po setkání rozumět."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Moon,
                title: "Každodenní rytmus",
                body: "Jak uvažovat o večerním režimu v kontextu celého dne.",
              },
              {
                icon: BookOpenCheck,
                title: "Informace na obalu",
                body: "Jak číst použití, složení, tvrzení a povinná upozornění.",
              },
              {
                icon: Presentation,
                title: "Jednoduchý rituál",
                body: "Jak vytvořit několik opakovatelných kroků bez zbytečné složitosti.",
              },
              {
                icon: ShieldCheck,
                title: "Bezpečné hranice",
                body: "Kdy obecná informace nestačí a je vhodné obrátit se na lékaře či lékárníka.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="border border-forest-deep/10 bg-ivory-warm/55 p-6">
                <Icon className="h-5 w-5 text-gold-deep" strokeWidth={1.35} />
                <p className="mt-5 font-serif-display text-2xl text-forest-deep">{title}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink/68">{body}</p>
              </div>
            ))}
          </div>
        </EducationSection>

        <EducationSection
          id="program"
          eyebrow="Návrh programu"
          title="Pět částí jednoho klidného setkání."
        >
          <ol className="space-y-5">
            {[
              ["01", "Rytmus dne", "Základní orientace v denních a večerních návycích."],
              [
                "02",
                "Prostředí pěti smyslů",
                "Světlo, zvuk, vůně, dotek a chuť jako součást vědomého přechodu do klidnější části dne.",
              ],
              [
                "03",
                "Byliny bez zkratek",
                "Jak rozlišovat tradici, zkušenost, povolené tvrzení a nepřiměřený slib.",
              ],
              [
                "04",
                "Vlastní večerní rituál",
                "Praktická osnova několika jednoduchých a opakovatelných kroků.",
              ],
              [
                "05",
                "Otázky a další cesta",
                "Obecné dotazy, doporučené zdroje a situace vyžadující kvalifikovanou radu.",
              ],
            ].map(([number, title, body]) => (
              <li
                key={number}
                className="grid grid-cols-[3rem_1fr] gap-5 border-b border-forest-deep/8 pb-5"
              >
                <span className="font-serif-display text-2xl text-gold-deep">{number}</span>
                <div>
                  <p className="font-serif-display text-xl text-forest-deep">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/68">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </EducationSection>

        <EducationSection
          id="hranice"
          eyebrow="Poradenství"
          title="Rozhovor podporuje orientaci a respektuje odborné hranice."
        >
          <div className="mb-7 flex h-12 w-12 items-center justify-center border border-gold-deep/30 text-gold-deep">
            <MessageCircleQuestion className="h-5 w-5" strokeWidth={1.35} />
          </div>
          <p>
            Otázky účastníků třídíme podle možnosti bezpečné odpovědi obecnou informací.
            Individuální zdravotní stav, změna léčby, příznaky onemocnění nebo posuzování kombinace
            s léky patří lékaři či lékárníkovi.
          </p>
          <p>
            Poradenský tým vede strukturovaný rozhovor o preferencích, každodenním režimu a
            informacích uvedených u produktu. Zdravotní závěr a volba bylin vycházejí z odborně
            validovaných informací a individuálního posouzení.
          </p>
          <EducationSources sources={SOURCES} />
        </EducationSection>

        <EducationSection
          id="termin"
          eyebrow="Aktuální stav"
          title="Termín je součástí hotového programu."
        >
          <div className="flex gap-5 border border-gold-deep/20 bg-ivory-warm p-6">
            <CalendarClock className="mt-1 h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.35} />
            <div>
              <p className="font-serif-display text-xl text-forest-deep">
                Registrace má stav ve vývoji.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                Skutečné datum, délku, cenu či bezplatnou dostupnost a podmínky účasti zveřejňujeme
                společně s potvrzeným obsahem, vedením setkání a technickým zajištěním.
              </p>
            </div>
          </div>
        </EducationSection>
      </EducationArticleLayout>

      <section className="bg-forest-deep py-20 text-cream">
        <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-8 px-6 sm:flex-row sm:items-center lg:px-12">
          <div>
            <p className="font-serif-display text-4xl">Začněte vlastním jednoduchým rituálem.</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream/68">
              Praktický průvodce je dostupný už nyní a nevyžaduje registraci.
            </p>
          </div>
          <div className="flex flex-wrap gap-6">
            <TextLink href="/vzdelavani/pruvodci" dark>
              Otevřít průvodce
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
