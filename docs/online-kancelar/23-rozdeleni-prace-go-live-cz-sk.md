# 23 — Rozdělení práce před go-live CZ + SK (tři paralelní proudy)

Rozhodnutí zadavatele 22. 8. 2026 (R23): **CZ a SK startují společně**, multishop
fáze B z `21` B.10 tedy jde **před go-live**, ne po něm. Práce se dělí na tři
proudy, které se nesmí vzájemně blokovat. Každý proud má vlastní větev, vlastní
tabulky/funkce a vlastní číselnou řadu pgTAP testů. Všechno společné je v §4
(rozhraní) — změna rozhraní = jednořádková dohoda v tomto dokumentu, ne tichá
migrace.

Pořadí v čase: **všechny tři proudy běží paralelně** od 23. 8. 2026. Go-live
CZ + SK je možný, až jsou hotové všechny tři (plus vstupy zadavatele: IČO,
účet Zásilkovny CZ + SK, Stripe EUR, právní texty CZ/SK — `10` §5).

---

## 1. Proud „Doklady" (Claude)

Rozsah: `19` §6.1–6.4, `20` §6, `21` B.8 (část doklady). Od začátku
**per trh / měna / fakturující entita / jazyk** — žádné „nejdřív CZ, pak SK".

| # | Co | Zdroj |
|---|---|---|
| 1 | **Firemní údaje** v administraci: `legal_entities` jako editovatelné placeholdery (logo je), guard `fn_company_profile_complete` → bez IČO jen testovací doklady | 19 §6.1 |
| 2 | **Číselné řady per (entita, trh, rok)**: `invoice_series` v `market_settings`, `fn_next_document_number(entity, market, kind, year)`; řada `TEST-` odděleně | 19 §6.2, 21 B.8 |
| 3 | **Snapshot dokladu** rozšířený o `market_code`, `currency`, `legal_entity_id`, `vat_mode` (`domestic` / `oss`), sazby z `market_vat_rates`, jazyk = `profiles.preferred_locale` | 21 B.7/B.8 |
| 4 | **Edge Function `invoice-render`** → PDF do bucketu `invoices` (privátní, signed URL 1 h), `invoices.pdf_path`; šablona dle vzorů Shoptet CZ / Fakturoid; SK varianta „Faktúra – daňový doklad", IČ DPH; dobropis | 19 §6.2 |
| 5 | **ISDOC 6.0.2** generátor + XSD v repu, Deno validace 5 vzorů; jen pro entity s `document_export_format = isdoc` (CZ účetní); SK/jiné = PDF + CSV | 19 §6.3, 21 B.8 |
| 6 | **Testovací doklady**: řada `TEST-`, vodoznak „TESTOVACÍ – nebyla uhrazena", uhrazeno 0, bez ISDOC, mimo exporty | 19 §6.4, 20 §3.1b |
| 7 | **Účetní export** `/admin/reports` → „Doklady": období × typ × **trh** → EF `documents-export`: ZIP (PDF + ISDOC/CSV + `prehled.csv`), XLSX; velké exporty na pozadí; každá měna zvlášť | 20 §6 |
| 8 | Doplňkové exporty na téže obrazovce (vratky/dobropisy, kredity a provize per měna, Stripe payouts vs. doklady) | 20 §6 b.4 |
| 9 | `fn_admin_reissue_invoice` (doklad na firmu dodatečně = dobropis + nová faktura) | 21 C.1 |
| 10 | Hlášení: `INVOICE-COMPANY-MISSING`, `INVOICE-RENDER-FAILED`, `EXPORT-FAILED` v `issue_catalog` (cs/en/sk) | 16 |

Vlastní DB objekty: `invoices*`, `invoice_series`, `fn_next_document_number`,
`fn_build_invoice_snapshot`, `fn_issue_internal_invoice`, `fn_admin_reissue_invoice`,
`fn_admin_document_*`, bucket `invoices`, EF `invoice-render`, `documents-export`.
pgTAP: `050–059`.

## 2. Proud „Multishop fáze B" (kolega 1)

Rozsah: `21` B.3, B.5, B.6, B.7, B.8 (část právo/souhlasy), B.9 (D38), admin
„Trhy", pilot SK. **Bez dokladů** (ty jsou v proudu 1).

