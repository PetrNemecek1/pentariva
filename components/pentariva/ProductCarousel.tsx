"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { GoldOrnament } from "./GoldOrnament";
import { PRODUCT_CONCEPTS } from "@/content/product-concepts";

// Interní placeholder data — připraveno pro pozdější napojení na backend / e-shop.
type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  price: string;
  image: string;
  badge?: string;
  href: string;
};

const PRODUCTS: Product[] = PRODUCT_CONCEPTS.map((product, index) => ({
  id: `p-0${index + 1}`,
  slug: product.slug,
  name: product.name,
  shortDescription: product.intention,
  price: "Ve vývoji",
  image: product.image,
  badge: "Koncept",
  href: `/produkty/${product.slug}`,
}));

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function ProductCarousel() {
  const reducedMotion = usePrefersReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    dragFree: false,
    duration: 32, // ~ 600–800ms smooth transition
  });

  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [pausedUntil, setPausedUntil] = React.useState(0);
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Pause autoplay temporarily after any manual interaction
  React.useEffect(() => {
    if (!emblaApi) return;
    const onPointerDown = () => setPausedUntil(Date.now() + 8000);
    const onSelect = () => setPausedUntil(Date.now() + 8000);
    emblaApi.on("pointerDown", onPointerDown);
    return () => {
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Autoplay
  React.useEffect(() => {
    if (!emblaApi || reducedMotion || !isDesktop) return;
    const interval = window.setInterval(() => {
      if (isHovered || isFocused) return;
      if (Date.now() < pausedUntil) return;
      emblaApi.scrollNext();
    }, 6000);
    return () => window.clearInterval(interval);
  }, [emblaApi, reducedMotion, isDesktop, isHovered, isFocused, pausedUntil]);

  const scrollPrev = React.useCallback(() => {
    emblaApi?.scrollPrev();
    setPausedUntil(Date.now() + 8000);
  }, [emblaApi]);
  const scrollNext = React.useCallback(() => {
    emblaApi?.scrollNext();
    setPausedUntil(Date.now() + 8000);
  }, [emblaApi]);

  return (
    <section className="relative bg-ivory py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="flex flex-col items-center text-center">
          <GoldOrnament className="text-gold-deep" width={140} />
          <h2
            className="mt-8 max-w-4xl font-serif-display text-forest-deep"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.1 }}
          >
            Produktové koncepty <span className="tracking-[0.04em]">PENTARIVA</span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink/70 sm:text-lg">
            Poznejte první koncepty vznikajícího portfolia. Jejich názvy, receptury i dostupnost
            právě rozvíjíme a každá karta transparentně ukazuje aktuální stav.
          </p>
        </div>

        <div
          className="relative mt-14"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsFocused(false);
            }
          }}
        >
          <div
            className="overflow-hidden"
            ref={emblaRef}
            aria-roledescription="carousel"
            aria-label="Doporučené produkty PENTARIVA"
          >
            <div className="flex -ml-5 touch-pan-y">
              {PRODUCTS.map((product, idx) => (
                <div
                  key={product.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${idx + 1} z ${PRODUCTS.length}: ${product.name}`}
                  className="min-w-0 shrink-0 grow-0 pl-5 basis-[85%] sm:basis-[55%] md:basis-[47%] lg:basis-[31%]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Předchozí produkt"
            className="absolute left-0 top-1/2 hidden -translate-x-2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ivory/90 p-2.5 text-forest-deep shadow-sm backdrop-blur transition-all duration-300 hover:border-gold hover:text-gold-deep hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold md:inline-flex lg:-translate-x-5"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Další produkt"
            className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-2 items-center justify-center rounded-full border border-gold/40 bg-ivory/90 p-2.5 text-forest-deep shadow-sm backdrop-blur transition-all duration-300 hover:border-gold hover:text-gold-deep hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold md:inline-flex lg:translate-x-5"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-14 flex justify-center">
          <a
            href="/produkty"
            className="group inline-flex items-center gap-2 border-b border-gold/40 pb-1 text-sm uppercase tracking-[0.18em] text-forest-deep transition-colors hover:border-gold hover:text-gold-deep"
          >
            Zobrazit všechny koncepty
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              strokeWidth={1.5}
            />
          </a>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <a
      href={product.href}
      className="group flex h-full flex-col overflow-hidden rounded-[18px] bg-cream ring-1 ring-forest-deep/8 shadow-[0_6px_20px_-12px_rgba(30,42,28,0.35)] transition-all duration-300 hover:shadow-[0_14px_30px_-14px_rgba(30,42,28,0.45)]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={900}
          height={1100}
          className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]"
        />
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-ivory/95 px-3 py-1 text-[10.5px] uppercase tracking-[0.18em] text-forest-deep ring-1 ring-gold/40">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 px-6 pb-6 pt-6">
        <h3
          className="font-serif-display text-forest-deep"
          style={{ fontSize: "1.35rem", lineHeight: 1.2 }}
        >
          {product.name}
        </h3>
        <p className="min-h-[2.75rem] text-[13.5px] leading-relaxed text-ink/70">
          {product.shortDescription}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-sm font-medium tracking-wide text-forest-deep">
            {product.price}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12.5px] uppercase tracking-[0.14em] text-forest-deep transition-colors group-hover:text-gold-deep">
            Detail produktu
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
              strokeWidth={1.5}
            />
          </span>
        </div>
      </div>
    </a>
  );
}
