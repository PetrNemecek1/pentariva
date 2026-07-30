import { GoldOrnament } from "./GoldOrnament";
import { Sprout, Microscope, ShieldCheck, Users } from "lucide-react";

const VALUES = [
  {
    icon: Sprout,
    title: "Tradice a bylinné poznání",
    body: "Vycházíme z generacemi ověřených receptur a evropského bylinářského odkazu, který propojujeme se současným pojetím péče o zdraví.",
  },
  {
    icon: Microscope,
    title: "Moderní vývoj a kvalita",
    body: "Každá receptura vzniká v souladu s aktuálním stavem poznání, prochází odbornou revizí a je transparentně dokumentována.",
  },
  {
    icon: ShieldCheck,
    title: "Bezpečnost a odpovědnost",
    body: "Nevytváříme přehnaná zdravotní tvrzení. Odpovídáme za srozumitelnost, dohledatelnost zdrojů a bezpečné používání produktů.",
  },
  {
    icon: Users,
    title: "Živý evropský ekosystém",
    body: "Zákazníci, členové, ambasadoři a partneři tvoří jeden propojený svět postavený na důvěře, vzdělávání a dlouhodobém vztahu.",
  },
] as const;

export function ValuesSection() {
  return (
    <section className="relative bg-forest-deep py-24 text-cream lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_1.35fr] lg:gap-24">
          <div>
            <GoldOrnament className="text-gold" width={120} />
            <p
              className="mt-8 text-eyebrow text-gold"
              style={{ letterSpacing: "0.32em" }}
            >
              PROČ PENTARIVA
            </p>
            <h2
              className="mt-6 font-serif-display text-cream"
              style={{
                fontSize: "clamp(1.9rem, 3.6vw, 3.1rem)",
                lineHeight: 1.1,
              }}
            >
              Ekosystém, kde tradice, věda a lidský vztah tvoří jeden celek.
            </h2>
            <p className="mt-8 max-w-lg text-base leading-relaxed text-cream/75">
              PENTARIVA není jen značka doplňků stravy. Je to živý evropský ekosystém,
              který propojuje produkty, znalosti, komunitu a odpovědnou péči do jedné
              srozumitelné cesty. Naše hodnoty určují každý krok — od receptury až po
              rozhovor s poradcem.
            </p>
          </div>

          <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <article key={title} className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center border border-gold/40 text-gold">
                  <Icon className="h-5 w-5" strokeWidth={1.3} />
                </div>
                <h3
                  className="font-serif-display text-cream"
                  style={{ fontSize: "1.35rem", lineHeight: 1.2 }}
                >
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/70">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
