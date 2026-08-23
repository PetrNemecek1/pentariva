# 25 — Revize balíku „PENTARIVA EKOSYSTÉM" (MASTER 1.0, 22. 8. 2026) proti našemu modelu

Vstup: složka kolegy — *Podmínky a pravidla Partner Programu MASTER v1.0*,
*B2B Podmínky a pravidla MASTER v1.0*, kalkulátory
`PENTARIVA_partner_program_UZAMCENY_MODEL_FINAL_01.26.xlsx` a
`PENTARIVA_B2B_PROGRAM_EKONOMICKY_MODEL_30_40_45.xlsx`, letáčky (5 cest,
Kvalifikace partnerů, Ambasador, Partner program, B2B síť, Benefit Club,
Regionální partner), Etický kodex AOP 2023.

Porovnáváno s: `13` (provizní model v2, schválený 20. 8.), `00` (R1–R25),
`02` (D-kontrakt), `03`/`05` (Trade), stav implementace k 23. 8. 2026 (`24`).

Výsledek v jedné větě: **ekonomika (sazby 20/8/4, Benefit 3/6/10, uvítací
výhoda, báze bez DPH, kontroly 35/45/30/17 %) sedí s tím, co máme v produkci;
liší se PRAVIDLA KOLEM — měsíční kvalifikace rolí se sestupem až na zákazníka
a převodem týmu, podmínění 2./3. linie rolí příjemce, zákaz čerpání provize
jako kreditu, měsíční dávková výplata, B2B úrovně 30/40/45 s čtvrtletní
kvalifikací bez provize získavateli, a dvě nové cesty (Partner Point,
hybridní prodejna).** Sekce 2 jsou rozhodnutí zadavatele, sekce 3 otázky
kolegovi, sekce 4 chyby v balíku, sekce 5 dopad na systém.

---

## 1. Co sedí (beze změny nebo jen přepnutí konstanty)

| Pravidlo kolegy | U nás | Akce |
|---|---|---|
| Provize 20 / 8 / 4 z uhrazené hodnoty produktů bez DPH, po slevách a kreditech, bez dopravy; max 3 provize na objednávku | `13` §1, `fn_net_haleru`, `team_gen1..3` | — |
| Benefit 3 / 6 / 10: prahy 0 / 1 500 / 5 000 Kč měsíčního katalogového obratu, „vyšší bere", přenos úrovně do dalšího měsíce, kredit z uhrazené hodnoty | `13` §3, `benefit_tiers` | — |
| Uvítací objednávka: sleva 20 % + pevný kredit 3 %, počítá se do Clubu i linií, nesčítá se s úrovňovým kreditem | `13` §4 | `welcome_mode` = `discount` (dnes výchozí `gift`) |
| Uvítací minimum **1 500 Kč** | default 500 Kč (`welcome_min_catalog_haleru`) | přepnout na 150 000 h |
| Vlastní objednávka partnera: sleva 30 %, bez vlastní provize, linie nahoru z `fn_upline(buyer, 3)`; nekombinuje se s uvítací slevou ani kreditem | `community_own` | — |
| Doprava zdarma od 2 000 Kč katalogu pro zákazníka | `shipping_free_from_haleru` | — |
| Kredit není provize ani pohledávka k výplatě; čekající → dostupný po ochranné lhůtě; při vratce se ruší/přepočítá | R12, settlement, reversal | — |
| Nevyzvednutá zásilka nevytváří aktivitu ani kredit; vratky a dobropisy se odečítají | 21 C, `fn_refund_order` | — |
| Kontroly ekonomiky: Σ provizí ≤ 35 %, zůstatek ≥ 45 %, hrubá marže ≥ 30 %, náklad ≤ 17 % | `/admin/economics`, `13` §7 | — |
| První řádné přiřazení rozhoduje; duplicity/self-referral se detekují; auditní stopa | referral cookie 30 dní, anti-abuse report, `audit_log` | — |
| Pozice: Ambasador / Komunitní partner / Regionální partner | tituly `career_level_params` | — |
| Minimální výplata 500 Kč; nevyplacený zůstatek se převádí | `payout_min_haleru` | — |

## 2. Rozdíly vyžadující rozhodnutí zadavatele (seřazeno podle dopadu)

### 2.1 Měsíční kvalifikace rolí, sestup až na zákazníka, převod týmu (kap. 8, 12)

