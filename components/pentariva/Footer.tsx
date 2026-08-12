import { GoldOrnament } from "./GoldOrnament";
import footerEmblem from "@/assets/pentariva-footer-emblem-gold.webp";

const COLUMNS = [
  {
    title: "Svět PENTARIVA",
    links: [
      { label: "Náš příběh", to: "/svet-pentariva/pribeh" },
      { label: "Hodnoty", to: "/svet-pentariva/hodnoty" },
      { label: "Věda a vývoj", to: "/svet-pentariva/veda-a-vyvoj" },
      { label: "Kvalita", to: "/svet-pentariva/kvalita" },
      { label: "Udržitelnost", to: "/svet-pentariva/udrzitelnost" },
      { label: "Směr rozvoje", to: "/svet-pentariva/budoucnost" },
      { label: "Pro média", to: "/svet-pentariva/pro-media" },
    ],
  },
  {
    title: "Produkty & Vzdělávání",
    links: [
      { label: "Podle potřeb", to: "/produkty/potreby" },
      { label: "Kolekce PENTARIVA", to: "/produkty/kolekce" },
      { label: "Znalostní centrum", to: "/vzdelavani" },
      { label: "Články", to: "/vzdelavani/clanky" },
      { label: "Průvodci", to: "/vzdelavani/pruvodci" },
      { label: "Videa", to: "/vzdelavani/videa" },
      { label: "Webináře", to: "/vzdelavani/webinare" },
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
          <div className="text-center">
            <a
              href="/"
              className="mx-auto block w-full max-w-[320px]"
              aria-label="PENTARIVA — hlavní strana"
            >
              <span className="block">
                <img
                  src={footerEmblem.src}
                  width={1254}
                  height={1254}
                  loading="lazy"
                  decoding="async"
                  alt="Grafický znak PENTARIVA"
                  className="mx-auto -mb-5 h-auto w-[210px] drop-shadow-[0_10px_28px_rgba(200,165,86,0.12)]"
                />

                <span
                  className="block font-serif-display text-[2.15rem] leading-none text-gold-soft sm:text-[2.45rem]"
                  style={{ letterSpacing: "0.2em", fontWeight: 500 }}
                >
                  PENTARIVA
                </span>

                <span
                  className="mt-4 block w-full whitespace-nowrap text-center text-[0.55rem] text-gold-soft/90 sm:text-[0.6rem]"
                  style={{ letterSpacing: "0.16em", fontWeight: 500 }}
                >
                  Z HLUBIN KOŘENŮ&nbsp;-&nbsp;PRO CELÝ ŽIVOT
                </span>
              </span>
            </a>

            <p className="mx-auto mt-7 max-w-md text-sm leading-relaxed text-cream/70">
              PENTARIVA má duši. Propojuje tradiční bylinné poznání, moderní vývoj, digitální
              technologie a partnerskou komunitu v jeden evropský ekosystém přirozené vitality.
            </p>
            <div className="mt-8 flex justify-center">
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
