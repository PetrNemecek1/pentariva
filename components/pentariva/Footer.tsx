import { GoldOrnament } from "./GoldOrnament";

const COLUMNS = [
  {
    title: "Svět PENTARIVA",
    links: [
      { label: "Náš příběh", to: "/svet-pentariva/pribeh" },
      { label: "Hodnoty", to: "/svet-pentariva/hodnoty" },
      { label: "Věda a vývoj", to: "/svet-pentariva/veda-a-vyvoj" },
      { label: "Kvalita", to: "/svet-pentariva/kvalita" },
      { label: "Udržitelnost", to: "/svet-pentariva/udrzitelnost" },
      { label: "Budoucnost", to: "/svet-pentariva/budoucnost" },
      { label: "Pro média", to: "/svet-pentariva/pro-media" },
    ],
  },
  {
    title: "Produkty & Vzdělávání",
    links: [
      { label: "Podle potřeb", to: "/produkty/potreby" },
      { label: "Kolekce PENTARIVA", to: "/produkty/kolekce" },
      { label: "Znalostní centrum", to: "/vzdelavani" },
      { label: "Průvodci", to: "/vzdelavani/pruvodci" },
      { label: "Slovník pojmů", to: "/vzdelavani/slovnik" },
      { label: "Nejčastější otázky", to: "/vzdelavani/faq" },
    ],
  },
  {
    title: "Komunita & Poradna",
    links: [
      { label: "O komunitě", to: "/komunita/o-komunite" },
      { label: "Členské výhody", to: "/komunita/clenske-vyhody" },
      { label: "Události", to: "/komunita/udalosti" },
      { label: "Ambasadorský program", to: "/komunita/ambasadorsky-program" },
      { label: "B2B spolupráce", to: "/komunita/b2b-spoluprace" },
      { label: "PENTARIVA Poradna", to: "/poradna" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="bg-forest-deep text-cream">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <span
              className="font-serif-display text-3xl text-cream"
              style={{ letterSpacing: "0.24em", fontWeight: 500 }}
            >
              PENTARIVA
            </span>
            <div className="mt-3 flex items-center gap-3">
              <span className="h-px w-8 bg-gold-soft/70" />
              <span
                className="text-[11px] text-gold-soft"
                style={{ letterSpacing: "0.32em", fontWeight: 500 }}
              >
                HERBAL RITUALS · INNER BALANCE
              </span>
            </div>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-cream/70">
              Evropský ekosystém přírodní vitality. Spojujeme tradiční bylinné receptury,
              moderní vývoj, digitální technologie a partnerskou komunitu do jednoho živého
              celku péče o člověka.
            </p>
            <div className="mt-8">
              <a
                href="/online-kancelar"
                className="inline-flex items-center border border-gold/70 px-6 py-3 text-[11px] text-gold transition-colors hover:bg-gold hover:text-forest-deep"
                style={{ letterSpacing: "0.24em", fontWeight: 500 }}
              >
                VSTOUPIT DO ONLINE KANCELÁŘE
              </a>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3
                  className="text-[11px] text-gold"
                  style={{ letterSpacing: "0.28em", fontWeight: 600 }}
                >
                  {col.title.toUpperCase()}
                </h3>
                <ul className="mt-6 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.to}>
                      <a
                        href={link.to}
                        className="text-sm text-cream/70 transition-colors hover:text-gold"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="my-14 flex justify-center text-gold-soft/60">
          <GoldOrnament width={180} />
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-cream/10 pt-8 text-xs text-cream/55 sm:flex-row">
          <p>© {new Date().getFullYear()} PENTARIVA. Všechna práva vyhrazena.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href="/pravni/obchodni-podminky" className="hover:text-gold">
              Obchodní podmínky
            </a>
            <a href="/pravni/ochrana-udaju" className="hover:text-gold">
              Ochrana osobních údajů
            </a>
            <a href="/pravni/cookies" className="hover:text-gold">
              Cookies
            </a>
            <span className="text-cream/40">CS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
