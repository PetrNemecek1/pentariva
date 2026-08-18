import { ValuesSection } from "@/components/pentariva/ValuesSection";
import {
  EditorialHero,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/pentariva/PublicPage";

const EVERYDAY_VALUES = [
  {
    title: "Čistota",
    body: "Transparentně popisovat stav vývoje a míru jistoty.",
    practice: "Každé sdělení odpovídá skutečně dostupným podkladům.",
  },
  {
    title: "Důvěra",
    body: "Nastavovat realistická zdravotní i příjmová očekávání.",
    practice: "Člověk vždy ví, z jakých informací doporučení vychází.",
  },
  {
    title: "Odbornost",
    body: "Dávat lidem kontext před doporučením.",
    practice: "Poznání převádíme do srozumitelného a použitelného kontextu.",
  },
  {
    title: "Péče",
    body: "Vést každé doporučení s respektem k člověku a jeho situaci.",
    practice: "Doporučení respektuje individuální situaci, tempo a rozhodnutí člověka.",
  },
  {
    title: "Vize",
    body: "Budovat dlouhodobý systém s jasným směrem a odpovědností.",
    practice: "Každý krok posiluje dlouhodobou hodnotu celého ekosystému.",
  },
] as const;


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
              Hodnoty tvoří živý základ. Ovlivňují, jak vybíráme suroviny, tvoříme obsah, navrhujeme
              služby a budujeme vztahy.
            </p>
            <p className="mt-4">
              Vzájemně se doplňují a teprve společně vytvářejí důvěryhodný celek.
            </p>
          </>
        }
      />

      <ValuesSection />

      <section className="bg-ivory py-24 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="max-w-3xl">
            <SectionHeading
              eyebrow="Každodenní měřítko"
              title="Hodnota je vidět v rozhodnutí."
              body="Čistota, důvěra, odbornost, péče a vize musí být možné rozpoznat v konkrétním produktu, textu, službě i partnerském vztahu."
            />
          </div>
          <div className="mt-14 grid gap-px bg-forest-deep/12 sm:grid-cols-2 xl:grid-cols-5">
            {EVERYDAY_VALUES.map((item, index) => (
              <article
                key={item.title}
                tabIndex={0}
                className="group relative overflow-hidden bg-ivory-warm p-7 transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_45px_rgba(18,41,30,0.08)] focus:-translate-y-1 focus:bg-white focus:shadow-[0_18px_45px_rgba(18,41,30,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep lg:p-8"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gold-deep transition-transform duration-500 group-hover:scale-x-100 group-focus:scale-x-100"
                />
                <span className="absolute right-4 top-0 font-serif-display text-6xl text-gold-deep/10">
                  0{index + 1}
                </span>
                <span className="relative font-serif-display text-gold-deep">0{index + 1}</span>
                <h3 className="relative mt-8 font-serif-display text-2xl text-forest-deep">
                  {item.title}
                </h3>
                <div className="relative mt-4 min-h-[7.5rem]">
                  <p className="absolute inset-0 text-sm leading-relaxed text-ink/70 transition-all duration-400 group-hover:-translate-y-2 group-hover:opacity-0 group-focus:-translate-y-2 group-focus:opacity-0">
                    {item.body}
                  </p>
                  <div className="absolute inset-0 translate-y-3 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">
                    <p className="text-[0.58rem] uppercase tracking-[0.22em] text-gold-deep">
                      Hodnota v praxi
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-forest-deep">
                      {item.practice}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory-warm py-16">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-6 lg:px-12">
          <p className="font-serif-display text-3xl text-forest-deep">
            Objevte celý příběh šesti kapitol.
          </p>
          <div className="flex flex-wrap items-center gap-7">
            <TextLink href="/svet-pentariva/pribeh">Náš příběh</TextLink>
            <TextLink href="/svet-pentariva/veda-a-vyvoj">Věda a vývoj</TextLink>
            <TextLink href="/svet-pentariva/kvalita">Kvalita</TextLink>
            <TextLink href="/svet-pentariva">Svět PENTARIVA</TextLink>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
