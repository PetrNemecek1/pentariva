import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/pentariva/LegalDocumentPage";
import { getLegalDocument } from "@/content/legal/documents";

const document = getLegalDocument("ochrana-udaju");

export const metadata: Metadata = {
  title: document.title,
  description: document.description,
  alternates: { canonical: document.path },
};

export default function PrivacyPage() {
  return <LegalDocumentPage document={document} />;
}
