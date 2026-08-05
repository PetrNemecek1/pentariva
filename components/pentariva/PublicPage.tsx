import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { GoldOrnament } from "./GoldOrnament";

export function PublicPage({
  children,
  className = "bg-ivory text-ink",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen ${className}`}>
      <Header solidAtTop />
      <main className="pt-[68px]">{children}</main>
      <Footer />
    </div>
  );
}

export function EditorialHero({
  eyebrow,
  title,
  lead,
  status,
  dark = false,
}: {
  eyebrow: string;
  title: ReactNode;
  lead: ReactNode;
  status?: string;
  dark?: boolean;
}) {
  return (
    <section
      className={`relative overflow-hidden py-24 lg:py-32 ${
        dark ? "bg-forest-deep text-cream" : "bg-ivory text-forest-deep"
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-24 -top-32 h-[30rem] w-[30rem] rounded-full blur-3xl ${
          dark ? "bg-gold/5" : "bg-gold/8"
        }`}
      />
      <div className="relative mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-12 lg:px-12">
        <div className="lg:col-span-7">
          <GoldOrnament className={dark ? "text-gold" : "text-gold-deep"} width={130} />
          <p
            className={`mt-8 text-eyebrow ${dark ? "text-gold" : "text-gold-deep"}`}
            style={{ letterSpacing: "0.32em" }}
          >
            {eyebrow}
          </p>
          <h1
            className={`mt-6 font-serif-display ${dark ? "text-cream" : "text-forest-deep"}`}
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.8rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.015em",
            }}
          >
            {title}
          </h1>
        </div>
        <div className="flex flex-col justify-end lg:col-span-5">
          {status && (
            <span
              className={`mb-6 w-fit border px-4 py-2 text-[0.64rem] uppercase ${
                dark ? "border-gold/35 text-gold" : "border-gold-deep/25 text-gold-deep"
              }`}
              style={{ letterSpacing: "0.26em" }}
            >
              {status}
            </span>
          )}
          <div
            className={dark ? "text-cream/75" : "text-forest-deep/75"}
            style={{ fontSize: "1.05rem", lineHeight: 1.85 }}
          >
            {lead}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  centered = false,
  dark = false,
}: {
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  centered?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p
        className={dark ? "text-eyebrow text-gold" : "text-eyebrow text-gold-deep"}
        style={{ letterSpacing: "0.3em" }}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-5 font-serif-display ${dark ? "text-cream" : "text-forest-deep"}`}
        style={{
          fontSize: "clamp(2rem, 3.8vw, 3.35rem)",
          lineHeight: 1.08,
        }}
      >
        {title}
      </h2>
      {body && (
        <div
          className={`mt-6 ${dark ? "text-cream/70" : "text-ink/70"}`}
          style={{ fontSize: "1rem", lineHeight: 1.8 }}
        >
          {body}
        </div>
      )}
    </div>
  );
}

export function ConceptNotice({
  title,
  children,
  dark = false,
}: {
  title: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <aside
      className={`border-l px-6 py-5 ${
        dark
          ? "border-gold/55 bg-black/10 text-cream/75"
          : "border-gold-deep/45 bg-ivory-warm/70 text-forest-deep/75"
      }`}
    >
      <p
        className={dark ? "text-eyebrow text-gold" : "text-eyebrow text-gold-deep"}
        style={{ letterSpacing: "0.26em" }}
      >
        {title}
      </p>
      <div className="mt-3 text-sm leading-relaxed">{children}</div>
    </aside>
  );
}

export function TextLink({
  href,
  children,
  dark = false,
}: {
  href: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-2 border-b pb-1 text-[0.7rem] uppercase transition-colors ${
        dark
          ? "border-gold/45 text-gold hover:border-gold-soft hover:text-gold-soft"
          : "border-gold-deep/35 text-forest-deep hover:border-gold-deep hover:text-gold-deep"
      }`}
      style={{ letterSpacing: "0.22em" }}
    >
      {children}
      <ArrowRight
        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
        strokeWidth={1.5}
      />
    </a>
  );
}

export function InlineLink({
  href,
  children,
  dark = false,
}: {
  href: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <a
      href={href}
      className={`font-medium underline decoration-1 underline-offset-[0.22em] transition-colors ${
        dark
          ? "text-gold-soft decoration-gold/45 hover:text-gold hover:decoration-gold"
          : "text-forest-deep decoration-gold-deep/45 hover:text-gold-deep hover:decoration-gold-deep"
      }`}
    >
      {children}
    </a>
  );
}
