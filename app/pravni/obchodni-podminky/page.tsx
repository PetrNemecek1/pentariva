import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/pentariva/LegalDocumentPage";
import { getLegalDocument } from "@/content/legal/documents";

const document = getLegalDocument("obchodni-podminky");

export const metadata: Metadata = {
  title: document.title,
  description: document.description,
  alternates: { canonical: document.path },
};

export default function TermsPage() {
  return <LegalDocumentPage document={document} />;
}
