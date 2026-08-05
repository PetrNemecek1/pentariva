import { ArrowRight } from "lucide-react";
import { Header } from "@/components/pentariva/Header";
import { Footer } from "@/components/pentariva/Footer";
import svetHeroAsset from "@/assets/svet-hero.jpg.asset.json";
import svetEuropeUrl from "@/assets/svet-europe.jpg";
import svetCraftUrl from "@/assets/svet-craft.jpg";
import svetEkosystemUrl from "@/assets/svet-ekosystem.jpg";
import svetVedaUrl from "@/assets/svet-veda.jpg";
import svetSignaturaUrl from "@/assets/svet-signatura.jpg";

const svetHero = { url: svetHeroAsset.url };
const svetEurope = { url: svetEuropeUrl.src };
const svetCraft = { url: svetCraftUrl.src };
const svetEkosystem = { url: svetEkosystemUrl.src };
const svetVeda = { url: svetVedaUrl.src };
const svetSignatura = { url: svetSignaturaUrl.src };

const TITLE = "Svět PENTARIVA — Příběh, filozofie a hodnoty značky";
const DESCRIPTION =
  "Emocionální a filozofické srdce ekosystému PENTARIVA. Sedm kapitol o myšlence, ze které vyrůstá evropská značka přirozené vitality.";


const CHAPTERS = [
  { roman: "I", title: "Prolog", href: "#prolog" },
  { roman: "II", title: "Myšlenka", href: "#myslenka" },
  { roman: "III", title: "Filozofie", href: "#filozofie" },
  { roman: "IV", title: "Ekosystém", href: "#ekosystem" },
  { roman: "V", title: "Ruka a věda", href: "#ruka-a-veda" },
  { roman: "VI", title: "Evropa", href: "#evropa" },
  { roman: "VII", title: "Signatura", href: "#signatura" },
] as const;

