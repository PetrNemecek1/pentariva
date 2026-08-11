import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  Coffee,
  Dumbbell,
  GraduationCap,
  Headphones,
  HeartPulse,
  Moon,
  Presentation,
  ShieldCheck,
} from "lucide-react";
import { EducationTeaser } from "@/components/pentariva/EducationTeaser";
import { EDUCATION_TOPICS, type EducationTopicIcon } from "@/content/education-topics";
import {
  ConceptNotice,
  EditorialHero,
  InlineLink,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/pentariva/PublicPage";

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

const EDUCATION_ROLES = [
  {
    icon: GraduationCap,
    title: "Jednotná metodika",
    body: "Tým propojuje produktové informace, způsob vysvětlování a bezpečnostní hranice do jednoho vzdělávacího systému.",
  },
  {
    icon: Presentation,
    title: "Online vzdělávání",
    body: "Články, průvodci a webináře převádějí složitější témata do srozumitelných kroků pro členy, zákazníky i prodejní tým.",
  },
  {
    icon: Headphones,
    title: "Metodika Poradny",
    body: "Metodika Poradny pracuje se strukturovaným rozhovorem, schválenou znalostní bází a jasným předáním dotazů kvalifikovaným odborníkům.",
  },
] as const;


export default function EducationPage() {
  return (
    <PublicPage>
      <EditorialHero
        eyebrow="Vzdělávání"
        title={
          <>
            Porozumění předchází
            <br />
            dobrému rozhodnutí.
          </>
        }
        status="Znalostní centrum je otevřené"
        lead={
          <>
            <p>
              Znalostní centrum PENTARIVA přináší srozumitelný, klidný a odpovědný obsah. Každé téma
              jasně rozlišuje tradici, zkušenost a{" "}
              <InlineLink href="/svet-pentariva/veda-a-vyvoj">ověřené informace</InlineLink> a
              podporuje informované rozhodnutí.
            </p>
            <p className="mt-4">
              Článek a praktický průvodce nabízejí plnohodnotný redakční obsah. Obrazová série
              představuje obsahový koncept a online setkání vlastní metodickou osnovu.
            </p>
          </>
        }
      />

      <EducationTeaser />

      <section className="bg-ivory py-24 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <SectionHeading
            eyebrow="Témata"
            title="Jedno centrum. Osm cest k porozumění."
            body="Každá tematická cesta nabízí vlastní orientaci, praktické otázky a funkční odkazy na navazující obsah."
          />
          <div className="mt-12 grid gap-px bg-forest-deep/10 sm:grid-cols-2 lg:grid-cols-4">
            {EDUCATION_TOPICS.map((topic) => {
              const Icon = TOPIC_ICONS[topic.icon];

              return (
                <a
                  key={topic.slug}
                  href={`/vzdelavani/temata/${topic.slug}`}
                  className="group flex min-h-72 flex-col justify-between bg-ivory p-7 transition-colors hover:bg-ivory-warm"
                >
                  <div>
                    <Icon className="h-5 w-5 text-gold-deep" strokeWidth={1.35} />
                    <h3 className="mt-5 font-serif-display text-2xl text-forest-deep">
                      {topic.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink/65">{topic.tileBody}</p>
                  </div>
                  <span
                    className="mt-7 inline-flex items-center gap-2 text-[0.65rem] uppercase text-gold-deep"
                    style={{ letterSpacing: "0.2em" }}
                  >
                    Otevřít téma
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                      strokeWidth={1.5}
                    />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-ivory-warm py-24 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div>
            <SectionHeading
              eyebrow="Metodická páteř"
              title="Jeden vzdělávací systém pro celý ekosystém."
              body="Tým PENTARIVA drží společný jazyk mezi veřejným obsahem, školením prodejců a Poradnou. Odborné zdravotní a legislativní části procházejí odpovídající kvalifikovanou revizí."
            />
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {EDUCATION_ROLES.map(({ icon: Icon, title, body }) => (
                <article key={title} className="border border-forest-deep/10 bg-ivory p-7">
                  <Icon className="h-5 w-5 text-gold-deep" strokeWidth={1.35} />
                  <h3 className="mt-5 font-serif-display text-2xl text-forest-deep">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/68">{body}</p>
                </article>
              ))}
            </div>
            <div className="mt-10">
              <ConceptNotice title="Hranice poradenství">
                Vzdělávací a poradenský tým podporuje orientaci v informacích, preferencích a
                každodenním režimu. Diagnostiku, vedení léčby a individuální zdravotní posouzení
                poskytují kvalifikovaní zdravotničtí odborníci.
              </ConceptNotice>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-forest-deep py-24 text-cream lg:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-14 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Redakční standard"
              title="Důvěra vzniká způsobem, jakým obsah tvoříme."
              dark
              body="Každý článek, průvodce a webinář má jasné označení, dohledatelné zdroje a formulace odpovídající dostupným podkladům."
            />
          </div>
          <ol className="space-y-6 lg:col-span-6 lg:col-start-7">
            {[
              "Oddělujeme tradiční použití, zkušenost a odborně podložená fakta.",
              "Zdravotní a produktová sdělení před zveřejněním odborně i legislativně kontrolujeme.",
              "Diagnostika a individuální zdravotní péče patří kvalifikovaným zdravotnickým odborníkům.",
              "U každého tématu vysvětlujeme hranice, nejistoty a praktické souvislosti.",
            ].map((item, index) => (
              <li
                key={item}
                className="grid grid-cols-[2.7rem_1fr] gap-4 border-t border-gold/20 pt-5"
              >
                <span className="font-serif-display text-gold">0{index + 1}</span>
                <span className="text-sm leading-relaxed text-cream/75">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-ivory-warm py-20">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow="Další krok"
              title="Vyberte si způsob, jakým chcete téma otevřít."
              body="Článek přináší přesnou orientaci, průvodce převádí principy do praxe, obrazová série pracuje s pěti smysly a online setkání otevírá prostor pro společný rozhovor."
            />
          </div>
          <div className="flex flex-wrap content-end gap-6 lg:col-span-4 lg:col-start-9">
            <TextLink href="/vzdelavani/clanky">Články</TextLink>
            <TextLink href="/vzdelavani/pruvodci">Průvodci</TextLink>
            <TextLink href="/vzdelavani/videa">Videa</TextLink>
            <TextLink href="/vzdelavani/webinare">Webináře</TextLink>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
