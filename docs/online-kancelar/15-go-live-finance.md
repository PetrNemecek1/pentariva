# 15 — Go-live a finanční agenda: fakturace, výplaty, účetnictví, provozní jistota

> **Závazné zadání (21. 8. 2026).** Rozpracovává M3 checklist z
> `10-implementacni-plan.md` §5 do implementovatelné podoby + doplňuje finanční
> agendu, bez které nelze bezpečně zapnout ostré peníze. Samonosné pro AI
> implementaci; guardraily `10` §1 platí. **Nic z tohoto dokumentu nezapíná
> live platby ani výplaty** — připravuje se vše tak, aby go-live byl jen
> přepnutí konfigurace podle §8.
>
> **Pořadí:** kapitoly 1–5 lze stavět souběžně s dokumentem 14 (nekolidují
> s 13); kapitola 6 (Fakturoid) až po 13 (potřebuje netto báze a vratky v2).

## 1. Noční sebekontrola ledgeru (provozní jistota peněz)

- `fn_ledger_selfcheck()` (SECURITY DEFINER, volá denní pg_cron po settlementu):
  1. P-INV1 pro objednávky posledních 35 dní: Σ kalkulačních entries = báze
     **verze té objednávky** (16 §5: `orders.commission_model` 1 = goods_paid
     vč. DPH, 2 = netto v2; Trade = goods_paid) — per objednávka. Historie se
     na aktuální sazby nesrovnává;
  2. P-INV2: plně stornované objednávky mají Σ (originály+reversaly) = 0;
  3. každý `accrual` má existující `available` entry; žádný duplicitní accrual;
  4. kreditní zůstatky: záporný zůstatek jen s existujícím clawbackem;
  5. `payments.status='paid'` bez `orders.paid_at` (a naopak) = anomálie;
  6. `stock_qty < 0` při `allow_backorder=false` (po implementaci 14).
- Výsledek do nové tabulky `selfcheck_runs(id, ran_at, ok boolean, findings
  jsonb)`; při `ok=false` e-mail adminovi (šablona `selfcheck_failed`) +
  `console.error` pro Sentry. Admin widget na `/admin` (poslední běh, stav).
- pgTAP: úmyslně rozbitá fixture → selfcheck ji najde (min. 4 aserce).

## 2. Heartbeat cronů a monitoring

- Každý pg_cron job (settle, expire, reconcile, stats, selfcheck) po doběhu
  zapíše řádek do `cron_heartbeats(job text PK, last_ok_at, last_error)`.
- EF `health` rozšířit: vrátí 500, pokud kterýkoli job neběžel > 26 h
  (reconcile > 2 h) — existující UptimeRobot to pak chytí.
- DNS: přidat **DMARC** záznam (`_dmarc.pentariva.com`,
  `v=DMARC1; p=quarantine; rua=mailto:admin@pentariva.com`) — doplnit do
  `11-dns-forpsi.md` a README (ruční krok u Forpsi).

## 3. Rate limiting veřejných vstupů

- Jednoduché DB throttly (bez nové infrastruktury), konfigy v `app_settings`:
  - registrace: max `signup_per_ip_hour` (default 5) přes `visitor_hash`
    v `referral_events` + nová `signup_attempts(hash, at)`;
  - `fn_checkout`: max `checkout_per_user_hour` (default 20);
  - `fn_resolve_referral` a `unsubscribe` EF: max 60/h per hash.
- Při překročení česká chyba „Zkuste to prosím později." CAPTCHA zůstává
  Fáze 3 (D30).

## 4. Výplatní agenda (příprava, `PAYOUTS_ENABLED` zůstává false)

- **Fakturační profil partnera** — `payout_profiles(profile_id PK, legal_name,
  address jsonb, ico text NULL, dic text NULL, bank_account, is_business
  boolean)`; editace v `/account`, validace č. účtu/IBAN. `fn_request_payout`
  nově bere údaje odtud (bank_account parametr zachovat jako override).
- **Vyúčtování provize (statement):** při `approved` se vygeneruje záznam
  `payout_statements(id, payout_request_id FK UNIQUE, number text — řada
  `PVYYYYNNNN`, snapshot jsonb: příjemce, období, seznam zdrojových accrual
  transakcí, částka)`; partner i admin si stáhnou tisknutelné HTML
  (print view, ne PDF generátor). CSV export příkazů k úhradě
  v `/admin/payouts` už existuje — rozšířit o číslo statementu a fakturační
  údaje.
- **Roční přehled** per partner: `/reports` sekce „Vyplacené odměny YYYY"
  (Σ payout `paid` + detail) — podklad pro daňové přiznání partnera.
- **Otevřená právní otázka pro zadavatele/účetní (implementaci neblokuje):**
  režim zdanění odměn (samofakturace s IČO vs. příležitostný příjem vs.
  srážková daň) — systém na to je připraven přes `is_business` a statement;
  konečný režim doplní právník před `PAYOUTS_ENABLED=true`.