**Kolega:** každý měsíc musí partner splnit všechny podmínky role současně:
Ambasador **10 aktivních zákazníků + 15 000 Kč** katalogového obratu;
Komunitní partner 15 zákazníků + 3 aktivní Ambasadoři + 45 zákazníků ve skupině
+ 67 500 Kč; Regionální 20 + 3 kvalifikovaní KP + 9 Ambasadorů + 155 zákazníků
+ 232 500 Kč. Bez ochranné lhůty. Kdo nesplní ani Ambasadora, **stává se
zákazníkem, ztrácí 30% výhodu i tým** — zákazníci a partneři se převedou
k nejbližšímu kvalifikovanému nadřazenému.

**U nás:** Ambasador je trvalá role po schválení (kvíz Akademie); povýšení na
mentor/leader podle `career_level_params` (3 partneři + 50 000 Kč / 8 +
200 000 Kč), **žádný sestup na zákazníka**, sponzor neměnný (D-kontrakt),
R21: tým se při deaktivaci nepřesouvá, podíl zůstává firmě (bez komprese, P4).

**Dopad:** největší změna v balíku. Znamená (a) měsíční kvalifikační engine
s počty zákazníků a skupinovými obraty (nové sloupce v `career_level_params`
+ noční/měsíční job), (b) provize 2./3. linie podmíněné rolí příjemce
v **uzavíraném** měsíci — tedy nárok je znám až po konci měsíce, ne při
zaplacení (dnes vzniká řádek ledgeru hned, `pending` 15 dní), (c) převod
týmu = změna sponzora/ownera v datech, což je v přímém rozporu s naším
pravidlem neměnného sponzora a s čerstvě schváleným R21.

