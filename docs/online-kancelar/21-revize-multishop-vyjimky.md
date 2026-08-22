# 21 — Revize zadání 00–20, multishop po zemích (R20) a katalog nestandardních situací

> **Závazné zadání (22. 8. 2026).** Vzniklo revizí všech dokumentů proti
> skutečnému stavu repa `pentariva-office` (74 migrací, 68 tabulek, 167
> funkcí, 691 pgTAP asercí — stav k 22. 8. 2026). Tři části: **A)** revizní
> matice — co je hotové, co se koriguje; **B)** architektura multishopu —
> jedna platforma, více zemí, každá oddělená; **C)** katalog nestandardních
> situací se zákazníky a objednávkami, které systém musí umět řešit.
> Inspirace: Shoptet (provoz, doklady), Shopify Markets (trh = země
> s vlastní měnou, cenami a obsahem, jeden katalog).
>
> Platí guardraily `10` §1. Část B mění datový model v jádru (měna, ceny,
> překlady) — proto je rozdělena na **fázi A před go-live CZ** (levná teď,
> drahá později s živým ledgerem) a fáze B/C po něm.

---

## A. Revizní matice

### A.1 Stav implementace podle dokumentů

| Dok. | Stav v repu | Korekce / doplnění (závazné) |
|---|---|---|
| 02 D-kontrakt | platí | Nové D36–D40 (trhy, měna, překlady, izolace, testovací data) — doplněno do 02 |
| 03/05 provize v1 | nahrazeno v2 | Beze změny; historické objednávky `commission_model=1` |
| 04 DDL | rozjeté: 68 tabulek vs. kanonický dokument | **Kanonický DDL se už neudržuje ručně** — zdrojem pravdy je `supabase/migrations` + generované typy; dokument 04 dostane hlavičku „historický návrh, platí migrace" (D1 upraveno) |
| 13 model v2 | **hotovo** (20/8/4, pool 2 %, Benefit 3/6/10, uvítací výhoda, verze sazeb, P-INV1 per verze) | Ověřit: `benefit_tiers.min_turnover_12m` = prahy 150 000 h / 500 000 h — zadání 13 mluví o **měsíčním** obratu v Europe/Prague (14 §7); název sloupce naznačuje 12 měsíců. **Implementátor doloží, co platí, a sjednotí s 13** (bez změny sazeb). Prahy se stanou per trh (B.6) |
| 14 provoz | hotovo: sklad, vratky, souhlasy, právní dokumenty, kategorie, `_en` sloupce, ruční expedice | `_en` sloupce nahrazuje `product_translations` (B.4) s migrací dat; expedice podle 19 |
| 15 go-live | hotovo: selfcheck, heartbeaty, rate limity, výplatní profily+statementy, Fakturoid adaptér | `INVOICING_MODE` výchozí `internal` (19 §6); výplaty per měna (B.7) |
| 16 hlášení | hotovo (`system_issues`, `issue_catalog`, `/admin/issues`) | Nové kódy z 19/20/21 doplnit do katalogu |
| 17 Authentica | jen šev (`fulfillment_provider`) | Beze změny; odloženo |
| 18 prezentace + promoakce | hotovo (`product_media`, `product_flags`, `promotions`, `fn_quote_cart`, 30denní referenční cena, adopce) | `promotions.market_code` (B.5); `badge_label_cs/en` → jsonb `labels` per locale; kupóny unikátní per trh |
| 19 expedice + doklady | **nezačato** | Doplnit `market_code` do `shipping_methods`, `legal_entities` místo `company_*` (B.8); beze změny ostatní |
| 20 správa objednávek | **nezačato** | `order_status_transitions` už existuje — použít jako základ `order_ops_transitions`; `payments.livemode` = základ `is_test` (B.9) |
| i18n D35 | UI slovník `lib/i18n/messages.ts` (cs/en, 3 703 řádků, localStorage) | Zachovat; doplnit locale z trhu a `profiles.preferred_locale` (B.3) |

### A.2 Nálezy, které multishop blokují (opravit ve fázi A)

