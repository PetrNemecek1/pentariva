"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Download, Play, Volume2 } from "lucide-react";
import { Header } from "@/components/pentariva/Header";
import { Footer } from "@/components/pentariva/Footer";
import { InlineLink } from "@/components/pentariva/PublicPage";
import heroV2Asset from "@/assets/svet-pentariva-hero-v2.png.asset.json";
import chapterOneAsset from "@/assets/PENTARIVA_-_CHAPTER_I.png.asset.json";
import chapterTwoAsset from "@/assets/PENTARIVA_-_CHAPTER_II-3.png.asset.json";
import chapterThreeAsset from "@/assets/PENTARIVA_-_CHAPTER_III.png.asset.json";
import chapterFourImage from "@/assets/pentariva-chapter-iv.webp";
import botanicalClosingImage from "@/assets/pentariva-quiet-botanical-closing.webp";
import pentarivaEmblemAsset from "@/assets/pentariva-emblem.jpg.asset.json";
const HERO_IMAGE = heroV2Asset.url;
const CHAPTER_III_IMAGE = chapterThreeAsset.url;
const EDITORIAL_WIDTHS = [480, 768, 1122] as const;
const CLOSING_WIDTHS = [768, 1280, 1915] as const;

function editorialSrcSet(name: string, widths: readonly number[], format: "avif" | "webp") {
  return widths
    .map((width) => `/images/svet-pentariva/${name}-${width}.${format} ${width}w`)
    .join(", ");
}

/* -------------------------------------------------------------------------- */
/*  Route + metadata                                                          */
/* -------------------------------------------------------------------------- */

const TITLE = "Svět PENTARIVA | Sedm kapitol, pět principů";
const DESCRIPTION =
  "Poznejte svět PENTARIVA. Sedm kapitol odhaluje pět principů, které propojují člověka, smysly, péči, odbornost a dlouhodobou vizi v jeden živý ekosystém.";


/* -------------------------------------------------------------------------- */
/*  Content data — approved Czech copy                                         */
/* -------------------------------------------------------------------------- */

const CHAPTERS = [
  { roman: "I", title: "Proč právě pět", id: "kapitola-1" },
  { roman: "II", title: "Pět bodů", id: "kapitola-2" },
  { roman: "III", title: "Pět smyslů", id: "kapitola-3" },
  { roman: "IV", title: "Pět vnitřních sil", id: "kapitola-4" },
  { roman: "V", title: "Pět pilířů", id: "kapitola-5" },
  { roman: "VI", title: "Jedna PENTARIVA", id: "kapitola-6" },
] as const;

const FIVE_PREVIEW = [
  { label: "ČLOVĚK", hint: "Celek, nikoliv součet částí." },
  { label: "SMYSLY", hint: "Okamžik se stává prožitkem." },
  { label: "VNITŘNÍ SÍLY", hint: "Rytmus, ve kterém žijeme." },
  { label: "PILÍŘE", hint: "Směr, který drží značku." },
  { label: "EKOSYSTÉM", hint: "Rozdílné oblasti, jeden celek." },
] as const;

const FIVE_POINTS = [
  {
    label: "VNÍMÁNÍ",
    body: "Místo, kde začíná pozornost, porozumění a vědomé rozhodnutí.",
    marker: { top: "12%", left: "50%" },
  },
  {
    label: "PROŽÍVÁNÍ",
    body: "To, co člověk cítí uvnitř a co ovlivňuje jeho vztah k sobě i okolnímu světu.",
    marker: { top: "32%", left: "48%" },
  },
  {
    label: "PÉČE",
    body: "Schopnost proměnit pozornost v laskavý a konkrétní čin.",
    marker: { top: "52%", left: "36%" },
  },
  {
    label: "JEDNÁNÍ",
    body: "Každodenní rozhodnutí, kterými člověk vytváří svůj vlastní směr.",
    marker: { top: "52%", left: "64%" },
  },
  {
    label: "OPORA",
    body: "Pevný základ, ze kterého může člověk růst, obnovovat sílu a pokračovat.",
    marker: { top: "86%", left: "50%" },
  },
] as const;

const SENSES = [
  {
    label: "ZRAK",
    body: "Barva, světlo, detail a botanická kresba vytvářejí první setkání.",
  },
  {
    label: "SLUCH",
    body: "Každý produkt může mít vlastní zvukový charakter — jemnou akustickou stopu inspirovanou jeho příběhem, materiálem a rituálem.",
  },
  {
    label: "ČICH",
    body: "Vůně bylin otevírá paměť, náladu a očekávání ještě před prvním dotykem.",
  },
  {
    label: "CHUŤ",
    body: "Chuť se rozvíjí v čase, rovnováze a doznívání jednotlivých rostlin.",
  },
  {
    label: "DOTEK",
    body: "Papír, sklo, keramika, dřevo i samotný způsob přípravy proměňují produkt v osobní rituál.",
  },
] as const;

const INNER_FORCES = [
  { label: "MYSL", body: "Prostor, ve kterém vzniká směr." },
  { label: "DECH", body: "Rytmus, který nás vrací k přítomnému okamžiku." },
  { label: "STŘED", body: "Pevný bod, ze kterého vyrůstá stabilita." },
  { label: "POHYB", body: "Přirozená součást života a každodenní vitality." },
  { label: "OBNOVA", body: "Schopnost zpomalit, doplnit sílu a znovu pokračovat." },
] as const;