**Doporučení:** kvalifikaci implementovat jako **bránu při měsíční uzávěrce**
(řádek ledgeru vznikne při zaplacení jako dnes, ale `hold_until` = uzávěrka
měsíce a při ní se nekvalifikovaný příjemce stornuje reversalem → podíl
firmě, přesně jak říká jeho §10.2 „příjemce splnil měsíční kvalifikaci");
**tým nepřesouvat** — místo fyzického převodu držet strukturu a nekvalifikovaný
článek jen přeskočit při výpočtu (virtuální komprese na dobu nekvalifikace),
což splní jeho „péče přechází k nejbližšímu aktivnímu partnerovi" bez
přepisování historie a bez nevratného kroku. Viz otázky 3.1–3.3.

### 2.2 Leadership pool 2 % (`13` §2) vs. max 32 % (kap. 10.3)

Kolega: součet provizí z objednávky je nejvýše 32 %, motivační programy běží
mimo ledger (§17.1). My: pool 2 % konfigurovatelný, generuje se z každé
objednávky. **Doporučení:** nastavit `leadership_pool` = 0 bp (jedno
nastavení v adminu), mechaniku nechat pro případ návratu. Potvrdit.

### 2.3 Provize se NESMÍ převádět na kredit (kap. 11.3) vs. R2

R2 říká „provize primárně kredit na nákupy". Kolega: dokud daňový poradce
neschválí, provize zůstává na kontě k bankovní výplatě, na kredit se
nepřevádí. U nás je provizní kredit dnes **čerpatelný v pokladně**
(`v_credit_balances`: provizní + klubový dostupný kredit se sčítají).
**Doporučení:** přepínač `commission_spendable` (default `false`) — pokladna
nabídne jen klubový kredit; provizní zůstatek jde jen do výplaty. Malá změna
(`fn_checkout` cap + UI). R2 pak zní „provize = výplata; kredit = jen Benefit".

### 2.4 Měsíční dávková výplata (kap. 11.1) vs. výplata na žádost

Kolega: uzávěrka 15. dne, firma **sama odešle** vše ≥ 500 Kč do 22. dne,
námitka do 15 dnů. My: partner žádá o výplatu (`fn_request_payout`),
admin schvaluje, ochranná lhůta 15 dní od zaplacení průběžně. **Doporučení:**
doplnit měsíční job „uzávěrka" = automaticky založit žádosti za všechny
partnery s dostupným ≥ 500 Kč (stejná cesta, stejné výpisy), žádost partnera
nechat jako doplněk. Ochrannou lhůtu vztáhnout k **převzetí** (máme události
dopravce) až po Packetě; do té doby 15 dní od zaplacení. Potvrdit harmonogram
15./22.

### 2.5 Doprava partnera (kap. 7.1, 14.1)

Kolega změnil: partner má dopravu zdarma od 2 000 Kč **stejně jako zákazník**
(etický důvod). My (`13` §5): partner hradí dopravu vždy. **Doporučení:**
přijmout — jedna migrace `fn_checkout`/`fn_validate_order_pricing` + pgTAP.
Totéž pro B2B (kap. 8.2: zdarma od 2 000 Kč vč. DPH před slevou) — dnes
Trade hradí vždy.

### 2.6 IČO před aktivací provizní role (kap. 3.1)

Kolega: Ambasador musí mít **před aktivací** ověřené IČO a oprávnění. My:
Ambasador bez IČO, IČO/fakturační profil až pro výplatu (`payout_profiles`,
`is_business`). **Doporučení:** zůstat u našeho — provize se **akruuje** bez
IČO, **vyplácí** se až s IČO (a výplaty jsou stejně vypnuté do IČO firmy).
Jinak se cesta „zákazník → Ambasador" zlomí hned na startu. Právník ať
potvrdí, že akruál bez živnosti je v pořádku (příjem vzniká až výplatou).

### 2.7 Zákazník → Ambasador: původní doporučitel dostane 8 % jen je-li KP (kap. 9.2)

Plyne z 2.1 (podmínění linie rolí). Pokud 2.1 přijmeme, řeší se stejnou
bránou. Pozor na důsledek: Ambasador, který vychová Ambasadora, z něj
**nemá nic**, dokud sám není Komunitní partner — demotivuje rozvoj týmu na
nejnižší úrovni. Viz otázka 3.4.

### 2.8 Oprava doporučitele 7 dní (kap. 4.2) vs. 14 dní (D-kontrakt)

Konfigurační; návrh přijmout 7 dní + podmínku „před první objednávkou".
Převod po první objednávce zůstává admin akcí s auditem (máme), kolega
vyžaduje písemný souhlas 4 stran — proces mimo systém.

### 2.9 B2B 30 / 40 / 45 s čtvrtletní kvalifikací (B2B doc kap. 4–6) vs. Trade 30/35/40 + 10/8/5 získavateli

| | Kolega | My (`03`, `trade_level_params`) |
|---|---|---|
| Slevy | START 30 / PRO 40 / PREMIUM 45 | entry 30 / active 35 / strategic 40 |
| Kvalifikace | automaticky: katalogový obrat **bez DPH** za kalendářní čtvrtletí 90 000 / 225 000; první objednávka 30 000 / 75 000 = okamžitě + garance do konce příštího čtvrtletí; „vyšší bere" v průběhu; sestup jen od nového čtvrtletí | úroveň nastavuje admin ručně |
| Provize získavateli | **žádná** („provizní systém pro obchodníky dotvořím") | 10 / 8 / 5 % partnerovi, který firmu přivedl |
| Benefit / linie | ne | ne (shodně) |
| Doprava | zdarma od 2 000 Kč vč. DPH před slevou | hradí vždy |
| Platba | předem převodem/kartou; splatnost na fakturu jen po schválení | karta (převod nově) |
| Odstoupení 14 dní | **ne** (podnikatel) | ⚠ veřejná stránka Moje objednávka nabízí odstoupení i Trade objednávce — opravit bez ohledu na rozhodnutí |

**Doporučení:** (a) sazby a prahy přijmout (jsou v `trade_level_params`,
přidat sloupce pro čtvrtletní prahy a první-objednávku, + job uzávěrky
čtvrtletí s garancí), (b) **provizi získavateli zatím NERUŠIT** — je to
jediný motiv partnera přivést firmu; kolegův „provizní systém pro
obchodníky" ještě neexistuje, až přijde, rozhodne se, zda nahrazuje nebo
doplňuje (otázka 3.7), (c) odstoupení vypnout pro `business_flow = trade`
hned po návratu (malá oprava, právní riziko na obou stranách).

### 2.10 Nové cesty: Partner Point a hybridní prodejna

- **Partner Point** = fyzické místo (vzorkovna) bez skladu, objednávky přes
  QR/link, provize 20/8/4 → v našem modelu je to **Ambasador s příznakem
  „Partner Point"** (schválení, adresa, případně veřejný seznam míst a
  možnost „výdej u Partner Pointu"). Systémově malé, ale zadání chybí
  (otázka 3.8).
- **Hybridní prodejna** = B2B účet (sklad, 30/40/45) **a zároveň** vlastní
  QR/link s provizemi 20/8/4 na jedné osobě/firmě. U nás má profil jednu
  roli (`trade_partner` NEBO `ambassador`) — vyžaduje vazbu firma ↔
  partnerský profil (dvě identity, dva ledgery, oddělené doklady). Střední
  dopad; kolegovo „jedna objednávka = jedna cesta" máme přes `business_flow`.

### 2.11 Aktivace kreditu 14 dní od převzetí (kap. 6.2) vs. 15 dní od zaplacení (R12)

Kolegovo znění je právně přesnější (lhůta pro odstoupení běží od převzetí).
Doporučení: ponechat R12 do zapnutí Packety; potom `hold_until` =
`delivered_at + 14 dní` (máme události dopravce), fallback 15 dní od
zaplacení. Není třeba rozhodovat teď.

## 3. Otázky pro kolegu (autora balíku)

1. **Kvalifikace Ambasadora 10 zákazníků + 15 000 Kč měsíčně:** ve vašem
   vlastním sešitu (list Pozice) má 16 Ambasadorů dohromady 80 zákazníků
   = **5 na Ambasadora a 7 500 Kč** — podle pravidel by **žádný z nich
   nebyl Ambasadorem**, Komunitní partner by měl 42 zákazníků ve skupině
   (potřeba 45) a celý model má 100 zákazníků (Regionální potřebuje 155).
   Model tedy nesplňuje svá pravidla. Jsou prahy záměrně tak vysoko (a
   pak je ekonomický model nerealistický), nebo mají být nižší?
2. **Co se děje s provizí v měsíci, kdy příjemce nekvalifikuje** — propadá
   firmě (§10.2), nebo jde nejbližšímu kvalifikovanému nahoru (§12.2 převod
   týmu)? Obě kapitoly říkají něco jiného.
3. **Převod týmu po sestupu na zákazníka:** má to být trvalá změna
   struktury (sponzor se přepíše, i kdyby se partner za měsíc
   rekvalifikoval — §12.3 říká „začíná v nové struktuře"), nebo dočasné
   přeskočení? Trvalý převod je nevratný a v rozporu s R21, které jsme
   schválili 22. 8. (tým se nepřesouvá).
4. **Ambasador, který vychová Ambasadora, nemá z něj nic** (8 % jen od
   Komunitního partnera). Je to záměr? Motivuje to raději nerozvíjet tým.
5. **Bez leadership poolu 2 %** — platí, že motivační programy jsou čistě
   mimo ledger a pool rušíme (nastavíme 0)?
6. **Provize jen bankovně, nikdy jako kredit** — potvrzuje to i zadavatel
   (ruší R2)? Partner dnes může provizní kredit utratit v e-shopu.
7. **B2B bez provize získavateli:** dnes partner, který přivede firmu,
   dostává 10/8/5 % z jejích nákupů. Váš „provizní systém pro obchodníky"
   to nahrazuje, nebo jde o jiné lidi (obchodní zástupci firmy)? Do té doby
   to rušit nechceme.
8. **Partner Point — co má systém umět:** veřejný seznam míst na webu?
   „Vyzvednout u Partner Pointu" jako způsob dopravy (pak drží zásobu =
   není to Partner Point)? Nebo jen příznak a QR v adminu?
9. **Hybridní prodejna:** je to jedna firma s jedním IČO, která má B2B účet
   i partnerský link? Kdo je „osoba" s provizním linkem — firma, nebo
   konkrétní člověk?
10. **B2B limity:** prahy bez DPH (90 000 / 225 000), ale doprava zdarma
    „vč. DPH před slevou" — dva základy vedle sebe matou; nešlo by vše bez
    DPH? Skok 30→40 je za 90 000, 40→45 za dalších 135 000 — PREMIUM
    přidává jen 5 bodů za 2,5× objem; je to záměr (45 je strop marže), nebo
    by PREMIUM měl být dostupnější (např. 180 000)? A „první objednávka
    30 000 → PRO 40 garantovaně až ~6 měsíců" znamená, že prodejna za
    jeden nákup drží 40 % půl roku bez dalšího objemu — OK?
11. **IČO před aktivací Ambasadora** — opravdu nechceme, aby Ambasador
    začal bez živnosti (provize by se jen akruovala do doby IČO)?
12. **Lhůta opravy doporučitele 7 dní** (dnes 14) — potvrdit.
13. **Vlastní objednávka partnera se nepočítá do jeho zákaznického
    obratu, ale do obratu nadřazeného** (§7.2) — pro nadřazeného se počítá
    jako „zákaznická objednávka" i do počtu zákazníků, nebo jen do obratu?

## 4. Chyby a nesrovnalosti v balíku (opravit před právníkem)

- Partner doc §1.2 říká B2B „se nepropojuje s provizními liniemi", B2B doc
  §11 a leták „5 cest" připouští hybrid s provizí z QR — OK, ale Partner doc
  by měl hybrid zmínit.
- Partner doc §6.2 (14 dní od převzetí) vs. §10.2 „uplynula ochranná doba"
  vs. R12 (15 dní od zaplacení) — sjednotit na jednu definici.
- §10.2 (nekvalifikovaný → nárok nevzniká) vs. §12.2 (převod týmu) — viz
  otázka 2.
- B2B sešit, list Úrovně B2B F7: „vyšší úroveň platí od následující
  objednávky" — pravidla i list Vstupy říkají „již na objednávku, která
  hranici překročí". Sjednotit.
- Partner sešit list Pozice: nesplňuje vlastní kvalifikační pravidla (otázka 1).
- Partner doc §3.1 vyžaduje IČO „před aktivací provizní role", ale §12.3
  připouští opakovaný vstup z pozice zákazníka bez zmínky o IČO.
- Leták „Kvalifikace partnerů" říká „Benefit kredit 3 % od 1 500 Kč", ale
  Benefit 3 % platí pro 0–1 499 Kč bez minima — 1 500 je minimum uvítací
  objednávky, ne kreditu. Zavádějící.
- Etický kodex AOP: §15 partner docu odpovídá; doplnit výslovný zákaz
  „cooling-off" nátlaku a povinnost uvést identitu prodávajícího při osobním
  prodeji (kodex čl. 2–3).

## 5. Dopad na systém, pokud se přijme vše (odhad pořadí prací)

| Změna | Velikost | Kde |
|---|---|---|
| Konstanty: uvítací 1 500 Kč + režim `discount`, pool 0, lhůta opravy 7 dní | malá (admin nastavení, bez migrace) | `/admin/settings` |
| Doprava zdarma ≥ 2 000 i pro partnera a Trade | malá migrace (`fn_checkout`, `fn_validate_order_pricing`) + pgTAP | `13` §5 |
| Provize nečerpatelná jako kredit (`commission_spendable=false`) | malá (`fn_checkout` strop, UI) | R2 |
| Odstoupení vypnout pro Trade objednávky | malá, **udělat v každém případě** | `fn_order_status_by_token`, `/order/` |
| Měsíční uzávěrka + automatické žádosti o výplatu ≥ 500 Kč | střední (pg_cron job nad `fn_request_payout`) | `15` |
| Měsíční kvalifikace rolí s počty zákazníků a skupinovým obratem, brána 2./3. linie při uzávěrce, sestup, virtuální komprese | **velká** — nové sloupce, měsíční job, změna `fn_generate_commissions`/`fn_settle_commissions`, zlaté testy, UI kvalifikace pro partnera | `13` nová kapitola |
| B2B čtvrtletní kvalifikace 30/40/45 + first-order garance + uzávěrka čtvrtletí | střední (sloupce `trade_level_params`, job, `fn_checkout` trade větev) | `03`/`05` |
| Partner Point příznak (+ seznam míst) | malá–střední podle odpovědi 8 | — |
| Hybridní prodejna (firma ↔ partnerský profil) | střední–velká (datový model identity) | `04` |
| Kredit aktivní 14 dní od převzetí | malá, až po Packetě | R12 |

Pořadí návrh: nejdřív malé věci (řádek 1–4) hned po pauze; měsíční
kvalifikace a B2B čtvrtletí až po odpovědích na otázky 1–3 a 7 — bez nich
se nedá napsat zadání, které by prošlo zlatými testy.
