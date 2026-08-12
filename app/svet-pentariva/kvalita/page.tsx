"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  Check,
  ClipboardList,
  Droplets,
  Factory,
  Files,
  Leaf,
  MapPin,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import craftImage from "@/assets/svet-craft.webp";
import ecosystemImage from "@/assets/svet-ekosystem-quality-pentariva-logo.webp";
import { GoldOrnament } from "@/components/pentariva/GoldOrnament";
import {
  ConceptNotice,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/pentariva/PublicPage";

type QualityLayer = {
  number: string;
  shortTitle: string;
  title: string;
  body: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

const QUALITY_LAYERS: readonly QualityLayer[] = [
  {
    number: "01",
    shortTitle: "Suroviny",
    title: "Výběr surovin",
    body: "Surovina vstupuje do receptury s určenou identitou, vlastnostmi, požadovanou kvalitou a jasnou rolí.",
    icon: Leaf,
  },
  {
    number: "02",
    shortTitle: "Původ",
    title: "Původ a dohledatelnost",
    body: "Informace o původu, dodavatelské cestě a specifikaci vytvářejí základ pro odpovědné rozhodování.",
    icon: MapPin,
  },
  {
    number: "03",
    shortTitle: "Voda",
    title: "Čistota vody",
    body: "Voda získává vlastní připravovaný standard kvality, úpravy a dokumentace podle svého použití ve výrobním procesu.",
    icon: Droplets,
  },
  {
    number: "04",
    shortTitle: "Výroba",
    title: "Výrobní proces",
    body: "Definované vstupy, postupy, odpovědnosti a kontrolní body převádějí recepturu do opakovatelné výroby.",
    icon: Factory,
  },
  {
    number: "05",
    shortTitle: "Dokumentace",
    title: "Dokumentace",
    body: "Specifikace, výrobní záznamy a schválené informace udržují souvislost mezi záměrem a výsledkem.",
    icon: Files,
  },
  {
    number: "06",
    shortTitle: "Bezpečnost",
    title: "Bezpečnost",
    body: "Složení, způsob použití, upozornění a hranice komunikace odpovídají konkrétní kategorii produktu.",
    icon: ShieldCheck,
  },
  {
    number: "07",
    shortTitle: "Komunikace",
    title: "Transparentní komunikace",
    body: "Veřejné informace vyjadřují skutečný stav produktu, dostupné podklady a platný rozsah tvrzení.",
    icon: MessageSquareText,
  },
  {
    number: "08",
    shortTitle: "Rozvoj",
    title: "Zpětná vazba a rozvoj",
    body: "Poznatky z používání, poradenství a partnerské praxe vstupují zpět do vývoje, vzdělávání a komunikace. Každý podnět zpřesňuje další rozhodnutí v celém řetězci.",
    icon: RefreshCw,
  },
] as const;

const QUALITY_GATE = [
  {
    number: "01",
    title: "Specifikovat",
    body: "Přesně určit požadavek, identitu a roli vstupu.",
  },
  {
    number: "02",
    title: "Doložit",
    body: "Připojit dokumentaci odpovídající původu a kategorii.",
  },
  {
    number: "03",
    title: "Zpracovat",
    body: "Dodržet schválený výrobní postup a jeho kontrolní body.",
  },
  {
    number: "04",
    title: "Ověřit",
    body: "Posoudit shodu výsledku se stanoveným zadáním.",
  },
  {
    number: "05",
    title: "Komunikovat",
    body: "Předat člověku přesné, srozumitelné a platné informace.",
  },
] as const;

const INFINITY_POSITIONS = [
  { left: "40%", top: "50%" },
  { left: "28%", top: "18%" },
  { left: "5%", top: "50%" },
  { left: "28%", top: "82%" },
  { left: "60%", top: "50%" },
  { left: "72%", top: "18%" },
  { left: "95%", top: "50%" },
  { left: "72%", top: "82%" },
] as const;

function useSequentialWalkthrough(itemCount: number, delay: number) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const selectIndex = (index: number) => {
    stop();
    setActiveIndex(index);
  };

  useEffect(() => {
    const container = containerRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!container || reducedMotion || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;

        startedRef.current = true;
        setActiveIndex(0);
        let step = 0;

        timerRef.current = setInterval(() => {
          step += 1;

          if (step >= itemCount) {
            stop();
            return;
          }

          setActiveIndex(step);
        }, delay);

        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      stop();
    };
  }, [delay, itemCount]);

  return { activeIndex, containerRef, selectIndex };
}

