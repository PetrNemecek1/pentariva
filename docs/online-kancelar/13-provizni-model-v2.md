# 13 — Provizní model v2 (UZAMČENÝ EKOSYSTÉM 20/8/4 + Benefit Club 3/6/10)

> **Závazné zadání schválené zadavatelem 20. 8. 2026.** Nahrazuje provizní část
> `03-provizni-pravidla-zdroj.md` a příslušné pasáže `04`/`05`. Zdrojem čísel je
> infografika „PENTARIVA PARTNER PROGRAM" a sešit
> `PENTARIVA_partner_program_UZAMCENY_MODEL.xlsx` (list Vstupy = jediné editovatelné
> hodnoty). Tento dokument je psaný jako **kompletní implementační zadání pro AI
> model** — vše potřebné je zde, není nutné znát konverzaci zadavatele.
>
> **Guardraily `10-implementacni-plan.md` §1 platí beze změny.** Tento dokument JE
> písemné schválení zadavatele pro změnu sazeb, peněžních funkcí a zlatých testů
> v rozsahu níže — nic nad tento rozsah se nemění. Postup: `supabase migration new`
> → lokální `db reset` + pgTAP → PR s blokem „SCHVÁLENÍ ZADAVATELE: ano
> (docs/online-kancelar/13-provizni-model-v2.md)" → merge → `deploy-db`.

## 0. Řídicí principy

1. **Všechno konfigurovatelné.** Zadavatel výslovně: model se bude dál měnit.
   Každé číslo z tohoto dokumentu žije v `commission_rates`, `app_settings`,
   `benefit_tiers` nebo `career_level_params` — **nikdy v kódu**. Admin UI
   (`/admin/settings`) musí umět editovat vše s auditem (`settings.changed`,
   `rates.changed`). Změna sazby **vloží novou verzi** (`commission_rule_versions`,
   `valid_from = now()`); zaplacené objednávky drží otisk sazeb z doby
   `fn_generate_commissions` a **nepřepočítávají se**. Výjimka: DPH sazby jsou
   snapshot na `order_items.vat_rate_bp` (už existuje).
2. **Jeden obrat = jedna logika** zůstává; mění se obsah logiky.
3. **Ledger append-only, storno reversalem** — mechanika D2/D4 beze změny.
4. **Trade kanál (30/35/40 % sleva + 10/8/5 % získavateli) se NEMĚNÍ** —
   rozhodnutí zadavatele: oddělený B2B kanál mimo partnerský program.
5. 15denní ochranná lhůta (R12) platí pro všechny nové kladné entries vč.
   Benefit kreditů; `fn_settle_commissions` beze změny.

## 1. Provizní linie 20 / 8 / 4 (nahrazuje 20 % osobní + 15/6/4 týmové)

- **Každá zaplacená objednávka** (flow `community_customer`, `community_own`,
  `organic` s atribucí — viz níže) posílá provizi **třem liniím nahoru**:
  1. linie **20 %**, 2. linie **8 %**, 3. linie **4 %**. Σ = 32 %.
- **Linie kupujícího-zákazníka:** 1. linie = `owner_ambassador_id` (trvalá
  atribuce, beze změny), 2. linie = sponzor tohoto ambasadora, 3. linie = jeho
  sponzor. Technicky: gen1 = owner, gen2–3 = `fn_upline(owner, 2)` posunuté o 1.
- **Linie kupujícího-partnera (vlastní objednávka se slevou 30 %):** gen1–3 =
  `fn_upline(buyer, 3)`. Partnerská sleva 30 % zůstává (`community_own`).
- **Organický zákazník bez ambasadora:** žádné linie (vše zůstává v marginu),
  Benefit Club kredit ale dostává.
- **Bez komprese** (P4 beze změny): chybí-li článek linie, jeho podíl zůstává
  firmě (není příjemce → řádek nevzniká, margin je dopočet).
- **Báze = uhrazená hodnota produktů BEZ DPH, po slevách a kreditech, bez
  dopravy.** Nová funkce `fn_net_haleru(paid_haleru, vat_rate_bp)` =
  HALF-UP(`paid * 10000 / (10000 + vat_rate_bp)`); netto báze objednávky =
  Σ přes `order_items` z `fn_net_haleru(line_paid_haleru_po_odečtení_kreditu…)`.
  Zjednodušení povoleno: kredit se odečítá od celku objednávky, proto netto báze
  = `fn_net_haleru(goods_paid_haleru, vážená DPH)`; při jednotné 21% DPH katalogu
  stačí `fn_net_haleru(goods_paid_haleru, 2100)`. Implementace MUSÍ počítat per
  položku, pokud jsou v objednávce různé sazby DPH (sloupec existuje).
