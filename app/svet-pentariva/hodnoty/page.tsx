import { ValuesSection } from "@/components/pentariva/ValuesSection";
import {
  EditorialHero,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/pentariva/PublicPage";


export default function ValuesPage() {
  return (
    <PublicPage>
      <EditorialHero
        eyebrow="Svět PENTARIVA · hodnoty"
        title={
          <>
            Pevné principy.
            <br />
            Živý způsob práce.
          </>
        }
        lead={
          <>
            <p>
              Hodnoty nejsou samostatná deklarace. Ovlivňují, jak vybíráme
              suroviny, tvoříme obsah, navrhujeme služby a budujeme vztahy.
            </p>
            <p className="mt-4">
              Vzájemně se doplňují a teprve společně vytvářejí důvěryhodný
              celek.
            </p>
          </>
        }
      />

      <ValuesSection />

      <section className="bg-ivory py-24 lg:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-14 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Každodenní měřítko"
              title="Hodnota je vidět v rozhodnutí."
              body="Čistota, důvěra, odbornost, péče a vize musí být možné rozpoznat v konkrétním produktu, textu, službě i partnerském vztahu."
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {[
              "Nezastírat stav vývoje ani nejistotu.",
              "Nevytvářet přehnaná zdravotní či příjmová očekávání.",
              "Dávat lidem kontext před doporučením.",
              "Budovat dlouhodobý systém, ne krátkodobý efekt.",
            ].map((item, index) => (
              <div
                key={item}
                className="border border-forest-deep/10 bg-ivory-warm p-6"
              >
                <span className="font-serif-display text-gold-deep">
                  0{index + 1}
                </span>
                <p className="mt-4 text-sm leading-relaxed text-ink/70">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory-warm py-16">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-6 lg:px-12">
          <p className="font-serif-display text-3xl text-forest-deep">
            Objevte celý příběh sedmi kapitol.
          </p>
          <TextLink href="/svet-pentariva">Svět PENTARIVA</TextLink>
        </div>
      </section>
    </PublicPage>
  );
}
