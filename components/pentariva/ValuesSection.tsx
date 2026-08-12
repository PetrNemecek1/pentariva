"use client";

import { useEffect, useRef, useState } from "react";
import { GoldOrnament } from "./GoldOrnament";
import pentarivaEmblem from "@/assets/pentariva-footer-emblem-gold.webp";
import {
  ArrowRight,
  HeartHandshake,
  Microscope,
  ShieldCheck,
  Sprout,
  Users,
} from "lucide-react";

const VALUES = [
  {
    icon: Sprout,
    shortTitle: "Tradice",
    title: "Tradice a bylinné poznání",
    body: "Vycházíme z generacemi ověřených receptur a evropského bylinářského odkazu, který propojujeme se současným pojetím péče o zdraví.",
    href: "/svet-pentariva/pribeh",
    linkLabel: "Poznat náš příběh",
  },
  {
    icon: Microscope,
    shortTitle: "Vývoj",
    title: "Moderní vývoj a kvalita",
    body: "Každá receptura vzniká v souladu s aktuálním stavem poznání, prochází odbornou revizí a je transparentně dokumentována.",
    href: "/svet-pentariva/veda-a-vyvoj",
    linkLabel: "Otevřít vědu a vývoj",
  },
  {
    icon: HeartHandshake,
    shortTitle: "Člověk",
    title: "Péče o celého člověka",
    body: "Mysl, dech, střed, pohyb a obnova tvoří jeden přirozený rytmus. Tento pohled prostupuje produkty, vzdělávání, poradenství i vztahy.",
    href: "/poradna",
    linkLabel: "Otevřít poradnu",
  },
  {
    icon: ShieldCheck,
    shortTitle: "Odpovědnost",
    title: "Bezpečnost a odpovědnost",
    body: "Komunikujeme střízlivě a přesně. Odpovídáme za srozumitelnost, dohledatelnost zdrojů a bezpečné používání produktů.",
    href: "/svet-pentariva/kvalita",
    linkLabel: "Poznat principy kvality",
  },
  {
    icon: Users,
    shortTitle: "Ekosystém",
    title: "Živý evropský ekosystém",
    body: "Zákazníci, členové, ambasadoři a partneři tvoří jeden propojený svět postavený na důvěře, vzdělávání a dlouhodobém vztahu.",
    href: "/komunita",
    linkLabel: "Vstoupit do komunity",
  },
] as const;

const ORBIT_POSITIONS = [
  { left: "50%", top: "10%" },
  { left: "88%", top: "38%" },
  { left: "74%", top: "82%" },
  { left: "26%", top: "82%" },
  { left: "12%", top: "38%" },
] as const;

const FLOW_ARROWS = [
  { left: "70%", top: "17%", rotation: 36 },
  { left: "90%", top: "61%", rotation: 108 },
  { left: "50%", top: "91%", rotation: 180 },
  { left: "10%", top: "61%", rotation: 252 },
  { left: "30%", top: "17%", rotation: 324 },
] as const;

