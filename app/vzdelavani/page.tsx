import {
  Activity,
  BookOpen,
  Brain,
  Coffee,
  Dumbbell,
  HeartPulse,
  Moon,
  ShieldCheck,
} from "lucide-react";
import { EducationTeaser } from "@/components/pentariva/EducationTeaser";
import {
  ConceptNotice,
  EditorialHero,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/pentariva/PublicPage";

const TOPICS = [
  ["Energie a vitalita", Activity],
  ["Imunita", ShieldCheck],
  ["Trávení", Coffee],
  ["Spánek a regenerace", Moon],
  ["Pohyb a výkon", Dumbbell],
  ["Každodenní péče", HeartPulse],
  ["Rovnováha", Brain],
  ["Kvalita a složení", BookOpen],
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
        status="Znalostní centrum ve vývoji"
        lead={
          <>
            <p>
              Budujeme místo pro srozumitelný, klidný a odpovědný obsah. Bez
              zbytečných slibů, bez tlaku a s jasným rozlišením mezi tradicí,
              zkušeností a ověřenými informacemi.
            </p>
            <p className="mt-4">
              První témata a formáty níže ukazují, jak bude centrum fungovat.
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
            body="Obsah budeme organizovat podle skutečných otázek lidí, aby bylo možné začít u potřeby a postupně dojít k hlubším souvislostem."
          />
          <div className="mt-12 grid gap-px bg-forest-deep/10 sm:grid-cols-2 lg:grid-cols-4">
            {TOPICS.map(([title, Icon]) => (
              <article key={title} className="bg-ivory p-7">
                <Icon className="h-5 w-5 text-gold-deep" strokeWidth={1.35} />
                <h3 className="mt-5 font-serif-display text-2xl text-forest-deep">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">
                  Připravujeme odborně revidovaný základ, praktické souvislosti a
                  srozumitelné odpovědi.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-deep py-24 text-cream lg:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-14 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Redakční standard"
              title="Důvěra vzniká způsobem, jakým obsah tvoříme."
              dark
              body="Budoucí články, průvodci a webináře musí být jasně označené, dohledatelné a přiměřené tomu, co je skutečně možné tvrdit."
            />
          </div>
          <ol className="space-y-6 lg:col-span-6 lg:col-start-7">
            {[
              "Oddělujeme tradiční použití, zkušenost a odborně podložená fakta.",
              "Zdravotní a produktová sdělení před zveřejněním odborně i legislativně kontrolujeme.",
              "Obsah nenahrazuje diagnózu ani individuální péči zdravotnického odborníka.",
              "U každého tématu vysvětlujeme hranice, nejistoty a praktické souvislosti.",
            ].map((item, index) => (
              <li
                key={item}
                className="grid grid-cols-[2.7rem_1fr] gap-4 border-t border-gold/20 pt-5"
              >
                <span className="font-serif-display text-gold">
                  0{index + 1}
                </span>
                <span className="text-sm leading-relaxed text-cream/75">
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-ivory-warm py-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <ConceptNotice title="Aktuální stav">
            Znalostní centrum je nyní ve fázi obsahové a odborné přípravy. Ukázkové
            odkazy zůstávají součástí architektury webu a postupně je naplníme
            plnohodnotným obsahem.
          </ConceptNotice>
          <div className="mt-8 flex flex-wrap gap-6">
            <TextLink href="/vzdelavani/clanky">Připravované články</TextLink>
            <TextLink href="/vzdelavani/pruvodci">Průvodci</TextLink>
            <TextLink href="/vzdelavani/webinare">Webináře</TextLink>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
