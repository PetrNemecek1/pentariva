# PENTARIVA Partner Program — FINÁLNÍ provizní model (zdroj pravdy)

Zdroj: finální infografika „PENTARIVA PARTNER PROGRAM" (2026-08) + dokument „Vlastní
objednávka Ambasadora D". Při rozporu s čímkoli jiným platí TENTO dokument.

Motto: Jeden ekosystém • Jedna zákaznická základna • Dvě obchodní cesty.

## A) PENTARIVA COMMUNITY („Prodávám, doporučuji a buduji komunitu")

Parametry:
- 30 % partnerská cena (ambasador nakupuje za 70 % katalogové ceny)
- 20 % osobní zákaznická provize
- 15 % / 6 % / 4 % týmové odměny (1./2./3. partnerská generace)
- až 2 % leadership bonus

### Flow A — osobní zákazník
- Ambasador A pošle osobní link/kód → Osobní zákazník A nakoupí za katalogovou cenu
  (příklad: nákup 1 000 Kč).
- Zákazník dostane Club kredit 3 % = 30 Kč.
- Ambasador A dostane 20 % pro sebe = 200 Kč (z nákupů svých vlastních zákazníků přes
  osobní link).
- DŮLEŽITÉ: „Osobní zákazník není partnerská generace." (nákupy zákazníků nespouštějí
  týmové odměny 15/6/4 výš po struktuře — jen 20 % pro ambasadora, jehož je zákazník.)

### Flow B — partnerská síť (genealogie)
Řetěz: Ambasador A (sponzor) → B (1. generace A) → C (2. generace A) → D (3. generace A).
- A získává 15 % z osobního obratu B, 6 % z osobního obratu C, 4 % z osobního obratu D.
- „A získává z B 15 %, z C 6 % a z D 4 %. Ne 15 % z celé větve." (procenta se vážou na
  vzdálenost generace od nakupujícího, každý příjemce dostává ze SVÉ perspektivy)
- Základem výpočtu týmových odměn je ČÁSTKA PO PARTNERSKÉ SLEVĚ (viz worked example).
- „30% partnerská sleva a 20% osobní provize se nikdy nesčítají na jedné objednávce."
  (vlastní nákup ambasadora = sleva 30 %, ŽÁDNÁ 20% provize z vlastního nákupu)

### Worked example (ZÁVAZNÝ) — vlastní objednávka Ambasadora D, katalog 1 000 Kč
| Příjemce      | Výpočet                       | Hodnota  |
|---------------|-------------------------------|----------|
| Ambasador D   | 30% partnerská sleva          | 300 Kč   |
| Ambasador C   | 1. generace: 15 % ze 700 Kč   | 105 Kč   |
| Ambasador B   | 2. generace: 6 % ze 700 Kč    | 42 Kč    |
| Ambasador A   | 3. generace: 4 % ze 700 Kč    | 28 Kč    |
| Leadership    | až 2 % ze 700 Kč              | 14 Kč    |
| Celkem terén  | 300+105+42+28+14              | 489 Kč = 48,9 % |
| PENTARIVĚ zbývá | 700 − 189                   | 511 Kč = 51,1 % |

POZOR na interpretaci generací: v tomto příkladu nakupuje D; „1. generace" z pohledu
plateb = PŘÍMÝ SPONZOR nakupujícího (C dostává 15 %), sponzor sponzora (B) 6 %,
pra-sponzor (A) 4 %. Tj. odměna teče 3 úrovně SMĚREM NAHORU od nakupujícího, z jeho
čisté (po slevě) částky.

## B) PENTARIVA TRADE („Nakupuji ve větším a prodávám vlastní distribucí")

Tři úrovně (příklad na katalogové ceně 1 000 Kč):
| Úroveň              | Zvýhodnění | Zaplatí | Provize získavateli | PENTARIVĚ zbývá |
|---------------------|-----------|---------|---------------------|-----------------|
| VSTUPNÍ PARTNER     | 30 %      | 700 Kč  | 10 % = 70 Kč        | 630 Kč          |
| AKTIVNÍ PARTNER     | 35 %      | 650 Kč  | 8 % = 52 Kč         | 598 Kč          |
| STRATEGICKÝ PARTNER | 40 %      | 600 Kč  | 5 % = 30 Kč         | 570 Kč          |

- „Trade obrat nevytváří plné týmové provize Community." (žádné 15/6/4; pouze provize
  získavateli — tomu, kdo Trade partnera přivedl, dle úrovně partnera)
- Provize získavatele se počítá ze zaplacené částky (10 % ze 700 = 70 Kč atd.).

## C) PENTARIVA CLUB (společná zákaznická vrstva)
- Jedna zákaznická vrstva pro organické zákazníky i zákazníky ambasadorů.
- JEDEN ZÁKAZNICKÝ ÚČET; 3 % kredit na další nákup; historie nákupů, odborný obsah,
  dlouhodobá péče.
- Organický zákazník (bez ambasadora): zaplatí 1 000 Kč, kredit 30 Kč, PENTARIVĚ zbývá
  970 Kč (žádná provize nikomu).

## D) Zastřešující pravidla
- „JEDEN KONKRÉTNÍ OBRAT SE VŽDY VYHODNOTÍ POUZE PODLE JEDNÉ OBCHODNÍ LOGIKY."
  (objednávka je BUĎ Community osobní nákup ambasadora, NEBO nákup osobního zákazníka,
  NEBO Trade nákup, NEBO organický nákup — nikdy kombinace)
- „Částka zbývající PENTARIVĚ není čistý zisk; hradí se z ní DPH, výroba, obaly,
  logistika, platební služby, provoz, marketing a reklamace."
  (=> procenta se počítají z cen VČETNĚ DPH; interní členění DPH je účetní záležitost)

## E) Doplňující rozhodnutí zadavatele (2026-08-12)
1. Objednávky v MVP VČETNĚ platební brány (online platba kartou).
2. Výplata provizí: primárně kredit na nákupy; volitelně výplata peněz na účet, ale
   NEJDŘÍVE 15 DNÍ PO PRODEJI (ochranná lhůta na vratky/reklamace). Vratka/reklamace
   provizi stornuje. [Upřesněno v R12: 15denní lhůta platí pro veškerý kredit.]
3. Stack: Supabase (Postgres, auth, storage, edge functions) + Next.js; aplikace na
   office.pentariva.com; statický hosting na stávajícím Firebase.
4. Domény: pentariva.com se stane primární doménou (uživatel převede), pentariva.cz
   na ni povede. Doporučovací linky: pentariva.com/r/{kód}.
5. E-maily: Resend.com (účet existuje).
6. Benefit club 15/20/25 + VIP úrovně: NEJSOU v MVP (zákazník = plná cena + 3% kredit);
   navrhnout jako konfigurovatelnou vrstvu do Fáze 2+.
7. Mentor/Leader role: struktura a dashboard ano (Fáze 2), ale leadership bonus „až 2 %"
   v MVP účtovat jako rezervovaný pool s ruční alokací adminem (přesné rozdělení firma
   teprve definuje).
8. Firma se teprve zakládá — platební brána a výplaty se implementují v testovacím
   režimu; produkční onboarding brány až po vzniku IČO.
