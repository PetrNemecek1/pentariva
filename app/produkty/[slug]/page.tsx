import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, FlaskConical, Leaf, ShieldCheck } from "lucide-react";
import {
  ConceptNotice,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/pentariva/PublicPage";
import {
  getProductConcept,
  PRODUCT_CONCEPTS,
} from "@/content/product-concepts";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return PRODUCT_CONCEPTS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductConcept(slug);
  return {
    title: product
      ? `${product.name} — koncept PENTARIVA`
      : "Koncept produktu — PENTARIVA",
    description:
      product?.description ?? "Připravovaný produktový koncept PENTARIVA.",
  };
}

export default async function ProductConceptPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;
  const product = getProductConcept(slug);
  if (!product) notFound();

  return (
    <PublicPage>
      <section className="bg-ivory py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <a
            href="/produkty"
            className="inline-flex items-center gap-2 text-[0.68rem] uppercase text-gold-deep"
            style={{ letterSpacing: "0.22em" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Zpět na produkty
          </a>

          <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <div className="relative aspect-[4/5] overflow-hidden bg-ivory-warm">
                <img
                  src={product.image}
                  alt={product.imageAlt}
                  width={1200}
                  height={1500}
                  className="h-full w-full object-cover"
                />
                <span
                  className="absolute left-5 top-5 border border-gold-deep/25 bg-ivory/95 px-4 py-2 text-[0.62rem] uppercase text-gold-deep"
                  style={{ letterSpacing: "0.24em" }}
                >
                  Koncept · není v prodeji
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center lg:col-span-5 lg:col-start-8">
              <p
                className="text-eyebrow text-gold-deep"
                style={{ letterSpacing: "0.3em" }}
              >
                {product.format}
              </p>
              <h1
                className="mt-6 font-serif-display text-forest-deep"
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 4.6rem)",
                  lineHeight: 1.02,
                }}
              >
                {product.shortName}
              </h1>
              <p className="mt-7 font-serif-display text-2xl italic leading-snug text-gold-deep">
                {product.intention}
              </p>
              <p className="mt-7 text-base leading-relaxed text-ink/72">
                {product.description}
              </p>
              <div className="mt-10">
                <ConceptNotice title="Stav produktu">
                  Toto je redakční koncept budoucího portfolia. Produkt zatím nemá
                  schválenou recepturu, cenu ani dostupnost a nelze jej objednat.
                </ConceptNotice>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory-warm py-24 lg:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-14 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Role v každodenním životě"
              title="Produkt jako součást rituálu."
              body={product.ritual}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {product.principles.map((principle) => (
              <div
                key={principle}
                className="flex gap-4 border border-forest-deep/10 bg-ivory p-6"
              >
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep"
                  strokeWidth={1.5}
                />
                <p className="text-sm leading-relaxed text-ink/72">{principle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-deep py-24 text-cream lg:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-14 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Pro koho koncept vzniká"
              title="Srozumitelná role. Realistické očekávání."
              dark
              body="Budoucí doporučení nebude vycházet z univerzálních slibů, ale z kontextu, potřeb a transparentních informací."
            />
          </div>
          <div className="space-y-5 lg:col-span-6 lg:col-start-7">
            {product.suitableFor.map((item, index) => {
              const icons = [Leaf, ShieldCheck, FlaskConical];
              const Icon = icons[index % icons.length];
              return (
                <div
                  key={item}
                  className="flex items-center gap-5 border-b border-gold/18 pb-5"
                >
                  <Icon
                    className="h-5 w-5 shrink-0 text-gold"
                    strokeWidth={1.3}
                  />
                  <p className="text-sm leading-relaxed text-cream/75">{item}</p>
                </div>
              );
            })}
            <ConceptNotice title="Doplníme po schválení" dark>
              Přesné složení, dávkování, povinná upozornění, původ surovin a
              odborně ověřené informace zveřejníme až u finálního produktu.
            </ConceptNotice>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-20">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-8 px-6 sm:flex-row sm:items-center lg:px-12">
          <div>
            <p className="font-serif-display text-3xl text-forest-deep">
              Produkt dává smysl teprve v souvislostech.
            </p>
            <p className="mt-2 text-sm text-ink/65">
              Pokračujte do Znalostního centra nebo do připravované Poradny.
            </p>
          </div>
          <div className="flex flex-wrap gap-6">
            <TextLink href="/vzdelavani">Vzdělávání</TextLink>
            <TextLink href="/poradna">Poradna</TextLink>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
