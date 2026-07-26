const logoAsset = { url: "/images/pentariva-logo.jpg" };
const waterfallAsset = { url: "/images/waterfall.jpg" };
const farmerAsset = { url: "/images/farmer-clean.jpg" };
const journalAsset = { url: "/images/journal.jpg" };
const productsAsset = { url: "/images/homepage-products.png" };

function Ornament() {
  return (
    <div className="flex items-center justify-center gap-3 text-gold my-6">
      <span className="block h-px w-16 bg-gold/60" />
      <span className="text-gold/80">✦</span>
      <span className="block h-px w-16 bg-gold/60" />
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="uppercase tracking-[0.35em] text-xs text-gold/80 mb-6">{children}</p>
  );
}

export default function Home() {
  return (
    <div id="top" className="bg-background text-foreground">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-deep/85 border-b border-gold/20">
        <nav className="container-p mx-auto max-w-7xl flex items-center justify-between py-4">
          <a href="#top" className="flex items-center gap-3 min-w-0">
            <img src={logoAsset.url} alt="Pentariva" className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-gold/40" />
            <span className="font-serif text-base sm:text-lg tracking-[0.3em] text-cream truncate">PENTARIVA</span>
          </a>
          <ul className="hidden md:flex items-center gap-8 text-sm text-cream/80">
            <li><a href="#pribeh" className="hover:text-gold transition">Příběh</a></li>
            <li><a href="#filosofie" className="hover:text-gold transition">Filosofie</a></li>
            <li><a href="#kvalita" className="hover:text-gold transition">Kvalita</a></li>
            <li><a href="#ritual" className="hover:text-gold transition">Rituál</a></li>
            <li><a href="#komunita" className="hover:text-gold transition">Komunita</a></li>
            <li><a href="#kontakt" className="hover:text-gold transition">Kontakt</a></li>
          </ul>
          <a href="mailto:info@pentariva.cz" className="md:hidden text-xs tracking-widest uppercase text-gold">Kontakt</a>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 600px at 50% 0%, oklch(0.28 0.04 155) 0%, oklch(0.17 0.028 155) 60%, oklch(0.14 0.02 155) 100%)",
          }}
        />
        <div className="relative z-10 text-center container-p max-w-3xl mx-auto pt-32 pb-24">
          <img
            src={logoAsset.url}
            alt="Pentariva — logo"
            className="mx-auto w-40 md:w-56 mb-10 drop-shadow-[0_10px_40px_rgba(200,160,80,0.25)]"
          />
          <h1 className="font-serif text-5xl md:text-7xl text-cream leading-[1.05]">PENTARIVA</h1>
          <Ornament />
          <p className="font-serif text-2xl md:text-3xl text-gold italic">
            Z hlubin kořenů. Pro celého člověka.
          </p>
          <p className="mt-8 text-cream/70 max-w-xl mx-auto">
            Bylinná péče, která spojuje přírodní moudrost s potřebami dnešního člověka.
            Každá receptura vzniká trpělivě — s úctou k tradici a pozorností ke každému detailu.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href="#pribeh" className="inline-flex items-center rounded-full border border-gold/60 bg-gold/10 px-7 py-3 text-sm tracking-widest uppercase text-gold hover:bg-gold hover:text-primary-foreground transition">
              Náš příběh
            </a>
            <a href="#ritual" className="inline-flex items-center rounded-full border border-cream/30 px-7 py-3 text-sm tracking-widest uppercase text-cream/90 hover:border-gold hover:text-gold transition">
              Bylinný chrám
            </a>
          </div>
          <p className="mt-16 text-cream/50 italic font-serif text-lg">Život začíná vodou.</p>
        </div>
      </section>

      {/* PRODUKTY — PARALLAX PRUH */}
      <section
        aria-label="Produktová řada PENTARIVA"
        className="relative h-64 sm:h-80 md:h-[28rem] w-full overflow-hidden bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url(${productsAsset.url})` }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, oklch(0.22 0.03 155) 0%, transparent 18%, transparent 72%, oklch(0.22 0.03 155) 100%)",
          }}
        />
      </section>

      {/* PŘÍBĚH */}
      <section id="pribeh" className="relative py-28 md:py-40">
        <div className="container-p mx-auto max-w-6xl grid md:grid-cols-2 gap-14 items-center">
          <div>
            <SectionEyebrow>Náš příběh</SectionEyebrow>
            <h2 className="font-serif text-4xl md:text-5xl text-cream leading-tight">
              Každý příběh začíná jediným zápisem.
            </h2>
            <div className="mt-8 space-y-5 text-cream/80 leading-relaxed">
              <p>
                Před více než šedesáti lety začala maminka jedné ze zakladatelek zapisovat
                do svého bylinného deníku zkušenosti, receptury a poznatky, které sbírala
                během života.
              </p>
              <p className="text-cream/60 italic">Nebyl určen k vydání. Nebyl psán pro veřejnost.</p>
              <p>
                Vznikal z lásky k přírodě, úcty k tradičnímu bylinoznalectví a z touhy
                pomáhat lidem pečovat o sebe přirozenou cestou.
              </p>
              <p>
                Každá stránka nesla kus zkušenosti. Každý zápis vznikal s trpělivostí.
                A každá receptura měla svůj důvod.
              </p>
              <p className="text-gold font-serif text-xl pt-2">
                Nikdo tehdy netušil, že právě tento deník se jednou stane kořenem značky PENTARIVA.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-lg border border-gold/25" aria-hidden />
            <img
              src={journalAsset.url}
              alt="Otevřený bylinný deník s ručně psanými zápisky a lisovanými rostlinami"
              className="relative w-full rounded-md shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
            />
          </div>
        </div>

        <div className="container-p mx-auto max-w-3xl text-center mt-32">
          <h3 className="font-serif text-3xl md:text-4xl text-cream">
            To nejcennější nebylo napsáno pro slávu.
          </h3>
          <p className="mt-4 text-gold font-serif text-xl">Bylo napsáno proto, aby pomáhalo.</p>
          <Ornament />
          <p className="text-cream/75 leading-relaxed">
            Stránku po stránce se rodila sbírka zkušeností, které spojovala úcta k přírodě,
            pečlivé pozorování a hluboký respekt k člověku. Nešlo o hledání zázraků. Šlo
            o každodenní práci, naslouchání a snahu porozumět tomu, co příroda nabízí.
          </p>
          <p className="mt-8 font-serif italic text-gold/90 text-2xl">
            Velké příběhy často nezačínají velkými činy. Začínají trpělivostí.
          </p>
        </div>
      </section>

      {/* FILOSOFIE */}
      <section id="filosofie" className="relative py-28 md:py-36 bg-deep">
        <div className="container-p mx-auto max-w-5xl text-center">
          <SectionEyebrow>Filosofie značky</SectionEyebrow>
          <h2 className="font-serif text-4xl md:text-6xl text-cream leading-tight">
            Z hlubin kořenů.<br />
            <span className="text-gold">Pro celého člověka.</span>
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-8 text-left">
            <p className="text-cream/80 leading-relaxed">
              Každá značka má svůj začátek. Naším začátkem nebyl obchod. Byla jím důvěra
              v přírodu, úcta ke zkušenostem a přesvědčení, že skutečná péče o člověka
              začíná mnohem hlouběji.
            </p>
            <p className="text-cream/80 leading-relaxed">
              Kořeny nejsou minulostí. Jsou zdrojem síly, ze které můžeme růst. Stejně
              jako strom čerpá život z toho, co není vidět, i člověk nachází svou
              rovnováhu v pevných základech.
            </p>
            <p className="text-cream/80 leading-relaxed">
              Nevytváříme jen produkty. Budujeme cestu, která spojuje přírodní moudrost
              s potřebami dnešního člověka. To, co nás drží pevně v zemi, nám zároveň
              dává odvahu růst.
            </p>
          </div>
        </div>

        <div className="container-p mx-auto max-w-6xl mt-24 grid md:grid-cols-3 gap-6">
          {[
            {
              eyebrow: "Pět bodů",
              title: "Jeden člověk.",
              body: "Stejně jako se tělo opírá o pět základních bodů, i zdraví stojí na pevných základech. Každý má svůj význam. Teprve společně vytvářejí celek, který může růst, obnovovat se a žít v přirozené harmonii.",
              quote: "Nepečujeme o jednotlivé části. Pečujeme o člověka jako celek.",
            },
            {
              eyebrow: "Pět smyslů",
              title: "Jeden prožitek.",
              body: "PENTARIVA nevychází jen z toho, co člověk potřebuje. Vychází také z toho, co člověk cítí. Vůně bylin. Dotek přírody. Chuť pečlivě vybraných rostlin. Klid, který přichází v rovnováze.",
              quote: "Skutečná rovnováha není vidět. Je cítit.",
            },
            {
              eyebrow: "Pět vnitřních sil",
              title: "Jeden přirozený rytmus.",
              body: "Mysl, dech, střed, pohyb a obnova. Žádná z těchto oblastí nestojí sama. Společně vytvářejí rytmus, ve kterém žijeme.",
              quote: "Rovnováha neznamená zastavit se. Znamená pohybovat se v souladu se sebou.",
            },
          ].map((c) => (
            <article key={c.eyebrow} className="rounded-lg border border-gold/20 bg-card/40 p-8 backdrop-blur-sm hover:border-gold/50 transition">
              <p className="uppercase tracking-[0.3em] text-xs text-gold">{c.eyebrow}</p>
              <h3 className="mt-4 font-serif text-2xl text-cream">{c.title}</h3>
              <p className="mt-4 text-cream/75 leading-relaxed text-sm">{c.body}</p>
              <p className="mt-6 font-serif italic text-gold/90 border-t border-gold/20 pt-4">{c.quote}</p>
            </article>
          ))}
        </div>

        <div className="container-p mx-auto max-w-5xl mt-24">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {[
              ["Mysl", "Prostor, ve kterém vzniká směr."],
              ["Dech", "Rytmus, který nás vrací k přítomnému okamžiku."],
              ["Střed", "Pevný bod, ze kterého vyrůstá stabilita."],
              ["Pohyb", "Přirozená součást života a každodenní vitality."],
              ["Obnova", "Schopnost zpomalit, doplnit sílu a znovu pokračovat."],
            ].map(([t, d]) => (
              <div key={t} className="px-2">
                <p className="font-serif text-gold text-xl tracking-[0.2em]">{t.toUpperCase()}</p>
                <div className="my-3 mx-auto h-px w-8 bg-gold/40" />
                <p className="text-cream/70 text-sm leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KVALITA */}
      <section id="kvalita" className="relative py-28 md:py-36">
        <div className="container-p mx-auto max-w-6xl grid md:grid-cols-2 gap-14 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="absolute -inset-4 rounded-lg border border-gold/25" aria-hidden />
            <img
              src={farmerAsset.url}
              alt="Ruce pěstitele opatrně přidržující mladou bylinu v poli za teplého ranního světla"
              className="relative w-full rounded-md shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <SectionEyebrow>Kvalita &amp; původ</SectionEyebrow>
            <h2 className="font-serif text-4xl md:text-5xl text-cream leading-tight">
              Kvalita nezačíná ve výrobě.
              <br />
              <span className="text-gold">Začíná tam, kde rostlina vyrůstá.</span>
            </h2>
            <div className="mt-8 space-y-5 text-cream/80 leading-relaxed">
              <p>
                Každá bylina je výsledkem místa, času a podmínek, ve kterých mohla růst.
                Proto se nedíváme pouze na její název. <span className="text-gold">Zajímá nás její původ.</span>
              </p>
              <p>
                Půda, světlo, vláha i okamžik sklizně ovlivňují charakter rostliny dávno
                předtím, než se stane součástí výsledné receptury.
              </p>
              <p>
                Přírodní původ pro nás neznamená automatickou dokonalost. Znamená
                odpovědnost vybírat s pozorností, rozlišovat a pracovat pouze s tím,
                čemu můžeme skutečně důvěřovat.
              </p>
              <p className="font-serif italic text-gold/90 text-xl pt-2">
                Nemůžeme ovlivnit vše, co příroda vytvoří. Můžeme však rozhodnout, co přijmeme dál.
              </p>
            </div>
          </div>
        </div>

        <div className="container-p mx-auto max-w-6xl mt-24 grid md:grid-cols-3 gap-10">
          {[
            {
              t: "Receptura není náhoda.",
              b: "Za každou recepturou stojí zkušenosti, pečlivé pozorování a respekt k tomu, co příroda nabízí. Nevěříme, že více znamená lépe.",
              q: "Nejde o to přidat co nejvíce. Jde o to vybrat to správné.",
            },
            {
              t: "Každý detail má svůj význam.",
              b: "Kvalita nevzniká náhodou. Je výsledkem stovek drobných rozhodnutí, která často zůstávají skrytá — a přesto tvoří celek, kterému lze věřit.",
              q: "Když je správný každý detail, vzniká celek, kterému lze věřit.",
            },
            {
              t: "Důvěra roste každým rozhodnutím.",
              b: "Za každou rostlinou je její původ. Za každým výběrem je lidské rozhodnutí. Za každým výrobkem musí být jistota, že jeho cesta byla vedena se stejnou péčí.",
              q: "Než požádáme o důvěru, musíme si ji zasloužit vlastní prací.",
            },
          ].map((c) => (
            <div key={c.t} className="border-t border-gold/30 pt-6">
              <h3 className="font-serif text-2xl text-cream">{c.t}</h3>
              <p className="mt-4 text-cream/75 leading-relaxed text-sm">{c.b}</p>
              <p className="mt-4 font-serif italic text-gold/90">{c.q}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ČISTOTA */}
      <section className="relative overflow-hidden bg-deep">
        <div className="grid md:grid-cols-2">
          <div className="relative min-h-[420px] md:min-h-[720px]">
            <img
              src={waterfallAsset.url}
              alt="Průzračná voda stékající po mechem porostlé skále v hlubokém lese"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "linear-gradient(to right, transparent 60%, oklch(0.17 0.028 155) 100%)" }}
            />
          </div>
          <div className="container-p py-24 md:py-32 max-w-xl">
            <SectionEyebrow>Čistota</SectionEyebrow>
            <h2 className="font-serif text-4xl md:text-5xl text-cream leading-tight">
              Čistota má svůj <span className="italic text-gold">zdroj.</span>
            </h2>
            <div className="mt-8 space-y-5 text-cream/80 leading-relaxed">
              <p>
                Voda je prvním předpokladem života. Je součástí rostlin, přírodních
                procesů i péče, která z nich vzniká.
              </p>
              <p>
                Proto ji nevnímáme pouze jako jednu ze složek. Je nositelem čistoty
                a základem každého šetrného postupu.
              </p>
              <p>
                Stejně jako u bylin záleží i u vody na jejím původu, vlastnostech
                a způsobu, jakým s ní zacházíme. Přírodní sílu není třeba přehlušit —
                je třeba vytvořit podmínky, ve kterých může zůstat zachována.
              </p>
              <p className="font-serif italic text-gold/90 text-xl pt-2">
                To nejčistší často nevzniká. Pouze mu dovolíme zůstat tím, čím je.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRADICE */}
      <section className="py-28 md:py-36">
        <div className="container-p mx-auto max-w-4xl text-center">
          <SectionEyebrow>Tradice a pokrok</SectionEyebrow>
          <h2 className="font-serif text-4xl md:text-5xl text-cream leading-tight">
            Hluboké kořeny nejsou překážkou pokroku.
            <br />
            <span className="text-gold">Jsou jeho pevným základem.</span>
          </h2>
          <Ornament />
          <p className="text-cream/80 leading-relaxed">
            Tradice sama o sobě nestačí. Stejně jako nestačí samotná moderní technologie.
            Skutečná hodnota vzniká teprve ve chvíli, kdy se obě přirozeně propojí.
            Nevnímáme tradici jako návrat do minulosti — vnímáme ji jako pevný základ,
            na kterém může vznikat kvalitní péče pro člověka dnešní doby.
          </p>
          <p className="mt-8 font-serif italic text-gold text-xl">
            Minulost nám ukázala směr. Budoucnost vytváříme tím, jak s tímto dědictvím pracujeme dnes.
          </p>
        </div>
      </section>

      {/* RITUÁL */}
      <section id="ritual" className="relative py-28 md:py-36 bg-deep">
        <div className="container-p mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <SectionEyebrow>Bylinný chrám — první produktová řada</SectionEyebrow>
            <h2 className="font-serif text-4xl md:text-5xl text-cream leading-tight">
              Když se receptura stane <span className="text-gold italic">každodenním rituálem.</span>
            </h2>
            <p className="mt-6 text-cream/75 leading-relaxed">
              Výrobek je pouze začátkem. Skutečnou hodnotu získává ve chvíli, kdy se
              stane přirozenou součástí každodenní péče. Bylinný chrám je první
              produktovou řadou PENTARIVY — nechceme předat pouze výrobek, chceme
              pomoci vytvořit prostor pro pravidelnou péči o sebe.
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-10 items-stretch">
            <div className="relative rounded-xl border border-gold/30 bg-card/50 p-10 flex flex-col justify-between">
              <div>
                <p className="uppercase tracking-[0.3em] text-xs text-gold">Herbal Complex</p>
                <h3 className="mt-4 font-serif text-3xl text-cream">PENTARIVA Herbalanc</h3>
                <p className="mt-4 text-cream/75 leading-relaxed">
                  Pečlivě sestavená bylinná kompozice, která vzniká s jediným cílem —
                  zachovat přirozenou sílu rostlin a proměnit ji ve smysluplnou péči
                  o člověka.
                </p>
              </div>
              <p className="mt-8 font-serif italic text-gold/90">
                Herbal Rituals. Inner Balance.
              </p>
            </div>

            <div className="rounded-xl border border-gold/30 bg-card/50 p-10">
              <p className="uppercase tracking-[0.3em] text-xs text-gold">Všímat si · Zaznamenávat · Porozumět</p>
              <h3 className="mt-4 font-serif text-3xl text-cream">
                Osobní zkušenost jako součást péče.
              </h3>
              <p className="mt-4 text-cream/75 leading-relaxed">
                Pravidelnost nevzniká náhodou. Vzniká z malých okamžiků, kterým
                věnujeme vědomou pozornost. Součástí této cesty může být i jednoduchý
                osobní záznam — ne proto, aby něco dokazoval, ale aby pomohl lépe
                porozumět sobě samému.
              </p>
              <p className="mt-6 font-serif italic text-gold/90">
                To, čemu věnujeme pozornost, dokážeme lépe vnímat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* KOMUNITA */}
      <section id="komunita" className="py-28 md:py-36">
        <div className="container-p mx-auto max-w-5xl text-center">
          <SectionEyebrow>Komunita &amp; ambasadoři</SectionEyebrow>
          <h2 className="font-serif text-4xl md:text-5xl text-cream leading-tight">
            Společně roste více <span className="text-gold italic">než jen důvěra.</span>
          </h2>
          <p className="mt-8 text-cream/80 leading-relaxed max-w-3xl mx-auto">
            Každý přichází s vlastním příběhem. To, co nás spojuje, je společná touha
            žít vědoměji, zdravěji a s větším respektem k přírodě. PENTARIVA nevnímáme
            jako uzavřenou značku — chceme vytvářet prostor, ve kterém mohou lidé
            společně objevovat cestu k dlouhodobé péči o sebe i své blízké.
          </p>
        </div>

        <div className="container-p mx-auto max-w-6xl mt-16 grid md:grid-cols-3 gap-8">
          {[
            {
              t: "Péče roste ve vztazích.",
              b: "Skutečná péče nekončí u jednoho výrobku. Pokračuje v prostředí, které člověka podporuje na jeho vlastní cestě.",
            },
            {
              t: "Dobré věci rostou, když je lidé sdílejí.",
              b: "Každá cesta začíná u jednotlivce. Největší sílu však získává ve chvíli, kdy se stává inspirací také pro druhé.",
            },
            {
              t: "Ambasador, který nepřesvědčuje.",
              b: "Skutečný ambasador nevede ostatní za sebou. Pomáhá jim objevit jejich vlastní cestu — sdílením zkušenosti, nikoli formální rolí.",
            },
          ].map((c) => (
            <div key={c.t} className="rounded-lg border border-gold/20 p-8 hover:border-gold/50 transition">
              <h3 className="font-serif text-xl text-gold">{c.t}</h3>
              <p className="mt-3 text-cream/75 text-sm leading-relaxed">{c.b}</p>
            </div>
          ))}
        </div>

        <div className="container-p mx-auto max-w-3xl text-center mt-24">
          <h3 className="font-serif text-3xl md:text-4xl text-cream">
            Každá velká cesta začíná jediným krokem.
          </h3>
          <p className="mt-6 text-cream/80 leading-relaxed">
            Nikdo nemusí být připraven od prvního dne. Stačí být otevřený novým
            zkušenostem a mít chuť růst vlastním tempem.
          </p>
          <p className="mt-8 font-serif italic text-gold text-xl">
            Budoucnost nevzniká náhodou. Vzniká odvahou udělat první krok.
          </p>
          <a href="#pribeh" className="mt-10 inline-flex items-center rounded-full border border-gold/60 bg-gold/10 px-8 py-3 text-sm tracking-widest uppercase text-gold hover:bg-gold hover:text-primary-foreground transition">
            Staňte se součástí příběhu
          </a>
        </div>
      </section>

      {/* CLOSING */}
      <section className="relative py-32 bg-deep border-t border-gold/20">
        <div className="container-p mx-auto max-w-3xl text-center">
          <img src={logoAsset.url} alt="Pentariva" className="mx-auto w-24 mb-8 opacity-90" />
          <p className="font-serif text-2xl md:text-3xl text-cream leading-snug">
            První stránku napsala tradice.
            <br />
            <span className="text-gold italic">Další můžeme napsat společně.</span>
          </p>
          <Ornament />
          <p className="text-cream/70">Děkujeme, že jste se stali součástí našeho příběhu.</p>
          <p className="mt-2 uppercase tracking-[0.35em] text-xs text-gold/80">
            Z hlubin kořenů. Pro celý život.
          </p>
        </div>
      </section>

      {/* KONTAKT */}
      <section id="kontakt" className="py-24 bg-deep border-t border-gold/20">
        <div className="container-p mx-auto max-w-3xl text-center">
          <SectionEyebrow>Kontakt</SectionEyebrow>
          <h2 className="font-serif text-3xl md:text-4xl text-cream">Ozvěte se nám.</h2>
          <p className="mt-6 text-cream/75">Pro dotazy, spolupráci nebo zájem stát se ambasadorem.</p>
          <a
            href="mailto:info@pentariva.cz"
            className="mt-8 inline-flex items-center rounded-full border border-gold/60 bg-gold/10 px-8 py-3 text-sm tracking-widest uppercase text-gold hover:bg-gold hover:text-primary-foreground transition"
          >
            info@pentariva.cz
          </a>
        </div>
      </section>

      <footer className="border-t border-gold/15 py-10">
        <div className="container-p mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs uppercase tracking-[0.3em] text-cream/50">
          <span>© {new Date().getFullYear()} Pentariva</span>
          <a href="mailto:info@pentariva.cz" className="hover:text-gold transition normal-case tracking-normal">info@pentariva.cz</a>
          <span>Herbal Rituals · Inner Balance</span>
        </div>
      </footer>

    </div>
  );
}