export function ValuesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const walkthroughTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const walkthroughStartedRef = useRef(false);
  const activeValue = VALUES[activeIndex];
  const progressAngle = (activeIndex + 1) * (360 / VALUES.length);

  const stopWalkthrough = () => {
    if (walkthroughTimerRef.current) {
      clearInterval(walkthroughTimerRef.current);
      walkthroughTimerRef.current = null;
    }
  };

  const selectValue = (index: number) => {
    stopWalkthrough();
    setActiveIndex(index);
  };

  useEffect(() => {
    const section = sectionRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!section || reducedMotion || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || walkthroughStartedRef.current) return;

        walkthroughStartedRef.current = true;
        setActiveIndex(0);
        let step = 0;

        walkthroughTimerRef.current = setInterval(() => {
          step += 1;

          if (step >= VALUES.length) {
            stopWalkthrough();
            return;
          }

          setActiveIndex(step);
        }, 1650);

        observer.disconnect();
      },
      { threshold: 0.4 },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      stopWalkthrough();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-forest-deep py-24 text-cream lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,0.82fr)_1.38fr] lg:gap-20">
          <div>
            <GoldOrnament className="text-gold" width={120} />
            <p className="mt-8 text-eyebrow text-gold" style={{ letterSpacing: "0.32em" }}>
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
              PENTARIVA je živý evropský ekosystém, který propojuje produkty, znalosti, komunitu a
              odpovědnou péči do jedné srozumitelné cesty. Naše hodnoty určují každý krok — od
              receptury až po rozhovor s poradcem.
            </p>
          </div>

          <div className="lg:hidden">
            <div className="grid gap-px bg-gold/20 sm:grid-cols-2">
              {VALUES.map(({ icon: Icon, title, body, href, linkLabel }, index) => (
                <article
                  key={title}
                  className={`bg-forest-deep p-7 ${index === VALUES.length - 1 ? "sm:col-span-2" : ""}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold">
                    <Icon className="h-5 w-5" strokeWidth={1.3} />
                  </div>
                  <p className="mt-5 text-[0.62rem] uppercase tracking-[0.24em] text-gold/70">
                    0{index + 1}
                  </p>
                  <h3 className="mt-3 font-serif-display text-2xl text-cream">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-cream/70">{body}</p>
                  <a
                    href={href}
                    className="mt-6 inline-flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.2em] text-gold transition-colors hover:text-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    {linkLabel}
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.4} />
                  </a>
                </article>
              ))}
            </div>
          </div>

          <div
            className="relative mx-auto hidden aspect-square w-full max-w-[650px] lg:block"
            aria-label="Pět propojených prvků ekosystému PENTARIVA"
          >
            <div
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(190, 147, 65, 0.10) 0%, rgba(190, 147, 65, 0.035) 38%, rgba(190, 147, 65, 0) 70%)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-[10%] rounded-full transition-all duration-700"
              style={{
                background: `conic-gradient(from -90deg, rgba(214, 173, 82, 0.95) 0deg ${progressAngle}deg, rgba(214, 173, 82, 0.16) ${progressAngle}deg 360deg)`,
              }}
            >
              <div className="absolute inset-[2px] rounded-full bg-forest-deep" />
            </div>
            <div aria-hidden className="absolute inset-[17%] rounded-full border border-gold/10" />

            {FLOW_ARROWS.map((arrow, index) => (
              <span
                key={index}
                aria-hidden
                className={`absolute z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-500 ${
                  activeIndex === index
                    ? "bg-gold text-forest-deep shadow-[0_0_20px_rgba(214,173,82,0.32)]"
                    : "bg-forest-deep text-gold/55"
                }`}
                style={{
                  left: arrow.left,
                  top: arrow.top,
                  transform: `translate(-50%, -50%) rotate(${arrow.rotation}deg) scale(${activeIndex === index ? 1.16 : 1})`,
                }}
              >
                <ArrowRight className="h-4 w-4" strokeWidth={1.2} />
              </span>
            ))}

            <div
              id="pentariva-ecosystem-detail"
              aria-live="polite"
              className="absolute left-1/2 top-1/2 h-[48%] w-[48%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-gold/30 bg-forest-deep/95 text-center shadow-[0_0_70px_rgba(190,147,65,0.08)]"
            >
              <img
                src={pentarivaEmblem.src}
                alt=""
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 w-[72%] -translate-x-1/2 -translate-y-1/2 opacity-[0.055]"
              />
              <div
                key={activeValue.title}
                className="ecosystem-content-enter relative z-10 flex h-full flex-col items-center justify-center px-8 xl:px-10"
              >
                <p className="text-[0.58rem] uppercase tracking-[0.3em] text-gold/75">
                  0{activeIndex + 1} · {activeValue.shortTitle}
                </p>
                <h3 className="mt-3 font-serif-display text-[clamp(1.25rem,1.8vw,1.8rem)] leading-tight text-cream">
                  {activeValue.title}
                </h3>
                <p className="mt-3 text-[0.7rem] leading-relaxed text-cream/68 xl:text-xs">
                  {activeValue.body}
                </p>
                <a
                  href={activeValue.href}
                  className="mt-4 inline-flex items-center gap-2 border-b border-gold/35 pb-1 text-[0.5rem] uppercase tracking-[0.18em] text-gold transition-colors hover:border-gold hover:text-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {activeValue.linkLabel}
                  <ArrowRight className="h-3 w-3" strokeWidth={1.4} />
                </a>
                <p className="mt-3 text-[0.48rem] uppercase tracking-[0.22em] text-gold/45">
                  Pět principů · jeden celek
                </p>
              </div>
            </div>

            {VALUES.map(({ icon: Icon, shortTitle, title }, index) => {
              const isActive = activeIndex === index;
              const position = ORBIT_POSITIONS[index];

              return (
                <button
                  key={title}
                  type="button"
                  aria-pressed={isActive}
                  aria-controls="pentariva-ecosystem-detail"
                  aria-label={`${title}: zobrazit podrobnosti`}
                  onClick={() => selectValue(index)}
                  onMouseEnter={() => selectValue(index)}
                  onFocus={() => selectValue(index)}
                  className={`absolute z-20 flex h-24 w-24 flex-col items-center justify-center rounded-full border text-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-forest-deep xl:h-28 xl:w-28 ${
                    isActive
                      ? "border-gold bg-gold text-forest-deep shadow-[0_0_34px_rgba(190,147,65,0.22)]"
                      : "border-gold/38 bg-forest-deep text-gold hover:border-gold/75 hover:bg-forest-light"
                  }`}
                  style={{
                    left: position.left,
                    top: position.top,
                    transform: `translate(-50%, -50%) scale(${isActive ? 1.1 : 1})`,
                  }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.3} />
                  <span className="mt-2 text-[0.5rem] uppercase tracking-[0.16em] xl:text-[0.55rem]">
                    {shortTitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