## 5. Účetní exporty a závazky

- `/admin/reports` (nová admin obrazovka nebo sekce):
  1. **Podklad DPH za měsíc:** zaplacené objednávky s rozpadem základ/DPH per
     sazba (z `order_items.vat_rate_bp`), vratky záporně; CSV.
  2. **Závazky z kreditů a provizí** ke dni: Σ `available` kredit per druh,
     Σ `pending` entries (budoucí závazek), měsíční pohyb — účetní rezerva.
  3. **Rekonciliace brány:** payments `paid` za období vs. Σ objednávek;
     rozdíly vypsané per objednávka.
- Vše jen čtení z existujících tabulek/views; žádné nové agregační tabulky.

## 6. Fakturoid (volitelný adaptér; výchozí jsou interní doklady dle 19 §6)

> **Upřesnění 22. 8. 2026 (R18):** Fakturoid není podmínkou go-live — tarif
> Zdarma je omezen na 5 odběratelů, placené tarify stojí 151–476 Kč měsíčně.
> Výchozí režim je `INVOICING_MODE=internal` (doklady vystavuje office sám,
> viz `19-interni-expedice-low-cost.md` §6). Tento odstavec platí pro
> případné pozdější přepnutí na Fakturoid.

- Adaptér `supabase/functions/_shared/invoicing/fakturoid.ts` (API v3, OAuth
  client credentials; secrets `FAKTUROID_SLUG/CLIENT_ID/CLIENT_SECRET`).
  Konfig `INVOICING_MODE=off|internal|fakturoid` (default `internal`;
  `off` = e-mailová rekapitulace bez dokladu, jen pro vývoj).
- Při `orders → paid` (po commitu, stejné místo jako e-mail): vystavit fakturu
  (řada dle Fakturoid, položky vč. DPH sazeb, kredit jako sleva), uložit
  `orders.invoice_number`, `invoice_url`; PDF odkaz do e-mailu #5 a detailu
  objednávky. Vratka → dobropis (plný i částečný). Selhání fakturace NIKDY
  neblokuje platbu — zapíše se do `invoice_failures` a admin widget nabídne
  retry.
- Deno test s mockem API: idempotence (jedna objednávka = max jedna faktura).

## 7. Čištění testovacích dat (M3 krok 3)

- Skript `supabase/scripts/pre-golive-truncate.sql` (spouští se JEDNOU, ručně,
  v transakci): TRUNCATE `orders`, `order_items`, `payments`, `order_refunds`,
  `commission_entries`, `credit_transactions`, `payout_requests`,
  `payout_statements`, `return_requests`, `stock_movements` + reset
  `order_number` sekvence; ponechává účty, katalog, akademii, `audit_log`
  (+ zapíše audit akci `golive.truncate`). Součástí PR, NIKDY se nespouští
  automaticky.

## 8. Go-live runbook (aktualizace `09` §7 / M3 — pořadí přepnutí)

1. Právní texty publikovány a odsouhlaseny (mechanika 14 §5), IČO doplněno
   v patičce a `legal_documents`.
2. Rozhodnutí brány (Stripe live vs Comgate, `08` Příloha A) → live klíče,
   nový webhook + `whsec`, `PAYMENTS_MODE=live` guard ověřen.
3. `INVOICING_MODE=internal`, testovací interní faktura a dobropis
   odsouhlasené účetní (19 §6); Fakturoid jen pokud se pro něj zadavatel
   rozhodne.
4. Restore drill: obnova poslední zálohy do lokálního Postgresu dle `09` §4
   + zápis výsledku do runbooku (povinné před přepnutím).
5. `pre-golive-truncate.sql` → smoke: live platba 10 Kč → webhook → provize
   → faktura → plný refund → dobropis → clawback.
6. Supabase Pro upgrade; Sentry alerty zapnuté; DMARC ověřen.
7. `PAYOUTS_ENABLED=true` až po prvním testovacím payoutu se statementem
   a potvrzení daňového režimu (§4).

## 9. Akceptace

1. Selfcheck najde uměle rozbitou objednávku a pošle e-mail (pgTAP + EF test).
2. `health` vrátí 500 při zastaralém heartbeatu (test s podvrženým časem).
3. 6. registrace ze stejného hashe v hodině je odmítnuta.
4. Payout `approved` vytvoří statement s číslem řady; CSV obsahuje fakturační
   údaje; roční přehled sedí se Σ `paid`.
5. DPH export: kontrolní součet základů+DPH = Σ `paid_money` objednávek období.
6. Fakturoid mock: druhé volání nevystaví druhou fakturu; `off` režim nevolá
   nic.
7. Truncate skript projde na kopii DB a zachová účty/katalog/audit.