1. `orders.currency CHECK (currency='CZK')` a všechny peněžní sloupce bez
   měny → B.7.
2. Ceny a DPH na `products`/`product_prices` bez trhu (DPH sazba se
   liší po zemích: CZ 12/21, SK 19/23 od 2025, DE 7/19) → B.4.
3. Překlady jako párové sloupce `_cs/_en` na 6 tabulkách → B.4/B.5.
4. Globální `app_settings` pro věci, které jsou per trh (doprava zdarma
   2 000 Kč, uvítací minimum 500 Kč, prahy Benefit Clubu, minimální
   výplata) → B.6.
5. Firemní údaje (`company_ico`, `_shared/constants/company`) = jedna
   entita → B.8.
6. `email_templates` bez jazyka/trhu → B.3.

---

## B. Multishop: jedna platforma, více zemí, každá oddělená (R20)

### B.1 Pojmy a zásady

- **Trh (`market`) = země se storefrontem**: vlastní měna, ceny, DPH,
  promoakce, doprava, právní dokumenty, e-mailový odesílatel, fakturující
  entita. Kód = ISO země malými písmeny (`cz`, `sk`, `de`, `at`).
- **Produkt se listuje jednou** (master: SKU, typ, hmotnost, rozměry,
  kategorie, média, nákladová cena) a **per trh se aktivuje** a doplňuje
  (cena, DPH, překlady v jazycích trhu, lokální média, SEO, akce).
- **Izolace:** stav jednoho trhu nikdy neovlivní jiný. Chybějící cena
  pro SK nesmí zastavit CZ; produkt bez SK překladu je na SK prostě
  neaktivní. Žádný dotaz storefrontu bez `market_code`.
- **Jazyk ≠ trh.** Trh má výchozí jazyk a seznam povolených jazyků
  (`cz`: cs, en; `sk`: sk, cs, en; `de`: de, en). Uživatel si jazyk
  volí z povolených; obsah padá na výchozí jazyk trhu, nikdy na jiný trh.
- **Účet je globální** (jedno přihlášení, jedna síť partnerů). Objednávka
  patří trhu. Peníze se vedou per měna (B.7).

### B.2 Datový model trhů

```sql
markets(code text PK, name text, country_code char(2), currency char(3),
  currency_minor_unit smallint DEFAULT 2, default_locale text,
  locales text[], timezone text, vat_mode text CHECK IN ('domestic','oss','local_entity'),
  legal_entity_id uuid FK, shipping_countries char(2)[],
  status text CHECK IN ('draft','pilot','active','paused'),
  url_prefix text, sender_email text, sender_name text, sort_order int)
market_settings(market_code FK, key text, value jsonb, PRIMARY KEY (market_code,key))
legal_entities(id, name, legal_form, address jsonb, ico, dic, vat_payer boolean,
  registry_text, bank_account, iban, bic, email, phone, logo_path, stamp_path,
  invoice_footer_md, document_export_format text DEFAULT 'isdoc')
```

- Seed: `cz` (CZK, cs/en, `Europe/Prague`, `domestic`, entita PENTARIVA
  s.r.o. — placeholdery 19 §6.1), status `active`. Další trhy zakládá
  admin v `/admin/settings` → „Trhy" jako `draft`; `pilot` = viditelný jen
  adminům a testovacím účtům; `active` = veřejný.
- `fn_setting(key, market_code)` → `market_settings` override, jinak
  `app_settings`. Všechny existující čtení `app_settings` pro klíče ze
  seznamu B.6 projdou touto funkcí (grep + test, že žádné přímé čtení
  per-trh klíče nezůstalo).
- Sloupec `market_code text NOT NULL FK markets` přidat na: `orders`,
  `promotions`, `shipping_methods`, `legal_documents`, `email_templates`
  (spolu s `locale`), `campaigns`, `referral_events` (kontext kliku),
  `commission_rule_versions` (NULL = globální výchozí), `payout_requests`
  (přes měnu), `invoices` (přes `legal_entity_id`). Backfill `'cz'`.
- `profiles.home_market text FK DEFAULT 'cz'`, `profiles.preferred_locale`.

