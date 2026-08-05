import { LockKeyhole } from "lucide-react";
import {
  ConceptNotice,
  EditorialHero,
  PublicPage,
  TextLink,
} from "@/components/pentariva/PublicPage";


export default function SignInPage() {
  return (
    <PublicPage>
      <EditorialHero
        eyebrow="Přihlášení"
        title={
          <>
            Bezpečný vstup
            <br />
            vzniká.
          </>
        }
        status="Ve vývoji"
        lead={
          <>
            <p>
              Architektura Online kanceláře používá jednu bezpečnou identitu pro celý ekosystém
              PENTARIVA.
            </p>
            <p className="mt-4">
              Přihlašovací formulář tvoří součást technicky ověřené služby a jasně nastavených
              podmínek ochrany osobních údajů.
            </p>
          </>
        }
      />

      <section className="bg-ivory-warm py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center border border-gold-deep/30 text-gold-deep">
            <LockKeyhole className="h-6 w-6" strokeWidth={1.3} />
          </div>
          <h2 className="mt-7 font-serif-display text-4xl text-forest-deep">
            Veřejná část webu je otevřená každému.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink/70">
            Účet vstupuje do ekosystému společně s aktivní registrací. Veřejnou část webu používáte
            volně a otevřeně.
          </p>
          <div className="mt-9 text-left">
            <ConceptNotice title="Proč je formulář skrytý">
              Osobní údaje sbíráme pouze v aktivní a bezpečně definované službě. Navigace proto vede
              k transparentnímu vysvětlení aktuálního stavu.
            </ConceptNotice>
          </div>
          <div className="mt-9 flex flex-wrap justify-center gap-6">
            <TextLink href="/online-kancelar">O Online kanceláři</TextLink>
            <TextLink href="/komunita">Komunita</TextLink>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
