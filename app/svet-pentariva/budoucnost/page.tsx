import { Compass, GraduationCap, HeartHandshake, Leaf, Network } from "lucide-react";
import { EuropeSection } from "@/components/pentariva/EuropeSection";
import {
  ConceptNotice,
  EditorialHero,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/pentariva/PublicPage";

const VISION_PILLARS = [
  {
    icon: Leaf,
    title: "Kořeny",
    body: "Tradice, úcta k přírodě a jasné hodnoty tvoří pevný základ každého rozhodnutí.",
  },
  {
    icon: GraduationCap,
    title: "Poznání",
    body: "Vzdělávání převádí odborné souvislosti do jazyka, který podporuje jistotu a odpovědnost.",
  },
  {
    icon: HeartHandshake,
    title: "Důvěra",
    body: "Kvalita vztahů, transparentní komunikace a osobní péče drží celý ekosystém pohromadě.",
  },
  {
    icon: Network,
    title: "Růst",
    body: "Promyšlený systém propojuje produkty, služby, vzdělávání a partnerství v evropském měřítku.",
  },
] as const;

const DEVELOPMENT_STEPS = [
  {
    number: "01",
    eyebrow: "Pevný bod",
    title: "Český základ",
    body: "Veřejný web, obsahový systém, produktová příprava a první služby společně vytvářejí důvěryhodný základ značky.",
  },
  {
    number: "02",
    eyebrow: "Propojený celek",
    title: "Funkční ekosystém",
    body: "Členství, vzdělávání, Poradna, produkty a online kancelář sdílejí jeden jazyk, metodiku a standard péče.",
  },
  {
    number: "03",
    eyebrow: "Evropský rozměr",
    title: "Odpovědná Evropa",
    body: "Společné principy získávají přesnou podobu v jednotlivých jazycích, partnerstvích a místních pravidlech.",
  },
] as const;


export default function FuturePage() {
  return (
    <PublicPage>
      <EditorialHero
        eyebrow="Svět PENTARIVA · směr"
        title={
          <>
            Růst vedený
            <br />
            vlastními kořeny.
          </>
        }
        status="Strategický směr"
        lead={
          <>
            <p>
              PENTARIVA rozvíjí evropskou ambici prostřednictvím kvality, přenositelné důvěry a
              společného jazyka v každé zemi i službě.
            </p>
            <p className="mt-4">Hodnoty, principy a odpovědné tempo určují každý krok rozvoje.</p>
          </>
        }
      />

      <section className="relative overflow-hidden bg-forest-deep py-24 text-cream lg:py-28">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-gold/10" />
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-5">
              <p className="text-eyebrow text-gold" style={{ letterSpacing: "0.3em" }}>
                Jeden společný směr
              </p>
              <h2
                className="mt-6 font-serif-display text-cream"
                style={{ fontSize: "clamp(2.7rem, 5vw, 5rem)", lineHeight: 0.98 }}
              >
                Hodnoty dávají vizi konkrétní tvar.
              </h2>
            </div>
            <p className="font-serif-display text-2xl leading-snug text-gold-soft sm:text-3xl lg:col-span-6 lg:col-start-7">
              Tým PENTARIVA spojuje rozdílné kompetence v jednom systému. Každá role má vlastní
              prostor, vlastní odpovědnost a stejný závazek ke kvalitě.
            </p>
          </div>

          <div className="mt-16 grid gap-px bg-gold/15 sm:grid-cols-2 lg:grid-cols-4">
            {VISION_PILLARS.map(({ icon: Icon, title, body }) => (
              <article key={title} className="bg-forest-deep p-7 lg:p-8">
                <Icon className="h-5 w-5 text-gold" strokeWidth={1.3} />
                <h3 className="mt-5 font-serif-display text-2xl text-cream">{title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-cream/65">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <EuropeSection />

      <section className="bg-ivory py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <SectionHeading
            eyebrow="Cesta rozvoje"
            title="Pevný základ otevírá prostor pro evropský růst."
            body="Každá vrstva rozvoje stojí na prokázané kvalitě, srozumitelném systému a provozní připravenosti předchozího kroku."
          />

          <div className="relative mt-16">
            <div className="absolute bottom-0 left-[2.15rem] top-0 hidden w-px bg-gold-deep/25 md:block" />
            <div className="space-y-8 md:space-y-12">
              {DEVELOPMENT_STEPS.map((step) => (
                <article
                  key={step.number}
                  className="relative grid gap-6 border-t border-forest-deep/10 pt-7 md:grid-cols-[4.5rem_1fr] md:border-t-0 md:pt-0"
                >
                  <div className="relative z-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-gold-deep/35 bg-ivory font-serif-display text-xl text-gold-deep">
                    {step.number}
                  </div>
                  <div className="grid gap-5 border-b border-forest-deep/10 pb-10 md:grid-cols-12 md:gap-10">
                    <div className="md:col-span-4">
                      <p
                        className="text-[0.62rem] uppercase text-gold-deep"
                        style={{ letterSpacing: "0.24em" }}
                      >
                        {step.eyebrow}
                      </p>
                      <h3 className="mt-3 font-serif-display text-3xl text-forest-deep">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-base leading-[1.8] text-ink/70 md:col-span-7 md:col-start-6">
                      {step.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-14">
            <ConceptNotice title="Transparentní architektura">
              Strategický systém jasně rozlišuje aktuálně dostupné služby, ověřované koncepty a
              schválené nabídky. Každá zveřejněná informace uvádí svůj platný stav, rozsah a
              podmínky.
            </ConceptNotice>
          </div>
        </div>
      </section>

      <section className="bg-ivory-warm py-16">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-6 lg:px-12">
          <div className="flex items-center gap-5">
            <Compass className="h-6 w-6 text-gold-deep" strokeWidth={1.25} />
            <p className="font-serif-display text-3xl text-forest-deep">
              Směr růstu začíná u hodnot.
            </p>
          </div>
          <TextLink href="/svet-pentariva/hodnoty">Poznat hodnoty</TextLink>
        </div>
      </section>
    </PublicPage>
  );
}
