# 24 — Stav systému a navázání po pauze (uzavřeno 23. 8. 2026)

Vývoj je **přerušen na týden** (24.–31. 8. 2026; zakonzervováno 23. 8. večer,
větev `codex/order-request-copy` je zmergovaná a pushnutá — Codex ji chtěl
zachovat, nemazat). Tento dokument je jediné
místo, které stačí přečíst pro navázání: co je v produkci, co chybí, na co
se během pauzy nesmí zapomenout a v jakém pořadí pokračovat. Podrobnosti
proudů jsou v `23`, rozhodnutí v `00`, provozní příkazy v `pentariva-office/README.md`.

---

## 1. Kde jsme

- **Produkce = `main`** (`pentariva-office`, commit `eb8c6ff`, 23. 8. večer —
  poslední tři merge: Codexovy opravy prázdného obchodu pro anonymní
  zákazníky a reklamačního formuláře, a zákaz spotřebitelského odstoupení
  pro B2B objednávky na veřejné stránce). Všech 120 migrací je nasazených, žádné otevřené PR, žádné
  neintegrované větve — vzdálené i lokální větve kolegů jsou smazané, zůstává
  jen `main`. Web nasazen ručně přes Firebase (`npm run deploy`).
- **Testy:** pgTAP 1086 asercí v 58 souborech (zlaté testy provizí beze
  změny), vitest 392, tsc a eslint čisté. Laťka pro každý další merge.
- **Tři proudy z `23` jsou hotové:** Doklady (Claude), Multishop B + kolo 2
  (Cursor, dokončil Claude), Správa objednávek + kolo 2 vč. bankovního převodu
  (Codex). Z plánu zůstává jen hardware (Zebra) a věci čekající na vstupy
  zadavatele (§3).
- **Přepínače, které jsou v produkci záměrně VYPNUTÉ** (zapíná zadavatel,
  viz `08` §9 a `10` §5 M3): `payouts_enabled`, `bank_transfer_enabled`,
  Stripe live (`PAYMENTS_MODE=test`), `invoicing_mode` Fakturoid,
  `fulfillment_provider=internal` (Authentica zamčená), `PACKETA_READY=false`
  (živé podání u Zásilkovny), trh `sk` ve stavu **pilot** (nakoupí jen admin).
- **Nápověda `/help`** (`docs/manual` = `public/manual`, cs + en) je k 23. 8.
  v souladu s UI: Moje objednávka a odstoupení, bankovní převody, vrácené
  výplaty, storno cenové chyby, inventura a nákupní cena, hlášení, expedice.

## 2. Co se dodělalo v posledním sprintu (20.–23. 8.)

