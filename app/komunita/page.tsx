import { CalendarDays, GraduationCap, HeartHandshake, Users } from "lucide-react";
import { CommunitySection } from "@/components/pentariva/CommunitySection";
import {
  ConceptNotice,
  EditorialHero,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/pentariva/PublicPage";

const BENEFITS = [
  {
    icon: GraduationCap,
    title: "Vzdělávání",
    body: "Přístup k postupně vznikajícím materiálům, průvodcům a událostem.",
  },
  {
    icon: CalendarDays,
    title: "Setkávání",
    body: "Budoucí online i osobní formáty pro sdílení zkušeností a inspirace.",
  },
  {
    icon: Users,
    title: "Jedna identita",
    body: "Jeden účet pro členské prostředí, vzdělávání, Poradnu a další služby.",
  },
  {
    icon: HeartHandshake,
    title: "Postupná spolupráce",
    body: "Možnost později rozšířit roli podle zájmu, zkušeností a pravidel programu.",
  },
] as const;


export default function CommunityPage() {
  return (
    <PublicPage>
      <EditorialHero
        eyebrow="Komunita PENTARIVA"
        title={
          <>
            Vztah, který roste
            <br />
            s důvěrou.
          </>
        }
        status="Členské prostředí připravujeme"
        lead={
          <>
            <p>
              Komunita není doplněk pod produktem. Je to prostor pro porozumění,
              sdílení zkušeností a dlouhodobou spolupráci.
            </p>
            <p className="mt-4">
              Každý člověk začne jako člen a sám rozhodne, zda a jak bude chtít
              svou roli v budoucnu rozšířit.
            </p>
          </>
        }
      />

      <CommunitySection />

      <section className="bg-ivory-warm py-24 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <SectionHeading
            eyebrow="Co členství propojí"
            title="Jedno místo pro vztah se značkou."
            body="Členské výhody budou vznikat postupně a vždy musí přinášet skutečnou hodnotu dříve, než od člena něco očekávají."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="border border-forest-deep/10 bg-ivory p-7"
              >
                <Icon className="h-5 w-5 text-gold-deep" strokeWidth={1.35} />
                <h3 className="mt-5 font-serif-display text-2xl text-forest-deep">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/68">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-deep py-24 text-cream lg:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-14 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Role v ekosystému"
              title="Členství je začátek, ne závazek."
              dark
              body="Role zákazníka, ambasadora, mentora, lídra nebo B2B partnera budou oddělené a přístupné jen tehdy, když pro ně vzniknou jasná pravidla a smysluplná podpora."
            />
          </div>
          <div className="space-y-7 lg:col-span-6 lg:col-start-7">
            <ConceptNotice title="Doporučování a ambasadorství" dark>
              Program je ve fázi návrhu. Zatím neaktivujeme doporučovací odkazy,
              provize ani příjmové přísliby. Veřejně jej představíme až s jasnými
              pravidly, podmínkami a odpovědnou komunikací.
            </ConceptNotice>
            <div className="flex flex-wrap gap-6">
              <TextLink href="/komunita/clenske-vyhody" dark>
                Členské výhody
              </TextLink>
              <TextLink href="/komunita/udalosti" dark>
                Události
              </TextLink>
              <TextLink href="/komunita/ambasadorsky-program" dark>
                Ambasadorství
              </TextLink>
            </div>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
