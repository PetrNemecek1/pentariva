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

**Stav 23. 8. 2026:** body 1–10 hotové a v produkci (pentariva-office PR #31–#33 + doplňkové
exporty); ISDOC prochází validací proti oficiálnímu XSD 6.0.2. Otevřené jen odpovědi účetní
(A10 `.isdocx`, A11 kód formy úhrady — výchozí 42) a příloha PDF k e-mailu #5 (rozhraní pro proud 2).

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
| **Doklady** | EF `invoice-render` akce `url` s `order_access_token` (bez JWT): `{action:"url", invoice_id, order_access_token}` → signed URL PDF (1 h) jen pro doklady téže objednávky. Kontrakt: Doklady volají `fn_order_status_by_token(p_token)` (service role) a čtou z výsledku `order_id`. | Objednávky (`/order/`, 20 §10) — Codex |
| **Doklady** | `loadInvoiceAttachment(client, orderId)` v `_shared/invoicing/attachment.ts` → `{filename, content(base64), contentType}`; `sendResendEmail({ attachments })` v `_shared/email/send.ts`. Vrací null, když PDF ještě není vykreslené (e-mail jde bez přílohy). | Multishop / e-maily (příloha k #5) — Cursor |
| **Objednávky** | `fn_order_status_by_token(p_token)` vrací jsonb s klíčem `order_id` (+ detail pro zákazníka); `order_access_tokens` vlastní Codex | Doklady (viz výše) |
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

---

## 6. Druhé kolo (zadáno 23. 8. 2026 — po merge prvních větví)

Předpoklad: `feat/multishop-b` a `feat/order-ops` opravené podle společného běhu
(view `v_credit_balances`, šablony per trh v testech, `customer_benefit_tiers` PK,
`fn_generate_commissions` nad verzí ze spec 16, drobnosti ve fixturách), zelený
společný `supabase test db`, merge po jednom PR. Pak každý pokračuje ve svém proudu;
rozhraní z §4 platí, nové sdílené sloupce se hlásí tam.

### 6.1 Codex — proud „Správa objednávek a expedice", kolo 2

| # | Co | Zdroj | Poznámka |
|---|---|---|---|
| 1 | **Packeta adaptér reálně** (CZ i SK): `createPacket`, `packetsLabelsPdf`, `cancelPacket`, `packetStatus`, `packetTracking` za `PACKETA_READY`; mapa 25 stavů → `shipping_status_map`; worker `shipping-worker` je volá; konfigurace dopravce per trh (`shipping_methods.market_code`) | 19 §2, §5.2 | mock/Deno testy hned, živě až po účtu (API klíč CZ + SK) |
| 2 | **Vratky přes Packetu** (`createPacketClaimWithPassword`, heslo v e-mailu i detailu, `returned` → příjem na sklad) | 19 §7 | mock do účtu |
| 3 | **Widget výdejních míst** s ověřením `isValid` na serveru (místo `mockPickupPoints`), per trh | 19 §4 | mock do klíče; `shipping_mock_pickup_points` z kola 1 jako fallback |
| 4 | Hromadné akce dotáhnout: **tisk balicích lístků výběru** (jeden PDF/HTML), **CSV/XLSX výběru** objednávek | 20 §5 | hromadná změna stavu je z kola 1 |
| 5 | **Hromadné storno objednávek produktu při chybné ceně** (§ 583 OZ) + blok uložení ceny pod nákupní (`product_cost`) | 21 C.2 | dotazuje se na vratky přes existující `fn_refund_order` |
| 6 | `profiles.payouts_blocked` + důvod, `payout_requests.returned` (vrácená výplata bankou) — pokud nebylo v kole 1 | 21 C.5 | |
| 7 | **Inventura**: obrazovka počítané vs. zadané stavy, `product_cost_history` (verzování nákupní ceny) | 21 C.6 🟡 | |
| 8 | Kontrola kódů hlášení z `21` D v `issue_catalog` (cs/en/sk) — doplnit chybějící | 21 D | |
| 9 | Zebra: po koupi tiskárny ověřit Browser Print (zkušební štítek, auto-tisk při Zabaleno) | 19 §0.2 | hardware |
| **10** | **Moje objednávka bez přihlášení + funkce odstoupení** (R24): `/my-order/`, tokenový odkaz na e-mail, detail se stavem/sledováním/doklady, tlačítko **Odstoupit od smlouvy** (celá / položky), potvrzení e-mailem, `fn_request_return_by_token`, `fn_order_status_by_token`, rate limit, pgTAP 075 | **20 §10** | **priorita 1 — zákon od 19. 6. 2026**; šablony e-mailů per trh dodá Cursor, signed URL dokladu s tokenem Claude |

### 6.2 Cursor — proud „Multishop fáze B", kolo 2

| # | Co | Zdroj | Poznámka |
|---|---|---|---|
| 1 | **Peníze per měna dotáhnout**: `fn_request_payout(currency)`, `payout_profiles.iban` povinné pro EUR, výplatní výpisy (`payout_statements`) per měna, `/commissions` a `/payouts` per měna; pgTAP, že se nic nepřepočítává kurzem | 21 B.7 | |
| 2 | **Admin Trhy → produkty**: aktivace per trh s kontrolou úplnosti (překlad, cena, DPH), pomocník „navrhnout z CZ kurzem × koeficient, zaokrouhlit na ,90", hromadná aktivace | 21 B.4, 22 §10 | |
| 3 | **E-maily per trh a jazyk ve všech tocích**: jazyk = `profiles.preferred_locale`, odesílatel/patička per entita, fallback `cz/cs`; **příloha faktury** k e-mailu #5 přes `invoices.pdf_path` + signed URL (rozhraní §4 — poskytne Claude funkcí v EF `invoice-render`, akce `url`) | 21 B.3, 19 §6.2 | Claude dodá helper, Cursor zapojí do `send-email` |
| 4 | **Právní dokumenty per trh** (`legal_documents(kind, market_code, locale, version)`) + re-souhlas v trhu uživatele; spotřebitelské lhůty per trh (`withdrawal_days`) | 21 B.8 | texty SK dodá zadavatel |
| 5 | **Promoakce a kupóny per trh** ověřit end-to-end (`fn_quote_cart` jen akce trhu, unikátnost kódu per trh) + UI průvodce s výběrem trhu | 21 B.5 | |
| 6 | **SK checkout end-to-end v Stripe TEST (EUR)**: objednávka SK → webhook → faktura `FSK…` (23 %, slovensky) → dobropis; pgTAP + ruční průchod | 21 B.7, 19 §6 | společně s Claudem |
| 7 | **OSS hlídač**: obrat do jiných států EU za kalendářní rok vs. práh 10 000 € → hlášení `low`/`medium` pro účetní (per trh, v měně trhu, informativně v CZK přes `fx_rates`) | 21 B.8, C.6 | `fx_rates` (ČNB denní kurz, cron) jen informativně |
| 8 | **VIES kontrola DIČ** (EF `vies-check`) pro B2B zákazníky v SK/EU, reverse charge poznámka na dokladu (Claude doplní do snapshotu, když dostane `buyer.vat_validated`) | 21 C.7 | |
| 9 | D38 izolace: doplnit scénáře (akce, doprava, e-maily, `paused` trh) do pgTAP 060–069 | 21 B.9 | |
| 10 | Šablony `order_access_link` a `withdrawal_received` per trh a jazyk + odkaz **Moje objednávka** v hlavičce/patičce storefrontu všech trhů (texty cs/sk/en) | 20 §10, R24 | pro Codexův bod 10 |

**Stav 23. 8. 2026 (kolo 2 Multishop):** Cursor dokončil body 1–5, 7 (OSS), 8 (VIES záznam + EF), 9 a šablony
R24 na `feat/multishop-kolo2`; po vyčerpání limitu převzal Claude: rebase, opravy z integračního běhu
(`fn_email_template` ambiguity, SK právní dokumenty, fixtury), **VIES v checkoutu** („Nakupuji na firmu“
+ Ověřit ve VIES, firemní údaje na doklad) a **kurzy ČNB** (EF `fx-rates`, cron po–pá 13:10 UTC) — merged
jako PR #41 a nasazeno. Zbývá: SK checkout end-to-end ve Stripe TEST (bod 6, s Claudem po Codexově merge).

**Stav 23. 8. 2026 (kolo 2 Objednávky):** Codexova priorita 1 (R24, 20 §10) je v produkci (PR #42: `/order/`,
EF `order-access`, tokeny, odstoupení bez pohybu peněz, tokenové PDF). Integrace odhalila a opravila
chybu řazení položek (`order_items.created_at`). **SK checkout E2E** (pgTAP 050 §11) odhalil, že validace
nacenění volala nacenění bez trhu → SK checkout padal; opraveno (PR #44, `20260824100000`). Ostrou platbu
ve Stripe TEST (EUR) provede zadavatel podle postupu v chatu/README; zbývá jen ověřit webhook → faktura `FSK`.

**Stav 23. 8. 2026 (kolo 2 Objednávky, blok 2):** Codexův blok Expedice/Packeta/inventura (body 1–7 §6.1)
je v produkci (PR #45: Packeta REST/XML adaptér za `PACKETA_READY`, mock job + tisk štítku po zabalení,
privátní štítky, historie sledování, vratné zásilky přes Packetu, CSV/XLSX výběru, inventura + historie
nákupní ceny). Integrace opravila kolizi timestampu migrace a tři fixtury. Web nasazen ručně (Actions kvóta).

### 6.3 Claude — proud „Doklady" + integrace, kolo 2

- Exkluzivní okna (společný `supabase test db`), merge po jednom PR, nasazení (`db push`, deploy funkcí) po každém merge.
- EF `invoice-render` akce `url` přijme i `order_access_token` (20 §10 b.3).
- Rozhraní pro e-mail #5: helper `fn_invoice_signed_url`/EF akce `url` pro `send-email` (s Cursorem, 6.2 b.3); `buyer.vat_validated` + reverse charge věta v dokladu (6.2 b.8).
- Účetní: odpovědi A10/A11 → `.isdocx` přepínač, kód formy úhrady; předání prvních vzorových balíků.
- Go-live checklist `10` §5: truncate testovacích dat (D39 `is_test` + doklady řady TEST zůstávají mimo), zálohy + zkušební obnova, live smoke 10 Kč po IČO/Stripe live.