### B.3 Určení trhu a jazyka v aplikaci

- URL: `office.pentariva.com/{market}/…` (`/cz/shop`, `/sk/shop`) — statický
  export generuje segment per `markets.status IN ('pilot','active')`;
  kořen `/` přesměruje podle `profiles.home_market` → IP/Accept-Language
  → `cz`. Volitelně doména per trh (`markets.url_prefix` může být
  absolutní URL) — Firebase Hosting multi-site, později.
- Trh je v klientu kontext (`MarketProvider`) + posílá se do všech RPC
  storefrontu jako parametr; server ho u objednávky ukládá a **nikdy
  nevěří klientovi u cen** (ceny čte z `product_markets` podle trhu).
- Jazyk: `LocaleProvider` zůstává; výchozí = `markets.default_locale`,
  povolené = `markets.locales`; UI slovník `messages.ts` se rozšíří o `sk`,
  `de` až při otevření trhu (klíče existují, překlad dodá zadavatel /
  AI překlad s kontrolou).
- E-maily: `email_templates(key, market_code, locale, …)`; výběr šablony:
  (trh objednávky, jazyk zákazníka) → (trh, výchozí jazyk trhu) → chyba
  hlášení `EMAIL-TEMPLATE-MISSING` (nikdy tichý fallback do cizího trhu).
  Odesílatel z `markets.sender_email` (ověřená doména v Resend per trh).

### B.4 Produkt: master + aktivace per trh + překlady

```sql
products            -- master: sku, fulfillment_kind, weight_g, size_mm, category_id,
                    -- cost_haleru → cost_minor + cost_currency (nákup v CZK/EUR),
                    -- is_featured, sort_order, related_product_ids, wms_product_id
product_markets(product_id, market_code, status text CHECK IN ('not_listed','draft','ready','active','archived'),
  price_minor bigint, vat_rate_bp int, sale_price_minor bigint NULL, sale_from, sale_to,
  cost_minor_override bigint NULL, allow_backorder boolean NULL, seo_slug text,
  sort_order int, completeness jsonb, activated_at, activated_by,
  PRIMARY KEY (product_id, market_code), UNIQUE (market_code, seo_slug))
product_market_prices(id, product_id, market_code, price_minor, sale_price_minor, sale_from, sale_to,
  valid_from, created_by)   -- historie cen per trh (nahrazuje product_prices), 30denní referenční cena per trh
product_translations(product_id, locale, name, subtitle, description_md, ingredients_md,
  usage_md, warnings_md, specs jsonb, story_md, faq jsonb, seo_title, seo_description,
  status text CHECK IN ('draft','ready'), translated_by, updated_at,
  PRIMARY KEY (product_id, locale))
product_media       -- + locale text NULL (NULL = všechny), market_code text NULL (NULL = všechny)
product_categories  -- name → jsonb labels {"cs":…,"sk":…}; + category_markets(category_code, market_code, visible)
product_flags       -- label → jsonb labels
```

- **Admin `/admin/products`:** seznam všech master produktů se sloupcem
  per trh (ikonky: šedá = nelistováno, žlutá = rozpracováno, modrá =
  připraveno, zelená = aktivní). Akce **„Aktivovat pro {trh}"** založí
  `product_markets.draft` + prázdné `product_translations` pro jazyky
  trhu, které chybí. Detail produktu má záložky **Master** (sdílené) ·
  **per trh** (cena, DPH, akční cena, SEO, lokální média, stav) ·
  **Překlady** (per jazyk, s „zkopírovat z cs" a AI předpřekladem
  označeným `draft`).
