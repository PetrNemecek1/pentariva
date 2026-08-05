import {
  BookOpenCheck,
  CircleHelp,
  Headphones,
  MessageCircleMore,
  PackageSearch,
} from "lucide-react";
import {
  ConceptNotice,
  EditorialHero,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/pentariva/PublicPage";

const SUPPORT_AREAS = [
  {
    icon: PackageSearch,
    title: "Orientace v produktech",
    body: "Pomoc porozumět zamýšlené roli, formě a způsobu použití produktů.",
    status: "S portfoliem",
  },
  {
    icon: BookOpenCheck,
    title: "Vysvětlení souvislostí",
    body: "Cesta ke srozumitelnému obsahu, upozorněním a ověřeným informacím.",
    status: "Ve vývoji",
  },
  {
    icon: Headphones,
    title: "Zákaznická podpora",
    body: "Podpora pro účet, objednávku, doručení a běžné otázky.",
    status: "Po spuštění prodeje",
  },
  {
    icon: MessageCircleMore,
    title: "Individuální konzultace",
    body: "Individuální formát pro otázky vyžadující osobní kontext.",
    status: "Ve vývoji",
  },
  {
    icon: CircleHelp,
    title: "Časté otázky",
    body: "Přehledná odpověď na nejběžnější otázky napříč ekosystémem.",
    status: "Průběžně vzniká",
  },
] as const;


export default function AdvisoryPage() {
  return (
    <PublicPage>
      <EditorialHero
        eyebrow="PENTARIVA Poradna"
        title={
          <>
            Nejdříve pomáháme.
            <br />
            Teprve potom doporučujeme.
          </>
        }
        status="Služby vznikají postupně"
        lead={
          <>
            <p>
              Poradna propojuje srozumitelné informace, lidskou podporu a jasné hranice
              odpovědnosti. Každý dotaz má nejprve dostat poctivý kontext.
            </p>
            <p className="mt-4">
              V této fázi představujeme strukturu služby. Kontaktní kanály, rezervace a produktové
              poradenství mají stav ve vývoji.
            </p>
          </>
        }
      />

      <section className="bg-ivory-warm py-24 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <SectionHeading
            eyebrow="Jak vám pomáháme"
            title="Správná úroveň pomoci pro každou otázku."
            body="Od rychlé orientace přes praktickou podporu až po individuální rozhovor. Jednotlivé služby aktivujeme s odpovídající odbornou a provozní připraveností."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {SUPPORT_AREAS.map(({ icon: Icon, title, body, status }) => (
              <article
                key={title}
                className="flex flex-col border border-forest-deep/10 bg-ivory p-7"
              >
                <Icon className="h-5 w-5 text-gold-deep" strokeWidth={1.35} />
                <h2 className="mt-5 font-serif-display text-2xl text-forest-deep">{title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/68">{body}</p>
                <span
                  className="mt-6 border-t border-gold-deep/20 pt-4 text-[0.6rem] uppercase text-gold-deep"
                  style={{ letterSpacing: "0.22em" }}
                >
                  {status}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-deep py-24 text-cream lg:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-14 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Hranice a odpovědnost"
              title="Poradna podporuje orientaci a odpovědné rozhodování."
              dark
              body="Služba pomáhá s orientací v ekosystému PENTARIVA a s obecnými informacemi. Diagnóza, léčba a individuální zdravotní rozhodnutí patří kvalifikovaným zdravotnickým odborníkům."
            />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <ConceptNotice title="Právě nyní" dark>
              Aktuální stav transparentně označuje fázi vývoje personálního i technického zázemí
              služby.
            </ConceptNotice>
            <div className="mt-8 flex flex-wrap gap-6">
              <TextLink href="/vzdelavani" dark>
                Znalostní centrum
              </TextLink>
              <TextLink href="/produkty" dark>
                Koncept produktů
              </TextLink>
              <TextLink href="/poradna/faq" dark>
                Časté otázky
              </TextLink>
            </div>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
