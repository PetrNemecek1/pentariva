import { ArrowRight, BookOpen, Play, HelpCircle } from "lucide-react";
import { GoldOrnament } from "./GoldOrnament";

const TEASERS = [
  {
    icon: BookOpen,
    kind: "Připravovaný článek",
    title: "Jak rozumět složení bylinných doplňků stravy",
    body: "Pracovní téma praktického textu o tom, na co se dívat na obalu a jak rozlišit ověřená tvrzení.",
    to: "/vzdelavani/clanky",
  },
  {
    icon: HelpCircle,
    kind: "Připravovaný průvodce",
    title: "Jak vytvořit každodenní bylinný rituál",
    body: "Koncept šesti kroků pro vytvoření jednoduchého a dlouhodobě udržitelného návyku.",
    to: "/vzdelavani/pruvodci",
  },
  {
    icon: Play,
    kind: "Připravovaný webinář",
    title: "Rovnováha a spánek: pohled odborníků",
    body: "Návrh budoucího setkání s odbornými hosty o spánku, regeneraci a dlouhodobé vitalitě.",
    to: "/vzdelavani/webinare",
  },
] as const;

export function EducationTeaser() {
  return (
    <section className="relative bg-ivory-warm py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <GoldOrnament className="text-gold-deep" width={120} />
            <p
              className="mt-8 text-eyebrow text-gold-deep"
              style={{ letterSpacing: "0.32em" }}
            >
              ZNALOSTNÍ CENTRUM
            </p>
            <h2
              className="mt-6 font-serif-display text-forest-deep"
              style={{
                fontSize: "clamp(1.9rem, 3.6vw, 3rem)",
                lineHeight: 1.1,
              }}
            >
              Nejdříve vysvětlujeme. Teprve potom doporučujeme.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70">
              Články, průvodci, videa a webináře vám pomohou porozumět tématu
              a udělat informované rozhodnutí. Každý finální obsah bude před
              zveřejněním procházet odbornou revizí.
            </p>
          </div>
          <a
            href="/vzdelavani"
            className="group inline-flex shrink-0 items-center gap-3 border border-forest px-6 py-3 text-[11px] text-forest transition-colors hover:bg-forest hover:text-cream"
            style={{ letterSpacing: "0.24em", fontWeight: 500 }}
          >
            OTEVŘÍT ZNALOSTNÍ CENTRUM
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
              strokeWidth={1.6}
            />
          </a>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {TEASERS.map(({ icon: Icon, kind, title, body, to }) => (
            <a
              key={title}
              href={to}
              className="group flex flex-col justify-between gap-8 border border-forest/15 bg-ivory p-8 transition-all hover:border-gold/60 hover:bg-ivory hover:shadow-[0_20px_40px_-20px_rgba(30,42,28,0.35)]"
            >
              <div>
                <div className="flex items-center gap-3 text-gold-deep">
                  <Icon className="h-4 w-4" strokeWidth={1.4} />
                  <span
                    className="text-[10.5px]"
                    style={{ letterSpacing: "0.28em", fontWeight: 500 }}
                  >
                    {kind.toUpperCase()}
                  </span>
                </div>
                <h3
                  className="mt-6 font-serif-display text-forest-deep"
                  style={{ fontSize: "1.55rem", lineHeight: 1.2 }}
                >
                  {title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-ink/70">{body}</p>
              </div>
              <span
                className="inline-flex items-center gap-2 border-b border-gold-deep/50 pb-1 text-[11px] text-gold-deep transition-colors group-hover:border-gold-deep group-hover:text-forest"
                style={{ letterSpacing: "0.24em", fontWeight: 500 }}
              >
                OTEVŘÍT TÉMA
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                  strokeWidth={1.6}
                />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