- **Realizace v ledgeru:** použít existující typy `team_gen1|2|3` pro VŠECHNA
  flow (tj. i `community_customer`); typ `personal_customer` se pro nové
  objednávky přestává používat (řádek v `commission_rates` ponechat
  s `description` „DEPRECATED — nahrazeno team_gen1 20 % (model v2)").
  Nutné úpravy: CHECK `chk_flow_type` rozšířit o `team_gen*` pro
  `community_customer`; `base_haleru` = netto báze.
- **Sazby v `commission_rates`:** `team_gen1` 2000, `team_gen2` 800,
  `team_gen3` 400 bp (UPDATE + audit řádek v migraci).

## 2. Leadership pool

- Zůstává jako **konfigurovatelná** složka `leadership_pool` v
  `commission_rates`; nastavit **200 bp (2 %)**, generuje se nově z **každé**
  objednávky s liniemi (ne jen `community_own`), z téže netto báze.
  Admin ji může kdykoli změnit (vč. 0). Alokace `fn_allocate_leadership`
  beze změny. Čtvrtletní/roční motivační programy běží mimo ledger (ad hoc).
- Kontrola: Σ (team_gen1+2+3 + leadership_pool) ≤ `max_commission_bp`
  (`app_settings`, default 3500) — vynutit v admin RPC pro změnu sazeb.

## 3. PENTARIVA BENEFIT CLUB 3 / 6 / 10 (nahrazuje fixní 3 % i úrovně 15/20/25/VIP)

- **Ruší se** stará vrstva `benefit_tiers` 15/20/25/VIP 30 % (Fáze 2) včetně
  `fn_club_credit_rate_bp` logiky GREATEST — migrace přepíše seed `benefit_tiers`
  na tři řádky: `benefit_3` (0 Kč, 300 bp), `benefit_6` (150 000 h, 600 bp),
  `benefit_10` (500 000 h, 1000 bp); sloupce 12měsíčních kritérií se přestávají
  používat (ponechat, NULL/0). Prahy = **měsíční obrat**, editovatelné adminem.
- **Měsíční obrat zákazníka** = Σ katalogových hodnot (`total_catalog_haleru`)
  jeho zaplacených objednávek v kalendářním měsíci (UTC), bez stornovaných.
- **Pravidlo „vyšší bere":** pro objednávku platí
  `MAX(přenesená úroveň z minulého měsíce, úroveň dle kumulativního měsíčního
  obratu VČETNĚ této objednávky)` — vyšší sazba platí už pro objednávku, která
  hranici překročila. Přenesená úroveň = úroveň dle konečného součtu minulého
  měsíce (žádná historie výher: každý měsíc se počítá znovu z obratů).
  Implementovat čistě v SQL uvnitř `fn_generate_commissions` (agregace orders
  za měsíc kupujícího) — žádná nová stavová tabulka není nutná; volitelně
  view `v_benefit_level` pro UI.
- **Kredit** = sazba úrovně z **uhrazené hodnoty produktů** (`goods_paid_haleru`,
  vč. DPH — zákaznická veličina). Zapisuje se jako `club_credit` entry,
  `pending` 15 dní → `available` (settlement beze změny). Kredit lze uplatnit u
  pokladny na další objednávce, nikdy na té, ze které vznikl (což stávající
  mechanika spend/available splňuje). Platí pro `community_customer` i `organic`;
  `community_own` a `trade` benefit neberou (beze změny).
- Dashboard zákazníka: aktuální úroveň, obrat měsíce, kolik chybí na vyšší
  úroveň, dvě kreditní čísla dle R12 (existuje).

## 4. Uvítací výhoda (nová)

- Náleží **první zaplacené objednávce účtu** s katalogem ≥
  `welcome_min_catalog_haleru` (**default 50 000 h = 500 Kč**, konfigurovatelné).
  Podmínka registrace přes doporučující odkaz: `welcome_requires_referral`
  (bool, default `true`).
- **Dva režimy — `welcome_mode` v `app_settings`, přepínatelné adminem:**
  - `gift` (VÝCHOZÍ pro start): do objednávky se automaticky přidá dárkový
    produkt `welcome_gift_product_id` jako `order_items.is_gift = true`
    (mechanika D18a existuje; cena 0). Cílová hodnota dárku ~200 Kč — volbu
    produktu dělá admin.
  - `discount`: sleva `welcome_discount_bp` (default 2000 bp = 20 %) per
    položka (`fn_pct_haleru` z `line_catalog_haleru`, stejně jako partnerská
    sleva). Vyžaduje: povolit slevu na `community_customer`/`organic`
    v `chk_flow_shape` (nový sloupec `orders.welcome_benefit boolean NOT NULL
    DEFAULT false`; CHECK povolí `total_discount > 0` jen s tímto flagem)
    a rozšířit `fn_validate_order_pricing` o očekávanou welcome sazbu.
- **Pevný kredit 3 %** (`welcome_credit_bp`, default 300 bp) z uhrazené hodnoty
  produktů první objednávky — `club_credit` entry `pending` 15 dní (tj. připíše
  se po ochranné lhůtě, jen pokud objednávka nebyla vrácena — reversal
  mechanika to řeší sama). Uvítací objednávka se počítá do měsíčního obratu
  Benefit Clubu i do provizních linií 20/8/4 (z ponížené báze).
- Uvítací výhoda a Benefit kredit úrovně se na téže objednávce **nesčítají**:
  první objednávka dostává uvítací výhodu + pevný kredit 3 %, ne úrovňový
  kredit. (Od druhé objednávky běží úrovně.)

## 5. Doprava

- `shipping_free_from_haleru` → **200 000 h (2 000 Kč katalogu)**; zdarma jen
  pro flow `community_customer`/`organic`. **Partner (`community_own`) hradí
  dopravu vždy** (práh se na něj nevztahuje) — úprava `fn_checkout` +
  `fn_validate_order_pricing`. Trade beze změny (chová se jako partner).
- Paušál `shipping_flat_haleru` (9 900 h) beze změny, konfigurovatelný.

## 6. Pozice (přejmenování, kritéria beze změny)

`career_level_params.title`: ambassador → **Ambasador**, mentor →
**Komunitní partner**, leader → **Regionální partner**. Enum `user_role` se
NEMĚNÍ (jen zobrazované tituly, CZ/EN slovníky aktualizovat). Kritéria povýšení
zůstávají současná (3 partneři + 50 000 Kč / 8 + 200 000 Kč měsíčně) — zadavatel
potvrdil; jsou konfigurovatelná v adminu.

## 7. Ekonomika a kontroly (nový admin modul `/admin/economics`)

- `products.cost_haleru bigint NULL` (náklad výroba+obal bez DPH; plní admin).
  Referenční data: `docs/online-kancelar/data/naklady-produkty-referencni-2026-08.csv`
  (konkurenční LU hodnoty, průměr ~92 Kč, medián 46 Kč — jen modelová reference,
  NEJSOU to produkty PENTARIVA; neimportovat do katalogu).
- Nové `app_settings` (ekonomické vstupy, dle listu Vstupy):
  `econ_packaging_haleru` 5000, `econ_gateway_bp` 200, `econ_shipping_cost_haleru`
  9000, `econ_other_var_bp` 300, `max_commission_bp` 3500,
  `min_partner_residual_bp` 4500, `min_gross_margin_bp` 3000,
  `max_product_cost_bp` 1700.
- Obrazovka počítá živě z reálných objednávek posledních 30 dní + katalogu:
  1) Σ provizních sazeb ≤ 35 %; 2) zůstatek z partnerské objednávky ≥ 45 %
  katalogu; 3) hrubá marže před fixními náklady ≥ 30 % z netto tržby
  (vzorec dle XLSX: uhrazeno − provize − DPH − náklad − balení − brána −
  doprava hrazená firmou − ostatní − rezerva kreditů); 4) `cost_haleru` ≤ 17 %
  katalogu bez DPH per produkt (tabulka prohřešků). Stav OK/VAROVÁNÍ.

