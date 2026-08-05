import { ArrowRight, BookOpen, CirclePlay, HelpCircle, Presentation } from "lucide-react";
import { GoldOrnament } from "./GoldOrnament";

const TEASERS = [
  {
    icon: BookOpen,
    kind: "Redakční článek",
    title: "Jak rozumět složení bylinných doplňků stravy",
    body: "Praktický text o etiketě, formě bylinných složek, denní dávce, tvrzeních a bezpečnostních souvislostech.",
    to: "/vzdelavani/clanky",
    action: "Číst článek",
  },
  {
    icon: HelpCircle,
    kind: "Praktický průvodce",
    title: "Jak vytvořit každodenní bylinný rituál",
    body: "Šest konkrétních kroků pro jednoduchý, bezpečný a dlouhodobě udržitelný návyk.",
    to: "/vzdelavani/pruvodci",
    action: "Otevřít průvodce",
  },
  {
    icon: CirclePlay,
    kind: "Obrazová série · obsahový koncept",
    title: "Pět smyslů v každodenním bylinném rituálu",
    body: "Obrazový formát propojuje praktický postup, smyslovou pozornost a srozumitelný kontext v jednom klidném celku.",
    to: "/vzdelavani/videa",
    action: "Projít koncept",
  },
  {
    icon: Presentation,
    kind: "Online setkání · metodická osnova",
    title: "Rovnováha a spánek: souvislosti každodenního rytmu",
    body: "Profesionálně vedené setkání propojuje večerní návyky, smyslové prostředí a odpovědnou orientaci v bylinách.",
    to: "/vzdelavani/webinare",
    action: "Projít program",
  },
] as const;

export function EducationTeaser() {
  return (
    <section className="relative bg-ivory-warm py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <GoldOrnament className="text-gold-deep" width={120} />
            <p className="mt-8 text-eyebrow text-gold-deep" style={{ letterSpacing: "0.32em" }}>
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
              Články, průvodci, videa a webináře pomáhají porozumět tématu a udělat informované
              rozhodnutí. Každý formát jasně uvádí svůj obsahový a odborný stav.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {TEASERS.map(({ icon: Icon, kind, title, body, to, action }) => (
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
                {action.toUpperCase()}
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