- **Kontrola úplnosti** (`completeness` přepočítává trigger) — podmínky
  pro `ready`: cena > 0, DPH sazba nastavena (z číselníku trhu
  `market_vat_rates(market_code, code, rate_bp)`), překlad `ready` ve
  **výchozím jazyce trhu** (ostatní jazyky volitelné s fallbackem na
  výchozí jazyk trhu), **`ingredients_md` a `warnings_md` v jazyce trhu**
  (zákonné značení kosmetiky/doplňků stravy v jazyce země), alespoň jedno
  médium, `weight_g > 0` u fyzických. `active` jen z `ready`; při změně
  master pole, které je v podmínkách, trh **nepadá** zpět (jen hlášení
  `low` „produkt X v trhu SK má neúplné údaje").
- Storefront čte výhradně `v_storefront_products(market_code, locale)`
  (aktivní v trhu, překlad v jazyce s fallbackem, cena/akce z trhu,
  příznaky 18 per trh: `new`, `sale`, `last_pieces` počítané per trh).
- **Migrace z dnešního stavu:** `product_prices` → `product_market_prices`
  (`cz`); `products.vat_rate_bp` → `product_markets.vat_rate_bp`;
  `name/description/…` + `_en` → `product_translations` (`cs`, `en`);
  staré sloupce zůstanou **jednu verzi** jako generované view
  `v_products_legacy` pro přechod UI, pak DROP. `seo_slug` per trh.
- Sklad: zůstává jeden (CZ), `products.stock_qty` sdílený všemi trhy —
  **fáze C** zavádí `warehouses` + `stock_levels(product_id, warehouse_id)`
  a `markets.default_warehouse_id`; do té doby vyprodáno = vyprodáno všude.

### B.5 Promoakce, kupóny, příznaky per trh

- `promotions.market_code NOT NULL`; `code` UNIQUE `(market_code, code)`;
  `badge_label_*` → `labels jsonb`; `landing_text_md` → jsonb per locale.
  `fn_quote_cart(market_code, …)` vybírá jen akce trhu. Kopie akce do
  jiného trhu = akce „Duplikovat do {trh}" (částky se **nepřepočítávají**,
  admin je zadá v měně trhu).
- Dárkový produkt akce musí být v cílovém trhu `active` (validace).
- Uvítací výhoda (13): `welcome_*` klíče per trh (B.6); `welcome_gift_product_id`
  per trh.

### B.6 Nastavení per trh (`market_settings` override)

`shipping_free_from`, `welcome_min_catalog`, `welcome_mode`,
`welcome_discount_bp`, `welcome_gift_product_id`, `benefit_tier_thresholds`
(prahy 3/6/10 v měně trhu), `payout_min`, `invoice_series`,
`label_format`, `packeta_sender`, `handover_mode`, `return_shipping_*`,
`gift_small_value_limit` (ZDPH limit je per zemi), `withdrawal_transit_days`,
`test_email_domains`. **Sazby provizí (20/8/4/2, Benefit 3/6/10) zůstávají
globální** s možností per-trh verze v `commission_rule_versions.market_code`
(změna = zadavatel, 13 guardrail).

### B.7 Peníze ve více měnách

- **Konvence D19 rozšířena (D37):** sloupce `_haleru` znamenají **nejmenší
  jednotku měny řádku** (haléře / centy). **Nepřejmenovávají se** (cena
  změny v živém ledgeru > přínos); nové sloupce se pojmenují `_minor`.
  Každá peněžní tabulka dostane `currency char(3) NOT NULL` (`orders` —
  zrušit CHECK `='CZK'`, `payments`, `order_refunds`, `commission_entries`,
  `credit_transactions`, `payout_requests`, `payout_statements`,
  `invoices`); CHECK: měna dceřiných řádků = měna objednávky; `payments`
  měna = měna objednávky (brána účtuje v měně trhu — Stripe účet umí více
  měn; Comgate CZ/EUR).
- **Ledger per objednávka beze změny** (invarianty 13 platí v měně
  objednávky). **Kreditní zůstatek per (profil, druh, měna)**; `/commissions`
  a `/payouts` zobrazují per měnu; `fn_request_payout(currency)`; výplata
  v měně (SEPA EUR / CZK), `payout_profiles` + `iban` povinné pro EUR.
  **Nikdy se nic nepřepočítává kurzem v ledgeru.**
- Benefit Club: obrat zákazníka se počítá **per trh v měně trhu** (prahy
  B.6); úroveň je per trh (`customer_benefit_tiers.market_code`).