## 8. Anti-abuse uvítací výhody (detekce, ne blokace)

Admin report (sekce v `/admin` nebo `/admin/economics`): účty s uvítací výhodou
seskupené podle (a) normalizované dodací adresy, (b) `visitor_hash` z
`referral_events`, (c) příjmení+město; sloupec počtu výhod ve skupině, skupiny
\>1 zvýrazněné. Unikátní telefon E.164 (existuje) zůstává tvrdou zábranou.
Žádné automatické blokování v MVP.

## 9. Zlaté testy v2 (přepis `05` §10 — schváleno tímto dokumentem)

Fixture: katalog 1 000 Kč se nahrazuje **1 500 Kč (150 000 h)**, DPH 21 %,
genealogie A→B→C→D, zákazník Z vlastněný D. HALF-UP přes `fn_pct_haleru`,
netto přes `fn_net_haleru`. Závazné hodnoty (haléře):

| Test | Objednávka | Netto báze | gen1 20 % | gen2 8 % | gen3 4 % | pool 2 % | kredit |
|---|---|---|---|---|---|---|---|
| G-N1 uvítací (režim discount 20 %) | Z, katalog 150 000, sleva 30 000, paid 120 000 | 99 174 | D +19 835 | C +7 934 | B +3 967 | +1 983 | welcome 3 % z 120 000 = +3 600 |
| G-N2 Benefit 6 (2. objednávka, obrat měsíce ≥150 000) | Z, paid 150 000 | 123 967 | D +24 793 | C +9 917 | B +4 959 | +2 479 | 6 % z 150 000 = +9 000 |
| G-N3 vlastní partnerská | D, sleva 45 000, paid 105 000 | 86 777 | C +17 355 | B +6 942 | A +3 471 | +1 736 | žádný |
| G-N4 „vyšší bere" | přenesená 6 %; obj. 1 = 40 000 kum. → 6 %; obj. 2 = 30 000, kum. 70 000 → **10 % už na obj. 2**; příští měsíc startuje na 10 % | | | | | | |
| G-N5 organický bez ambasadora | žádné gen entries, jen club_credit 3 % + margin | | | | | | |
| G-N6 storno G-N2 | plný reversal všech entries, Σ = 0 (D4) | | | | | | |
| G-N7 uvítací režim gift | položka `is_gift`, cena 0, žádná sleva; linie z plné paid báze | | | | | | |