| # | Co | Zdroj |
|---|---|---|
| 1 | **Admin „Trhy"** (`/admin/settings/markets/`): stav trhu (`active`/`paused`), měna, jazyky, `legal_entity_id`, `vat_mode`, `withdrawal_days`; **aktivace produktu per trh** + ceny per trh (`product_market_prices`, pomocník „navrhnout z CZ kurzem × koeficient, zaokrouhlit na ,90") + překlady `product_translations` (sk) v záložce „Trhy" detailu produktu | 21 B.4, B.6, 22 §10 |
| 2 | **`market_settings` override** a jeho použití všude, kde se dnes čte `app_settings` (doprava zdarma od, prahy Benefit, `payout_min`, lhůty) — s testem, že override neprosakuje | 21 B.6, D38 |
| 3 | **Promoakce a kupóny per trh** (`promotions.market_code`, unikátnost kódu per trh, `fn_quote_cart` čte jen akce trhu objednávky) | 21 B.5 |
| 4 | **E-maily per trh a jazyk** (`email_templates(market_code, locale)`, fallback na `cz/cs`, odesílatel a patička per entita) a **právní dokumenty per trh** (`legal_documents(kind, market_code, locale, version)`, re-souhlas v trhu uživatele) | 21 B.3, B.8 |
| 5 | **Peníze per měna**: kreditní zůstatek per (profil, druh, měna) ve `v_credit_overview`/`v_credit_balances`, `/commissions` a `/payouts` per měna, `fn_request_payout(currency)`, `payout_profiles.iban` povinné pro EUR, výplatní výpisy per měna; Benefit obrat per trh (`customer_benefit_tiers.market_code`). **Ledger se nikdy nepřepočítává kurzem.** | 21 B.7 |
| 6 | **Storefront SK**: `/sk/` prefix, `MarketProvider` určuje trh z URL, ceny v EUR z `product_market_prices`, doprava `shipping_methods(market_code='sk')`, Stripe EUR (stejný účet, měna z objednávky), Packeta SK výdejní místa (mock do doby účtu) | 21 B.3, B.7 |
| 7 | **pgTAP „market isolation" (D38)**: objednávka `sk` nevidí ceny/akce/dopravu `cz`; produkt aktivní jen v `cz` se ve `sk` nevrátí; `paused` blokuje checkout jen tam; zlaté testy 13 beze změny čísel | 21 B.9 |
| 8 | Manuál `/help` kapitoly Trhy (cs/en) | CLAUDE.md 10 |

Vlastní DB objekty: `markets`, `market_settings`, `market_vat_rates`,
`product_markets`, `product_market_prices`, `product_translations`,
`promotions.market_code`, `email_templates`/`legal_documents` per trh,
kredit/výplaty per měna, `customer_benefit_tiers.market_code`. pgTAP: `060–069`.

## 3. Proud „Správa objednávek a expedice" (kolega 2)

Rozsah: `20` §1, §5, `19` §2, §3.1, §8, `21` C.2, C.3, C.5, D.

| # | Co | Zdroj |
|---|---|---|
| 1 | **Editace provozních stavů** v adminu (CRUD: název, barva, text pro zákazníka, e-mailová šablona, pořadí, přechody) — dnes jen ke čtení; systémové stavy zůstávají pevné | 20 §1, 22 §9a |
| 2 | **Hromadné akce** v `/admin/orders`: změna provozního stavu, tisk balicích lístků, CSV/XLSX výběru | 20 §5 |
| 3 | **Worker nad `shipping_jobs`** (EF/cron: podání, štítek, stav; retry s backoffem; hlášení `SHIP-JOB-FAILED`) | 19 §2, §8 |
| 4 | **Packeta adaptér** `lib/shipping/packeta.ts` místo stubu: `createPacket`, `packetsLabelsPdf`, `cancelPacket`, `packetStatus`, `packetTracking`, `createPacketClaimWithPassword` (vratky), mapa 25 stavů → `shipping_status_map`; Deno mock testy; **CZ i SK** (dvě konfigurace dopravce per trh); živé ověření až po účtu | 19 §2, §5.2, §7 |
| 5 | **Widget výdejních míst** s ověřením `isValid` na serveru (mock, než bude klíč) | 19 §4 |
| 6 | **Doručení digitálních produktů** (`fn_deliver_digital`, kód v e-mailu, `digital_deliveries`) | 19 §3.1 |
| 7 | **R21 — deaktivace partnera**: `fn_admin_deactivate_partner(reason)`, podíl zůstává firmě, výplata do 12 měsíců (`payout_after_exit_months`), `profiles.payouts_blocked` + důvod, `payout_requests.returned`; kritéria „neaktivní" doplní kolega zadavatele (zatím ruční akce admina) | 21 C.5, R21 |
| 8 | Výjimky: `ORDER-POSSIBLE-DUPLICATE` + „Stornovat a vrátit", hromadné storno objednávek produktu při chybné ceně + blok ceny pod nákladovou, `REFUND-GATEWAY-FAILED` + ruční refund s referencí, guard GDPR výmazu při `pending` provizi / nevyřízené vratce | 21 C.1–C.3 |
| 9 | Kódy hlášení z `21` D do `issue_catalog` (cs/en/sk) | 21 D |

