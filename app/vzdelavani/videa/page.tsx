import { Ear, Eye, Hand, Sparkles } from "lucide-react";
import {
  EducationArticleLayout,
  EducationCallout,
  EducationEditorialFeature,
  EducationMeta,
  EducationSection,
} from "@/components/pentariva/EducationContentLayout";
import {
  ConceptNotice,
  EditorialHero,
  PublicPage,
  TextLink,
} from "@/components/pentariva/PublicPage";

const TOC = [
  { id: "smysl-formatu", label: "Smysl obrazového formátu" },
  { id: "pet-smyslu", label: "Pět smyslů" },
  { id: "struktura", label: "Struktura epizody" },
  { id: "vlastni-zkusenost", label: "Vlastní zkušenost" },
  { id: "odborne-hranice", label: "Odborné hranice" },
] as const;

const SENSES = [
  {
    icon: Eye,
    title: "Zrak",
    body: "Barva, čirost, struktura rostliny a uspořádání prostředí otevírají první vrstvu pozornosti.",
  },
  {
    icon: Ear,
    title: "Sluch",
    body: "Přirozený zvuk přípravy a klidná zvuková stopa dávají rituálu rozpoznatelný rytmus.",
  },
  {
    icon: Sparkles,
    title: "Čich a chuť",
    body: "Vůně a chuť vedou k pomalému vnímání intenzity, teploty a proměny v čase.",
  },
  {
    icon: Hand,
    title: "Hmat",
    body: "Teplo nádoby, povrch bylin a vědomý pohyb rukou ukotvují pozornost v přítomném okamžiku.",
  },
] as const;


