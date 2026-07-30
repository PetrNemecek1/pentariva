"use client";

import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Produkty", to: "/produkty" as const },
  { label: "Vzdělávání", to: "/vzdelavani" as const },
  { label: "Komunita", to: "/komunita" as const },
  { label: "Poradna", to: "/poradna" as const },
  { label: "Svět PENTARIVA", to: "/svet-pentariva" as const },
];

export function Header({ solidAtTop = false }: { solidAtTop?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solidAtTop
          ? "bg-forest-deep/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(200,165,86,0.2)]"
          : scrolled
          ? "bg-forest-deep/85 backdrop-blur-md shadow-[0_1px_0_0_rgba(200,165,86,0.15)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-8 px-6 py-5 lg:px-12">
        <a href="/" className="flex items-center" aria-label="PENTARIVA — Hlavní strana">
          <span
            className="font-serif-display text-xl text-cream sm:text-2xl"
            style={{ letterSpacing: "0.24em", fontWeight: 500 }}
          >
            PENTARIVA
          </span>
        </a>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Hlavní navigace">
          {NAV_LINKS.map((link) => (
            <a
              key={link.to}
              href={link.to}
              className="text-eyebrow text-cream/85 transition-colors hover:text-gold"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a
            href="/vyhledavani"
            aria-label="Vyhledávání"
            className="text-cream/80 transition-colors hover:text-gold"
          >
            <Search className="h-5 w-5" strokeWidth={1.4} />
          </a>
          <a
            href="/online-kancelar"
            className="border border-gold/70 px-5 py-2.5 text-[11px] text-gold transition-colors hover:bg-gold hover:text-forest-deep"
            style={{ letterSpacing: "0.24em", fontWeight: 500 }}
          >
            ONLINE KANCELÁŘ
          </a>
        </div>

        <button
          type="button"
          aria-label={open ? "Zavřít menu" : "Otevřít menu"}
          onClick={() => setOpen((v) => !v)}
          className="text-cream lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gold/15 bg-forest-deep/95 backdrop-blur-md lg:hidden">
          <nav className="mx-auto flex max-w-[1400px] flex-col gap-1 px-6 py-6" aria-label="Mobilní navigace">
            {NAV_LINKS.map((link) => (
              <a
                key={link.to}
                href={link.to}
                onClick={() => setOpen(false)}
                className="border-b border-gold/10 py-4 text-eyebrow text-cream/90 hover:text-gold"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/online-kancelar"
              onClick={() => setOpen(false)}
              className="mt-4 border border-gold/70 py-3 text-center text-[11px] text-gold hover:bg-gold hover:text-forest-deep"
              style={{ letterSpacing: "0.24em", fontWeight: 500 }}
            >
              ONLINE KANCELÁŘ
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
