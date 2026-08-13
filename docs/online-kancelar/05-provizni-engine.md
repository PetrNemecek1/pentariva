# 05 — Provizní engine (finální specifikace)

> Závazná specifikace peněžní logiky. Precedence při rozporu (dle `02-technicka-rozhodnuti.md`):
> `03-provizni-pravidla-zdroj.md` → `00-zadani-a-rozhodnuti.md` (R1–R14) →
> `02-technicka-rozhodnuti.md` (D1–D34) → `04-datovy-model.md` (kanonické schéma) → tento dokument.
> **Jediný zdroj DDL je `04-datovy-model.md` (D1)** — tento dokument žádné `CREATE TABLE`
> nedefinuje; všechny názvy tabulek, sloupců, ENUMů a funkcí přebírá odsud a citované
> plpgsql funkce jsou kanonicky definované v `04-datovy-model.md` §2.17 a §3.1.

## 0. Jednotky, báze a zásady

- **Peníze**: `BIGINT` v haléřích, sloupce se sufixem `_haleru` (1 000 Kč = 100 000 h).
  Žádné floaty v úložišti ani v aritmetice. (D19)
- **Sazby**: basis pointy, sloupce se sufixem `_bp` (`INTEGER`, 2000 = 20 %). Žijí výhradně
  v tabulkách `commission_rates` (`code` = `commission_entry_type`, `rate_bp`) a
  `trade_level_params` (`level`, `discount_bp`, `acquirer_rate_bp`). (D19)
- **Zaokrouhlení**: jediná funkce `fn_pct_haleru(base_haleru, rate_bp)` — HALF-UP na celé
  haléře, chyba **≤ 0,5 h** na jedno volání. Zaokrouhluje se jen při výpočtu procenta;
  storna a čerpání pouze negují/sčítají už zaokrouhlené integery. (D5, detail §8)
- **Provizní báze** = `orders.goods_paid_haleru` (generovaný sloupec) =
  `total_catalog − total_discount − credit_used`. Tj. částka skutečně zaplacená penězi
  za **zboží** (vč. DPH, po slevě, po odečtení kreditu), **nikdy doprava**.
  To je **ROZHODNUTÍ zadavatele R11 + R14** (`00-zadani-a-rozhodnuti.md`), technicky
  zakotvené jako D6 — není to doporučení, je to závazek. Plně kreditem hrazené zboží
  (`goods_paid = 0`) negeneruje žádné nové provize ani kredit.
- **Ceny vč. DPH**: všechna procenta se počítají z cen včetně DPH; interní členění DPH je
  účetní záležitost (§D provizního modelu).
- **Slevy (30 % partner, 30/35/40 % Trade) jsou cenotvorba checkoutu, ne engine.**
  Sleva se počítá a zaokrouhluje **per položka** (`fn_pct_haleru(line_catalog, sazba flow)`,
  D5) a validuje ji `fn_validate_order_pricing`. „300 Kč sleva Ambasadora D" z worked
  example se nikdy nezapisuje do ledgeru — realizuje se tím, že D zaplatí 700 Kč.
- **Flow objednávky**: `orders.business_flow` ENUM `community_own | community_customer |
  trade | organic`, přiřazený při vzniku objednávky a neměnný (trigger). Exkluzivitu
  „jeden obrat = jedna obchodní logika" (§D) vynucují CHECK `chk_flow_shape`,
  `chk_flow_type` a trigger — viz `04-datovy-model.md` §5. (D7)