export default function SensoryVideoPage() {
  return (
    <PublicPage>
      <EditorialHero
        eyebrow="Znalostní centrum · video"
        title={
          <>
            Pět smyslů v každodenním
            <br />
            bylinném rituálu.
          </>
        }
        status="Obsahový koncept · obrazová série"
        lead={
          <>
            <p>
              Krátký obrazový formát převádí znalosti do konkrétní zkušenosti. Každý krok ukazuje
              přípravu, smyslový detail a jeho místo v klidném každodenním rytmu.
            </p>
            <p className="mt-4">
              Obraz, hlas a zvuk společně vytvářejí srozumitelný vzdělávací celek v jazyku
              PENTARIVA.
            </p>
          </>
        }
      />

      <EducationEditorialFeature
        image="/images/vzdelavani/videa-editorial-1536.webp"
        imageSmall="/images/vzdelavani/videa-editorial-768.webp"
        alt="Natáčení praktické práce s čerstvými bylinami v klidném vzdělávacím studiu PENTARIVA."
        eyebrow="Znalost v obraze"
        title="Vidět postup. Slyšet souvislosti. Vnímat celek."
        body={
          <>
            <p>
              Kamera zachycuje ruce, rostlinu, vodu a přesný sled činností. Mluvené slovo vysvětluje
              význam jednotlivých kroků a drží pozornost u podstatných informací.
            </p>
            <p>
              Smyslový detail dává vzdělávání lidský rozměr a pomáhá převést poznatek do vlastní
              každodennosti.
            </p>
          </>
        }
        caption="Redakční motiv · praktická ukázka, obrazové vzdělávání a živé byliny"
      />

      <EducationMeta
        readingTime="Pilotní formát 6–8 minut"
        level="Praktické obrazové vzdělávání"
        review="Metodický obsah PENTARIVA"
      />

      <EducationArticleLayout toc={TOC}>
        <EducationSection
          id="smysl-formatu"
          eyebrow="Znalost v pohybu"
          title="Obraz ukazuje přesně to, co slova vysvětlují."
        >
          <p>
            Video spojuje názorný postup se souvislostmi. Divák sleduje množství, pořadí kroků,
            podobu suroviny, práci s vodou i výslednou podobu rituálu v jednom plynulém celku.
          </p>
          <p>
            Klidné tempo vytváří prostor pro pozornost. Každá epizoda drží jedno hlavní téma, jednu
            praktickou ukázku a jeden srozumitelný závěr.
          </p>
          <EducationCallout title="Princip série">
            Praktická ukázka dává informaci tvar. Kontext dává informaci smysl. Vlastní pozornost
            proměňuje informaci ve zkušenost.
          </EducationCallout>
        </EducationSection>

        <EducationSection id="pet-smyslu" eyebrow="PENTARIVA" title="Pět smyslů drží jeden rytmus.">
          <div className="grid gap-4 sm:grid-cols-2">
            {SENSES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="border border-forest-deep/10 bg-ivory-warm/55 p-6">
                <Icon className="h-5 w-5 text-gold-deep" strokeWidth={1.35} />
                <p className="mt-5 font-serif-display text-2xl text-forest-deep">{title}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink/68">{body}</p>
              </div>
            ))}
          </div>
          <p>
            Vnitřní pozornost propojuje všechny smyslové podněty. Člověk vnímá prostředí, vlastní
            tempo i způsob, jakým rituál zapadá do jeho dne.
          </p>
        </EducationSection>

        <EducationSection
          id="struktura"
          eyebrow="Jasná osnova"
          title="Jedna epizoda. Pět pevných částí."
        >
          <ol className="space-y-5">
            {[
              ["01", "Téma", "Jedna přesně formulovaná otázka otevírá epizodu."],
              ["02", "Surovina", "Obraz představuje rostlinu, použitou část a její charakter."],
              ["03", "Postup", "Ruce ukazují konkrétní sled činností v přirozeném tempu."],
              [
                "04",
                "Smyslový detail",
                "Pozornost se soustředí na vůni, chuť, zvuk, dotek nebo obraz.",
              ],
              ["05", "Souvislost", "Závěr shrnuje bezpečný rámec a místo rituálu v každodennosti."],
            ].map(([number, title, body]) => (
              <li
                key={number}
                className="grid grid-cols-[3rem_1fr] gap-5 border-b border-forest-deep/8 pb-5"
              >
                <span className="font-serif-display text-2xl text-gold-deep">{number}</span>
                <div>
                  <p className="font-serif-display text-xl text-forest-deep">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/68">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </EducationSection>

        <EducationSection
          id="vlastni-zkusenost"
          eyebrow="Pozornost"
          title="Vlastní záznam zachycuje skutečnou zkušenost."
        >
          <p>
            Po ukázce přichází krátká chvíle pro vlastní pozorování. Divák si zapisuje čas,
            prostředí, zvolený smyslový detail a jednoduchou větu o průběhu rituálu.
          </p>
          <p>
            Pravidelné poznámky pomáhají rozpoznat, která podoba rituálu přirozeně zapadá do denního
            režimu a podporuje dlouhodobou pozornost.
          </p>
          <EducationCallout title="Otázka pro vlastní praxi">
            Který detail dnešního rituálu si pamatuji nejzřetelněji a čím získal mou pozornost?
          </EducationCallout>
        </EducationSection>

        <EducationSection
          id="odborne-hranice"
          eyebrow="Odpovědnost"
          title="Každá informace má jasný rámec použití."
        >
          <p>
            Produktová část videa vychází ze schváleného označení, doporučeného použití a ověřených
            veřejných zdrojů. Konkrétní zdravotní situace patří do péče lékaře, lékárníka nebo
            dalšího kvalifikovaného odborníka.
          </p>
          <p>
            Jazyk PENTARIVA podporuje informovanou orientaci, bezpečné rozhodování a respekt k
            individuálním potřebám člověka.
          </p>
        </EducationSection>
      </EducationArticleLayout>

      <section className="bg-ivory-warm py-20">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
          <ConceptNotice title="Stav série">
            Stránka nyní představuje obsahovou osnovu a obrazový styl pilotní epizody. Stav
            produkce: příprava záznamu a odborná kontrola scénáře.
          </ConceptNotice>
          <div className="mt-8 flex flex-wrap gap-6">
            <TextLink href="/vzdelavani/pruvodci">Praktický průvodce</TextLink>
            <TextLink href="/vzdelavani/webinare">Online setkání</TextLink>
            <TextLink href="/vzdelavani">Znalostní centrum</TextLink>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
