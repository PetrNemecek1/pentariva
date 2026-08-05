import type { ReactNode } from "react";
import { Clock3, GraduationCap, ShieldCheck } from "lucide-react";

export type EducationTocItem = {
  id: string;
  label: string;
};

export function EducationEditorialFeature({
  image,
  imageSmall,
  alt,
  eyebrow,
  title,
  body,
  caption,
}: {
  image: string;
  imageSmall: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: ReactNode;
  caption: string;
}) {
  return (
    <section className="bg-ivory-warm py-14 lg:py-20">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-6 lg:grid-cols-12 lg:gap-16 lg:px-12">
        <figure className="lg:col-span-7">
          <div className="overflow-hidden bg-forest-deep/5">
            <img
              src={image}
              srcSet={`${imageSmall} 768w, ${image} 1536w`}
              sizes="(min-width: 1024px) 58vw, 100vw"
              width={1536}
              height={1024}
              loading="eager"
              decoding="async"
              alt={alt}
              className="aspect-[3/2] h-auto w-full object-cover"
            />
          </div>
          <figcaption
            className="mt-4 text-[0.62rem] uppercase text-forest-deep/50"
            style={{ letterSpacing: "0.22em" }}
          >
            {caption}
          </figcaption>
        </figure>

        <div className="lg:col-span-4 lg:col-start-9">
          <p className="text-eyebrow text-gold-deep" style={{ letterSpacing: "0.28em" }}>
            {eyebrow}
          </p>
          <h2
            className="mt-5 font-serif-display text-forest-deep"
            style={{ fontSize: "clamp(2rem, 3.8vw, 3.5rem)", lineHeight: 1.05 }}
          >
            {title}
          </h2>
          <div className="mt-6 space-y-4 text-base leading-[1.85] text-ink/72">{body}</div>
        </div>
      </div>
    </section>
  );
}

export function EducationMeta({
  readingTime,
  level = "Srozumitelný základ",
  review = "Redakční obsah PENTARIVA",
}: {
  readingTime: string;
  level?: string;
  review?: string;
}) {
  const items = [
    { icon: Clock3, label: "Čas", value: readingTime },
    { icon: GraduationCap, label: "Úroveň", value: level },
    { icon: ShieldCheck, label: "Standard", value: review },
  ];

  return (
    <div className="border-y border-forest-deep/10 bg-ivory-warm/55">
      <div className="mx-auto grid max-w-[1400px] gap-px bg-forest-deep/10 px-6 sm:grid-cols-3 lg:px-12">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 bg-ivory-warm px-5 py-5">
            <Icon className="h-4 w-4 shrink-0 text-gold-deep" strokeWidth={1.35} />
            <div>
              <p
                className="text-[0.58rem] uppercase text-gold-deep"
                style={{ letterSpacing: "0.22em" }}
              >
                {label}
              </p>
              <p className="mt-1 text-sm text-forest-deep/75">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EducationArticleLayout({
  toc,
  children,
}: {
  toc: readonly EducationTocItem[];
  children: ReactNode;
}) {
  return (
    <section className="bg-ivory py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-6 lg:grid-cols-12 lg:px-12">
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-28">
            <p className="text-eyebrow text-gold-deep" style={{ letterSpacing: "0.26em" }}>
              Obsah
            </p>
            <nav className="mt-6 border-l border-gold-deep/30" aria-label="Obsah stránky">
              {toc.map((item, index) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="group grid grid-cols-[2rem_1fr] gap-2 border-b border-forest-deep/8 py-3 pl-4 text-sm text-ink/60 transition-colors hover:text-forest-deep"
                >
                  <span className="font-serif-display text-gold-deep/70">0{index + 1}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </aside>
        <article className="min-w-0 lg:col-span-8 lg:col-start-5">{children}</article>
      </div>
    </section>
  );
}

export function EducationSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 border-b border-forest-deep/10 pb-14 pt-4 first:pt-0 last:border-b-0 last:pb-0"
    >
      {eyebrow && (
        <p className="text-[0.65rem] uppercase text-gold-deep" style={{ letterSpacing: "0.24em" }}>
          {eyebrow}
        </p>
      )}
      <h2
        className="mt-3 font-serif-display text-forest-deep"
        style={{ fontSize: "clamp(1.9rem, 3.5vw, 3rem)", lineHeight: 1.08 }}
      >
        {title}
      </h2>
      <div className="mt-6 space-y-5 text-[0.98rem] leading-[1.85] text-ink/72">{children}</div>
    </section>
  );
}

export function EducationCallout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="my-8 border-l-2 border-gold-deep bg-ivory-warm px-6 py-5">
      <p className="text-[0.62rem] uppercase text-gold-deep" style={{ letterSpacing: "0.22em" }}>
        {title}
      </p>
      <div className="mt-3 text-sm leading-relaxed text-forest-deep/75">{children}</div>
    </div>
  );
}

export function EducationSources({
  sources,
}: {
  sources: readonly { label: string; href: string }[];
}) {
  return (
    <div className="mt-8 border-t border-forest-deep/10 pt-6">
      <p className="text-[0.62rem] uppercase text-gold-deep" style={{ letterSpacing: "0.22em" }}>
        Základní veřejné zdroje
      </p>
      <ul className="mt-4 space-y-3">
        {sources.map((source) => (
          <li key={source.href}>
            <a
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-forest-deep underline decoration-gold-deep/40 underline-offset-4 transition-colors hover:text-gold-deep"
            >
              {source.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