const PRINCIPLES = [
  {
    roman: "I",
    title: "Úcta k přírodě",
    body: "Nejsme nad přírodou. Jsme její součástí. Každá receptura začíná pokorou před tím, co bylo tady dávno před námi.",
  },
  {
    roman: "II",
    title: "Pravdivost",
    body: "Mluvíme přesně o tom, co je opravdu uvnitř — o rostlinách, původu, procesu a odpovědnosti.",
  },
  {
    roman: "III",
    title: "Trvalost",
    body: "Nestavíme na trendech. Stavíme na kořenech. Rozhodnutí posuzujeme v horizontu generací, ne kvartálů.",
  },
  {
    roman: "IV",
    title: "Řemeslo",
    body: "Detail je věcí cti. Pečujeme o každou surovinu, každý obal, každé slovo — jako o součást jednoho živého celku.",
  },
  {
    roman: "V",
    title: "Partnerství",
    body: "Rosteme společně s pěstiteli, vědci, partnery a komunitou. Vztahy tvoří živý střed ekosystému.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  Editorial primitives                                                       */
/* -------------------------------------------------------------------------- */

function ChapterLabel({
  roman,
  kicker,
  tone = "light",
}: {
  roman: string;
  kicker: string;
  tone?: "light" | "dark";
}) {
  const numberClass = tone === "dark" ? "text-gold-soft/90" : "text-gold-deep/80";
  const ruleClass = tone === "dark" ? "bg-gold-soft/40" : "bg-gold/30";
  const kickerClass = tone === "dark" ? "text-gold-soft/85" : "text-gold-deep/70";
  return (
    <div className="flex items-baseline gap-4">
      <span
        className={`font-serif-display ${numberClass}`}
        style={{ fontSize: "0.95rem", letterSpacing: "0.14em" }}
      >
        {`Kapitola ${roman}`}
      </span>
      <span className={`h-px flex-1 ${ruleClass}`} aria-hidden />
      <span
        className={`text-[10px] sm:text-[11px] ${kickerClass}`}
        style={{ letterSpacing: "0.32em", fontWeight: 500 }}
      >
        {kicker}
      </span>
    </div>
  );
}

function DropCap({ letter }: { letter: string }) {
  return (
    <span
      className="float-left mr-3 font-serif-display text-forest-deep"
      style={{
        fontSize: "4.5rem",
        lineHeight: "0.9",
        marginTop: "0.35rem",
        letterSpacing: "-0.02em",
      }}
    >
      {letter}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function SvetPentarivaPage() {
  return (
    <div className="min-h-screen bg-ivory text-ink [scroll-behavior:smooth] motion-reduce:[scroll-behavior:auto]">
      <Header />
      <main>
        {/* ─── Cinematic hero ────────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden bg-forest-deep">
          <img
            src={svetHero.url}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Mobile: bottom column scrim covers the whole text block */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(20,30,20,0.25)_38%,rgba(20,30,20,0.65)_78%,rgba(20,30,20,0.75)_100%)] sm:hidden"
          />
          {/* ≥sm: local left-bottom scrim only; preserve true image colours */}
          <div
            aria-hidden
            className="absolute inset-0 hidden bg-[radial-gradient(ellipse_at_left_bottom,rgba(20,30,20,0.45)_0%,rgba(20,30,20,0.12)_38%,transparent_62%)] sm:block"
          />
          <div className="relative mx-auto flex min-h-[92vh] max-w-[1200px] flex-col justify-end px-6 pb-24 pt-40 lg:px-12 lg:pb-32 lg:pt-48">
            <p
              className="text-[11px] text-gold-soft"
              style={{
                letterSpacing: "0.36em",
                fontWeight: 500,
                textShadow: "0 1px 8px rgba(0,0,0,0.35)",
              }}
            >
              SVĚT PENTARIVA
            </p>
            <h1
              className="mt-6 max-w-4xl font-serif-display text-cream"
              style={{
                fontSize: "clamp(2.5rem, 6vw, 5.25rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.01em",
                textShadow:
                  "0 1px 2px rgba(0,0,0,0.35), 0 2px 12px rgba(0,0,0,0.35), 0 8px 28px rgba(0,0,0,0.3)",
              }}
            >
              Kniha o kořenech,
              <br />o řemesle a o důvěře.
            </h1>
            <p
              className="mt-8 max-w-xl text-base leading-relaxed text-cream/95 sm:text-lg"
              style={{
                textShadow: "0 1px 2px rgba(0,0,0,0.4), 0 2px 12px rgba(0,0,0,0.35)",
              }}
            >
              Než vznikl první produkt, vznikla myšlenka. Těchto sedm kapitol vypráví příběh, ze
              kterého vyrůstá PENTARIVA – evropský ekosystém propojující přírodu, člověka a moderní
              poznání.
            </p>

            {/* Chapter index */}
            <nav aria-label="Kapitoly" className="mt-14 border-t border-cream/20 pt-6">
              <ol className="flex flex-wrap gap-x-8 gap-y-3">
                {CHAPTERS.map((c) => (
                  <li key={c.roman}>
                    <a
                      href={c.href}
                      className="group inline-flex items-baseline gap-2 text-[12px] uppercase tracking-[0.22em] text-cream/85 transition-colors hover:text-gold-soft"
                    >
                      <span
                        className="font-serif-display text-gold-soft"
                        style={{ fontSize: "0.85rem", letterSpacing: "0.08em" }}
                      >
                        {c.roman}
                      </span>
                      <span>{c.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </section>

        {/* ─── I. Prolog ─────────────────────────────────────────────────── */}
        <section id="prolog" className="scroll-mt-24 bg-ivory py-32 lg:py-44">
          <div className="mx-auto max-w-[620px] px-6 lg:px-0">
            <ChapterLabel roman="I" kicker="PROLOG" />
            <h2
              className="mt-10 font-serif-display text-forest-deep"
              style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.08 }}
            >
              Vše, co trvá,
              <br />
              roste pomalu.
            </h2>
            <div
              className="mt-14 space-y-10 text-ink/85"
              style={{ fontSize: "1.135rem", lineHeight: 1.8 }}
            >
              <p>
                <DropCap letter="Ž" />
                ijeme v době, která si zvykla spěchat. Řešení se objevují dřív, než stačíme
                pojmenovat otázku. Značky vznikají a zanikají v rytmu jedné sezóny.
              </p>
              <p>
                Přesto — nejcennější věci, které kolem sebe máme, se nikam spěchat neučí. Kámen, ze
                kterého jsou postaveny evropské kláštery. Vinná réva zasazená před sto lety.
              </p>
              <p>
                PENTARIVA vzniká právě tady — v přesvědčení, že skutečná hodnota se buduje v rytmu
                přírody, ne trhu. A že tento rytmus stojí za to znovu objevit.
              </p>
            </div>
          </div>
        </section>

        {/* ─── II. Myšlenka — full-bleed craft image + pull quote ───────── */}
        <section id="myslenka" className="relative isolate scroll-mt-24 bg-forest-deep">
          <img
            src={svetCraft.url}
            alt="Ruce řemeslníka pečlivě skládají větvičky rozmarýnu a šalvěje na dubovém stole."
            loading="lazy"
            width={1920}
            height={1280}
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          {/* Local left-side gradient only — image keeps its natural colour on the right */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,30,20,0.7)_0%,rgba(20,30,20,0.35)_45%,rgba(20,30,20,0.1)_70%,transparent_100%)]"
          />
          <div className="relative mx-auto grid max-w-[1200px] gap-16 px-6 py-28 lg:grid-cols-[1fr_1fr] lg:gap-24 lg:px-12 lg:py-40">
            <div>
              <ChapterLabel roman="II" kicker="MYŠLENKA" tone="dark" />
              <h2
                className="mt-10 font-serif-display text-cream"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.25rem)",
                  lineHeight: 1.08,
                  textShadow: "0 2px 14px rgba(0,0,0,0.4)",
                }}
              >
                Nezakládáme značku.
                <br />
                Kultivujeme ekosystém.
              </h2>
              <p
                className="mt-10 text-cream/90"
                style={{
                  fontSize: "1.075rem",
                  lineHeight: 1.8,
                  textShadow: "0 1px 10px rgba(0,0,0,0.35)",
                }}
              >
                PENTARIVA je promyšlený ekosystém péče, poznání a vztahů. Je to živý celek, ve
                kterém se potkává tradiční bylinné poznání, moderní vývoj, digitální technologie a
                evropská partnerská komunita. Pět proudů — jedna řeka.
              </p>
              <div className="mt-10 flex items-center gap-3">
                <span className="h-px w-10 bg-gold-soft/70" />
                <span
                  className="text-[11px] text-gold-soft"
                  style={{
                    letterSpacing: "0.34em",
                    fontWeight: 600,
                    textShadow: "0 1px 8px rgba(0,0,0,0.4)",
                  }}
                >
                  MANIFEST PENTARIVA
                </span>
              </div>
            </div>
            <blockquote className="self-center border-l border-gold-soft/60 pl-8 lg:pl-12">
              <p
                className="font-serif-display text-cream"
                style={{
                  fontSize: "clamp(1.6rem, 2.6vw, 2.35rem)",
                  lineHeight: 1.25,
                  fontStyle: "italic",
                  textShadow: "0 2px 14px rgba(0,0,0,0.4)",
                }}
              >
                „Značka je jen slovo.
                <br />
                Ekosystém je způsob života."
              </p>
            </blockquote>
          </div>
        </section>

        {/* ─── III. Filozofie — editorial magazine rhythm ─────────────────── */}
        <section id="filozofie" className="scroll-mt-24 bg-ivory py-32 lg:py-44">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
            <div className="max-w-[620px]">
              <ChapterLabel roman="III" kicker="FILOZOFIE" />
              <h2
                className="mt-10 font-serif-display text-forest-deep"
                style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.08 }}
              >
                Pět principů,
                <br />
                které nikdy neustoupí.
              </h2>
              <p
                className="mt-8 max-w-[520px] text-ink/75"
                style={{ fontSize: "1.075rem", lineHeight: 1.8 }}
              >
                Každá receptura, každé partnerství, každé slovo prochází stejnou zkouškou. Pokud
                rozhodnutí obstojí před těmito pěti principy, může se stát součástí ekosystému
                PENTARIVA.
              </p>
            </div>

            <ol className="mt-24 space-y-20 lg:space-y-24">
              {PRINCIPLES.map((p, i) => {
                const alignRight = i % 2 === 1;
                return (
                  <li key={p.roman}>
                    <div
                      className={`grid gap-8 lg:grid-cols-12 lg:gap-16 ${
                        alignRight ? "lg:pl-24" : ""
                      }`}
                    >
                      <div
                        className={`lg:col-span-3 ${alignRight ? "lg:order-2 lg:text-right" : ""}`}
                      >
                        <span
                          className="block font-serif-display text-gold-deep/70"
                          style={{
                            fontSize: "clamp(3.5rem, 6vw, 5rem)",
                            lineHeight: 1,
                            letterSpacing: "0.02em",
                          }}
                        >
                          {p.roman}
                        </span>
                        <span className="mt-4 inline-block h-px w-16 bg-gold/40" />
                      </div>
                      <div
                        className={`lg:col-span-8 ${
                          alignRight ? "lg:order-1 lg:col-start-2" : "lg:col-start-4"
                        }`}
                      >
                        <h3
                          className="font-serif-display text-forest-deep"
                          style={{
                            fontSize: "clamp(1.6rem, 2.4vw, 2rem)",
                            lineHeight: 1.15,
                          }}
                        >
                          {p.title}
                        </h3>
                        <p
                          className="mt-5 max-w-[560px] text-ink/80"
                          style={{ fontSize: "1.08rem", lineHeight: 1.8 }}
                        >
                          {p.body}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* ─── IV. Ekosystém — original editorial scene ───────────────────── */}
        <section id="ekosystem" className="scroll-mt-24 bg-ivory-warm/40 py-28 lg:py-40">
          <div className="mx-auto grid max-w-[1300px] gap-16 px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-20 lg:px-12">
            <div className="order-2 lg:order-1">
              <ChapterLabel roman="IV" kicker="EKOSYSTÉM" />
              <h2
                className="mt-10 font-serif-display text-forest-deep"
                style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.08 }}
              >
                Pět vrstev,
                <br />
                jeden živý celek.
              </h2>
              <p
                className="mt-10 max-w-[520px] text-ink/85"
                style={{ fontSize: "1.075rem", lineHeight: 1.8 }}
              >
                Produkty. Vzdělávání. Komunita. Poradna. Svět značky. Každá vrstva má vlastní
                hloubku, ale všechny sdílí stejné kořeny. Všechno funguje ve vzájemném propojení.
              </p>
              <p
                className="mt-6 max-w-[520px] text-ink/70"
                style={{ fontSize: "1.02rem", lineHeight: 1.8 }}
              >
                Zákazník se stává členem. Člen se stává partnerem. Partner se stává součástí
                příběhu, který přesahuje jednotlivce.
              </p>
              <div className="mt-10 flex items-center gap-3">
                <span className="h-px w-10 bg-gold/60" />
                <span
                  className="text-[11px] text-gold-deep"
                  style={{ letterSpacing: "0.32em", fontWeight: 500 }}
                >
                  JEDEN KOŘENOVÝ SYSTÉM
                </span>
              </div>
            </div>
            <figure className="order-1 lg:order-2">
              <div className="overflow-hidden rounded-[20px] ring-1 ring-forest-deep/10 shadow-[0_30px_60px_-40px_rgba(30,42,28,0.4)]">
                <img
                  src={svetEkosystem.url}
                  alt="Rozmarýn s kořeny v travertinové misce vedle otevřené botanické publikace, produktu PENTARIVA, tabletu s minimálním rozhraním a svazku ručně psaných dopisů — pět vrstev ekosystému v jedné scéně."
                  loading="lazy"
                  width={1600}
                  height={1200}
                  className="block h-auto w-full object-cover"
                />
              </div>
            </figure>
          </div>
        </section>

        {/* ─── V. Ruka a věda — split editorial spread ────────────────────── */}
        <section id="ruka-a-veda" className="scroll-mt-24 bg-ivory py-28 lg:py-40">
          <div className="mx-auto grid max-w-[1300px] gap-14 px-6 lg:grid-cols-[minmax(0,48fr)_minmax(0,52fr)] lg:items-center lg:gap-20 lg:px-12">
            <div>
              <ChapterLabel roman="V" kicker="RUKA A VĚDA" />
              <h2
                className="mt-10 font-serif-display text-forest-deep"
                style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.08 }}
              >
                Tradice a laboratoř
                <br />
                tvoří spolupracující celek.
              </h2>
              <div
                className="mt-12 space-y-8 text-ink/85"
                style={{ fontSize: "1.075rem", lineHeight: 1.8 }}
              >
                <p>
                  Bylinné receptury vznikaly po staletí prostou zkušeností — z generací, které
                  pozorovaly, ochutnávaly a předávaly. Tuto pokoru bereme jako živý výchozí bod
                  současné práce.
                </p>
                <p>
                  Každou surovinu, každý extrakt, každou kombinaci ověřujeme v evropských
                  laboratořích. Ne proto, abychom tradici nahradili — ale proto, abychom jí rozuměli
                  hlouběji.
                </p>
                <p>
                  Ruka řemeslníka a přístroj v laboratoři pracují ve stejném týmu. Věda potvrzuje.
                  Tradice inspiruje. Výsledkem je klid — vědomí, že nabízíme jen to, čemu sami
                  věříme.
                </p>
              </div>
            </div>
            <figure>
              <div className="overflow-hidden rounded-[20px] ring-1 ring-forest-deep/10 shadow-[0_30px_60px_-40px_rgba(30,42,28,0.4)]">
                <img
                  src={svetVeda.url}
                  alt="Botanický formulátor pečlivě vybírá rukou čerstvé bylinky u pracovního stolu s přesnou váhou, amberovými lahvičkami PENTARIVA a ručně psanými poznámkami — řemeslo a moderní ověřování v jednom týmu."
                  loading="lazy"
                  width={1400}
                  height={1600}
                  className="block h-auto w-full object-cover"
                />
              </div>
              <figcaption
                className="mt-4 text-[11px] text-ink/50"
                style={{ letterSpacing: "0.24em", fontWeight: 500 }}
              >
                RUKA · VÁHA · POZNÁMKA
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ─── VI. Evropa ─────────────────────────────────────────────────── */}
        <section id="evropa" className="relative isolate scroll-mt-24 bg-forest-deep">
          <img
            src={svetEurope.url}
            alt="Evropská krajina při zlaté hodině s kamennými terasami a bylinnými poli."
            loading="lazy"
            width={1920}
            height={1280}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Minimal bottom scrim only under the text block */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(180deg,transparent_0%,rgba(20,30,20,0.35)_65%,rgba(20,30,20,0.6)_100%)]"
          />
          <div className="relative mx-auto max-w-[900px] px-6 py-32 text-center lg:px-12 lg:py-48">
            <ChapterLabel roman="VI" kicker="EVROPA JAKO DOMOV" tone="dark" />
            <h2
              className="mt-12 font-serif-display text-cream"
              style={{
                fontSize: "clamp(2.25rem, 4.6vw, 3.75rem)",
                lineHeight: 1.05,
                textShadow: "0 1px 2px rgba(0,0,0,0.4), 0 2px 16px rgba(0,0,0,0.4)",
              }}
            >
              Kořeny máme v Evropě.
              <br />
              Další kroky vznikají tady.
            </h2>
            <p
              className="mx-auto mt-10 max-w-xl text-cream/95"
              style={{
                fontSize: "1.075rem",
                lineHeight: 1.8,
                textShadow: "0 1px 10px rgba(0,0,0,0.4)",
              }}
            >
              Pěstitelé z jižní i střední Evropy. Laboratoře v Německu a Rakousku. Řemeslní výrobní
              partneři v Čechách. Komunita, která přesahuje jazyky i hranice.
            </p>
            <p
              className="mx-auto mt-6 max-w-xl text-cream/80"
              style={{
                fontSize: "0.98rem",
                lineHeight: 1.8,
                textShadow: "0 1px 10px rgba(0,0,0,0.4)",
              }}
            >
              Evropa je pro nás kulturní krajina, ze které čerpáme a které vracíme.
            </p>
          </div>
        </section>

        {/* ─── VII. Signatura — closing editorial spread ──────────────────── */}
        <section id="signatura" className="scroll-mt-24 bg-ivory py-28 lg:py-40">
          <div className="mx-auto max-w-[1300px] px-6 lg:px-12">
            <figure className="overflow-hidden rounded-[20px] ring-1 ring-forest-deep/10 shadow-[0_30px_60px_-40px_rgba(30,42,28,0.4)]">
              <img
                src={svetSignatura.url}
                alt="Otevřený kožený botanický deník s prázdnou pravou stranou, plnicí pero, sklenice vody, rozmarýnová větvička a produkt PENTARIVA v teplém večerním evropském světle — prostor pro další kapitolu."
                loading="lazy"
                width={1600}
                height={1104}
                className="block h-auto w-full object-cover"
              />
            </figure>

            <div className="mx-auto mt-16 max-w-[720px] lg:mt-20">
              <ChapterLabel roman="VII" kicker="SIGNATURA" />
              <h2
                className="mt-10 font-serif-display text-forest-deep"
                style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.08 }}
              >
                To nejdůležitější pokračuje
                <br />
                mimo tyto stránky.
              </h2>
              <div
                className="mt-12 space-y-8 text-ink/85"
                style={{ fontSize: "1.09rem", lineHeight: 1.8 }}
              >
                <p>
                  Svět PENTARIVA netvoří pouze produkty, technologie nebo jednotlivé myšlenky. Tvoří
                  jej lidé, kteří věří, že skutečná hodnota vzniká z porozumění, každodenní péče a
                  vztahů budovaných v čase.
                </p>
                <p>
                  Každý člověk může do tohoto příběhu vstoupit jinak. Jako zákazník, člen komunity,
                  poradce nebo partner. Společným základem zůstává důvěra a přesvědčení, že dobré
                  věci rostou tehdy, když jim věnujeme pozornost.
                </p>
              </div>

              <p
                className="mt-16 font-serif-display text-forest-deep"
                style={{
                  fontSize: "clamp(1.6rem, 2.6vw, 2.25rem)",
                  lineHeight: 1.3,
                  fontStyle: "italic",
                }}
              >
                První kapitoly jsme napsali.
                <br />
                Další mohou vzniknout společně.
              </p>

              <div className="mt-12 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
                <a
                  href="/produkty"
                  className="group inline-flex items-center gap-3 whitespace-nowrap bg-forest-deep px-10 py-4 text-[11px] text-cream transition-all hover:bg-forest"
                  style={{ letterSpacing: "0.28em", fontWeight: 600 }}
                >
                  OBJEVIT PRODUKTY
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    strokeWidth={1.6}
                  />
                </a>
                <a
                  href="/komunita"
                  className="group inline-flex items-center gap-3 whitespace-nowrap border border-forest-deep px-10 py-4 text-[11px] text-forest-deep transition-all hover:bg-forest-deep hover:text-cream"
                  style={{ letterSpacing: "0.28em", fontWeight: 600 }}
                >
                  POZNAT KOMUNITU
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    strokeWidth={1.6}
                  />
                </a>
              </div>

              <div className="mt-16 flex items-center gap-3">
                <span className="h-px w-10 bg-gold/60" />
                <span
                  className="text-[11px] text-gold-deep"
                  style={{ letterSpacing: "0.32em", fontWeight: 500 }}
                >
                  PENTARIVA
                </span>
                <span className="h-px flex-1 bg-gold/20" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