const PILLARS = [
  {
    label: "ČISTOTA",
    body: "Pečlivě vybíráme suroviny, partnery i výrobní procesy. Kvalita pro nás vzniká v každém rozhodnutí, které výslednému produktu předchází.",
  },
  {
    label: "DŮVĚRA",
    body: "Stavíme na otevřenosti, srozumitelnosti a dlouhodobých vztazích. Důvěra roste z důslednosti v každém rozhodnutí.",
  },
  {
    label: "ODBORNOST",
    body: "Propojujeme zkušenost vývojářů, výrobců a dalších odborníků. Každý produkt musí obstát nejen svou krásou, ale také svým smyslem.",
  },
  {
    label: "PÉČE",
    body: "Člověk je vždy na prvním místě. Produkty, služby i technologie proto navrhujeme kolem skutečných potřeb každodenního života.",
  },
  {
    label: "VIZE",
    body: "PENTARIVA tvoříme jako značku, která se rozvíjí, inovuje a vytváří hodnotu v dlouhém časovém horizontu.",
  },
] as const;

const PILLAR_POSITIONS = [
  { x: 50, y: 8 },
  { x: 84, y: 37 },
  { x: 72, y: 84 },
  { x: 28, y: 84 },
  { x: 16, y: 37 },
] as const;

/* -------------------------------------------------------------------------- */
/*  Small primitives                                                          */
/* -------------------------------------------------------------------------- */

