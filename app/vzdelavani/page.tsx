import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  Coffee,
  Download,
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
const brandBookPdfUrl = "/downloads/PENTARIVA-Brand-Book.pdf";
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
    body: "Barbara propojuje produktové informace, způsob vysvětlování a bezpečnostní hranice do jednoho vzdělávacího systému.",
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
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <figure className="lg:col-span-7">
              <div className="overflow-hidden bg-forest-deep/5">
                <img
                  src="/images/vzdelavani/barbara-kockova-1536.webp"
                  srcSet="/images/vzdelavani/barbara-kockova-768.webp 768w, /images/vzdelavani/barbara-kockova-1536.webp 1536w"
                  sizes="(min-width: 1024px) 56vw, 100vw"
                  width={1536}
                  height={1024}
                  loading="lazy"
                  decoding="async"
                  alt="Barbara Kočková představuje vzdělávací materiály PENTARIVA v prostředí firemního vzdělávání."
                  className="aspect-[3/2] h-auto w-full object-cover"
                />
              </div>
              <figcaption
                className="mt-4 text-[0.65rem] uppercase text-forest-deep/50"
                style={{ letterSpacing: "0.22em" }}
              >
                Barbara Kočková · firemní trenérka PENTARIVA
              </figcaption>
            </figure>

            <div className="lg:col-span-5">
              <p className="text-eyebrow text-gold-deep" style={{ letterSpacing: "0.3em" }}>
                Tvář vzdělávání
              </p>
              <h2
                className="mt-5 font-serif-display text-forest-deep"
                style={{
                  fontSize: "clamp(2.3rem, 4.2vw, 4rem)",
                  lineHeight: 1.02,
                }}
              >
                Barbara Kočková
              </h2>
              <p className="mt-5 border-l border-gold-deep/45 pl-5 font-serif-display text-xl leading-relaxed text-gold-deep sm:text-2xl">
                Firemní trenérka a průvodkyně světem bylin PENTARIVA
              </p>
              <div className="mt-8 space-y-5 text-base leading-[1.85] text-ink/72">
                <p>
                  Barbara propojuje osobní zkušenost s bylinami, principy PENTARIVA a srozumitelnou
                  práci s lidmi. Společná metodika propojuje veřejný obsah, školení poradců a
                  Poradnu PENTARIVA.
                </p>
                <p>
                  Vede lidi k vnímání souvislostí, správným otázkám a informovaným rozhodnutím.
                  Informace převádí do bezpečné, srozumitelné a dlouhodobě udržitelné každodenní
                  péče.
                </p>
              </div>
              <blockquote className="mt-9 border-t border-forest-deep/10 pt-7 font-serif-display text-2xl leading-snug text-forest-deep">
                „Zkušenost získává největší hodnotu ve chvíli, kdy ji dokážeme předat srozumitelně a
                odpovědně.“
              </blockquote>
            </div>
          </div>

          <div className="mt-24 border-t border-forest-deep/10 pt-20">
            <SectionHeading
              eyebrow="Metodická páteř"
              title="Jeden vzdělávací systém pro celý ekosystém."
              body="Barbara drží společný jazyk mezi veřejným obsahem, školením prodejců a Poradnou. Odborné zdravotní a legislativní části procházejí odpovídající kvalifikovanou revizí."
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
            <div className="mt-16 grid items-center gap-10 border-t border-forest-deep/10 pt-16 lg:grid-cols-12 lg:gap-16">
              <figure className="lg:col-span-6">
                <div className="overflow-hidden bg-forest-deep/5">
                  <img
                    src="/images/vzdelavani/roman-zich-skoleni-1536.webp"
                    srcSet="/images/vzdelavani/roman-zich-skoleni-768.webp 768w, /images/vzdelavani/roman-zich-skoleni-1536.webp 1536w"
                    sizes="(min-width: 1024px) 48vw, 100vw"
                    width={1536}
                    height={1024}
                    loading="lazy"
                    decoding="async"
                    alt="Roman Zich vede školení PENTARIVA a předává zkušenosti u prezentačního panelu."
                    className="aspect-[3/2] h-auto w-full object-cover"
                  />
                </div>
                <figcaption
                  className="mt-4 text-[0.65rem] uppercase text-forest-deep/50"
                  style={{ letterSpacing: "0.22em" }}
                >
                  Roman Zich · školení a předávání zkušeností
                </figcaption>
              </figure>

              <div className="lg:col-span-5 lg:col-start-8">
                <p className="text-eyebrow text-gold-deep" style={{ letterSpacing: "0.3em" }}>
                  Zkušenost v pohybu
                </p>
                <h3
                  className="mt-5 font-serif-display text-forest-deep"
                  style={{ fontSize: "clamp(2rem, 3.5vw, 3.3rem)", lineHeight: 1.05 }}
                >
                  Školení převádí principy do každodenní praxe.
                </h3>
                <div className="mt-7 space-y-5 text-base leading-[1.85] text-ink/72">
                  <p>
                    Roman Zich přináší do vzdělávacího systému zkušenost s vedením obchodních týmů,
                    partnerskou spoluprací a budováním dlouhodobě funkčních struktur.
                  </p>
                  <p>
                    Společně s Barbarou Kočkovou propojuje strategii, práci s lidmi a srozumitelnou
                    produktovou orientaci. Každé školení posiluje odbornost, jistotu v komunikaci a
                    odpovědnost vůči klientovi.
                  </p>
                </div>
                <blockquote className="mt-8 border-l border-gold-deep/50 pl-6 font-serif-display text-2xl leading-snug text-gold-deep">
                  „Znalost získává sílu ve chvíli, kdy ji člověk používá správně, srozumitelně a s
                  respektem.“
                </blockquote>
              </div>
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

      <section className="bg-ivory py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-6 lg:grid-cols-12 lg:gap-16 lg:px-12">
          <div className="lg:col-span-5">
            <p className="text-eyebrow text-gold-deep" style={{ letterSpacing: "0.3em" }}>
              Příběh, který pokračuje
            </p>
            <h2
              className="mt-5 font-serif-display text-forest-deep"
              style={{
                fontSize: "clamp(2.2rem, 4vw, 3.8rem)",
                lineHeight: 1.05,
              }}
            >
              Každý příběh začíná jediným zápisem.
            </h2>
            <div className="mt-8 space-y-5 text-base leading-[1.85] text-ink/72">
              <p>
                Na půdě našla Barbara deník, který po sobě zanechala její maminka. Před více než
                šedesáti lety do něj začala zapisovat zkušenosti s bylinami, receptury a poznatky,
                které během života sbírala.
              </p>
              <p>
                Deník vznikal jako osobní záznam trpělivosti, úcty k přírodě a touhy pomáhat lidem
                pečovat o sebe přirozenou cestou.
              </p>
              <p>
                Po letech v něm Barbara objevila{" "}
                <InlineLink href="/svet-pentariva/pribeh">kořen příběhu</InlineLink>, na který
                PENTARIVA navazuje současnými poznatky, odpovědným přístupem a respektem k člověku.
              </p>
            </div>
            <p className="mt-9 font-serif-display text-3xl text-forest-deep sm:text-4xl">
              PENTARIVA má duši.
            </p>
            <blockquote className="mt-9 border-l border-gold-deep/50 pl-6 font-serif-display text-2xl leading-snug text-gold-deep sm:text-3xl">
              „První stránku napsala tradice. Další píšeme společně.“
            </blockquote>
          </div>

          <figure className="lg:col-span-7 lg:col-start-6">
            <div className="overflow-hidden bg-forest-deep/5">
              <img
                src="/images/vzdelavani/barbara-rodinny-denik-1536.webp"
                srcSet="/images/vzdelavani/barbara-rodinny-denik-768.webp 768w, /images/vzdelavani/barbara-rodinny-denik-1536.webp 1536w"
                sizes="(min-width: 1024px) 56vw, 100vw"
                width={1536}
                height={1024}
                loading="lazy"
                decoding="async"
                alt="Barbara Kočková představuje příběh rodinného bylinného deníku, který po mamince našla na půdě."
                className="aspect-[3/2] h-auto w-full object-cover"
              />
            </div>
            <figcaption
              className="mt-4 text-[0.65rem] uppercase text-forest-deep/50"
              style={{ letterSpacing: "0.22em" }}
            >
              Rodinný bylinný deník · kořen příběhu PENTARIVA
            </figcaption>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href={brandBookPdfUrl}
                download="PENTARIVA-Brand-Book.pdf"
                className="group inline-flex items-center gap-3 border border-forest-deep px-5 py-3 text-[0.68rem] uppercase text-forest-deep transition-colors hover:bg-forest-deep hover:text-cream"
                style={{ letterSpacing: "0.2em" }}
              >
                Stáhnout Brand Book
                <Download className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <TextLink href="/svet-pentariva/pribeh">Přečíst celý příběh</TextLink>
              <span className="text-xs text-forest-deep/50">PDF · 25 stran · 4,9 MB</span>
            </div>
          </figure>
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