- Konsolidované reporty: `fx_rates(date, base char(3), quote char(3),
  rate numeric, source)` (ČNB denní kurz přes cron) jen pro **informativní**
  přepočet do CZK v `/admin/reports` (označeno „orientačně, kurz ČNB
  k datu"); účetní dostává každou měnu zvlášť.
- Cenotvorba: admin zadává ceny per trh ručně; pomocník „navrhnout
  z CZ ceny kurzem × koeficient, zaokrouhlit na ,90" jen předvyplní.

### B.8 Doklady, právo, DPH per trh

- `markets.legal_entity_id` → kdo fakturuje (start: jedna CZ entita pro
  všechny trhy; později lokální s. r. o.). Číselné řady per (entita, trh,
  rok). `invoice_series` v `market_settings`.
- `vat_mode`: `domestic` (DPH země entity), `oss` (DPH země zákazníka —
  sazby z `market_vat_rates`, registrace OSS, přiznání čtvrtletně — export
  v 20 §6 per trh), `local_entity` (místní plátce). DUZP, šablona a
  jazyk dokladu = jazyk zákazníka; povinné náležitosti dle země
  (SK: „Faktúra – daňový doklad", IČ DPH; DE: Rechnung, USt-IdNr., § 14
  UStG); `document_export_format` per entita (ISDOC jen pro CZ účetní;
  jinde CSV + PDF).
- `legal_documents(kind, market_code, locale, version)` — souhlas se
  váže k trhu; re-souhlas (14 §5) při změně verze v trhu uživatele.
- Spotřebitelské lhůty per trh (`withdrawal_days` 14 EU standard, ale
  konfigurovatelné), reklamační texty per trh.

### B.9 Izolace, testování, migrace (D38–D40)

- **D38 Izolace trhů (test):** pgTAP sada „market isolation" — objednávka
  v `sk` nevidí ceny/akce/dopravu `cz`; produkt aktivní jen v `cz` se
  ve `sk` storefrontu nevrátí; `market_settings` override neprosakuje;
  deaktivace trhu (`paused`) zablokuje checkout jen tam.
- **D39 Testovací data (20 §3.1b):** `is_test` všude; `payments.livemode`
  existuje → `is_test = NOT livemode OR manual_test`.
- **D40 Migrace ve fázi A** (jedna migrace, v transakci, s reverzním
  skriptem): založit `cz`, backfill `market_code='cz'`, `currency='CZK'`
  všude, přesun cen/DPH/překladů, zrušení CHECK měny, kompatibilní views;
  všech 691 stávajících asercí musí projít beze změny výsledků; zlaté
  testy 13 beze změny čísel.

### B.10 Fáze

| Fáze | Kdy | Obsah |
|---|---|---|
| **A** | **před go-live CZ** (levné teď) | B.2 `markets` + `market_code` + `legal_entities`; B.4 `product_markets` / `product_translations` / `product_market_prices` s migrací; B.7 `currency` sloupce + zrušení CHECK; B.3 `MarketProvider` + `/cz/` prefix; D38 testy. Funkčně pro CZ **nic nemění** |
| **B** | po go-live CZ | B.6 `market_settings`, B.5 akce per trh, B.3 e-maily per trh/jazyk, B.8 DPH režimy a doklady per entitu, B.7 kredity/výplaty per měna, admin „Trhy" + aktivace produktů; **pilot SK** (Packeta SK, EUR, Stripe EUR) |
| **C** | při 2.–3. trhu | sklady per trh (`warehouses`), šarže (C.6), FX reporty, domény per trh, lokální entity |

---

## C. Katalog nestandardních situací (co musí systém umět)

Legenda stavu: ✅ existuje · 🟡 částečně / v zadání 19–20 · 🔴 nové (tento dokument)

### C.1 Zákazník a účet

| Situace | Řešení | Stav |
|---|---|---|
| Dva účty téže osoby (e-mail překlep, nová registrace) | `fn_admin_merge_accounts(from, to, reason)`: přepojí objednávky, kredity (per měna), referral kódy, souhlasy; zakázáno, je-li `from` partner s downline (nejdřív převést síť); audit + e-mail | 🔴 |
| Změna e-mailu / telefonu | samoobsluha v `/account` s ověřením; admin s důvodem; `profiles.email` zrcadlí auth ✅ | ✅ |
| Zákazník chce doklad na firmu až po vystavení | `fn_admin_reissue_invoice(order, billing)`: dobropis původní + nová faktura (19 §6), obě v řadě, historie | 🔴 |
| Změna doručovací adresy po objednávce | do založení zásilky volně (20 §2); po ní storno zásilky a nová; po podání přesměrování nelze (Packeta) → zákazník si vyzvedne / vrátí | 🟡 20 |
| Zákazník neodpovídá, balík nevyzvednut (Packeta 20 „storage time expired" → vrácen) | `returned` → admin volba: znovu poslat (doposlání 20 §3.4, doprava účtovatelná dle `unclaimed_reship_fee`) / vrátit peníze minus skutečné náklady dopravy (`unclaimed_refund_deduct_shipping`, default `true`, text v obchodních podmínkách) | 🔴 konfig |
| GDPR výmaz s otevřenými objednávkami/provizemi | anonymizace ✅, ale **blokovat**, dokud existuje `pending` provize nebo nevyřízená vratka (hlášení s vysvětlením) | 🟡 doplnit guard |
| Nezletilý / podezřelá registrace | 18+ u ambasadora ✅; anti-abuse report ✅; blokované domény ✅ | ✅ |
| Zákazník chce přejít k jinému ambasadorovi | adopce jen organický → přiřazený (R17) ✅; změna sponzora do 14 dnů ✅; po 14 dnech jen admin s důvodem a **oboustranným souhlasem** zaznamenaným v poznámce | 🟡 text |

### C.2 Objednávka a položky

| Situace | Řešení | Stav |
|---|---|---|
| Částečný sklad, dělení, doposlání, částečná vratka, storno | 20 §3 | 🟡 20 |
| Duplicitní objednávka (zákazník kliknul dvakrát) | detekce: stejný kupující + stejné položky + 10 min + obě zaplacené → hlášení `ORDER-POSSIBLE-DUPLICATE` (`medium`) s akcí „Stornovat a vrátit" jedním klikem | 🔴 |
| Chybná cena v katalogu (překlep 99 místo 999) | admin „Hromadné storno objednávek produktu za období" s důvodem a e-mailem (zjevná chyba, § 583 OZ); semafor marže 18 **blokuje uložení ceny pod nákladovou cenou** bez potvrzení | 🔴 |
| Produkt stažen z prodeje / nahrazen | `archived` per trh; otevřené objednávky → hlášení + volba doposlat náhradu (20 §3.4) nebo vrátit | 🟡 |
| Objednávka zaplacena, sklad mezitím 0 (`allow_backorder`) | stav „Čeká na doskladnění" (20 §3.3) + e-mail s termínem + právo zrušit | 🟡 20 |
| Zákazník chce přidat položku po zaplacení | nelze upravit (server) → nová objednávka; doprava zdarma ručně kupónem `free_shipping` jednorázově | 🟡 text |
| Objednávka od testovacího účtu v ostrém provozu | 20 §3.1b | 🟡 20 |

### C.3 Platby

| Situace | Řešení | Stav |
|---|---|---|
| Platba selhala / zákazník zavřel okno | expirace + „zaplatit znovu" ✅, reconcile ✅ | ✅ |
| **Chargeback / spor u brány** (Stripe `charge.dispute.*`) | `disputes(id, payment_id, provider_dispute_id, status, amount_haleru, currency, reason, evidence_due_at, opened_at, closed_at, outcome)`; webhook → objednávka provozní stav „Sporná platba", **výplaty všech příjemců provizí z této objednávky blokovány** do uzavření (`fn_request_payout` kontroluje), hlášení `critical` s návodem, co doložit (doklad, tracking, doručení); `lost` → `fn_apply_dispute_lost` = ledger reversal jako vratka **bez** refundu brány + evidence poplatku; `won` → odblokovat | 🔴 |
| Převod na účet: nedoplatek / přeplatek | `bank_payments_inbox(received_at, amount, currency, vs, payer, raw, matched_order_id)` — ruční zápis nebo import CSV výpisu; párování VS; **nedoplatek** → e-mail „doplaťte X" + objednávka čeká (`underpayment_tolerance`, default 5 Kč se toleruje); **přeplatek** → vrátit rozdíl nebo kredit (`overpayment_to_credit` default `false`) | 🔴 |
| Platba přišla po expiraci objednávky | reconcile už řeší „paid po cancel" → obnovit objednávku, je-li sklad; jinak refund | 🟡 ověřit test |
| Refund brány selhal (karta expirovala) | Stripe vrací na původní kartu vždy; při `failed` hlášení `high` + ruční převod (admin zapíše `manual_refund` s referencí) | 🔴 |

### C.4 Doprava a balík

| Situace | Řešení | Stav |
|---|---|---|
| Balík ztracen / poškozen | `carrier_claims(shipment_id, kind lost|damaged, filed_at, claim_ref, claimed_haleru, received_haleru, status, note)`; akce: doposlat (20 §3.4) nebo vrátit peníze; hlášení `SHIP-STUCK` (19 §8) spouští podnět; Packeta reklamace se podává v client section (bez API) — evidujeme jen výsledek | 🔴 |
| Špatná položka odeslána | doposlání správné + zpětná zásilka heslem (19 §7), `stock_movements` oprava s důvodem | 🟡 |
| Zákazník odmítl převzít (Packeta 17/18) | = nevyzvednuto (C.1) | 🔴 konfig |
| Změna výdejního místa po podání | Packeta umožňuje zákazníkovi v aplikaci; my nic — jen stav | ✅ info |

### C.5 Partner a síť

| Situace | Řešení | Stav |
|---|---|---|
| Partner končí / deaktivován (`fn_admin_set_active=false`) | **R21 (výchozí, ke schválení):** neaktivní partner **nedostává nové provize**; jeho podíl z linie zůstává firmě (`company_margin`), downline **se nepřesouvá** (žádná komprese), jeho zákazníci zůstávají přiřazeni (provize z nich firmě). Reaktivace obnoví. Výplata zůstatku po ukončení možná do 12 měsíců (`payout_after_exit_months`) | 🔴 + R21 |
| Partner zemřel / převod pozice | ruční převod pozice na jiný účet (`fn_admin_transfer_position(from,to)`) s dokumentací; provize pokračují novému | 🔴 fáze C |
| Podezření na self-referral / fiktivní zákazníky | anti-abuse report ✅ (stejná adresa, IP, platební karta `payments.payload.fingerprint`); akce: pozastavit výplaty partnera (`profiles.payouts_blocked` + důvod) | 🟡 sloupec |
| Změna bankovního účtu před výplatou / výplata se vrátila | `payout_requests` stav `returned` + hlášení; nový profil účtu; opětovné odeslání | 🔴 stav |
| Partner má záporný kredit (clawback) a žádá výplatu | netování ✅; výplata jen z kladného zůstatku ✅ | ✅ |
| Partner prodává v jiném trhu (CZ partner, SK zákazník) | povoleno; provize v EUR na EUR zůstatek (B.7); Benefit Club zákazníka per trh | 🔴 B.7 |

### C.6 Katalog a sklad

| Situace | Řešení | Stav |
|---|---|---|
| Inventura: rozdíl skutečnost vs. systém | `stock_movements.correction` ✅ + obrazovka inventury (počítané vs. zadané, rozdíl, potvrzení) | 🟡 UI |
| Šarže a expirace (kosmetika, doplňky: dohledatelnost dle nařízení 1223/2009 / potravinové právo) | **fáze C:** `stock_lots(product_id, lot_code, expiry_date, qty)`, příjem se šarží, FEFO při balení (balicí stanice ukáže šarži k vzetí), `shipment_items.lot_code`; stažení šarže = seznam objednávek s danou šarží + hromadný e-mail | 🔴 fáze C |
| Nákupní cena se změnila | `products.cost_*` verzovat (`product_cost_history`) kvůli marži per období | 🟡 |
| Produkt má různé DPH v trzích | B.4 `product_markets.vat_rate_bp` | 🔴 B |

### C.7 Právo a compliance

| Situace | Řešení | Stav |
|---|---|---|
| B2B zákazník z EU s DIČ (reverse charge) | EF `vies-check` (VIES SOAP) při zadání DIČ, uložit výsledek + čas; doklad bez DPH s textem „reverse charge" jen při platném DIČ a `vat_mode` to dovoluje | 🔴 fáze B |
| Změna obchodních podmínek | re-souhlas ✅ per trh (B.8) | 🟡 |
| Žádost o data / výmaz | ✅ | ✅ |
| Reklamace po 24 měsících / mimo lhůtu | `return_requests` s `kind=complaint` bez limitu ✅; admin zamítne s textem | ✅ |
| Dárek nad 500 Kč bez DPH | 19 §6.2 bod 4 | 🟡 19 |

---

## D. Co se přidává do zadání 19/20 (sloučeno sem, bez duplikace)

- 19: `shipping_methods.market_code`, `legal_entities` místo `company_*`
  (B.8), `carrier_claims` (C.4), nevyzvednuté balíky (C.1 konfig).
- 20: `disputes` + webhooky (C.3), `bank_payments_inbox` (C.3),
  `fn_admin_merge_accounts`, `fn_admin_reissue_invoice` (C.1), duplicitní
  objednávky a hromadné storno (C.2), `payout_requests.returned`,
  `profiles.payouts_blocked` (C.5), `fn_admin_deactivate_partner` s R21.
- 16: kódy `ORDER-POSSIBLE-DUPLICATE`, `PAYMENT-DISPUTE-OPENED/LOST/WON`,
  `PAYMENT-UNDERPAID/OVERPAID`, `REFUND-GATEWAY-FAILED`, `SHIP-CLAIM-*`,
  `PAYOUT-RETURNED`, `PRODUCT-MARKET-INCOMPLETE`, `EMAIL-TEMPLATE-MISSING`.

## E. Akceptace (nad rámec 19/20)

1. Fáze A migrace: všech 691 asercí + zlaté testy 13 beze změny; CZ
   storefront vizuálně i cenově identický (snapshot test košíku).
2. Izolace (D38): min. 12 asercí; produkt aktivní v `cz` není v `sk`;
   `sk` bez cen nebrání CZ checkoutu.
3. Aktivace produktu pro trh: `draft` nejde `active`; po doplnění ceny,
   DPH, překladu `ready` v jazyce trhu a složení → `ready` → `active`;
   chybějící slovenské `ingredients_md` blokuje.
4. Objednávka v EUR: ledger v EUR, kreditní zůstatek EUR oddělený od CZK,
   výplata EUR vyžaduje IBAN; žádný kurzový přepočet v ledgeru.
5. Chargeback otevřen → výplaty příjemců blokovány; `lost` → Σ ledgeru
   objednávky = 0; `won` → odblokováno.
6. Merge účtů převede objednávky a kredity, zachová Σ zůstatků; odmítne
   partnera s downline.
7. Nevyzvednutý balík → po `returned` nabídka doposlat / vrátit minus
   doprava dle konfigurace; dobropis správně.
8. Deaktivace partnera: nové objednávky jeho zákazníků generují podíl
   firmě, downline beze změny, starší `pending` entries dozrají a lze je
   vyplatit do `payout_after_exit_months`.

## F. Pořadí (souhrn napříč 19/20/21)

1. **21 fáze A** (trhy, měna, produkt per trh — strukturální, před
   go-live CZ) + 20 §1/§4 (stavy, historie) + 20 §3.1/3.1b (ruční platba,
   testovací data).
2. 19 §3, §6 (doklady interní, ISDOC), §5.1 balicí stanice, §0.2 tiskárna.
3. 20 §2 detail, §3.2–3.5, §6 exporty; 21 C.3 spory a převody.
4. 19 Packeta živě (po účtu); 21 C.1/C.4 merge, reissue, claims.
5. 21 fáze B (SK pilot), C.5 R21, C.7 VIES.
6. 21 fáze C (sklady, šarže, FX).
