import {
  BookOpen,
  CalendarDays,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Package,
} from "lucide-react";
import { OfficeGate } from "@/components/pentariva/OfficeGate";
import {
  ConceptNotice,
  EditorialHero,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/pentariva/PublicPage";

const MODULES = [
  ["Přehled", LayoutDashboard],
  ["Objednávky", Package],
  ["Vzdělávání", BookOpen],
  ["Události", CalendarDays],
  ["Poradna", MessageCircle],
  ["Dokumenty", FileText],
] as const;


export default function OfficePage() {
  return (
    <PublicPage>
      <EditorialHero
        eyebrow="Online kancelář"
        title={
          <>
            Jedna identita.
            <br />
            Jeden propojený svět.
          </>
        }
        status="Koncepční prostředí · připravujeme"
        lead={
          <>
            <p>
              Online kancelář bude osobním a pracovním prostředím uvnitř
              ekosystému. Rozsah funkcí se přizpůsobí roli uživatele, nikoliv
              počtu jeho účtů.
            </p>
            <p className="mt-4">
              Přihlášení, registrace ani členské funkce zatím nejsou spuštěné.
            </p>
          </>
        }
      />

      <OfficeGate />

      <section className="bg-ivory py-24 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <SectionHeading
            eyebrow="Budoucí moduly"
            title="Vše podstatné na jednom místě."
            body="Moduly se budou zobrazovat podle skutečně aktivních služeb a role uživatele. Ne každý potřebuje všechno."
          />
          <div className="mt-12 grid gap-px bg-forest-deep/10 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map(([label, Icon]) => (
              <div key={label} className="flex items-center gap-5 bg-ivory p-7">
                <Icon className="h-5 w-5 text-gold-deep" strokeWidth={1.35} />
                <p className="font-serif-display text-2xl text-forest-deep">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <ConceptNotice title="Aktuální stav">
              Tato stránka popisuje cílovou architekturu. Dokud nebude bezpečně
              připravená správa účtů a osobních údajů, nevytváříme zdánlivě
              funkční registraci ani přihlášení.
            </ConceptNotice>
          </div>
        </div>
      </section>

      <section className="bg-ivory-warm py-16">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-6 lg:px-12">
          <p className="font-serif-display text-3xl text-forest-deep">
            Základem kanceláře bude členství.
          </p>
          <TextLink href="/komunita">Poznat komunitu</TextLink>
        </div>
      </section>
    </PublicPage>
  );
}
