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
            připravujeme.
          </>
        }
        status="Zatím není aktivní"
        lead={
          <>
            <p>
              Online kancelář bude používat jednu bezpečnou identitu pro celý
              ekosystém PENTARIVA.
            </p>
            <p className="mt-4">
              Přihlašovací formulář zobrazíme až ve chvíli, kdy bude služba
              technicky připravená a budou jasně nastavené podmínky ochrany
              osobních údajů.
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
            Váš účet zatím není potřeba zakládat.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink/70">
            Registrace, obnova hesla ani přihlašování nyní nejsou dostupné.
            Veřejnou část webu můžete používat bez účtu.
          </p>
          <div className="mt-9 text-left">
            <ConceptNotice title="Proč je formulář skrytý">
              Nechceme sbírat údaje dříve, než je dokážeme bezpečně a smysluplně
              využít. Tlačítko v navigaci proto vede na toto transparentní
              vysvětlení, nikoliv do nefunkčního formuláře.
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
