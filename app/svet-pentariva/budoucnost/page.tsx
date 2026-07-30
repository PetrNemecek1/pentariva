import { EuropeSection } from "@/components/pentariva/EuropeSection";
import {
  ConceptNotice,
  EditorialHero,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/pentariva/PublicPage";


export default function FuturePage() {
  return (
    <PublicPage>
      <EditorialHero
        eyebrow="Svět PENTARIVA · budoucnost"
        title={
          <>
            Růst, který neztrácí
            <br />
            vlastní kořeny.
          </>
        }
        status="Strategický směr"
        lead={
          <>
            <p>
              PENTARIVA vzniká s evropskou ambicí, ale její smysl nestojí na
              rychlosti expanze. Stojí na kvalitě, přenositelné důvěře a
              schopnosti zachovat stejný jazyk v každé zemi i službě.
            </p>
            <p className="mt-4">
              Níže popisujeme směr, nikoliv závazný harmonogram uvedení na trhy.
            </p>
          </>
        }
      />

      <EuropeSection />

      <section className="bg-ivory py-24 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <SectionHeading
            eyebrow="Cesta rozvoje"
            title="Nejdříve pevný základ. Potom škálování."
            body="Každá další vrstva vznikne teprve tehdy, když předchozí prokáže svou kvalitu a provozní připravenost."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Český základ",
                body: "Dokončit veřejný web, obsahový systém, produktovou přípravu a první skutečné služby.",
              },
              {
                number: "02",
                title: "Funkční ekosystém",
                body: "Propojit členství, vzdělávání, Poradnu, produkty a online kancelář do jednoho prostředí.",
              },
              {
                number: "03",
                title: "Odpovědná Evropa",
                body: "Přenášet ověřený model do dalších jazyků a partnerství s respektem k místním pravidlům.",
              },
            ].map((step) => (
              <article
                key={step.number}
                className="border-t border-gold-deep/35 pt-6"
              >
                <span className="font-serif-display text-gold-deep">
                  {step.number}
                </span>
                <h2 className="mt-4 font-serif-display text-3xl text-forest-deep">
                  {step.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-ink/70">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-14">
            <ConceptNotice title="Transparentně">
              Uvedené trhy, role a technologie jsou součástí strategické
              architektury. Neznamenají aktuální dostupnost, garantovaný termín ani
              závaznou obchodní nabídku.
            </ConceptNotice>
          </div>
        </div>
      </section>

      <section className="bg-ivory-warm py-16">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-6 lg:px-12">
          <p className="font-serif-display text-3xl text-forest-deep">
            Budoucnost začíná u hodnot.
          </p>
          <TextLink href="/svet-pentariva/hodnoty">Poznat hodnoty</TextLink>
        </div>
      </section>
    </PublicPage>
  );
}