Invarianty: margin = netto báze − Σ příjemců − pool (≥ 0); `company_margin`
`available` ihned; ostatní `pending` +15 dní. P-IDEMP, P-INV1/2, B-CLIENT-DENY
a Trade testy (beze změny sazeb) zůstávají v platnosti.

## 10. Rozsah prací (checklist pro implementaci)

1. Migrace: sazby + CHECKy (`chk_flow_type`, `chk_flow_shape` + `welcome_benefit`
   sloupec) + `fn_net_haleru` + přepis `fn_generate_commissions` + benefit_tiers
   seed 3/6/10 + `products.cost_haleru` + nové `app_settings` + tituly pozic.
2. `fn_checkout` / `fn_validate_order_pricing`: uvítací výhoda (oba režimy),
   doprava jen pro zákazníky, žádné jiné změny checkoutu.
3. pgTAP: přepsat zlaté testy dle §9, doplnit G-N4 simulaci měsíce.
4. UI: dashboard zákazníka (úroveň + obrat + prahy), `/admin/settings` nové
   klíče, `/admin/economics`, anti-abuse report, přejmenování pozic vč. EN.
5. Dokumentace: aktualizovat `03`, `04` §2.2/§2.17, `05` (sazby, báze bez DPH,
   worked examples → §9 tohoto dokumentu), `00` (R16: model v2 dle 13).
6. **Neměnit:** Trade, výplatní mechanika, settlement, RLS, append-only ledger,
   `PAYOUTS_ENABLED=false`, Stripe test mód.

## 11. Předpoklady k potvrzení zadavatelem (implementaci neblokují — implementovat dle defaultů)

- Měsíční obrat pro úrovně = katalogová hodnota vč. DPH (dle XLSX simulátoru);
  kredit z uhrazené hodnoty produktů vč. DPH.
- Chybějící linie propadá firmě (bez komprese).
- `welcome_requires_referral` default `true`.
- Pool 2 % se nově počítá ze všech objednávek s liniemi (dřív jen vlastní
  partnerské) — při nesouhlasu stačí přepnout sazbu, mechanika je konfigurační.
