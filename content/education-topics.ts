export type EducationTopicIcon =
  "activity" | "shield" | "coffee" | "moon" | "movement" | "care" | "balance" | "quality";

export type EducationTopic = {
  slug: string;
  title: string;
  icon: EducationTopicIcon;
  headline: string;
  tileBody: string;
  lead: string;
  principles: readonly {
    title: string;
    body: string;
  }[];
  questions: readonly string[];
  closing: string;
  related: readonly {
    label: string;
    href: string;
  }[];
};

export const EDUCATION_TOPICS: readonly EducationTopic[] = [
  {
    slug: "energie-a-vitalita",
    title: "Energie a vitalita",
    icon: "activity",
    headline: "Energie má svůj rytmus.",
    tileBody: "Souvislosti denního rytmu, odpočinku, pohybu a pozornosti k vlastnímu tělu.",
    lead: "Každodenní vitalita vyrůstá ze souhry spánku, pohybu, jídla, odpočinku a tempa, které člověk dlouhodobě unese. Téma pomáhá vnímat vlastní rytmus a rozpoznat místa, kde drobná změna získává skutečný význam.",
    principles: [
      {
        title: "Rytmus dne",
        body: "Pravidelný začátek a konec dne vytvářejí pevné body, podle kterých lze lépe vnímat vlastní energii.",
      },
      {
        title: "Signály těla",
        body: "Únava, soustředění a potřeba odpočinku poskytují užitečnou zpětnou vazbu pro každodenní rozhodování.",
      },
      {
        title: "Udržitelné tempo",
        body: "Vitalita získává stabilitu prostřednictvím pravidelnosti, přiměřené zátěže a prostoru pro obnovu.",
      },
    ],
    questions: [
      "Ve které části dne přirozeně přichází nejvíce energie?",
      "Které návyky energii podporují a které ji rychle vyčerpávají?",
      "Má den jasný prostor pro pohyb, jídlo a odpočinek?",
      "Jakou jednu změnu lze udržet i během náročnějšího týdne?",
    ],
    closing:
      "Vitalita roste z rozhodnutí, která respektují vlastní tempo a dávají dni přirozený řád.",
    related: [
      { label: "Každodenní bylinný rituál", href: "/vzdelavani/pruvodci" },
      { label: "Rovnováha a spánek", href: "/vzdelavani/webinare" },
      { label: "Pět smyslů", href: "/vzdelavani/videa" },
    ],
  },
  {
    slug: "imunita",
    title: "Imunita",
    icon: "shield",
    headline: "Odolnost vyrůstá z každodenních podmínek.",
    tileBody:
      "Regenerace, životní styl, bezpečná orientace v informacích a respekt k individuálním potřebám.",
    lead: "Téma imunity propojuje regeneraci, pohyb, stravu, hygienu, věk a individuální zdravotní stav. Srozumitelná orientace pomáhá klást přesnější otázky a volit odpovědný postup podle konkrétní situace.",
    principles: [
      {
        title: "Celkový kontext",
        body: "Odolnost člověka souvisí s každodenním režimem, kvalitou odpočinku i aktuální životní situací.",
      },
      {
        title: "Přesné informace",
        body: "Etiketa, denní dávka, botanické označení a bezpečnostní upozornění tvoří základ informovaného výběru.",
      },
      {
        title: "Odborné hranice",
        body: "Opakované, výrazné nebo dlouhodobé obtíže patří do individuálního posouzení kvalifikovaného zdravotnického odborníka.",
      },
    ],
    questions: [
      "Jak vypadá můj běžný spánek a prostor pro regeneraci?",
      "Rozumím přesně údajům na etiketě zvoleného výrobku?",
      "Zohledňuje výběr můj věk, zdravotní stav a užívané léky?",
      "Patří moje otázka do obecného vzdělávání, nebo k odbornému posouzení?",
    ],
    closing: "Odpovědná péče začíná přesnou orientací a respektem k jedinečné situaci člověka.",
    related: [
      { label: "Jak číst složení", href: "/vzdelavani/clanky" },
      { label: "Rovnováha a spánek", href: "/vzdelavani/webinare" },
      { label: "Znalostní centrum", href: "/vzdelavani" },
    ],
  },
  {
    slug: "traveni",
    title: "Trávení",
    icon: "coffee",
    headline: "Trávení má vlastní rytmus.",
    tileBody: "Denní režim, způsob užívání, osobní tolerance a otázky, které zpřesňují výběr.",
    lead: "Orientace v tématu trávení začíná u každodenního rytmu, pravidelnosti a pozornosti k vlastní zkušenosti. Důležitou roli hraje také forma výrobku, doporučené užívání a individuální tolerance jednotlivých složek.",
    principles: [
      {
        title: "Pravidelnost",
        body: "Čas jídla, pitný režim, pohyb a klid pro samotné jídlo vytvářejí základ pro pozorování vlastních souvislostí.",
      },
      {
        title: "Způsob užívání",
        body: "Forma produktu, doporučená denní dávka a vztah k jídlu patří mezi praktické informace, které si zaslouží pozornost.",
      },
      {
        title: "Osobní zkušenost",
        body: "Jednoduchý záznam pomáhá rozpoznat opakující se situace a připravit konkrétní otázky pro další konzultaci.",
      },
    ],
    questions: [
      "Kdy a v jakém prostředí během dne jím?",
      "Které souvislosti se v mé zkušenosti pravidelně opakují?",
      "Rozumím doporučenému způsobu užívání zvoleného výrobku?",
      "Vyžaduje moje situace individuální odborné posouzení?",
    ],
    closing:
      "Pozornost k rytmu, souvislostem a vlastní zkušenosti vytváří pevný základ pro další rozhodnutí.",
    related: [
      { label: "Jak číst složení", href: "/vzdelavani/clanky" },
      { label: "Každodenní bylinný rituál", href: "/vzdelavani/pruvodci" },
      { label: "Poradna PENTARIVA", href: "/poradna" },
    ],
  },
  {
    slug: "spanek-a-regenerace",
    title: "Spánek a regenerace",
    icon: "moon",
    headline: "Obnova začíná rytmem dne.",
    tileBody: "Večerní prostředí, pravidelnost, smyslový klid a souvislosti kvalitní regenerace.",
    lead: "Spánek se připravuje v průběhu celého dne. Pohyb, světlo, pracovní tempo, večerní prostředí i pravidelnost společně vytvářejí podmínky pro klidnější přechod k odpočinku.",
    principles: [
      {
        title: "Přechod do večera",
        body: "Opakující se sled jednoduchých kroků pomáhá oddělit aktivní část dne od času určeného k odpočinku.",
      },
      {
        title: "Smyslové prostředí",
        body: "Světlo, zvuk, vůně, teplota a dotek materiálů formují atmosféru, ve které večerní rituál probíhá.",
      },
      {
        title: "Regenerace v souvislostech",
        body: "Kvalita odpočinku získává význam společně s denním pohybem, psychickou zátěží a pravidelností režimu.",
      },
    ],
    questions: [
      "Jaký okamžik dnes skutečně uzavírá aktivní část dne?",
      "Který smyslový podnět podporuje večerní zklidnění?",
      "Je čas usínání a vstávání během týdne dostatečně pravidelný?",
      "Které dlouhodobé obtíže patří k odbornému posouzení?",
    ],
    closing: "Klidný večer dává tělu i mysli srozumitelný signál, že přichází čas obnovy.",
    related: [
      { label: "Program Rovnováha a spánek", href: "/vzdelavani/webinare" },
      { label: "Každodenní bylinný rituál", href: "/vzdelavani/pruvodci" },
      { label: "Pět smyslů", href: "/vzdelavani/videa" },
    ],
  },
  {
    slug: "pohyb-a-vykon",
    title: "Pohyb a výkon",
    icon: "movement",
    headline: "Výkon vyrůstá z rovnováhy zátěže a obnovy.",
    tileBody:
      "Přiměřená zátěž, regenerace a dlouhodobý rytmus, který respektuje zkušenost člověka.",
    lead: "Pohyb získává dlouhodobou hodnotu ve chvíli, kdy odpovídá možnostem člověka a přirozeně se propojuje s odpočinkem. Pozornost patří pravidelnosti, postupnému rozvoji a kvalitě obnovy.",
    principles: [
      {
        title: "Přiměřená zátěž",
        body: "Tempo a náročnost pohybu vycházejí z aktuální kondice, zkušenosti a cíle každého člověka.",
      },
      {
        title: "Pravidelnost",
        body: "Udržitelný pohybový rytmus dává zkušenosti pevnější základ než jednotlivé intenzivní okamžiky.",
      },
      {
        title: "Prostor pro obnovu",
        body: "Odpočinek, spánek a vnímání reakcí těla tvoří přirozenou součást dlouhodobé péče o výkon.",
      },
    ],
    questions: [
      "Odpovídá současná zátěž mé zkušenosti a kondici?",
      "Má pohyb v týdnu pravidelné a realistické místo?",
      "Jak tělo reaguje během dne následujícího po zátěži?",
      "Který způsob obnovy podporuje dlouhodobou pravidelnost?",
    ],
    closing:
      "Pohyb získává sílu v rytmu, který podporuje rozvoj a současně ponechává prostor pro obnovu.",
    related: [
      { label: "Každodenní bylinný rituál", href: "/vzdelavani/pruvodci" },
      { label: "Energie a vitalita", href: "/vzdelavani/temata/energie-a-vitalita" },
      { label: "Rovnováha", href: "/vzdelavani/temata/rovnovaha" },
    ],
  },
  {
    slug: "kazdodenni-pece",
    title: "Každodenní péče",
    icon: "care",
    headline: "Rituál dává péči místo v čase.",
    tileBody: "Jednoduché kroky, smyslová pozornost a pravidelnost, která přirozeně zapadá do dne.",
    lead: "Každodenní péče získává tvar prostřednictvím jednoduchých a opakovatelných kroků. Osobní rituál propojuje záměr, prostředí, smysly a vlastní zkušenost do chvíle, která má v životě jasné místo.",
    principles: [
      {
        title: "Jasný záměr",
        body: "Pojmenovaný důvod dává rituálu směr a pomáhá vybrat podobu, která odpovídá skutečnému dni.",
      },
      {
        title: "Pevný okamžik",
        body: "Spojení rituálu s konkrétním místem nebo částí dne podporuje přirozenou pravidelnost.",
      },
      {
        title: "Vlastní záznam",
        body: "Krátká poznámka zachycuje zkušenost a umožňuje vnímat souvislosti, které se objevují v čase.",
      },
    ],
    questions: [
      "Jaký záměr má můj každodenní rituál?",
      "Ve které části dne pro něj přirozeně vzniká prostor?",
      "Které smyslové podněty pomáhají věnovat chvíli plnou pozornost?",
      "Jak jednoduchý může rituál být, aby zůstal dlouhodobě udržitelný?",
    ],
    closing: "Pravidelná péče vyrůstá z malých okamžiků, kterým člověk věnuje skutečnou pozornost.",
    related: [
      { label: "Praktický průvodce", href: "/vzdelavani/pruvodci" },
      { label: "Pět smyslů", href: "/vzdelavani/videa" },
      { label: "Svět PENTARIVA", href: "/svet-pentariva" },
    ],
  },
  {
    slug: "rovnovaha",
    title: "Rovnováha",
    icon: "balance",
    headline: "Rovnováha je živý proces.",
    tileBody: "Mysl, dech, střed, pohyb a obnova jako pět vzájemně propojených oblastí.",
    lead: "Rovnováha se proměňuje společně s životem člověka. PENTARIVA ji vnímá prostřednictvím pěti vnitřních sil: mysli, dechu, středu, pohybu a obnovy. Každá oblast má vlastní význam a společně vytvářejí přirozený rytmus.",
    principles: [
      {
        title: "Vnímání souvislostí",
        body: "Pozornost k mysli, dechu, tělu a každodenním rozhodnutím pomáhá zachytit celek místo jednotlivého okamžiku.",
      },
      {
        title: "Vlastní střed",
        body: "Pevné body dne vytvářejí prostor pro klidnější rozhodování a návrat k tomu, co má skutečný význam.",
      },
      {
        title: "Pohyb a obnova",
        body: "Aktivita a odpočinek se přirozeně doplňují a dávají každodennímu rytmu potřebnou pružnost.",
      },
    ],
    questions: [
      "Která z pěti vnitřních sil nyní potřebuje nejvíce pozornosti?",
      "Jaký pevný bod pomáhá vracet se k vlastnímu středu?",
      "Má den přirozený prostor pro pohyb i obnovu?",
      "Které rozhodnutí dnes podporuje soulad se sebou?",
    ],
    closing:
      "Rovnováha roste z pozornosti, kterou člověk věnuje svému rytmu a vzájemným souvislostem.",
    related: [
      { label: "Pět vnitřních sil", href: "/svet-pentariva#kapitola-4" },
      { label: "Každodenní bylinný rituál", href: "/vzdelavani/pruvodci" },
      { label: "Rovnováha a spánek", href: "/vzdelavani/webinare" },
    ],
  },
  {
    slug: "kvalita-a-slozeni",
    title: "Kvalita a složení",
    icon: "quality",
    headline: "Etiketa otevírá cestu k porozumění.",
    tileBody:
      "Původ, botanická přesnost, denní dávka a bezpečnostní souvislosti v jednom přehledu.",
    lead: "Kvalita se skládá z přesných rozhodnutí. Botanické označení, použitá část rostliny, forma složky, množství v denní dávce a bezpečnostní informace společně vytvářejí obraz, podle kterého se lze odpovědně orientovat.",
    principles: [
      {
        title: "Botanická přesnost",
        body: "Český i latinský název a použitá část rostliny pomáhají přesně určit, s jakou surovinou výrobek pracuje.",
      },
      {
        title: "Množství a forma",
        body: "Údaj o denní dávce získává význam společně s vysvětlením formy složky a doporučeného způsobu užívání.",
      },
      {
        title: "Bezpečnostní souvislosti",
        body: "Upozornění, omezení a osobní zdravotní kontext patří ke každému odpovědnému rozhodnutí.",
      },
    ],
    questions: [
      "Je rostlina označena českým i latinským názvem?",
      "Uvádí etiketa použitou část rostliny a množství v denní dávce?",
      "Rozumím formě složky a doporučenému způsobu užívání?",
      "Zohledňuje výběr bezpečnostní upozornění a můj osobní kontext?",
    ],
    closing: "Přesné informace dávají člověku klidnější prostor pro odpovědné rozhodnutí.",
    related: [
      { label: "Celý článek o složení", href: "/vzdelavani/clanky" },
      { label: "Praktický průvodce", href: "/vzdelavani/pruvodci" },
      { label: "Poradna PENTARIVA", href: "/poradna" },
    ],
  },
] as const;

export function getEducationTopic(slug: string) {
  return EDUCATION_TOPICS.find((topic) => topic.slug === slug);
}