| Oblast | Stav | Kde |
|---|---|---|
| Doklady: entita, řady per trh, snapshot, faktura/dobropis automaticky, PDF + ISDOC 6.0.2 (XSD validace), exporty pro účetní, doklad na firmu dodatečně, reverse charge B2B (VIES) | hotovo, v produkci | `19` §6, `20` §6, `21` B.8, pgTAP 050 |
| Multishop: SK pilot, admin Trhy, ceny/překlady per trh, kredit a výplaty per měna + IBAN, e-maily a právo per trh, OSS hlídač, VIES v pokladně, kurzy ČNB (cron) | hotovo, v produkci | `21` B, pgTAP 060–061 |
| Objednávky: provozní stavy, hromadné akce, balicí stanice, Packeta adaptér (za `PACKETA_READY`), vratky přes Packetu (mock), inventura + historie nákupní ceny, digitální doručení, R21 deaktivace partnera, výjimky 21 C | hotovo, v produkci | `19`, `20`, `21` C, pgTAP 070–078 |
| **Moje objednávka + funkce odstoupení** (R24, směrnice 2023/2673) vč. doplňků po nezávislém auditu (20 §10.5) | hotovo, v produkci | `20` §10, pgTAP 075 |
| **Vrácená výplata** (`payout_requests.returned`, 21 C.5) | hotovo, v produkci | pgTAP 079 |
| **Bankovní převod s VS** (R25) vč. rozhodnutí §8.5 (shoda účtu plátce, nová objednávka po stornu, retence 10 let) | hotovo, v produkci, **vypnuto** | `08` §8, pgTAP 080 |
| Kritická chyba nalezená ručním E2E: validace nacenění bez trhu → SK checkout padal | opraveno (PR #44) | `23` stav |
| Go-live skript `pre-golive-truncate.sql` pokrývá nové tabulky a resetuje řady | hotovo, lokálně ověřeno | `pentariva-office/supabase/scripts` |

## 3. Co chybí — rozdělené podle toho, kdo to odblokuje

### 3.1 Vstupy zadavatele (bez nich go-live nejde; `10` §5 M3)

1. **IČO** (CZ entita) a rozhodnutí o SK entitě / IČ DPH → vyplnit v
   *Nastavení → Firma a doklady*; guard teprve potom pustí ostré doklady,
   výplaty a převod.
2. **Bankovní účty** entity: CZK účet, EUR IBAN + BIC → tamtéž. Až poté
   zapnout *Platba bankovním převodem* (Integrace).
3. **Stripe live** klíče + nový live webhook secret (`08` §9); do té doby
   test mód. **Ruční SK nákup ve Stripe TEST (EUR)** stále neproběhl —
   postup v README, výsledek má být faktura `FSK…` a dobropis.
4. **Účet Zásilkovny CZ + SK** (API klíč, heslo vratek) → `PACKETA_READY`
   a přístupové údaje; pak reálné podání a štítky.
5. **Právní texty** CZ/SK: obchodní podmínky, GDPR, podmínky partnera,
   reklamační řád, **texty k odstoupení** per trh (`return_notice_md` —
   výchozí znění je měkké, právník ho má vidět; `20` §10.5 b.3).
6. **Účetní**: odpovědi A10 (`.isdocx` ano/ne) a A11 (kód formy úhrady,
   výchozí 42); schválení vzorového balíku dokladů; formát CSV výpisu banky
   (které sloupce, oddělovač) pro import převodů.
7. **Minimální výplata** 500 Kč potvrdit (`10` §5 M3 b.5); kritéria
   „neaktivního partnera“ pro R21 (zatím ruční akce).
8. **GitHub billing** — viz §4, blokuje zálohy a CI.

### 3.2 Technické zbytky (malé, známé)

- PAY by square QR pro SK (zatím IBAN/BIC textem) — `08` §8.2.
- Import CSV výpisu: mapování sloupců per banka až podle reálného výpisu
  (`app_settings.bank_csv_mapping` ve spec, dnes pevné sloupce).
- České popisky konstant *Underpayment tolerance* / *Overpayment to credit*
  a UI pro `market_settings.return_notice_md`, `return_shipping_fee_haleru`,
  `packeta_returns_enabled` (dnes jen DB).
- Zebra Browser Print: ověřit na koupené tiskárně (`19` §0.2).
- E-mail #5 s přílohou faktury: helper existuje (`invoice-render` akce `url`),
  ověřit v produkci, že příloha skutečně odchází.
- Po 1. 9. vrátit throttle v `.github/workflows` (komentáře `QUOTA THROTTLE`,
  viz `CLAUDE.md`).

### 3.3 Odložené záměrně (fáze C, `21`)

Sklady per trh, šarže, FX reporty, lokální entity a domény per trh,
zálohové doklady, Fakturoid (interní doklady stačí), Authentica WMS, API
banky místo CSV.

## 4. Na co nezapomenout BĚHEM pauzy (rizika)

1. **GitHub Actions je zablokované** — hláška zní *„recent account payments
   have failed or your spending limit needs to be increased“*, tj. nejde jen
   o kvótu, ale i o neúspěšnou platbu. Důsledky už teď:
   - **noční záloha DB (`backup.yml`) bude padat** — poslední úspěšná
     23. 8. 03:14;
   - cron `payments-reconcile` (kontrola zaseklých plateb u Stripe) neběží —
     v test módu bez reálného dopadu;
   - CI na push do `main` neběží (merge se ověřují lokálně, viz §6).
   **Expirace objednávek, výplatní settlement, kurzy ČNB a render dokladů
   jedou v databázi (pg_cron + pg_net) a pokračují.**
   → **Akce zadavatele: opravit platbu/limit na GitHubu (Settings → Billing).**
   Do té doby existuje **ruční záloha z 23. 8. 16:40** v
   `~/pentariva-backups/prod-{schema,data}-2026-08-23.sql` na vývojovém Macu
   (lokálně, nešifrovaně, chmod 600 — není offsite). Data v produkci jsou
   zatím testovací.
2. Ověřit, zda je Supabase projekt na **Pro** (vlastní denní zálohy Supabase
   by riziko z bodu 1 kryly; `09` §6.1a říká „ostré platby ⇒ Pro“).
3. Nic nezapínat v Integracích (převod, výplaty) před IČO a účty — guardy to
   sice hlídají, ale přepínač převodu kontroluje jen IČO — bez vyplněných účtů
   entity by zákazník v pokladně dostal chybu místo platebních údajů.
4. Pokud by se v pauze sáhlo na DB z Dashboardu — **ne** (CLAUDE.md 4);
   změna = migrace + `supabase db push`.

## 5. Další kroky po návratu (v tomto pořadí)

1. **Provoz:** GitHub billing → `gh run list --workflow=backup.yml` zelené;
   obnovit CI; po 1. 9. vrátit throttle. Smazat lokální zálohu, až offsite
   záloha znovu běží.
2. **SK Stripe TEST E2E** (zadavatel nakoupí jako admin v `/sk/shop/`) →
   ověřit webhook → `FSK` faktura → dobropis. Jediný neověřený kus multishopu.
3. **Vstupy ze §3.1** postupně vyplnit v adminu; po IČO: *Dovystavit doklady*
   (Reporty → Doklady), zapnout převod, smoke test live platby 10 Kč +
   plný refund (`10` §5 M3 b.4).
4. **Go-live checklist `10` §5 M3** projít bod po bodu; před spuštěním
   `supabase/scripts/pre-golive-truncate.sql` (testovací data pryč, účty
   a deník zůstávají) a zkušební obnova zálohy (`09` §4).
5. **Romanův balík „PENTARIVA EKOSYSTÉM" MASTER 1.0** — revize a otázky jsou
   v `25` (zadavatel: čísla v excelech proberte spolu, revizi ber jako
   podklad k debatě, ne hotový verdikt). Nic z něj se zatím neimplementuje.
6. **Nezávislé audity přes Gemini (textově, web)**, které se ještě vyplatí:
   (a) ISDOC výstup vs. účetní software účetní (Pohoda/Money/…), (b) OSS a
   DPH SK entity vs. CZ entita, (c) bezpečnostní revize veřejné stránky
   `/order/` (tokeny, enumerace) — `06` §9.
6. Technické zbytky §3.2 podle priority zadavatele.

## 6. Jak navázat prakticky (pro toho, kdo otevře repo)

- Přečíst: tento dokument → `pentariva-office/CLAUDE.md` (pravidla, stav)
  → `23` (proudy, rozhraní §4) → `00` (rozhodnutí R1–R25).
- Lokální stack: `supabase start`, `supabase db reset`, `supabase test db`,
  `npm test`. Produkce: `supabase db push --include-all`,
  `supabase functions deploy <jména>`, web `npm run deploy` (ručně, dokud
  neběží CI).
- **Integrační okno** (platí pro každou větev kolegy): nový worktree z
  `origin/main`, cherry-pick jen commitnutých změn, `db reset` + celý
  pgTAP + tsc/eslint/vitest, regen typů (a znovu tsc), `--no-ff` merge,
  push, db push, deploy jen změněných funkcí, web. Kolegové pgTAP lokálně
  nespouští — počítat s opravami fixtur, migrace zatím byly správně.
- Gemini se používá **jen textově ve webovém rozhraní** (bez API klíče);
  zadání připraví Claude, odpověď se vyhodnotí proti spec a testům.
- Nové věci do nápovědy ve stejné změně (`docs/manual` + `public/manual`,
  cs i en) — CLAUDE.md pravidlo 10.
