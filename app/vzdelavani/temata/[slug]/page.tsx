import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  Coffee,
  Dumbbell,
  HeartPulse,
  Moon,
  ShieldCheck,
} from "lucide-react";
import {
  EducationArticleLayout,
  EducationCallout,
  EducationMeta,
  EducationSection,
} from "@/components/pentariva/EducationContentLayout";
import { EditorialHero, PublicPage, TextLink } from "@/components/pentariva/PublicPage";
import {
  EDUCATION_TOPICS,
  getEducationTopic,
  type EducationTopicIcon,
} from "@/content/education-topics";

const TOPIC_ICONS = {
  activity: Activity,
  shield: ShieldCheck,
  coffee: Coffee,
  moon: Moon,
  movement: Dumbbell,
  care: HeartPulse,
  balance: Brain,
  quality: BookOpen,
} satisfies Record<EducationTopicIcon, typeof Activity>;

const TOC = [
  { id: "souvislosti", label: "Téma v souvislostech" },
  { id: "body-pozornosti", label: "Tři body pozornosti" },
  { id: "vlastni-orientace", label: "Otázky pro vlastní orientaci" },
  { id: "navazujici-obsah", label: "Navazující obsah" },
] as const;

type EducationTopicPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return EDUCATION_TOPICS.map(({ slug }) => ({ slug }));
}

export default async function EducationTopicPage({ params }: EducationTopicPageProps) {
  const { slug } = await params;
  const topic = getEducationTopic(slug);

  if (!topic) {
    return (
      <PublicPage>
        <EditorialHero
          eyebrow="Znalostní centrum"
          title="Téma čeká na správnou cestu."
          lead={
            <p>
              Zvolená adresa neodpovídá žádnému tematickému přehledu. Znalostní centrum nabízí osm
              ověřených cest k dalšímu obsahu.
            </p>
          }
        />
        <section className="bg-ivory py-20">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
            <TextLink href="/vzdelavani">Zpět do Znalostního centra</TextLink>
          </div>
        </section>
      </PublicPage>
    );
  }

  const Icon = TOPIC_ICONS[topic.icon];

  return (
    <PublicPage>
      <EditorialHero
        eyebrow={`Znalostní centrum · ${topic.title}`}
        title={topic.headline}
        status="Tematický přehled"
        lead={
          <>
            <p>{topic.lead}</p>
            <p className="mt-4">
              Přehled otevírá základní souvislosti, otázky pro vlastní orientaci a navazující
              vzdělávací obsah PENTARIVA.
            </p>
          </>
        }
      />

      <section className="overflow-hidden bg-forest-deep py-16 text-cream lg:py-20">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-6 lg:grid-cols-12 lg:px-12">
          <div className="relative flex min-h-72 items-center justify-center border border-gold/20 lg:col-span-5">
            <div
              aria-hidden
              className="absolute inset-8 border border-gold/10"
              style={{ transform: "rotate(8deg)" }}
            />
            <div
              aria-hidden
              className="absolute inset-8 border border-gold/10"
              style={{ transform: "rotate(-8deg)" }}
            />
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-gold/35 bg-black/10">
              <Icon className="h-16 w-16 text-gold" strokeWidth={1} aria-hidden />
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-eyebrow text-gold" style={{ letterSpacing: "0.28em" }}>
              Tři body pozornosti
            </p>
            <div className="mt-7 space-y-5">
              {topic.principles.map((principle, index) => (
                <div
                  key={principle.title}
                  className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-gold/20 pt-5"
                >
                  <span className="font-serif-display text-gold">0{index + 1}</span>
                  <div>
                    <h2 className="font-serif-display text-2xl text-cream">{principle.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-cream/68">{principle.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <EducationMeta
        readingTime="5 minut"
        level="Tematický základ"
        review="Vzdělávací rámec PENTARIVA"
      />

      <EducationArticleLayout toc={TOC}>
        <EducationSection id="souvislosti" eyebrow="Výchozí bod" title={topic.headline}>
          <p>{topic.lead}</p>
          <EducationCallout title="Princip PENTARIVA">{topic.closing}</EducationCallout>
        </EducationSection>

        <EducationSection
          id="body-pozornosti"
          eyebrow="Praktická orientace"
          title="Tři souvislosti, které drží téma pohromadě."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {topic.principles.map((principle, index) => (
              <article
                key={principle.title}
                className="border border-forest-deep/10 bg-ivory-warm p-5"
              >
                <span className="font-serif-display text-gold-deep">0{index + 1}</span>
                <h3 className="mt-4 font-serif-display text-2xl text-forest-deep">
                  {principle.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/68">{principle.body}</p>
              </article>
            ))}
          </div>
        </EducationSection>

        <EducationSection
          id="vlastni-orientace"
          eyebrow="Otázky pro vás"
          title="Pozornost začíná správnou otázkou."
        >
          <ol className="space-y-4">
            {topic.questions.map((question, index) => (
              <li
                key={question}
                className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-forest-deep/10 pt-4"
              >
                <span className="font-serif-display text-gold-deep">0{index + 1}</span>
                <span>{question}</span>
              </li>
            ))}
          </ol>
        </EducationSection>

        <EducationSection
          id="navazujici-obsah"
          eyebrow="Pokračování"
          title="Vyberte si další vrstvu poznání."
        >
          <p>
            Navazující obsah rozvíjí téma prostřednictvím praktického průvodce, redakčního článku,
            obrazového formátu nebo související části ekosystému PENTARIVA.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {topic.related.map((item) => (
              <a
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="group flex min-h-36 flex-col justify-between border border-forest-deep/12 bg-ivory-warm p-5 transition-colors hover:border-gold-deep/55"
              >
                <span className="font-serif-display text-xl leading-snug text-forest-deep">
                  {item.label}
                </span>
                <span
                  className="mt-5 inline-flex items-center gap-2 text-[0.65rem] uppercase text-gold-deep"
                  style={{ letterSpacing: "0.2em" }}
                >
                  Otevřít
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                    strokeWidth={1.5}
                  />
                </span>
              </a>
            ))}
          </div>
        </EducationSection>
      </EducationArticleLayout>

      <section className="bg-forest-deep py-16 text-cream">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-6 lg:grid-cols-12 lg:px-12">
          <p className="font-serif-display text-3xl leading-snug lg:col-span-7">{topic.closing}</p>
          <div className="flex items-end lg:col-span-4 lg:col-start-9">
            <TextLink href="/vzdelavani" dark>
              Znalostní centrum
            </TextLink>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