function ChapterLabel({
  roman,
  kicker,
  tone = "light",
}: {
  roman: string;
  kicker: string;
  tone?: "light" | "dark";
}) {
  const numberCls = tone === "dark" ? "text-gold-soft/90" : "text-gold-deep/80";
  const ruleCls = tone === "dark" ? "bg-gold-soft/40" : "bg-gold/30";
  const kickerCls = tone === "dark" ? "text-gold-soft/85" : "text-gold-deep/70";
  return (
    <div className="flex items-baseline gap-4">
      <span
        className={`font-serif-display ${numberCls}`}
        style={{ fontSize: "0.95rem", letterSpacing: "0.14em" }}
      >
        {roman}
      </span>
      <span className={`h-px w-10 ${ruleCls}`} aria-hidden />
      <span className={`text-[0.68rem] uppercase ${kickerCls}`} style={{ letterSpacing: "0.32em" }}>
        {kicker}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chapter navigation                                                         */
/* -------------------------------------------------------------------------- */

function ChapterNavigation() {
  const [active, setActive] = useState<string>(CHAPTERS[0].id);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [scrollEdges, setScrollEdges] = useState({
    left: false,
    right: true,
  });

  const updateScrollEdges = useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const next = {
      left: list.scrollLeft > 4,
      right: list.scrollLeft + list.clientWidth < list.scrollWidth - 4,
    };

    setScrollEdges((current) =>
      current.left === next.left && current.right === next.right ? current : next,
    );
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    for (const c of CHAPTERS) {
      const el = document.getElementById(c.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    updateScrollEdges();
    list.addEventListener("scroll", updateScrollEdges, { passive: true });
    window.addEventListener("resize", updateScrollEdges);

    return () => {
      list.removeEventListener("scroll", updateScrollEdges);
      window.removeEventListener("resize", updateScrollEdges);
    };
  }, [updateScrollEdges]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || window.matchMedia("(min-width: 1024px)").matches) return;

    const activeItem = list.querySelector<HTMLElement>(`[data-chapter-id="${active}"]`);
    if (!activeItem) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const centeredLeft = activeItem.offsetLeft - (list.clientWidth - activeItem.clientWidth) / 2;
    list.scrollTo({
      left: centeredLeft,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [active]);

  return (
    <nav
      aria-label="Obsah — kapitoly"
      className="sticky top-[68px] z-30 border-y border-gold/15 bg-ivory/85 backdrop-blur-md"
    >
      <div className="mx-auto max-w-[1400px] px-4 lg:px-12">
        <div className="relative">
          <ul
            ref={listRef}
            className="chapter-navigation-scroll flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain py-4 lg:grid lg:snap-none lg:grid-cols-7 lg:gap-4 lg:py-5"
          >
            {CHAPTERS.map((c) => {
              const isActive = active === c.id;
              return (
                <li
                  key={c.id}
                  data-chapter-id={c.id}
                  className="min-w-[9rem] snap-center lg:min-w-0"
                >
                  <a
                    href={`#${c.id}`}
                    aria-current={isActive ? "location" : undefined}
                    className="group block border-t border-transparent pt-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep/60"
                    style={{
                      borderTopColor: isActive ? "rgba(120,90,30,0.55)" : undefined,
                    }}
                  >
                    <div className="flex items-baseline gap-3">
                      <span
                        className={`font-serif-display transition-colors ${
                          isActive
                            ? "text-gold-deep"
                            : "text-forest-deep/45 group-hover:text-gold-deep"
                        }`}
                        style={{
                          fontSize: "0.95rem",
                          letterSpacing: "0.16em",
                        }}
                      >
                        {c.roman}
                      </span>
                      <span
                        className={`font-sans text-[0.7rem] uppercase transition-colors ${
                          isActive
                            ? "text-forest-deep"
                            : "text-forest-deep/55 group-hover:text-forest-deep"
                        }`}
                        style={{ letterSpacing: "0.22em" }}
                      >
                        {c.title}
                      </span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>

          {scrollEdges.left && (
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-10 items-center bg-gradient-to-r from-ivory via-ivory/90 to-transparent lg:hidden"
              aria-hidden="true"
            >
              <ChevronLeft className="h-4 w-4 text-gold-deep/65" />
            </div>
          )}

          {scrollEdges.right && (
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-10 items-center justify-end bg-gradient-to-l from-ivory via-ivory/90 to-transparent lg:hidden"
              aria-hidden="true"
            >
              <ChevronRight className="h-4 w-4 text-gold-deep/65" />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                       */
/* -------------------------------------------------------------------------- */

function WorldHero() {
  return (
    <section className="relative bg-ivory pt-28 pb-20 lg:pt-36 lg:pb-28">
      <div className="mx-auto grid max-w-[1400px] gap-14 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20 lg:px-12">
        <div className="flex flex-col justify-center">
          <p
            className="mb-8 text-[0.72rem] uppercase text-gold-deep/80"
            style={{ letterSpacing: "0.36em" }}
          >
            SVĚT PENTARIVA
          </p>
          <h1
            className="font-serif-display text-forest-deep"
            style={{
              fontSize: "clamp(2.4rem, 5vw, 4.2rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.005em",
              fontWeight: 500,
            }}
          >
            Šest kapitol.
            <br />
            <span className="text-gold-deep/90">Pět principů.</span>
            <br />
            Jeden živý ekosystém.
          </h1>

          <div
            className="mt-10 max-w-xl space-y-5 text-forest-deep/75"
            style={{ fontSize: "1.05rem", lineHeight: 1.75 }}
          >
            <p>Než vznikl první produkt, vznikla myšlenka.</p>
            <p>
              Člověka vnímáme jako celek. Skutečná péče vzniká propojením přírody, poznání,
              každodenního života a lidské blízkosti.
            </p>
            <p>
              Těchto šest kapitol odhaluje svět PENTARIVA — svět, jehož přirozeným řádem je číslo
              pět.
            </p>
          </div>

          <div className="mt-12 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
            <a
              href="#kapitola-1"
              className="group inline-flex items-center gap-3 border border-forest-deep bg-forest-deep px-8 py-4 text-[0.72rem] uppercase text-cream transition-colors hover:bg-forest hover:text-cream"
              style={{ letterSpacing: "0.24em" }}
            >
              Začít první kapitolou
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#chapter-index"
              className="inline-flex items-center gap-2 text-[0.72rem] uppercase text-forest-deep/70 underline decoration-gold/40 underline-offset-[6px] transition-colors hover:text-gold-deep"
              style={{ letterSpacing: "0.22em" }}
            >
              Procházet kapitoly
            </a>
          </div>
        </div>

        <div className="relative">
          <picture className="contents">
            <source
              type="image/avif"
              srcSet={editorialSrcSet("hero", EDITORIAL_WIDTHS, "avif")}
              sizes="(min-width: 1024px) 50vw, calc(100vw - 3rem)"
            />
            <source
              type="image/webp"
              srcSet={editorialSrcSet("hero", EDITORIAL_WIDTHS, "webp")}
              sizes="(min-width: 1024px) 50vw, calc(100vw - 3rem)"
            />
            <img
              src={HERO_IMAGE}
              alt="Botanický deník, archivní box PENTARIVA a ručně psané bylinné poznámky v teplém evropském světle."
              className="h-full w-full object-cover"
              style={{ aspectRatio: "4 / 5" }}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width={1122}
              height={1402}
            />
          </picture>
        </div>
      </div>
      <div id="chapter-index" aria-hidden className="h-0" />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Editorial chapter shell                                                   */
/* -------------------------------------------------------------------------- */

function ChapterShell({
  id,
  roman,
  kicker,
  headline,
  intro,
  closing,
  tone = "light",
  children,
}: {
  id: string;
  roman: string;
  kicker: string;
  headline: React.ReactNode;
  intro?: React.ReactNode;
  closing?: React.ReactNode;
  tone?: "light" | "dark";
  children?: React.ReactNode;
}) {
  const isDark = tone === "dark";
  return (
    <section
      id={id}
      className={`relative scroll-mt-32 py-24 lg:py-32 ${isDark ? "bg-forest-deep text-cream" : "bg-ivory text-forest-deep"}`}
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <header className="lg:col-span-5">
            <ChapterLabel roman={roman} kicker={kicker} tone={tone} />
            <h2
              className={`mt-8 font-serif-display ${isDark ? "text-cream" : "text-forest-deep"}`}
              style={{
                fontSize: "clamp(2rem, 3.8vw, 3.2rem)",
                lineHeight: 1.1,
                fontWeight: 500,
                letterSpacing: "-0.005em",
              }}
            >
              {headline}
            </h2>
          </header>
          {intro && (
            <div
              className={`space-y-5 lg:col-span-6 lg:col-start-7 ${isDark ? "text-cream/80" : "text-forest-deep/75"}`}
              style={{ fontSize: "1.02rem", lineHeight: 1.8, maxWidth: "38rem" }}
            >
              {intro}
            </div>
          )}
        </div>

        {children && <div className="mt-16 lg:mt-24">{children}</div>}

        {closing && (
          <div
            className={`mt-20 max-w-2xl border-l border-gold/40 pl-6 font-serif-display italic ${
              isDark ? "text-gold-soft/90" : "text-gold-deep/85"
            }`}
            style={{ fontSize: "1.35rem", lineHeight: 1.5 }}
          >
            {closing}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chapter I — Proč právě pět                                                */
/* -------------------------------------------------------------------------- */

function ChapterOne() {
  const [active, setActive] = useState(0);
  return (
    <ChapterShell
      id="kapitola-1"
      roman="I"
      kicker="Kapitola"
      headline={<>Proč právě pět</>}
      intro={
        <>
          <p
            className="font-serif-display italic text-forest-deep/90"
            style={{ fontSize: "1.3rem", lineHeight: 1.55 }}
          >
            V čísle pět jsme objevili přirozený řád.
          </p>
          <p>
            V člověku, přírodě i každodenním životě se některé věci neustále vracejí ve vzájemných
            souvislostech.
          </p>
          <p>
            Pět bodů vytváří celek. Pět smyslů proměňuje okamžik v prožitek. Pět vnitřních sil
            utváří přirozený rytmus. Pět pilířů drží směr značky. Pět oblastí ekosystému propojuje
            rozdílné zkušenosti v jednu vizi.
          </p>
          <p>
            PENTARIVA vnímá číslo pět jako připomínku, že skutečná rovnováha vzniká tehdy, když
            jednotlivé části začnou spolupracovat.
          </p>
        </>
      }
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <div
            className="relative w-full overflow-hidden lg:overflow-visible lg:origin-top-right lg:scale-[118%] lg:translate-x-[2%] lg:-mt-12"
            style={{ aspectRatio: "4 / 3" }}
          >
            <picture className="contents">
              <source
                type="image/avif"
                srcSet={editorialSrcSet("chapter-1", EDITORIAL_WIDTHS, "avif")}
                sizes="(min-width: 1024px) 60vw, calc(100vw - 3rem)"
              />
              <source
                type="image/webp"
                srcSet={editorialSrcSet("chapter-1", EDITORIAL_WIDTHS, "webp")}
                sizes="(min-width: 1024px) 60vw, calc(100vw - 3rem)"
              />
              <img
                src={chapterOneAsset.url}
                alt="Pracovní stůl zachycující vznik filozofie PENTARIVA – botanické studie, přírodní materiály a ruka propojující pět základních principů."
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                width={1122}
                height={1402}
              />
            </picture>
          </div>
          <p
            className="mt-8 max-w-2xl border-l border-gold/40 pl-6 font-serif-display italic text-gold-deep/85 lg:hidden"
            style={{ fontSize: "1.35rem", lineHeight: 1.5 }}
          >
            Pět samostatných částí. Jeden přirozený celek.
          </p>
        </div>
        <ul className="lg:col-span-5 space-y-1" role="list">
          {FIVE_PREVIEW.map((p, i) => {
            const isActive = i === active;
            return (
              <li key={p.label}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className="group flex w-full items-baseline gap-6 border-b border-gold/15 py-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep/60"
                  aria-expanded={isActive}
                >
                  <span
                    className={`font-serif-display transition-colors ${isActive ? "text-gold-deep" : "text-forest-deep/40 group-hover:text-gold-deep"}`}
                    style={{ fontSize: "1.15rem", letterSpacing: "0.14em" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <div
                      className={`font-sans text-[0.78rem] uppercase transition-colors ${isActive ? "text-forest-deep" : "text-forest-deep/60 group-hover:text-forest-deep"}`}
                      style={{ letterSpacing: "0.28em" }}
                    >
                      {p.label}
                    </div>
                    <div
                      className={`overflow-hidden font-serif-display italic text-forest-deep/70 transition-all duration-500 ${isActive ? "mt-2 max-h-24 opacity-100" : "max-h-0 opacity-0"}`}
                      style={{ fontSize: "1.05rem", lineHeight: 1.5 }}
                    >
                      {p.hint}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-36 hidden lg:grid lg:grid-cols-12">
        <p
          className="max-w-2xl border-l border-gold/40 pl-6 font-serif-display italic text-gold-deep/85 lg:col-span-7"
          style={{ fontSize: "1.35rem", lineHeight: 1.5 }}
        >
          Pět samostatných částí. Jeden přirozený celek.
        </p>
      </div>
    </ChapterShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chapter II — Pět bodů. Jeden člověk.                                       */
/* -------------------------------------------------------------------------- */

function ChapterTwo() {
  const [active, setActive] = useState(0);
  return (
    <ChapterShell
      id="kapitola-2"
      roman="II"
      kicker="Kapitola"
      tone="dark"
      headline={
        <>
          Pět bodů.
          <br />
          Jeden člověk.
        </>
      }
      intro={
        <>
          <p>Na člověka se nedíváme po částech.</p>
          <p>
            Věříme, že skutečná péče vzniká tehdy, když vnímáme souvislosti mezi tělem, myslí a
            každodenním životem.
          </p>
          <p>Proto tvoříme rovnováhu, která vydrží.</p>
        </>
      }
      closing={<>Nepečujeme o jednotlivé části. Pečujeme o člověka jako celek.</>}
    >
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="relative lg:col-span-7">
          <picture className="contents">
            <source
              type="image/avif"
              srcSet={editorialSrcSet("chapter-2", EDITORIAL_WIDTHS, "avif")}
              sizes="(min-width: 1024px) 58vw, calc(100vw - 3rem)"
            />
            <source
              type="image/webp"
              srcSet={editorialSrcSet("chapter-2", EDITORIAL_WIDTHS, "webp")}
              sizes="(min-width: 1024px) 58vw, calc(100vw - 3rem)"
            />
            <img
              src={chapterTwoAsset.url}
              alt="Žena stojící v klidném botanickém prostředí – vizuální vyjádření filozofie PENTARIVA: pět bodů, jeden člověk."
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              width={1122}
              height={1402}
            />
          </picture>
          {/* clean image container awaiting final photograph */}
        </div>

        <ul className="lg:col-span-5 space-y-1" role="list">
          {FIVE_POINTS.map((p, i) => {
            const isActive = i === active;
            return (
              <li key={p.label}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group flex w-full items-baseline gap-6 border-b border-gold-soft/20 py-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft/60"
                  aria-expanded={isActive}
                >
                  <span
                    className={`font-serif-display transition-colors ${isActive ? "text-gold-soft" : "text-cream/40 group-hover:text-gold-soft"}`}
                    style={{ fontSize: "1.15rem", letterSpacing: "0.14em" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <div
                      className={`font-sans text-[0.78rem] uppercase transition-colors ${isActive ? "text-cream" : "text-cream/60 group-hover:text-cream"}`}
                      style={{ letterSpacing: "0.28em" }}
                    >
                      {p.label}
                    </div>
                    <div
                      className={`hidden overflow-hidden font-serif-display italic text-cream/70 transition-all duration-500 md:block ${
                        isActive ? "mt-2 max-h-24 opacity-100" : "max-h-0 opacity-0"
                      }`}
                      style={{ fontSize: "1.05rem", lineHeight: 1.5 }}
                    >
                      {p.body}
                    </div>
                    <div
                      className="mt-2 max-h-24 opacity-100 font-serif-display italic text-cream/70 md:hidden"
                      style={{ fontSize: "1.05rem", lineHeight: 1.5 }}
                    >
                      {p.body}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </ChapterShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chapter III — Pět smyslů. Jeden prožitek.                                  */
/* -------------------------------------------------------------------------- */

function ProductAudioPreview() {
  return (
    <div className="border border-forest-deep/12 bg-ivory-warm/50 p-6 lg:p-8">
      <div className="flex flex-col gap-1">
        <span
          className="text-[0.68rem] uppercase text-gold-deep/70"
          style={{ letterSpacing: "0.28em" }}
        >
          Zvuková krajina PENTARIVA
        </span>
        <span
          className="font-serif-display text-forest-deep/70 italic"
          style={{ fontSize: "1rem" }}
        >
          Pět smyslů. Jeden dech.
        </span>
      </div>

      <div className="mt-6 grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-x-4 gap-y-5 sm:flex sm:gap-5">
        <button
          type="button"
          disabled
          className="flex h-12 w-12 cursor-default items-center justify-center rounded-full border border-forest-deep/30 bg-ivory text-forest-deep/65"
          aria-label="Přehrávač zvukové krajiny Pět smyslů. Jeden dech."
        >
          <Play className="h-5 w-5 translate-x-[1px]" />
        </button>

        <div className="flex-1">
          <div className="h-[2px] w-full bg-forest-deep/10">
            <div
              className="h-full bg-gold-deep/70 transition-[width]"
              style={{ width: "0%" }}
              aria-hidden
            />
          </div>
          <div
            className="mt-2 flex justify-between font-sans text-[0.7rem] text-forest-deep/60"
            style={{ letterSpacing: "0.12em" }}
          >
            <span>0:00</span>
            <span>0:00</span>
          </div>
        </div>

        <label className="col-span-2 ml-auto flex items-center gap-2 text-forest-deep/60 sm:col-auto">
          <Volume2 className="h-4 w-4" aria-hidden />
          <span className="sr-only">Hlasitost</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={0.7}
            disabled
            readOnly
            className="h-1 w-20 cursor-default accent-gold-deep opacity-65"
            aria-label="Hlasitost"
          />
        </label>
      </div>

      <audio preload="none" aria-label="Přehrávač zvukové krajiny PENTARIVA." />
    </div>
  );
}

function ChapterThree() {
  return (
    <ChapterShell
      id="kapitola-3"
      roman="III"
      kicker="Kapitola"
      headline={
        <>
          Pět smyslů.
          <br />
          Jeden prožitek.
        </>
      }
      intro={
        <>
          <p>Každý den vnímáme svět očima, sluchem, čichem, chutí i dotykem.</p>
          <p>
            Teprve když všechny smysly spolupracují, vzniká skutečný prožitek — okamžik, který nás
            propojuje s okolím i se sebou samými.
          </p>
        </>
      }
      closing={<>Skutečnou rovnováhu cítíme.</>}
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          <picture className="contents">
            <source
              type="image/avif"
              srcSet={editorialSrcSet("chapter-3", EDITORIAL_WIDTHS, "avif")}
              sizes="(min-width: 1024px) 45vw, calc(100vw - 3rem)"
            />
            <source
              type="image/webp"
              srcSet={editorialSrcSet("chapter-3", EDITORIAL_WIDTHS, "webp")}
              sizes="(min-width: 1024px) 45vw, calc(100vw - 3rem)"
            />
            <img
              src={CHAPTER_III_IMAGE}
              alt="Ruce připravující bylinný nápoj nad hřejícím keramickým hrnkem, s čerstvými bylinkami a botanickým deníkem na dřevěném stole v teplém redakčním světle."
              className="relative block h-auto w-full max-w-none object-cover lg:w-[108%]"
              style={{ aspectRatio: "4 / 5" }}
              loading="lazy"
              decoding="async"
              width={1122}
              height={1402}
            />
          </picture>
        </div>
        <div className="lg:col-span-7">
          <ul className="divide-y divide-gold/15 border-y border-gold/15 lg:ml-6" role="list">
            {SENSES.map((s, i) => (
              <li key={s.label} className="grid grid-cols-[3.5rem_1fr] gap-6 py-6">
                <span
                  className="font-serif-display text-gold-deep/70"
                  style={{ fontSize: "1.1rem", letterSpacing: "0.14em" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div
                    className="font-sans text-[0.78rem] uppercase text-forest-deep"
                    style={{ letterSpacing: "0.3em" }}
                  >
                    {s.label}
                  </div>
                  <p
                    className="mt-2 text-forest-deep/75"
                    style={{ fontSize: "1rem", lineHeight: 1.75, maxWidth: "38rem" }}
                  >
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <ProductAudioPreview />
          </div>
        </div>
      </div>
    </ChapterShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chapter IV — Pět vnitřních sil.                                            */
/* -------------------------------------------------------------------------- */

function ChapterFour() {
  return (
    <ChapterShell
      id="kapitola-4"
      roman="IV"
      kicker="Kapitola"
      tone="dark"
      headline={
        <>
          Pět vnitřních sil.
          <br />
          Jeden přirozený rytmus.
        </>
      }
      intro={
        <>
          <p>
            Uvnitř člověka se každý den setkává to, co si myslíme, jak dýcháme, kde nacházíme svůj
            střed, jak se pohybujeme a jak dokážeme obnovovat vlastní sílu.
          </p>
          <p>Všech pět oblastí společně vytváří rytmus, ve kterém žijeme.</p>
        </>
      }
      closing={<>Rovnováha je plynulý pohyb v souladu se sebou.</>}
    >
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div
            className="relative w-full overflow-hidden bg-forest-deep/60 ring-1 ring-inset ring-gold-soft/15"
            style={{ aspectRatio: "3 / 4" }}
          >
            <picture className="contents">
              <source
                type="image/avif"
                srcSet={editorialSrcSet("chapter-4", EDITORIAL_WIDTHS, "avif")}
                sizes="(min-width: 1024px) 50vw, calc(100vw - 3rem)"
              />
              <source
                type="image/webp"
                srcSet={editorialSrcSet("chapter-4", EDITORIAL_WIDTHS, "webp")}
                sizes="(min-width: 1024px) 50vw, calc(100vw - 3rem)"
              />
              <img
                src={chapterFourImage.src}
                alt="Žena v klidném přirozeném postoji u otevřeného okna, obklopená živými bylinami, jako obraz mysli, dechu, středu, pohybu a obnovy."
                className="h-full w-full object-cover object-center"
                loading="lazy"
                decoding="async"
                width={1122}
                height={1402}
              />
            </picture>
          </div>
        </div>
        <ol className="lg:col-span-6 space-y-8" role="list">
          {INNER_FORCES.map((f, i) => (
            <li
              key={f.label}
              className="grid grid-cols-[3.5rem_1fr] gap-6 border-l border-gold-soft/25 pl-6"
            >
              <span
                className="font-serif-display text-gold-soft/70"
                style={{ fontSize: "1.15rem", letterSpacing: "0.14em" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div
                  className="font-sans text-[0.78rem] uppercase text-cream"
                  style={{ letterSpacing: "0.3em" }}
                >
                  {f.label}
                </div>
                <p
                  className="mt-2 font-serif-display italic text-cream/80"
                  style={{ fontSize: "1.15rem", lineHeight: 1.55, maxWidth: "32rem" }}
                >
                  {f.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div
        className="mx-auto mt-20 max-w-3xl text-cream/75"
        style={{ fontSize: "1.02rem", lineHeight: 1.85 }}
      >
        <p>
          PENTARIVA vnímá rovnováhu jako živý proces — citlivou souhru každodenních rozhodnutí, péče
          a pozornosti, kterou věnujeme sami sobě.
        </p>
      </div>
    </ChapterShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chapter V — Pět pilířů. Jedna značka.                                      */
/* -------------------------------------------------------------------------- */

function PillarSystemGraphic({
  active,
  onChange,
}: {
  active: number;
  onChange: (index: number) => void;
}) {
  const polygonPoints = PILLAR_POSITIONS.map(({ x, y }) => `${x},${y}`).join(" ");

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[30rem] select-none"
      aria-label="Pět pilířů značky PENTARIVA"
    >
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r="41"
          stroke="currentColor"
          strokeWidth="0.3"
          className="text-gold/25"
        />
        <polygon
          points={polygonPoints}
          stroke="currentColor"
          strokeWidth="0.55"
          className="text-gold-deep/35"
        />
        {PILLAR_POSITIONS.map(({ x, y }, index) => (
          <g key={`${x}-${y}`}>
            <line
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth={index === active ? "0.9" : "0.38"}
              className={`transition-all duration-700 motion-reduce:transition-none ${
                index === active ? "text-gold-deep/90" : "text-gold/25"
              }`}
            />
            <circle
              cx={x}
              cy={y}
              r={index === active ? "2.1" : "1.35"}
              fill="currentColor"
              className={`transition-all duration-700 motion-reduce:transition-none ${
                index === active ? "text-gold-deep" : "text-gold/55"
              }`}
            />
          </g>
        ))}
        <circle
          cx="50"
          cy="50"
          r="19.5"
          stroke="currentColor"
          strokeWidth="0.45"
          className="text-gold/35"
        />
        <circle
          cx="50"
          cy="50"
          r="17.5"
          stroke="currentColor"
          strokeWidth="0.25"
          className="text-gold/20"
        />
      </svg>

      <div className="absolute left-1/2 top-1/2 flex h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-gold/30 bg-ivory/95 px-3 text-center">
        <img
          src={pentarivaEmblemAsset.url}
          alt=""
          aria-hidden="true"
          className="w-[68%] mix-blend-multiply"
          loading="lazy"
          decoding="async"
        />
        <span
          className="mt-1 text-[0.48rem] uppercase text-gold-deep/70 sm:text-[0.56rem]"
          style={{ letterSpacing: "0.28em" }}
        >
          Principy
        </span>
        <span
          className="mt-1 font-serif-display text-forest-deep"
          style={{ fontSize: "clamp(0.7rem, 2vw, 1rem)", letterSpacing: "0.12em" }}
        >
          PENTARIVA
        </span>
      </div>

      {PILLARS.map((pillar, index) => {
        const position = PILLAR_POSITIONS[index];
        const isActive = index === active;

        return (
          <button
            key={pillar.label}
            type="button"
            onClick={() => onChange(index)}
            onMouseEnter={() => onChange(index)}
            onFocus={() => onChange(index)}
            className={`absolute min-w-[4.5rem] -translate-x-1/2 -translate-y-1/2 border px-2 py-2 text-[0.5rem] uppercase transition-all duration-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep/60 motion-reduce:transition-none sm:min-w-[6rem] sm:px-3 sm:text-[0.62rem] ${
              isActive
                ? "border-forest-deep bg-forest-deep text-cream"
                : "border-gold/35 bg-ivory/95 text-forest-deep/60 hover:border-gold-deep/60 hover:text-forest-deep"
            }`}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              letterSpacing: "0.18em",
            }}
            aria-pressed={isActive}
          >
            {pillar.label}
          </button>
        );
      })}
    </div>
  );
}

function ChapterFive() {
  const [active, setActive] = useState(0);
  return (
    <ChapterShell
      id="kapitola-5"
      roman="V"
      kicker="Kapitola"
      headline={
        <>
          Pět pilířů.
          <br />
          Jedna značka.
        </>
      }
      intro={
        <>
          <p>
            PENTARIVA stojí na <InlineLink href="/svet-pentariva/hodnoty">pěti pilířích</InlineLink>
            , které společně určují její směr.
          </p>
          <p>
            Stojí na pěti pilířích, které určují, jak přemýšlíme, jak tvoříme a jak budujeme vztahy.
          </p>
        </>
      }
      closing={<>Pět pilířů. Každý má vlastní úlohu. Skutečnou hodnotu však vytvářejí společně.</>}
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <PillarSystemGraphic active={active} onChange={setActive} />
        </div>

        <div className="lg:col-span-7">
          <div className="flex flex-wrap gap-2">
            {PILLARS.map((p, i) => {
              const isActive = i === active;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`border px-4 py-2 text-[0.7rem] uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep/60 ${
                    isActive
                      ? "border-forest-deep bg-forest-deep text-cream"
                      : "border-forest-deep/25 text-forest-deep/70 hover:border-forest-deep/60 hover:text-forest-deep"
                  }`}
                  style={{ letterSpacing: "0.24em" }}
                  aria-pressed={isActive}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 min-h-[10rem] border-t border-gold/25 pt-8">
            <div
              className="font-serif-display text-forest-deep"
              style={{ fontSize: "1.6rem", letterSpacing: "0.06em" }}
            >
              {PILLARS[active].label}
            </div>
            <p
              className="mt-4 text-forest-deep/75"
              style={{ fontSize: "1.05rem", lineHeight: 1.8, maxWidth: "38rem" }}
            >
              {PILLARS[active].body}
            </p>
          </div>
        </div>
      </div>
    </ChapterShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chapter VI — Jedna PENTARIVA                                               */
/* -------------------------------------------------------------------------- */

function BusinessProfileDownload() {
  return (
    <div className="flex flex-col items-start gap-3">
      <a
        href="/downloads/PENTARIVA-Business-Profile.pdf"
        download="PENTARIVA - Business Profile.pdf"
        type="application/pdf"
        className="group inline-flex items-center gap-3 border border-forest-deep bg-transparent px-7 py-4 text-[0.72rem] uppercase text-forest-deep transition-colors hover:bg-forest-deep hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep/60"
        style={{ letterSpacing: "0.24em" }}
      >
        <Download className="h-4 w-4" />
        Stáhnout firemní profil
      </a>
      <span
        className="text-[0.62rem] uppercase text-gold-deep/70"
        style={{ letterSpacing: "0.28em" }}
      >
        PDF · 14 stran · 3,1 MB
      </span>
    </div>
  );
}

function ChapterSeven() {
  const lines = ["Pět bodů.", "Pět smyslů.", "Pět vnitřních sil.", "Pět pilířů.", "Pět oblastí ekosystému."];
  return (
    <ChapterShell
      id="kapitola-6"
      roman="VI"
      kicker="Kapitola"
      headline={<>Jedna PENTARIVA</>}
      intro={
        <>
          <p>
            Šest kapitol odhaluje různé části{" "}
            <InlineLink href="/svet-pentariva/pribeh">jednoho příběhu</InlineLink>.
          </p>
          <p>
            Člověka, jeho smysly, vnitřní síly a{" "}
            <InlineLink href="/svet-pentariva/hodnoty">hodnoty značky</InlineLink>, které dávají
            celému ekosystému společný směr.
          </p>
          <p>Každá část má vlastní význam. Teprve společně však vytvářejí svět PENTARIVA.</p>
        </>
      }
    >
      <div className="mx-auto max-w-4xl py-10 text-center">
        <ul className="space-y-3" role="list">
          {lines.map((l) => (
            <li
              key={l}
              className="font-serif-display text-forest-deep/60"
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                letterSpacing: "0.02em",
                lineHeight: 1.25,
              }}
            >
              {l}
            </li>
          ))}
        </ul>
        <div className="my-10 mx-auto h-px w-24 bg-gold/40" aria-hidden />
        <p
          className="font-serif-display text-forest-deep"
          style={{
            fontSize: "clamp(2.6rem, 6vw, 4.8rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.005em",
            fontWeight: 500,
          }}
        >
          Jedna PENTARIVA.
        </p>
      </div>

      <div
        className="mx-auto mt-16 max-w-3xl space-y-5 text-forest-deep/75"
        style={{ fontSize: "1.05rem", lineHeight: 1.8 }}
      >
        <p>
          PENTARIVA je živý ekosystém, který propojuje přírodu, člověka,{" "}
          <InlineLink href="/svet-pentariva/veda-a-vyvoj">poznání</InlineLink>, péči a dlouhodobou
          vizi.
        </p>
        <p>
          PENTARIVA je otevřený prostor, který se rozvíjí spolu s lidmi,{" "}
          <InlineLink href="/svet-pentariva/kvalita">kvalitou produktů</InlineLink>, partnery a
          zkušenostmi, jež do něj vstupují.
        </p>
        <p>
          Ověřené dokumenty, fotografie a redakční souvislosti zpřístupňuje{" "}
          <InlineLink href="/svet-pentariva/pro-media">mediální centrum PENTARIVA</InlineLink>.
        </p>
      </div>

      <div className="mt-14 flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
        <a
          href="/"
          className="group inline-flex items-center gap-3 border border-forest-deep bg-forest-deep px-8 py-4 text-[0.72rem] uppercase text-cream transition-colors hover:bg-forest"
          style={{ letterSpacing: "0.24em" }}
        >
          Poznat ekosystém
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
        <BusinessProfileDownload />
      </div>

      <p
        className="mt-20 border-t border-gold/25 pt-10 text-center font-serif-display italic text-gold-deep/85"
        style={{ fontSize: "1.35rem", lineHeight: 1.6 }}
      >
        Šest kapitol. Pět principů. Jeden živý ekosystém.
      </p>
    </ChapterShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Final editorial transition                                                */
/* -------------------------------------------------------------------------- */

function EditorialClosing() {
  return (
    <section className="bg-ivory-warm/60 py-24 lg:py-32">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-12">
        <div
          className="relative w-full overflow-hidden bg-ivory-warm/70 ring-1 ring-inset ring-gold/15"
          style={{ aspectRatio: "21 / 9" }}
        >
          <picture className="contents">
            <source
              type="image/avif"
              srcSet={editorialSrcSet("closing", CLOSING_WIDTHS, "avif")}
              sizes="(min-width: 1100px) 1000px, calc(100vw - 3rem)"
            />
            <source
              type="image/webp"
              srcSet={editorialSrcSet("closing", CLOSING_WIDTHS, "webp")}
              sizes="(min-width: 1100px) 1000px, calc(100vw - 3rem)"
            />
            <img
              src={botanicalClosingImage.src}
              alt="Tichý evropský botanický ateliér s otevřeným herbářem, šálkem, pěti bylinami a oknem do živé zahrady."
              className="h-full w-full object-cover object-center"
              loading="lazy"
              decoding="async"
              width={1915}
              height={821}
            />
          </picture>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function SvetPentarivaV2Page() {
  return (
    <div className="min-h-screen bg-ivory text-forest-deep">
      <Header solidAtTop />
      <main>
        <WorldHero />
        <ChapterNavigation />
        <ChapterOne />
        <ChapterTwo />
        <ChapterThree />
        <ChapterFour />
        <ChapterFive />
        <ChapterSeven />
        <EditorialClosing />
      </main>
      <Footer />
    </div>
  );
}
