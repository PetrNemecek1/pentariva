import { GoldOrnament } from "./GoldOrnament";

const STATS = [
  { value: "5", label: "PILÍŘŮ EKOSYSTÉMU" },
  { value: "12", label: "EVROPSKÝCH TRHŮ V PLÁNU" },
  { value: "1", label: "DIGITÁLNÍ IDENTITA" },
  { value: "∞", label: "MOŽNOSTÍ ZAPOJENÍ" },
] as const;

export function EuropeSection() {
  return (
    <section className="relative bg-forest-deep py-24 text-cream lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <GoldOrnament className="text-gold" width={140} />
          <p
            className="mt-8 text-eyebrow text-gold"
            style={{ letterSpacing: "0.32em" }}
          >
            PŘIPRAVENI PRO EVROPU
          </p>
          <h2
            className="mt-6 font-serif-display text-cream"
            style={{
              fontSize: "clamp(1.9rem, 3.6vw, 3.1rem)",
              lineHeight: 1.1,
            }}
          >
            Budujeme evropskou partnerskou síť přirozené vitality.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/75">
            PENTARIVA vzniká jako jednotný digitální ekosystém, jehož architektura je
            připravena na vícejazyčné prostředí, mezinárodní spolupráci a dlouhodobý
            růst — vždy s důrazem na kvalitu, bezpečnost a odpovědnost.
          </p>
        </div>

        <div className="mt-16 grid gap-8 border-t border-gold/20 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <span
                className="font-serif-display text-gold"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 1 }}
              >
                {stat.value}
              </span>
              <span
                className="mt-3 text-[10.5px] text-cream/75"
                style={{ letterSpacing: "0.28em", fontWeight: 500 }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
