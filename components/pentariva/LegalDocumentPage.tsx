import type { LegalDocument } from "@/content/legal/documents";
import { LegalMarkdown } from "./LegalMarkdown";
import { ConceptNotice, EditorialHero, InlineLink, PublicPage, TextLink } from "./PublicPage";

export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  const other =
    document.slug === "obchodni-podminky"
      ? { href: "/pravni/ochrana-udaju", label: "Ochrana osobních údajů" }
      : { href: "/pravni/obchodni-podminky", label: "Obchodní podmínky" };

  return (
    <PublicPage>
      <EditorialHero
        eyebrow={document.eyebrow}
        title={document.title}
        status="Návrh"
        lead={
          <>
            <p>{document.lead}</p>
            <p className="mt-4">
              Kontakt pro ochranu údajů a právní podněty:{" "}
              <InlineLink href="mailto:gdpr@pentariva.com">gdpr@pentariva.com</InlineLink>.
            </p>
          </>
        }
      />

      <section className="bg-ivory-warm py-10 lg:py-12">
        <div className="mx-auto max-w-[760px] px-6">
          <ConceptNotice title="Návrh ke zveřejnění">
            Identifikační údaje společnosti — [NÁZEV SPOLEČNOSTI], [IČO], [SÍDLO], [DIČ] a [DATUM
            ÚČINNOSTI] — zůstávají viditelně v hranatých závorkách, dokud nebudou doplněny. Stejně
            tak placeholdery e-shopu, zpracovatelů a cookies. Adresa{" "}
            <InlineLink href="mailto:gdpr@pentariva.com">gdpr@pentariva.com</InlineLink> je platná a
            nemění se.
          </ConceptNotice>
        </div>
      </section>

      <section className="bg-ivory py-16 lg:py-24">
        <article className="mx-auto max-w-[760px] px-6">
          <LegalMarkdown content={document.markdown} />
          <div className="mt-14 flex flex-wrap gap-6 border-t border-forest-deep/10 pt-8">
            <TextLink href={other.href}>{other.label}</TextLink>
            <TextLink href="/pravni/cookies">Cookies</TextLink>
            <TextLink href="/">Hlavní strana</TextLink>
          </div>
        </article>
      </section>
    </PublicPage>
  );
}