function QualityInfinitySystem() {
  const { activeIndex, containerRef, selectIndex } = useSequentialWalkthrough(
    QUALITY_LAYERS.length,
    1350,
  );
  const activeLayer = QUALITY_LAYERS[activeIndex];
  const ActiveIcon = activeLayer.icon;

  return (
    <div ref={containerRef} className="mt-16">
      <div className="grid gap-px bg-gold/15 sm:grid-cols-2 lg:hidden">
        {QUALITY_LAYERS.map(({ number, shortTitle, title, icon: Icon }, index) => {
          const isActive = activeIndex === index;

          return (
            <button
              key={number}
              type="button"
              aria-pressed={isActive}
              aria-controls="quality-layer-detail"
              onClick={() => selectIndex(index)}
              className={`flex min-h-36 items-center gap-5 p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold ${
                isActive ? "bg-gold text-forest-deep" : "bg-forest-deep text-cream"
              }`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${
                  isActive ? "border-forest-deep/25" : "border-gold/35 text-gold"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.2} />
              </span>
              <span>
                <span className="block text-[0.56rem] uppercase tracking-[0.2em] opacity-70">
                  {number} · {shortTitle}
                </span>
                <span className="mt-2 block font-serif-display text-xl leading-tight">{title}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="relative mx-auto hidden aspect-[2.75/1] w-full max-w-[1180px] lg:block"
        aria-label="Osm propojených vrstev kvality ve tvaru nekonečna"
      >
        <div aria-hidden className="absolute bottom-[18%] left-[3%] top-[18%] w-[49%] rounded-[50%] border-[1.5px] border-gold/38" />
        <div aria-hidden className="absolute bottom-[18%] right-[3%] top-[18%] w-[49%] rounded-[50%] border-[1.5px] border-gold/38" />

        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-14 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center border-y border-gold/30 bg-forest-deep text-center">
          <span className="font-serif-display text-3xl leading-none text-gold/55">∞</span>
          <span className="mt-0.5 text-[0.45rem] uppercase tracking-[0.24em] text-gold/70">
            Kvalita
          </span>
        </div>

        {QUALITY_LAYERS.map(({ number, shortTitle, title, icon: Icon }, index) => {
          const isActive = activeIndex === index;
          const isVisited = index < activeIndex;
          const position = INFINITY_POSITIONS[index];

          return (
            <button
              key={number}
              type="button"
              aria-pressed={isActive}
              aria-controls="quality-layer-detail"
              aria-label={`${number} ${title}: zobrazit podrobnosti`}
              onClick={() => selectIndex(index)}
              onMouseEnter={() => selectIndex(index)}
              onFocus={() => selectIndex(index)}
              className={`absolute z-20 flex h-28 w-28 flex-col items-center justify-center rounded-full border text-center transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-forest-deep xl:h-32 xl:w-32 ${
                isActive
                  ? "border-gold bg-gold text-forest-deep shadow-[0_14px_34px_rgba(0,0,0,0.2)]"
                  : isVisited
                    ? "border-gold/75 bg-gold/8 text-gold"
                    : "border-gold/42 bg-forest-deep text-gold hover:border-gold/80 hover:bg-forest-light"
              }`}
              style={{
                left: position.left,
                top: position.top,
                transform: `translate(-50%, -50%) scale(${isActive ? 1.06 : 1})`,
              }}
            >
              <Icon className="h-6 w-6 xl:h-7 xl:w-7" strokeWidth={1.2} />
              <span className="mt-2.5 text-[0.6rem] font-medium uppercase tracking-[0.13em] xl:text-[0.66rem]">
                {number} · {shortTitle}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="quality-layer-detail"
        aria-live="polite"
        className="mx-auto mt-10 max-w-5xl border-y border-gold/20 py-7"
      >
        <div
          key={activeLayer.number}
          className="ecosystem-content-enter grid items-center gap-6 md:grid-cols-[auto_0.72fr_1.28fr] md:gap-10"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/35 text-gold">
            <ActiveIcon className="h-6 w-6" strokeWidth={1.2} />
          </div>
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-gold/70">
              Vrstva {activeLayer.number} · {activeLayer.shortTitle}
            </p>
            <h3 className="mt-2 font-serif-display text-2xl text-cream md:text-3xl">
              {activeLayer.title}
            </h3>
          </div>
          <p className="text-sm leading-[1.8] text-cream/68">{activeLayer.body}</p>
        </div>
      </div>
    </div>
  );
}

function QualityGateTimeline() {
  return (
    <div className="relative mt-16">
      <span
        aria-hidden
        className="absolute left-[10%] right-[10%] top-8 hidden h-px bg-gold-deep/24 lg:block"
      />
      <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
        {QUALITY_GATE.map((step) => (
          <li
            key={step.number}
            tabIndex={0}
            className="group relative border border-forest-deep/10 bg-ivory p-6 transition-colors duration-300 hover:border-gold-deep/30 hover:bg-ivory-warm focus:bg-ivory-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep lg:border-0 lg:bg-transparent lg:px-5 lg:text-center"
          >
            <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-gold-deep/32 bg-ivory font-serif-display text-lg text-gold-deep transition-colors duration-300 group-hover:border-gold-deep group-hover:bg-gold-deep group-hover:text-ivory group-focus:border-gold-deep group-focus:bg-gold-deep group-focus:text-ivory lg:mx-auto">
              {step.number}
            </span>
            <h3 className="mt-7 font-serif-display text-2xl text-forest-deep transition-colors duration-300 group-hover:text-gold-deep group-focus:text-gold-deep">
              {step.title}
            </h3>
            <p className="mt-4 text-sm leading-[1.75] text-ink/64">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}


export default function QualityPage() {
  return (
    <PublicPage className="bg-ivory text-ink">
      <section className="relative overflow-hidden bg-ivory text-forest-deep">
        <div className="mx-auto grid min-h-[740px] max-w-[1720px] lg:grid-cols-[0.88fr_1.12fr]">
          <div className="relative z-10 flex flex-col justify-center px-6 py-20 lg:px-12 lg:py-28 xl:px-20">
            <GoldOrnament className="text-gold-deep" width={136} />
            <p className="mt-9 text-eyebrow text-gold-deep" style={{ letterSpacing: "0.32em" }}>
              Kvalita PENTARIVA
            </p>
            <h1
              className="mt-6 max-w-3xl font-serif-display text-forest-deep"
              style={{ fontSize: "clamp(3rem, 5.8vw, 6.1rem)", lineHeight: 0.96 }}
            >
              Kvalita vzniká v každém rozhodnutí.
            </h1>
            <p className="mt-8 max-w-xl font-serif-display text-2xl leading-snug text-gold-deep sm:text-3xl">
              Od původu suroviny až po poslední větu na etiketě.
            </p>
            <p className="mt-7 max-w-xl text-base leading-[1.85] text-ink/68">
              Standard PENTARIVA propojuje pečlivý výběr, dohledatelnost, dokumentovaný proces,
              bezpečnost a přesnou komunikaci do jednoho souvislého systému.
            </p>
            <a
              href="#vrstvy-kvality"
              className="mt-10 inline-flex w-fit items-center gap-3 border border-forest-deep px-6 py-4 text-[0.68rem] uppercase text-forest-deep transition-colors hover:bg-forest-deep hover:text-cream"
              style={{ letterSpacing: "0.22em" }}
            >
              Poznat vrstvy kvality
              <span aria-hidden>↓</span>
            </a>
          </div>

          <figure className="relative min-h-[500px] overflow-hidden lg:min-h-[740px]">
            <img
              src={craftImage.src}
              width={2528}
              height={1696}
              fetchPriority="high"
              alt="Pečlivé ruční zpracování čerstvých bylin v prostředí PENTARIVA."
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[35%] bg-gradient-to-r from-ivory via-ivory/75 to-transparent lg:block" />
            <figcaption className="absolute bottom-7 right-7 border border-gold/30 bg-forest-deep/88 px-5 py-4 text-right text-cream shadow-xl backdrop-blur-sm">
              <span
                className="block text-[0.58rem] uppercase text-gold"
                style={{ letterSpacing: "0.24em" }}
              >
                Původ · proces · odpovědnost
              </span>
              <span className="mt-1.5 block font-serif-display text-2xl">Standard PENTARIVA</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section
        id="vrstvy-kvality"
        className="scroll-mt-24 bg-forest-deep py-24 text-cream lg:py-32"
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <SectionHeading
                eyebrow="Osm vrstev"
                title="Kvalita drží celý řetězec pohromadě."
                body="Osm vrstev propojuje původ, proces, ověření a zkušenost do souvislého cyklu. Každá vrstva zpřesňuje rozhodnutí, které následuje." 
                dark
              />
            </div>
            <p className="text-sm leading-[1.8] text-cream/62 lg:col-span-4 lg:col-start-9">
              Konkrétní požadavky se zpřesňují podle kategorie produktu, použitých surovin,
              výrobního postupu a platných pravidel pro daný trh.
            </p>
          </div>

          <QualityInfinitySystem />
        </div>
      </section>

      <section className="relative overflow-hidden bg-ivory-warm py-24 lg:py-32">
        <div className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full border border-gold-deep/10" />
        <div className="mx-auto grid max-w-[1400px] gap-14 px-6 lg:grid-cols-12 lg:items-center lg:px-12">
          <div className="lg:col-span-5">
            <div className="flex items-end gap-4 text-gold-deep">
              <Droplets className="mb-2 h-9 w-9" strokeWidth={1.1} />
              <span
                className="font-serif-display text-[5.5rem] leading-none text-gold-deep/18 sm:text-[7rem]"
                aria-hidden
              >
                H₂O
              </span>
            </div>
            <p className="mt-7 text-eyebrow text-gold-deep" style={{ letterSpacing: "0.3em" }}>
              Připravovaný standard
            </p>
            <h2
              className="mt-5 font-serif-display text-forest-deep"
              style={{ fontSize: "clamp(2.7rem, 4.7vw, 5rem)", lineHeight: 0.98 }}
            >
              Čistota vody začíná přesně definovaným požadavkem.
            </h2>
          </div>

          <div className="space-y-6 text-base leading-[1.85] text-ink/70 lg:col-span-6 lg:col-start-7">
            <p>
              Voda vstupuje do úvah o výrobě jako základní surovina a nositel procesní čistoty.
              PENTARIVA připravuje vlastní požadavky na její kvalitu, způsob úpravy, použití a
              dokumentaci.
            </p>
            <p>
              Standard propojuje zdroj, technologický postup, kontrolní parametry a dohledatelný
              záznam. Přesný rozsah se přizpůsobuje konkrétnímu výrobku a jeho výrobnímu procesu.
            </p>
            <p>
              Parametry, technologické řešení a partnerské zapojení vstupují do veřejné komunikace
              po odborném ověření a smluvním potvrzení.
            </p>
            <div className="grid gap-3 border-t border-gold-deep/20 pt-7 sm:grid-cols-2">
              {[
                "Určený účel použití",
                "Popsaný způsob úpravy",
                "Kontrolní parametry",
                "Dohledatelná dokumentace",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-forest-deep/72">
                  <Check className="h-4 w-4 shrink-0 text-gold-deep" strokeWidth={1.5} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <SectionHeading
            eyebrow="Kontrolní brány"
            title="Každý krok potvrzuje připravenost dalšího."
            body="Pět kontrolních bran převádí kvalitu z obecného principu do konkrétního způsobu práce s materiály, procesy, dokumenty a informacemi."
          />

          <QualityGateTimeline />
        </div>
      </section>

      <section className="bg-ivory-warm py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1520px] gap-14 px-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center lg:gap-24 lg:px-12">
          <figure className="overflow-hidden bg-forest-deep/5">
            <img
              src={ecosystemImage.src}
              width={1451}
              height={1084}
              loading="lazy"
              decoding="async"
              alt="Rozmarýn, botanický zápis a dokumentace v pracovním prostředí PENTARIVA."
              className="aspect-[4/3] h-auto w-full object-cover"
            />
          </figure>

          <div>
            <p className="text-eyebrow text-gold-deep" style={{ letterSpacing: "0.3em" }}>
              Transparentnost
            </p>
            <h2
              className="mt-5 font-serif-display text-forest-deep"
              style={{ fontSize: "clamp(2.6rem, 4.5vw, 4.8rem)", lineHeight: 1 }}
            >
              Důvěra stojí na informaci, kterou lze ověřit.
            </h2>
            <div className="mt-8 space-y-5 text-base leading-[1.85] text-ink/70">
              <p>
                PENTARIVA komunikuje skutečný stav produktu, rozsah dostupných podkladů a platný
                rámec každého tvrzení. Stejný princip se promítá do etikety, webu, vzdělávání i
                osobního doporučení.
              </p>
              <p>
                Dokumentace chrání souvislost mezi původním záměrem, konkrétní výrobou a informací,
                kterou dostává člověk při každodenním používání.
              </p>
            </div>
            <div className="mt-10">
              <ConceptNotice title="Aktuální rozsah">
                Stránka popisuje metodické principy kvality. Konkrétní laboratorní hodnoty,
                certifikace a jména výrobních partnerů vstupují do veřejného obsahu ve chvíli, kdy
                jsou ověřené, platné a přiřazené ke konkrétnímu produktu nebo procesu.
              </ConceptNotice>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-forest-deep py-20 text-cream">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-8 px-6 lg:flex-row lg:items-center lg:px-12">
          <div className="flex items-center gap-5">
            <ClipboardList className="h-6 w-6 text-gold" strokeWidth={1.25} />
            <div>
              <p className="font-serif-display text-3xl text-cream sm:text-4xl">
                Kvalita navazuje na promyšlený vývoj.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-cream/62">
                Projděte celou cestu od suroviny k používání nebo otevřete redakční podklady.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-7">
            <TextLink href="/svet-pentariva/veda-a-vyvoj" dark>
              Věda a vývoj
            </TextLink>
            <TextLink href="/svet-pentariva/pro-media" dark>
              Pro média
            </TextLink>
            <TextLink href="/produkty" dark>
              Produktové koncepty
            </TextLink>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