Vlastní DB objekty: `order_ops_statuses`/`order_ops_transitions` (CRUD),
`shipments*`, `shipping_jobs`, `shipping_status_map`, `digital_deliveries`,
`fn_admin_*` nad objednávkami (kromě dokladů), `fn_admin_deactivate_partner`,
EF `shipping-worker`. pgTAP: `070–079`.

---

## 4. Rozhraní mezi proudy (závazné)

| Kdo poskytuje | Co | Kdo čte |
|---|---|---|
| fáze A (hotovo) | `orders.market_code`, `orders.currency`, `payments.currency`, `invoices.market_code`, `invoices.legal_entity_id`, `profiles.preferred_locale`, `markets.legal_entity_id` | všichni |
| **Doklady** (přidá v první migraci, s defaulty, aby nikoho neblokoval) | `markets.vat_mode text NOT NULL DEFAULT 'domestic'` (`domestic`/`oss`/`local_entity`), `legal_entities.document_export_format text NOT NULL DEFAULT 'isdoc'` (`isdoc`/`csv`), klíč `market_settings.invoice_series` | Multishop čte/edituje v admin „Trhy"; Objednávky nečtou |
| **Multishop** | hodnoty `market_vat_rates` pro `sk`, `markets.legal_entity_id`, `preferred_locale` zákazníků, `email_templates(market_code, locale)` | Doklady (sazby DPH, jazyk a entita dokladu); Objednávky (e-mail o expedici per trh) |
| **Doklady** | `invoices.pdf_path`, `invoices.credit_note_pdf_path` (privátní bucket `invoices`) | Multishop/e-maily: příloha k potvrzení objednávky přes signed URL funkcí `fn_invoice_signed_url(order)` — do té doby e-mail bez přílohy |
| **Objednávky** | `fn_admin_mark_paid`, `fn_admin_split_ship`, `fn_admin_create_replacement`, `fn_refund_order` (existují) — **signatury se nemění** | Doklady věší vystavení dokladu na `order_events` (`paid`, `refunded`, `partially_refunded`), ne na tyto funkce |
| **Objednávky** | `shipping_methods(market_code)` a dopravce per trh | Multishop (storefront SK zobrazuje metody trhu) |

Pravidla:

1. **Každý proud sahá jen na své tabulky a funkce** (seznamy výše). Potřeba sáhnout
   jinam = jeden řádek do §4 a zpráva ostatním, dřív než vznikne migrace.
2. **Migrace**: `supabase migration new`, timestamp dne vzniku. Před merge do `main`
   rebase na aktuální `main` + lokální `supabase db reset` + **celý** `supabase test db`
   (dnes 808 asercí zelených — to je laťka).
3. **Testy**: řady pgTAP `050–059` / `060–069` / `070–079`; vitest vedle kódu;
   zlaté testy `034` (model v2) se **nemění** — kdo je rozbije, opravuje kód, ne test.
4. **Větve a CI**: jedna větev na proud (`feat/docs-invoicing`, `feat/multishop-b`,
   `feat/order-ops`), PR do `main` po dokončeném celku, **ne denně** — kvóta GitHub
   Actions do 1. 9. 2026 (`CLAUDE.md`). CI běží jen na push do `main`.
5. **Peníze** (`CLAUDE.md` pravidla 1–5): sazby, ledger a výpočty jen v DB funkcích;
   nic se nepřepočítává kurzem; `_haleru` = nejmenší jednotka měny řádku (D37).
6. **UI**: nový admin prvek = `Field` s `help` + tooltip (22), manuál `/help` ve
   stejné změně (CLAUDE.md 10), žádná čeština v URL/kódu (R15).
7. **Stav**: každý proud si po dokončení celku aktualizuje `CLAUDE.md` „Stav implementace"
   (19 a 20 tam dnes chybí — doplní proud Doklady / Objednávky za svou část).

## 5. Co po proudech zůstává (nezařazeno)

Fáze C z `21` (sklady per trh, šarže, FX reporty, lokální entity, domény per trh),
bankovní převod s VS (čeká na rozhodnutí zadavatele, `10` §6), zálohové doklady,
Zebra na hardwaru (po koupi), VIES kontrola DIČ (první B2B zákazník v SK).
