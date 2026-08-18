import product01 from "@/assets/product-01.webp";
import product02 from "@/assets/product-02.webp";
import product03 from "@/assets/product-03.webp";
import product04 from "@/assets/product-04.webp";

export type ProductConcept = {
  slug: string;
  name: string;
  shortName: string;
  format: string;
  intention: string;
  description: string;
  ritual: string;
  image: string;
  imageAlt: string;
  principles: readonly string[];
  suitableFor: readonly string[];
};

export const PRODUCT_CONCEPTS: readonly ProductConcept[] = [
  {
    slug: "kazdodenni-rovnovaha",
    name: "PENTARIVA Každodenní rovnováha",
    shortName: "Každodenní rovnováha",
    format: "Koncept bylinného komplexu",
    intention: "Klidný začátek každodenního rituálu.",
    description:
      "Návrh základního produktu vznikajícího portfolia, který vyjadřuje princip pravidelnosti, jednoduchosti a dlouhodobé péče.",
    ritual:
      "Jednoduchý ranní nebo polední okamžik, ve kterém rovnováha roste opakováním drobných kroků.",
    image: product01.src,
    imageAlt: "Koncept botanického produktu PENTARIVA Každodenní rovnováha",
    principles: [
      "srozumitelná role v každodenní péči",
      "transparentně vznikající složení",
      "forma navržená pro pravidelný rituál",
      "střízlivá a přesná komunikace",
    ],
    suitableFor: [
      "lidi hledající jednoduchý každodenní rituál",
      "zájemce o základní řadu PENTARIVA",
      "ty, kteří chtějí nejprve porozumět souvislostem",
    ],
  },
  {
    slug: "vecerni-harmonie",
    name: "PENTARIVA Večerní harmonie",
    shortName: "Večerní harmonie",
    format: "Koncept bylinných kapek",
    intention: "Přechod z aktivity do klidnější části dne.",
    description:
      "Redakční koncept tekuté botanické formy propojené s večerním rituálem, dechem a vědomým zpomalením.",
    ritual:
      "Několik klidných minut, teplý nápoj a prostor pro uzavření dne. Produkt doplňuje širší večerní rituál.",
    image: product02.src,
    imageAlt: "Koncept bylinných kapek PENTARIVA Večerní harmonie",
    principles: [
      "jemná a snadno uchopitelná forma",
      "důraz na smyslový a večerní kontext",
      "odborná a legislativní kontrola ve vývoji",
      "propojení s tématem regenerace a životního rytmu",
    ],
    suitableFor: [
      "lidi, kteří chtějí kultivovat večerní návyky",
      "zájemce o botanické tekuté formy",
      "čtenáře tématu spánku a regenerace",
    ],
  },
  {
    slug: "bylinny-ritual",
    name: "PENTARIVA Bylinný rituál",
    shortName: "Bylinný rituál",
    format: "Koncept sypané bylinné směsi",
    intention: "Chuť, vůně a dotek v jednom vědomém okamžiku.",
    description:
      "Koncept čajové směsi, která ztělesňuje smyslový jazyk PENTARIVA a propojuje přípravu, vůni, teplo a chvíli pozornosti.",
    ritual:
      "Pomalá příprava, vnímání vůně a teploty, chvíle bez spěchu. Každý krok má vlastní význam a společně vytvářejí prožitek.",
    image: product03.src,
    imageAlt: "Koncept sypané bylinné směsi PENTARIVA Bylinný rituál",
    principles: [
      "smyslově čitelná a přirozená forma",
      "původ a kvalita bylin jako základní priorita",
      "rituál přípravy jako součást zkušenosti",
      "jasné informace před jakýmkoliv doporučením",
    ],
    suitableFor: [
      "milovníky čajových a botanických rituálů",
      "lidi hledající vědomou pauzu během dne",
      "zájemce o příběh původu jednotlivých bylin",
    ],
  },
  {
    slug: "vnitrni-vitalita",
    name: "PENTARIVA Vnitřní vitalita",
    shortName: "Vnitřní vitalita",
    format: "Koncept prémiového doplňku",
    intention: "Dlouhodobá a odpovědná péče.",
    description:
      "Koncept prémiového produktu postaveného na vysokých nárocích na dokumentaci, původ, kvalitu a srozumitelnost.",
    ritual:
      "Pravidelná péče doplněná vzděláváním a realistickým očekáváním. Výslednou recepturu představujeme po odborném a legislativním schválení.",
    image: product04.src,
    imageAlt: "Koncept prémiového produktu PENTARIVA Vnitřní vitalita",
    principles: [
      "kvalita a dohledatelnost před marketingem",
      "odborná revize vznikající receptury",
      "srozumitelná dokumentace a upozornění",
      "propojení produktu se vzděláváním a Poradnou",
    ],
    suitableFor: [
      "zájemce o prémiovou produktovou řadu",
      "lidi, kteří vyžadují transparentní informace",
      "členy, kteří chtějí sledovat vývoj portfolia",
    ],
  },
];

export function getProductConcept(slug: string) {
  return PRODUCT_CONCEPTS.find((product) => product.slug === slug);
}
