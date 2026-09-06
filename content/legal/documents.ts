import { readFileSync } from "node:fs";
import { join } from "node:path";

export type LegalDocumentSlug = "obchodni-podminky" | "ochrana-udaju";

export type LegalDocument = {
  slug: LegalDocumentSlug;
  path: string;
  eyebrow: string;
  title: string;
  shortTitle: string;
  description: string;
  lead: string;
  markdown: string;
};

function readMarkdown(filename: string) {
  return readFileSync(join(process.cwd(), "content/legal", filename), "utf8");
}

export const LEGAL_DOCUMENTS: Record<LegalDocumentSlug, Omit<LegalDocument, "markdown">> = {
  "obchodni-podminky": {
    slug: "obchodni-podminky",
    path: "/pravni/obchodni-podminky",
    eyebrow: "Právní informace",
    title: "Obchodní podmínky",
    shortTitle: "VOP",
    description:
      "Všeobecné obchodní podmínky značky PENTARIVA. Návrh ke zveřejnění; identita provozovatele zůstává v placeholderech.",
    lead: "Návrh všeobecných obchodních podmínek veřejného webu a partnerského prostředí PENTARIVA. Identifikační údaje provozovatele doplníme, až bude společnost zapsána.",
  },
  "ochrana-udaju": {
    slug: "ochrana-udaju",
    path: "/pravni/ochrana-udaju",
    eyebrow: "Právní informace",
    title: "Ochrana osobních údajů",
    shortTitle: "GDPR",
    description:
      "Zásady ochrany osobních údajů PENTARIVA. Návrh ke zveřejnění; identita správce zůstává v placeholderech.",
    lead: "Návrh zásad ochrany osobních údajů. Ke zveřejnění až po doplnění [NÁZEV SPOLEČNOSTI], [IČO] a [SÍDLO] a po kontrole provozovatele. Kontakt gdpr@pentariva.com je platný.",
  },
};

export function getLegalDocument(slug: LegalDocumentSlug): LegalDocument {
  const meta = LEGAL_DOCUMENTS[slug];
  return {
    ...meta,
    markdown: readMarkdown(`${slug}.md`),
  };
}
