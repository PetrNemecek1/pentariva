import { ArrowRight, BookOpen, Leaf, MessageCircle, ShieldCheck } from "lucide-react";
import {
  ConceptNotice,
  EditorialHero,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/pentariva/PublicPage";
import { PRODUCT_CONCEPTS } from "@/content/product-concepts";

const TITLE = "Produkty PENTARIVA — připravované botanické portfolio";
const DESCRIPTION =
  "Objevte koncept připravovaného portfolia PENTARIVA. Produkty zatím nejsou v prodeji; představujeme jejich roli, principy a místo v každodenních rituálech.";

const NEEDS = [
  {
    title: "Každodenní rovnováha",
    body: "Jednoduché rituály, které lze přirozeně začlenit do běžného dne.",
    icon: Leaf,
  },
  {
    title: "Klid a regenerace",
    body: "Prostor pro zpomalení, večerní návyky a vědomé uzavření dne.",
    icon: MessageCircle,
  },
  {
    title: "Vitalita a dlouhodobost",
    body: "Realistický přístup založený na pravidelnosti, kvalitě a vzdělávání.",
    icon: ShieldCheck,
  },
  {
    title: "Porozumění produktu",
    body: "Srozumitelné informace o účelu, budoucím složení a způsobu používání.",
    icon: BookOpen,
  },
] as const;


export default function ProductsPage() {
  return (
    <PublicPage>
      <EditorialHero
        eyebrow="Produktový ekosystém"
        title={
          <>
            Nejdříve potřeba.
            <br />
            Potom řešení.
          </>
        }
        status="Portfolio ve vývoji"
        lead={
          <>
            <p>
              Produkty PENTARIVA nevznikají jako izolované položky katalogu.
              Každý koncept propojujeme s rituálem, vzděláváním, transparentními
              informacemi a možností získat pomoc.
            </p>
            <p className="mt-4">
              Níže představujeme směr budoucího portfolia. Žádný z uvedených
              konceptů zatím není možné objednat.
            </p>
          </>
        }
      />

      <section className="bg-ivory-warm py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <SectionHeading
            eyebrow="Začněte tím, co hledáte"
            title="Člověk před produktem."
            body="Budoucí nabídka bude uspořádána podle potřeb a životních situací, nikoliv podle interních skladových kategorií."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {NEEDS.map(({ title, body, icon: Icon }) => (
              <article
                key={title}
                className="border border-forest-deep/10 bg-ivory p-7"
              >
                <Icon className="h-5 w-5 text-gold-deep" strokeWidth={1.35} />
                <h3 className="mt-6 font-serif-display text-2xl text-forest-deep">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <SectionHeading
            eyebrow="Návrh portfolia"
            title="Čtyři koncepty. Jeden společný jazyk."
            body="Názvy, receptury, balení i konečná určení jsou pracovní. Koncepty slouží k vytvoření srozumitelné produktové architektury a vizuálního směru."
          />

          <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCT_CONCEPTS.map((product) => (
              <a
                key={product.slug}
                href={`/produkty/${product.slug}`}
                className="group flex flex-col overflow-hidden bg-cream ring-1 ring-forest-deep/10 transition-shadow hover:shadow-[0_20px_45px_-28px_rgba(30,42,28,0.6)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-ivory-warm">
                  <img
                    src={product.image}
                    alt={product.imageAlt}
                    loading="lazy"
                    width={900}
                    height={1100}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                  />
                  <span
                    className="absolute left-4 top-4 bg-ivory/95 px-3 py-1.5 text-[0.6rem] uppercase text-gold-deep"
                    style={{ letterSpacing: "0.2em" }}
                  >
                    Koncept
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p
                    className="text-[0.62rem] uppercase text-gold-deep"
                    style={{ letterSpacing: "0.22em" }}
                  >
                    {product.format}
                  </p>
                  <h3 className="mt-3 font-serif-display text-2xl leading-tight text-forest-deep">
                    {product.shortName}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-ink/70">
                    {product.intention}
                  </p>
                  <span
                    className="mt-7 inline-flex items-center gap-2 text-[0.67rem] uppercase text-forest-deep"
                    style={{ letterSpacing: "0.2em" }}
                  >
                    Prozkoumat koncept
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                      strokeWidth={1.5}
                    />
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-12">
            <ConceptNotice title="Transparentně">
              Produkty nejsou v prodeji, nemají cenu a nelze je vložit do košíku.
              Konečné receptury, tvrzení, upozornění a způsob používání zveřejníme
              až po odborném, legislativním a kvalitativním schválení.
            </ConceptNotice>
          </div>
        </div>
      </section>

      <section className="bg-forest-deep py-24 text-cream lg:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-14 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-6">
            <SectionHeading
              eyebrow="Jak portfolio vzniká"
              title="Důvěra před uvedením produktu."
              dark
              body="Každý budoucí produkt musí nejprve prokázat svou srozumitelnou roli, kvalitu, bezpečnost a přirozené místo v ekosystému PENTARIVA."
            />
          </div>
          <ol className="space-y-7 lg:col-span-5 lg:col-start-8">
            {[
              "Definujeme skutečnou potřebu a zamýšlený rituál.",
              "Připravíme recepturu, dokumentaci a odbornou kontrolu.",
              "Teprve po schválení zveřejníme úplný detail a dostupnost.",
            ].map((step, index) => (
              <li
                key={step}
                className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-gold/20 pt-5"
              >
                <span className="font-serif-display text-gold">
                  0{index + 1}
                </span>
                <span className="text-sm leading-relaxed text-cream/75">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-ivory py-20">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-8 px-6 sm:flex-row sm:items-center lg:px-12">
          <div>
            <p className="font-serif-display text-3xl text-forest-deep">
              Chcete nejprve porozumět souvislostem?
            </p>
            <p className="mt-2 text-sm text-ink/65">
              Pokračujte do Znalostního centra nebo poznejte připravovanou Poradnu.
            </p>
          </div>
          <div className="flex flex-wrap gap-6">
            <TextLink href="/vzdelavani">Vzdělávání</TextLink>
            <TextLink href="/poradna">PENTARIVA Poradna</TextLink>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