- **Atribuce je trvalá** — ROZHODNUTÍ dle mise `00-zadani-a-rozhodnuti.md` („doporučovací
  linky s trvalou atribucí") a D9: `owner_ambassador_id` zákazníka se nastaví při registraci
  přes `pentariva.com/r/{kód}` a mění ho jen admin; sponzor partnera je neměnný (admin
  oprava jen do 14 dnů od registrace přes `fn_admin_change_sponsor`). Objednávka navíc
  snapshotuje `orders.attributed_ambassador_id` v okamžiku vytvoření — pozdější změny
  atribuce historické provize nemění.
- **MVP nemá kvalifikační podmínky**: 15/6/4 se vyplácí prvním třem sponzorům v řetězu
  bezpodmínečně (zdroj žádné podmínky aktivity nedefinuje). Upline se čte funkcí
  `fn_upline(buyer, 3)` v okamžiku generování; zapsané entries jsou snapshot.

## 1. Rozhodnutí závazná pro engine

| # | Rozhodnutí | Zdroj |
|---|---|---|
| P1 | Báze provizí i 3% kreditu = `goods_paid_haleru` (po kreditu, bez dopravy). | **R11 + R14** zadavatele, D6 |
| P2 | 15denní ochranná lhůta platí **pro všechno** — provizní i klubový kredit; `hold_until = paid_at + app_settings.commission_hold_days`. Výjimka: `company_margin` je `available` ihned (bilanční dopočet firmy, nic se nekreditá). | **R12** zadavatele, D2 |
| P3 | UI vždy zobrazuje **dvě čísla**: dostupný kredit (Σ `credit_transactions`) a kredit čekající na aktivaci (Σ `pending` entries) s datem nejbližší aktivace — view `v_credit_overview`. | **R12** zadavatele, D22 |
| P4 | **Neúplný upline**: chybějící generace se nevyplácí výš ani nekomprimuje — neuplatněná procenta zůstávají firmě jako součást `company_margin`. Záznamy `team_gen2/3` se nevytvářejí (nulové ani zástupné záznamy neexistují, D6). | **ROZHODNUTÍ** (zdroj váže procenta na přesnou vzdálenost generace, ne na „nejbližšího existujícího" příjemce) |
| P5 | **Trade partner bez získavatele** (`trade_partners.acquirer_profile_id IS NULL`): provize propadá firmě — zůstává v `company_margin`, žádný náhradní záznam. | **ROZHODNUTÍ** = D13 |
| P6 | **Leadership pool 2 % vzniká jen z `community_own`** obratů; příjemce NULL = firemní pool; ruční alokace adminem (`leadership_alloc`, Σ alokací ≤ Σ poolu). | **R7** zadavatele, D15, `04` §0 R9 |
| P7 | Klubový kredit je **bez expirace** (D16), **nelze ho vyplatit** na účet (jen utratit v nákupu); vyplatitelný je pouze provizní kredit. | D16, `04` §0 R10 |
| P8 | Minimální výplata = `app_settings.payout_min_haleru` = **50 000 h (500 Kč)**; nárok = aktuální zůstatek provizního kreditu (díky R12 už „zralý"). | D17 |
| P9 | Sazby se čtou **výhradně** z `commission_rates` / `trade_level_params` v okamžiku generování a fixují se ve sloupcích `rate_bp` + `amount_haleru` každého entry (CHECK `chk_amount_formula`: `amount = fn_pct_haleru(base, rate_bp)`). Změna konfigurace platí jen pro nově generované entries. | D19 |
| P10 | Vratka v MVP = **celá objednávka**; kompenzační záporné řádky, žádné mazání ani UPDATE částek. Poměrné storno = Fáze 2. | **R2** zadavatele, D4 |

Záměrně **neexistují** (soulad s D16/D30 a kanonickým schématem `04` §4): expirace kreditu,
FIFO párování čerpání na konkrétní entries, tabulka `ledger_accounts`/`credit_accounts`,
procentní tabulka s `rate_pct` — kredit je fungibilní, zůstatek = Σ append-only
`credit_transactions` per `(profile_id, kind)` a nic jiného.

## 2. Pravidla výpočtu per `business_flow`

Všechny kladné řádky vznikají v `commission_entries` (D2), typy dle
`commission_entry_type`. **Kalkulační typy** (produkuje je výhradně
`fn_generate_commissions`): `personal_customer`, `team_gen1..3`, `leadership_pool`,
`trade_acquirer`, `club_credit`, `company_margin`. Nekalkulační řádky: `leadership_alloc`
(ruční alokace poolu) a reversaly (`reverses_entry_id IS NOT NULL`). Nulové záznamy se
nikdy nezapisují (D6).

### 2.1 `community_own` — vlastní nákup partnera

| Položka | Hodnota |
|---|---|
| Vstup | kupující role `ambassador/mentor/leader`; checkout účtuje 70 % katalogu (30% sleva per položka); `base = goods_paid` |
| Příjemci | `team_gen1` = přímý sponzor **15 %** (1500 bp); `team_gen2` = sponzor sponzora **6 %** (600 bp); `team_gen3` = pra-sponzor **4 %** (400 bp); `leadership_pool` **2 %** (200 bp, beneficiary NULL) |
| NIC nedostává | **kupující** — má 30% slevu („sleva a 20% provize se nikdy nesčítají na jedné objednávce"); **žádný club kredit** (kredit je nástroj Club vrstvy pro zákazníky); **4.+ generace** — model končí 3. generací |
| Neúplný upline | P4: neuplatněná procenta zůstávají v `company_margin` |

Odměna teče 3 úrovně **směrem nahoru od nakupujícího** z jeho čisté (po slevě) částky —
přesně dle interpretační poznámky zdroje (nakupuje D: C = 15 %, B = 6 %, A = 4 %).

### 2.2 `community_customer` — nákup osobního zákazníka

| Položka | Hodnota |
|---|---|
| Vstup | kupující zákazník s `owner_ambassador_id`; plná katalogová cena (`total_discount = 0`, CHECK); `base = goods_paid` |
| Příjemci | `personal_customer` = `orders.attributed_ambassador_id` **20 %** (2000 bp); `club_credit` = kupující zákazník **3 %** (300 bp) |
| NIC nedostává | **sponzoři ambasadora (15/6/4)** — „osobní zákazník není partnerská generace"; **leadership pool** — P6: 2 % se bookují jen tam, kde běží týmové odměny (zdroj uvádí leadership bonus pouze u vlastního nákupu partnera a Flow A vyjmenovává výhradně 20 % + 3 %) |

### 2.3 `trade` — nákup Trade partnera

Parametry z `trade_level_params` (úroveň kupujícího v okamžiku zaplacení):

| `level` | `discount_bp` (checkout) | Zaplatí z 1 000 Kč | `acquirer_rate_bp` (z `goods_paid`) |
|---|---|---|---|
| `entry` | 3000 | 700 Kč | 1000 (10 %) |
| `active` | 3500 | 650 Kč | 800 (8 %) |
| `strategic` | 4000 | 600 Kč | 500 (5 %) |

| Položka | Hodnota |
|---|---|
| Příjemce | `trade_acquirer` = `trade_partners.acquirer_profile_id` dle úrovně **kupujícího** |
| NIC nedostává | **celý upline (15/6/4)** — „Trade obrat nevytváří plné týmové provize Community"; **leadership pool**; **kupující** — žádný club kredit (má velkoobchodní slevu); **bez získavatele** — P5: provize zůstává v `company_margin` |

### 2.4 `organic` — organický zákazník

| Položka | Hodnota |
|---|---|
| Vstup | zákazník bez ambasadora; plná cena; `base = goods_paid` |
| Příjemci | `club_credit` = kupující **3 %** (300 bp) |
| NIC nedostává | **kdokoli jiný** — nikdo zákazníka nepřivedl, nárok neexistuje |

### 2.5 `company_margin` — u každého flow

Firma se nepočítá procentem, ale **přesným dopočtem** `company_margin = goods_paid −
Σ příjemců` (D5), `beneficiary_profile_id NULL`, `rate_bp = 0`, status `available` ihned
(P2). Runtime guard: záporný margin = výjimka.

## 3. Závazné worked examples (haléře, HALF-UP)

Doprava do žádného výpočtu nevstupuje (R14): má-li objednávka dopravu 9 900 h, je o ni
vyšší `paid_money_haleru`, ale báze zůstává `goods_paid_haleru`. V příkladech ji proto
neuvádíme. Aritmetika všech příkladů je auditem potvrzená na halíř a je zlatým testem CI
(D25).

### (a) Vlastní nákup Ambasadora D, katalog 100 000 h (1 000 Kč), řetěz A→B→C→D

Checkout: sleva 30 % per položka → `goods_paid` = **70 000 h**. Ledger (`base_haleru` = 70 000):

| Příjemce | `entry_type` | Výpočet | `amount_haleru` | Kč |
|---|---|---|---|---|
| Ambasador C | `team_gen1` | `fn_pct_haleru(70000, 1500)` | 10 500 | 105 |
| Ambasador B | `team_gen2` | `fn_pct_haleru(70000, 600)` | 4 200 | 42 |
| Ambasador A | `team_gen3` | `fn_pct_haleru(70000, 400)` | 2 800 | 28 |
| firemní pool | `leadership_pool` | `fn_pct_haleru(70000, 200)` | 1 400 | 14 |
| firma | `company_margin` | 70 000 − 18 900 | 51 100 | 511 |
| **Σ ledger** | | | **70 000** | **700** |

Kontrola vůči zdrojové tabulce: 105 + 42 + 28 + 14 + sleva 300 = 489 Kč terén (48,9 %),
firmě 511 Kč (51,1 %) — reprodukováno na halíř přesně. Sleva 30 000 h není ledger záznam.

### (b) Nákup osobního zákazníka Ambasadora A, katalog 100 000 h

Zákazník platí za zboží **100 000 h** (`goods_paid` = 100 000):

| Příjemce | `entry_type` | Výpočet | `amount_haleru` |
|---|---|---|---|
| Ambasador A | `personal_customer` | `fn_pct_haleru(100000, 2000)` | 20 000 |
| zákazník | `club_credit` | `fn_pct_haleru(100000, 300)` | 3 000 |
| firma | `company_margin` | 100 000 − 23 000 | 77 000 |
| **Σ** | | | **100 000** |

Žádné `team_gen*`, žádný `leadership_pool`. Klubový kredit bez expirace (P7).

### (c) Trade nákup partnera úrovně `active`, katalog 100 000 h

Checkout: sleva 35 % → `goods_paid` = **65 000 h**:

| Příjemce | `entry_type` | Výpočet | `amount_haleru` |
|---|---|---|---|
| získavatel | `trade_acquirer` | `fn_pct_haleru(65000, 800)` | 5 200 |
| firma | `company_margin` | 65 000 − 5 200 | 59 800 |
| **Σ** | | | **65 000** |

Odpovídá zdroji: 52 Kč / 598 Kč.

### (d) Organický nákup, katalog 100 000 h

| Příjemce | `entry_type` | Výpočet | `amount_haleru` |
|---|---|---|---|
| zákazník | `club_credit` | `fn_pct_haleru(100000, 300)` | 3 000 |
| firma | `company_margin` | 100 000 − 3 000 | 97 000 |
| **Σ** | | | **100 000** |

Odpovídá zdroji: 970 Kč firmě, žádná provize nikomu.

### (e) Vlastní nákup ambasadora E s neúplným uplinem (jen 1 sponzor S)

E platí za zboží **70 000 h**. Dle P4 se neuplatněné generace nevyplácejí výš ani
nekomprimují:

| Příjemce | `entry_type` | Výpočet | `amount_haleru` |
|---|---|---|---|
| sponzor S | `team_gen1` | `fn_pct_haleru(70000, 1500)` | 10 500 |
| firemní pool | `leadership_pool` | `fn_pct_haleru(70000, 200)` | 1 400 |
| firma | `company_margin` | 70 000 − 11 900 | 58 100 |
| **Σ** | | | **70 000** |

Neuplatněných 6 % (4 200 h) + 4 % (2 800 h) je součástí `company_margin`. Záznamy
`team_gen2`/`team_gen3` se **nevytvářejí** — ani nulové, ani na firmu zvlášť; zbytek je
vždy jediná položka `company_margin`.

### (f) Vratka objednávky (b) po 10 dnech

Den 0 zaplaceno: `personal_customer` (20 000) a `club_credit` (3 000) jsou `pending`
(`hold_until = paid_at + 15 dní`); **`company_margin` (77 000) je `available` od
zaplacení** (P2) — v den 10 tedy NEJSOU všechny originály `pending`. Den 10
`fn_refund_order`: objednávka → `refunded`; ke každému nestornovanému entry vznikne
reversal −částka (status `available`, `hold_until = now()`), originál dostane `reversed`:

| Příjemce | `entry_type` | reversal `amount_haleru` | originál před stornem | originál po stornu |
|---|---|---|---|---|
| Ambasador A | `personal_customer` | −20 000 | `pending` | `reversed` |
| zákazník | `club_credit` | −3 000 | `pending` | `reversed` |
| firma | `company_margin` | −77 000 | **`available`** | `reversed` |

Σ všech záznamů objednávky (originály + reversaly) = **0**. Ambasadorovi ani zákazníkovi
žádný kredit nevznikl (settlement neproběhl, žádný `accrual` v `credit_transactions`),
takže se nezapisuje žádný `clawback` a jejich zůstatky se nemění. **Bilance firmy z
objednávky ale stornem klesá**: `company_margin` byl `available` ihned a jeho reversal
−77 000 h sráží margin objednávky na 0. Brána vrací zákazníkovi celé
`paid_money_haleru`; kredit případně použitý na úhradu zboží se vrací `adjustment`
transakcí (u (b) žádný nebyl).

**Varianta — storno až po settlementu (den ≥ 15):** originály už byly `available` a
připsané (`accrual`). `fn_refund_order` pak ke každému připsanému entry navíc zapíše
`clawback` (−20 000 h kind `commission` ambasadorovi, −3 000 h kind `club` zákazníkovi).
Zůstatek smí jít do minusu (D3) — netuje se budoucími akruály; výplata je do vyrovnání
nemožná (žádost < zůstatek selže).

Částečné vratky: **MVP podporuje pouze storno celé objednávky** (P10). Částečnou vratku
řeší admin plným stornem + náhradní objednávkou, případně `adjustment` transakcí s
povinnou poznámkou a auditem.

## 4. Životní cyklus entry, idempotence, storno

### 4.1 Stavy (`commission_status`)

```
pending ──(settlement: hold_until = paid_at + 15 dní)──► available
   │                                                        │
   └──────────────────(vratka: fn_refund_order)─────────────┴──► reversed
                                                    (+ záporný reversal řádek)
```

- **`pending`**: 15denní ochranná lhůta od `paid_at` platí jednotně pro všechny kladné
  záznamy s beneficiary — provizní i klubové (R12/P2). Jediné okno znamená, že storno v
  ochranné lhůtě nikdy nevymáhá už utracené peníze.
- **`available`**: entry prošlo settlementem; jeho `amount_haleru` je připsán akruálem do
  `credit_transactions` (u firemních řádků s beneficiary NULL se nekreditá nic).
  Výjimky z lhůty: `company_margin` vzniká `available` ihned; `leadership_alloc` vzniká
  `pending` s `hold_until = now()` (pool už lhůtou prošel) a připíše ho nejbližší
  settlement.
- **`reversed`**: originál po stornu — bilančně ho neguje záporný reversal řádek.

Stavy `credited`/`paid_out`/`expired` **neexistují** — spotřebu kreditu reprezentují
výhradně transakce v `credit_transactions` (`spend`, `payout`, `clawback`, `adjustment`)
a expirace není (P7). **Disponibilní zůstatek** = Σ `credit_transactions.amount_haleru`
per `(profile_id, kind)` — view `v_credit_balances`; jediná definice zůstatku v systému.

### 4.2 Idempotence — přesný mechanismus

1. **Tvrdá pojistka v DB** — unikátní index `uq_commission_once`
   (`order_id, beneficiary_profile_id, entry_type`) `NULLS NOT DISTINCT`, partial
   `WHERE reverses_entry_id IS NULL AND entry_type <> 'leadership_alloc'`. Druhý běh ani
   souběžné volání nikdy nezdvojí zápis. Druhé storno téhož originálu nemůže vzniknout
   (UNIQUE na `reverses_entry_id`; druhé volání `fn_refund_order` navíc padne na UNIQUE
   `order_refunds.order_id`).
2. **Early-exit v generátoru**: `fn_generate_commissions` po `SELECT … FOR UPDATE` na
   objednávce testuje existenci řádků **výhradně kalkulačních typů** (D2):
   `WHERE order_id = p_order AND reverses_entry_id IS NULL AND entry_type <>
   'leadership_alloc'` — tj. ignoruje ruční alokace i storna. **Čerpání kreditu do
   testu z principu nevstupuje: `spend` NENÍ řádek `commission_entries` — žije v
   `credit_transactions` (`type='spend'`, `spent_on_order_id`) dle D3, takže kolize
   „spend na nové objednávce zablokuje generování jejích provizí" nemůže nastat.**
   Po stornu objednávky early-exit správně drží: originály zůstávají v tabulce
   (`reverses_entry_id IS NULL`, byť `status='reversed'`) — refundovaná objednávka se
   nikdy nepřegeneruje.
3. **Serializace**: zámek řádku objednávky (`FOR UPDATE`) seřadí souběžné webhooky téže
   platby; druhý uvidí zapsané entries a skončí early-exitem. Samotné webhooky dedupuje
   UNIQUE `payments (provider, provider_event_id)`.
4. **Žádné UPDATE částek**: přepočet spočtené objednávky neexistuje. Oprava = plné storno
   + nová objednávka, nebo `adjustment` v `credit_transactions`. `base_haleru`,
   `rate_bp` i `amount_haleru` jsou v řádku zmrazeny (P9).

### 4.3 Storno (`fn_refund_order`)

Pro každý nestornovaný řádek objednávky (vč. `leadership_pool` a případných
`leadership_alloc`) vznikne přesně jeden záporný reversal se stejným `entry_type`,
`amount_haleru = −originál`, `reverses_entry_id = originál.id`, status `available`;
originál → `reversed`. Byl-li originál už připsán akruálem, vznikne v téže transakci
`clawback` (zůstatek smí do minusu, D3). Kredit použitý na úhradu zboží se vrací
`adjustment` transakcí. Invariant D4: po plném stornu Σ (kalkulační entries + jejich
reversaly) = 0; totéž platí pro páry alokací, takže Σ všech řádků objednávky = 0.

## 5. Settlement, kredit, výplaty

- **`fn_settle_commissions()`** — denní job (pg_cron / Edge Function): každé entry se
  `status='pending' AND hold_until <= now()` překlopí na `available` a **v téže
  transakci** zapíše `accrual` do `credit_transactions` (`club_credit` → kind `club`,
  vše ostatní → kind `commission`). Firemní řádky (beneficiary NULL — pool, margin) se
  nekreditují. Idempotence: UNIQUE `uq_credit_accrual_entry` (jedno entry = max jeden
  accrual). Kryje partial index `idx_commission_release`.
- **Čerpání kreditu** (checkout, server-side SECURITY DEFINER pod
  `pg_advisory_xact_lock(profile, kind)`): zapíše `spend` se `spent_on_order_id`;
  tvrdá podmínka `částka ≤ aktuální zůstatek` a `credit_used ≤ zboží po slevě`
  (CHECK `chk_credit_only_goods` — doprava se platí vždy penězi). **Žádné FIFO párování
  na konkrétní entries — kredit je fungibilní** (D3). Klesne-li zboží na 0 a doprava je
  0, brána se přeskočí a objednávka jde rovnou na `paid` (serverová cesta; provize
  nevznikají, `goods_paid = 0`).
- **Výplaty** (`payout_requests`, D17): `requested → approved → paid | rejected |
  cancelled`. Jen provizní kredit (P7). Minimální částka =
  `app_settings.payout_min_haleru` (50 000 h = 500 Kč, P8). Schválením vzniká rezervační
  transakce `payout` (záporná); admin vyplácí ručně převodem a označí `paid`;
  `rejected`/`cancelled` vrací rezervaci `adjustment` transakcí. Nárok = aktuální
  zůstatek — díky R12 už prošel ochrannou lhůtou, žádná další zralostní kontrola není.
- **UI (R12/P3)**: view `v_credit_overview` — pro každý profil a kind dvě čísla:
  `available_haleru` (Σ transakcí) a `pending_haleru` (Σ `pending` entries) +
  `next_activation_at` (min `hold_until`). Dashboard ambasadora je čte z
  `v_ambassador_dashboard`.

## 6. Leadership pool „až 2 %"

- Engine bookuje **fixní 2,00 %** (`commission_rates.leadership_pool` = 200 bp) z base
  každého `community_own` nákupu jako entry `leadership_pool` s
  `beneficiary_profile_id NULL` (P6). „Až" se realizuje při alokaci, ne při bookingu —
  plná rezerva je konzervativní vůči závazkům firmy (R7 zadavatele).
- Pool podléhá stejné 15denní lhůtě a stornuje se s objednávkou jako každý jiný záznam;
  settlement ho jen překlopí na `available` (nekreditá — beneficiary NULL).
- **Pool se nikdy nevyplácí automaticky.** Alokaci provádí admin funkcí
  `fn_allocate_leadership(pool_entry, beneficiary, amount, actor)`: vznikne entry
  `leadership_alloc` s `parent_entry_id` na pool, `rate_bp = 0` (ruční částka),
  `pending` s `hold_until = now()` — **mimo 15denní hold** (pool už lhůtou prošel);
  nejbližší settlement ho připíše na provizní kredit. Funkce vynucuje
  Σ alokací ≤ Σ poolu a zapisuje audit. Nealokovaný zbytek poolu zůstává firmě.

## 7. Klubový kredit 3 %

- Entry `club_credit` na kupujícího zákazníka, 300 bp z `goods_paid` — tedy z částky PO
  uplatnění kreditu: **kredit z kreditu se negeneruje**, jen z reálných peněz (R11/P1).
  Objednávka plně uhrazená kreditem ⇒ `goods_paid = 0` ⇒ žádné entries (ani
  `company_margin` — nulové záznamy se nezapisují).
- Stejná 15denní lhůta jako provize (R12); po settlementu akruál kind `club`.
- **Bez expirace** (D16/P7) a **nevyplatitelný** — jediné použití je `spend` na dalším
  nákupu. Organický i ambasadorův zákazník mají jeden zákaznický účet (Club vrstva §C).

## 8. Zaokrouhlení a bilanční invarianty

- **Jediné místo zaokrouhlení**: `fn_pct_haleru(base_haleru, rate_bp)` =
  `ROUND((base::numeric * rate_bp) / 10000)::bigint`. Postgres `ROUND(numeric)`
  zaokrouhluje 0,5 od nuly = HALF-UP pro nezáporné vstupy. Ověřeno na worked example:
  `fn_pct_haleru(70000, 1500) = 10500`.
- **P-INV1 (nad kalkulačními typy)**: pro každou objednávku platí
  Σ `amount_haleru` kalkulačních entries (tj. `reverses_entry_id IS NULL AND
  entry_type <> 'leadership_alloc'`) = `orders.goods_paid_haleru`. Firma se nepočítá
  procentem, ale zbytkem `company_margin = goods_paid − Σ příjemců` → zbytkové haléře
  vždy připadnou firmě a invariant platí exaktně. (`leadership_alloc` je redistribuce
  už započteného poolu — do sumy nepatří, jinak by se počítala dvakrát.)
- **Bezpečnost zbytku**: součet sazeb je max. 27 % (`community_own`: 15+6+4+2); **každé
  HALF-UP přidá ≤ 0,5 h**, takže při 4 příjemcích je Σ příjemců nejvýše
  `0,27 × base + 2 h` a `company_margin ≥ 0` pro každou bázi, na které vůbec nějaké
  entry vznikne. Funkce přesto drží runtime guard (výjimka při záporném marginu) —
  chrání před budoucí změnou sazeb v `commission_rates`.
- **P-INV2**: po plném stornu Σ (kalkulační entries + jejich reversaly) objednávky = 0
  (D4); včetně alokačních párů je Σ všech řádků objednávky = 0.
- Sleva se zaokrouhluje **per položka** (D5) a souhrny objednávky = Σ položek — hlídá
  `fn_validate_order_pricing` při odeslání do platby; kanonický vzorec objednávky drží
  CHECK `chk_order_formula` (D7).

## 9. Implementace — plpgsql proti kanonickému schématu

Kanonické znění všech funkcí žije v `04-datovy-model.md` §2.17 a §3.1; zde je citováno
beze změny — **při jakémkoli rozporu platí `04`**. Peníze zapisují výhradně tyto
SECURITY DEFINER funkce (`fn_generate_commissions`, `fn_settle_commissions`,
`fn_allocate_leadership`, `fn_refund_order`) + serverová funkce čerpání kreditu; klient
(`anon`/`authenticated`) má přes RLS jen SELECT a na funkcích `REVOKE EXECUTE` (D22).

**Volací řetěz (žádný sloupec `orders.payment_status` neexistuje — stav brány žije v
`payments`, D8):**

1. Webhook Edge Function (service_role) ověří podpis brány a vloží/aktualizuje řádek
   `payments`; deduplikaci zajišťuje UNIQUE `(provider, provider_event_id)` — opakovaná
   událost skončí konfliktem a odpoví 200 bez efektu.
2. V téže DB transakci: `payments.status = 'paid'` → `UPDATE orders SET status='paid',
   paid_at = <čas brány>` (přechod validuje stavová mašina `trg_orders_status`; `paid`
   bez `paid_at` je výjimka) → `PERFORM fn_generate_commissions(order_id)`.
   Buď se zapíše platba, stav objednávky i provize, nebo nic.
3. Denně: `SELECT fn_settle_commissions()` (pg_cron / plánovaná Edge Function).
4. Vratka: admin → `fn_refund_order(order_id, reason, actor)`.
5. Alokace poolu: admin → `fn_allocate_leadership(...)`.

```sql
-- KANONICKÉ (04 §2.17): generátor provizí — volá webhook handler po přechodu na paid.
CREATE FUNCTION fn_generate_commissions(p_order uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  o orders%ROWTYPE; r RECORD;
  v_hold timestamptz; v_rate integer;
  v_recipients bigint := 0; v_margin bigint;
BEGIN
  SELECT * INTO o FROM orders WHERE id = p_order FOR UPDATE;
  IF o.status <> 'paid' OR o.paid_at IS NULL THEN
    RAISE EXCEPTION 'Objednávka % není paid', p_order; END IF;
  -- early-exit idempotence: testuje VÝHRADNĚ kalkulační typy (D2) — ne ruční alokace,
  -- ne storna; čerpání kreditu žije v credit_transactions (D3), kolize neexistuje.
  IF EXISTS (SELECT 1 FROM commission_entries
             WHERE order_id = p_order AND reverses_entry_id IS NULL
               AND entry_type <> 'leadership_alloc') THEN RETURN; END IF;
  IF o.goods_paid_haleru = 0 THEN RETURN; END IF;  -- plně kreditem: žádné entries (D6)
  v_hold := o.paid_at + make_interval(days =>
    (SELECT (value)::int FROM app_settings WHERE key = 'commission_hold_days'));

  IF o.business_flow = 'community_customer' THEN
    -- 3 % kredit zákazníkovi + 20 % ambasadorovi; základ = goods_paid (D6)
    FOR r IN SELECT * FROM (VALUES
        ('club_credit',       o.buyer_profile_id),
        ('personal_customer', o.attributed_ambassador_id)) AS t(code, benef) LOOP
      SELECT rate_bp INTO v_rate FROM commission_rates WHERE code = r.code;
      IF fn_pct_haleru(o.goods_paid_haleru, v_rate) > 0 THEN
        INSERT INTO commission_entries (order_id, order_flow, entry_type, beneficiary_profile_id,
                                        base_haleru, rate_bp, amount_haleru, hold_until)
        VALUES (o.id, o.business_flow, r.code::commission_entry_type, r.benef,
                o.goods_paid_haleru, v_rate, fn_pct_haleru(o.goods_paid_haleru, v_rate), v_hold);
        v_recipients := v_recipients + fn_pct_haleru(o.goods_paid_haleru, v_rate);
      END IF;
    END LOOP;

  ELSIF o.business_flow = 'organic' THEN
    SELECT rate_bp INTO v_rate FROM commission_rates WHERE code = 'club_credit';
    IF fn_pct_haleru(o.goods_paid_haleru, v_rate) > 0 THEN
      INSERT INTO commission_entries (order_id, order_flow, entry_type, beneficiary_profile_id,
                                      base_haleru, rate_bp, amount_haleru, hold_until)
      VALUES (o.id, 'organic', 'club_credit', o.buyer_profile_id,
              o.goods_paid_haleru, v_rate, fn_pct_haleru(o.goods_paid_haleru, v_rate), v_hold);
      v_recipients := fn_pct_haleru(o.goods_paid_haleru, v_rate);
    END IF;

  ELSIF o.business_flow = 'community_own' THEN
    -- týmové 15/6/4 z goods_paid (po 30% slevě) + 2% leadership pool
    FOR r IN SELECT * FROM fn_upline(o.buyer_profile_id, 3) LOOP
      SELECT rate_bp INTO v_rate FROM commission_rates WHERE code = 'team_gen' || r.generation;
      IF fn_pct_haleru(o.goods_paid_haleru, v_rate) > 0 THEN
        INSERT INTO commission_entries (order_id, order_flow, entry_type, beneficiary_profile_id,
                                        generation, base_haleru, rate_bp, amount_haleru, hold_until)
        VALUES (o.id, 'community_own', ('team_gen' || r.generation)::commission_entry_type,
                r.ancestor_id, r.generation, o.goods_paid_haleru, v_rate,
                fn_pct_haleru(o.goods_paid_haleru, v_rate), v_hold);
        v_recipients := v_recipients + fn_pct_haleru(o.goods_paid_haleru, v_rate);
      END IF;
    END LOOP;
    SELECT rate_bp INTO v_rate FROM commission_rates WHERE code = 'leadership_pool';
    IF fn_pct_haleru(o.goods_paid_haleru, v_rate) > 0 THEN
      INSERT INTO commission_entries (order_id, order_flow, entry_type, beneficiary_profile_id,
                                      base_haleru, rate_bp, amount_haleru, hold_until)
      VALUES (o.id, 'community_own', 'leadership_pool', NULL,
              o.goods_paid_haleru, v_rate, fn_pct_haleru(o.goods_paid_haleru, v_rate), v_hold);
      v_recipients := v_recipients + fn_pct_haleru(o.goods_paid_haleru, v_rate);
    END IF;

  ELSIF o.business_flow = 'trade' THEN
    -- provize získavateli z goods_paid dle úrovně partnera; bez získavatele vše zůstává v marginu
    FOR r IN SELECT tp.acquirer_profile_id, tlp.acquirer_rate_bp
             FROM trade_partners tp JOIN trade_level_params tlp ON tlp.level = tp.level
             WHERE tp.id = o.trade_partner_id AND tp.acquirer_profile_id IS NOT NULL LOOP
      IF fn_pct_haleru(o.goods_paid_haleru, r.acquirer_rate_bp) > 0 THEN
        INSERT INTO commission_entries (order_id, order_flow, entry_type, beneficiary_profile_id,
                                        base_haleru, rate_bp, amount_haleru, hold_until)
        VALUES (o.id, 'trade', 'trade_acquirer', r.acquirer_profile_id,
                o.goods_paid_haleru, r.acquirer_rate_bp,
                fn_pct_haleru(o.goods_paid_haleru, r.acquirer_rate_bp), v_hold);
        v_recipients := fn_pct_haleru(o.goods_paid_haleru, r.acquirer_rate_bp);
      END IF;
    END LOOP;
  END IF;

  -- Firemní margin = přesný dopočet base − Σ příjemců (D5); available IHNED (D2).
  v_margin := o.goods_paid_haleru - v_recipients;
  IF v_margin < 0 THEN RAISE EXCEPTION 'company_margin < 0 (runtime guard D5)'; END IF;
  IF v_margin > 0 THEN
    INSERT INTO commission_entries (order_id, order_flow, entry_type, beneficiary_profile_id,
                                    base_haleru, rate_bp, amount_haleru, status, hold_until)
    VALUES (o.id, o.business_flow, 'company_margin', NULL,
            o.goods_paid_haleru, 0, v_margin, 'available', o.paid_at);
  END IF;
END $$;
```

Doprovodné funkce (kanonické kontrakty; plná těla v `04` §2.17):

- **`fn_settle_commissions() RETURNS integer`** — denní settlement: `pending` s
  `hold_until <= now()` → `available` (`FOR UPDATE SKIP LOCKED`) a v téže transakci
  `accrual` do `credit_transactions` (`club_credit` → kind `club`, jinak `commission`);
  firemní řádky (beneficiary NULL) se nekreditují; idempotentní přes
  `uq_credit_accrual_entry`.
- **`fn_refund_order(p_order, p_reason, p_actor)`** — plné storno dle §4.3: zapíše
  `order_refunds` (UNIQUE `order_id` = druhé volání selže), přepne objednávku na
  `refunded` (stavová mašina D8), reversaly + `clawback` + vrácení použitého kreditu
  `adjustment` transakcí.
- **`fn_allocate_leadership(p_pool_entry, p_beneficiary, p_amount_haleru, p_actor)
  RETURNS uuid`** — alokace dle §6: jen na `available` pool, Σ alokací ≤ pool, audit.
- **`fn_upline(p_profile, p_max DEFAULT 3)`** — rekurzivní CTE po `sponsor_id`:
  generation 1 = přímý sponzor (15 %), 2 = sponzor sponzora (6 %), 3 = pra-sponzor (4 %);
  kratší řetěz vrátí méně řádků.

RLS na `commission_entries` a `credit_transactions`: SELECT jen vlastník
(`beneficiary_profile_id` / `profile_id`) a admin — partner vidí své provize včetně stavů
(čekající/dostupná/stornovaná; pokrývá §8 zadání); INSERT/UPDATE/DELETE nemá žádná
klientská role. `credit_transactions` navíc drží append-only RULEs (no update/no delete).

## 10. Povinné testy (property-based + golden + hraniční)

Property testy generují náhodné vstupy: `goods_paid ∈ [0; 10^9] h`, hloubka uplinu 0–10,
všechna flow, náhodné kombinace kreditů a vratek; min. 1 000 iterací v CI. Golden testy
jsou fixní na halíř (zlaté worked examples, D25). Bez zeleného kompletu se engine
nenasazuje.

1. **P-INV1**: ∀ objednávka: Σ `amount_haleru` kalkulačních entries
   (`reverses_entry_id IS NULL AND entry_type <> 'leadership_alloc'`) =
   `goods_paid_haleru` — všechna flow, všechny báze.
2. **P-INV2**: ∀ objednávka po plném stornu: Σ (kalkulační entries + jejich reversaly)
   = 0; včetně alokačních párů Σ všech řádků objednávky = 0.
3. **P-ROUND**: každé sazbové entry má `amount_haleru = fn_pct_haleru(base_haleru,
   rate_bp)` (kryje i CHECK `chk_amount_formula`); ověřit proti nezávislé referenční
   implementaci HALF-UP (big-int aritmetika v testu).
4. **P-COMPANY**: `company_margin ≥ 0` pro libovolnou bázi včetně 1–10 h (mikročástky,
   kde jednotlivé sazby zaokrouhlí na 0 a entries nevznikají).
5. **P-IDEMP**: dvojí i souběžné (2 paralelní transakce) volání
   `fn_generate_commissions` ⇒ ledger identický s jedním voláním; žádný duplicitní
   řádek (`uq_commission_once` + early-exit + `FOR UPDATE`).
6. **P-IDEMP-SCOPE**: early-exit reaguje **jen na kalkulační typy** — existující
   reversaly ani `leadership_alloc` generování neblokují ve špatném smyslu a stornovaná
   objednávka se nikdy nepřegeneruje (originály s `reverses_entry_id IS NULL` v tabulce
   zůstávají); `spend` v `credit_transactions` na jiné objednávce generování nové
   objednávky nijak neovlivní.
7. **P-FLOW-EXCL (nad kalkulačními typy)**: množina kalkulačních `entry_type`
   objednávky je podmnožinou: `community_own` ⊆ {`team_gen1..3`, `leadership_pool`,
   `company_margin`}; `community_customer` ⊆ {`personal_customer`, `club_credit`,
   `company_margin`}; `trade` ⊆ {`trade_acquirer`, `company_margin`}; `organic` ⊆
   {`club_credit`, `company_margin`}. `leadership_alloc` smí existovat jen u
   `community_own` (CHECK `chk_flow_type`). Nic navíc, nikdy.
8. **P-CUSTOMER-NO-TEAM**: nákup osobního zákazníka nikdy nevytvoří `team_gen*` ani
   `leadership_pool`, bez ohledu na hloubku uplinu ambasadora.
9. **P-TRADE-ISOLATION**: Trade nákup nikdy nevytvoří `team_gen*`, `leadership_pool`
   ani `club_credit`; `rate_bp` získavatele = `trade_level_params.acquirer_rate_bp`
   úrovně KUPUJÍCÍHO (1000/800/500).
10. **G-UPLINE-PARTIAL**: upline hloubky 0/1/2/3+ ⇒ bookují se jen existující generace,
    chybějící procenta zůstávají v `company_margin` (golden: příklad (e) = 58 100 h
    firmě); žádné nulové ani zástupné záznamy; žádná komprese (P4).
11. **G-GOLDEN**: příklady (a)–(f) reprodukovány na halíř přesně, včetně stavů
    (`company_margin` available ihned, ostatní `pending` s `hold_until = paid_at +
    15 dní`).
12. **P-REVERSE-IDEMP**: dvojí volání `fn_refund_order` ⇒ přesně jedna sada reversalů
    (druhé volání padá na UNIQUE `order_refunds.order_id`; UNIQUE
    `reverses_entry_id` drží i při souběhu).
13. **P-REVERSE-CLAWBACK**: storno po settlementu ⇒ ke každému připsanému entry přesně
    jeden `clawback` na −akruál; zůstatek klesá přesně o připsanou částku (i do
    záporu); následné nové akruály záporný zůstatek nejdřív dorovnají; žádost o
    výplatu při zůstatku < minimu selže.
14. **P-HOLD (s výjimkami)**: žádné entry s beneficiary nepřejde na `available` před
    `paid_at + 15 dní` a žádný `accrual` nevznikne před settlementem — s výjimkami:
    `company_margin` je `available` ihned (D2); `leadership_alloc` vzniká s
    `hold_until = now()` mimo hold (pool už lhůtou prošel); `adjustment` v
    `credit_transactions` působí okamžitě (není entry a holdu nepodléhá).
    `fn_settle_commissions()` v čase T zpřístupní právě entries s `hold_until ≤ T`.
15. **P-SETTLE-IDEMP**: dvojí/souběžný běh `fn_settle_commissions` ⇒ jedno entry má
    vždy max jeden `accrual` (`uq_credit_accrual_entry`, `SKIP LOCKED`).
16. **P-SPEND-RACE**: dvě souběžné transakce čerpající tentýž zůstatek pod
    `pg_advisory_xact_lock` ⇒ nikdy Σ čerpání > zůstatek; `spend` vždy nese
    `spent_on_order_id`.
17. **P-CREDIT-BASE**: objednávka s uplatněným kreditem K ⇒ všechna entries počítána z
    `goods_paid = catalog − sleva − K`; objednávka plně krytá kreditem ⇒ žádná entries
    (ani `company_margin` „ze vzduchu"); 3% kredit z kreditu nevzniká.
18. **B-TRADE-NO-ACQ**: Trade partner bez získavatele ⇒ jediné entry `company_margin`
    = celá `goods_paid` (P5/D13).
19. **B-ROOT-AMB**: nákup ambasadora bez sponzora (kořen sítě) ⇒ jen `leadership_pool`
    + `company_margin`.
20. **B-RATE-SNAPSHOT**: změna `commission_rates`/`trade_level_params` po zaplacení
    nemění existující řádky (`rate_bp` a `amount_haleru` beze změny); nová objednávka
    počítá novou sazbou (P9).
21. **B-ALLOC-CAP**: Σ `leadership_alloc` > pool ⇒ výjimka; alokace na ne-`available`
    pool ⇒ výjimka; alokaci připíše nejbližší settlement jako kind `commission`.
22. **B-MIN-PAYOUT**: žádost o výplatu pod `app_settings.payout_min_haleru` (500 Kč)
    selže; výplata z klubového kreditu selže vždy (P7/P8).
23. **B-SHIPPING**: objednávka s dopravou 9 900 h ⇒ žádné entry nezahrnuje dopravu;
    báze = `goods_paid`; kredit nelze použít na dopravu (`chk_credit_only_goods`).
24. **B-CLIENT-DENY**: volání `fn_generate_commissions` / `fn_refund_order` /
    `fn_allocate_leadership` / `fn_settle_commissions` pod rolí `anon` i
    `authenticated` selže (permission denied); INSERT/UPDATE na `commission_entries` a
    `credit_transactions` pod klientskou rolí selže; klient nenastaví `orders.paid_at`
    ani `status='paid'`.

Testy 1–9 a 12–17 jsou property-based, 10–11 golden, 18–24 hraniční/bezpečnostní.
