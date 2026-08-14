# 10 — Implementační plán MVP (finální)

> Závazný, samostatně spustitelný plán pro AI implementátora. Podřizuje se precedenci:
> `03-provizni-pravidla-zdroj.md` → `00-zadani-a-rozhodnuti.md` (R1–R15) →
> `02-technicka-rozhodnuti.md` (D1–D35) → `04-datovy-model.md` (kanonické schéma) →
> `05-provizni-engine.md` → `06-bezpecnost-rls.md`, `07-aplikace.md`, `08-platby.md`,
> `09-provoz-email-naklady.md` → tento plán. **Jediný zdroj DDL je `04-datovy-model.md`
> (D1)** — tento dokument žádnou tabulku nedefinuje; všechny názvy tabulek, sloupců,
> ENUMů, stavů a funkcí přebírá odsud beze změny. Implementátor nezná konverzaci
> zadavatele — vše potřebné je v adresáři `docs/online-kancelar`.

## 0. Závazné konvence (odkazy, nikoli nové definice)

- **Peníze:** `BIGINT` v haléřích, sloupce se sufixem **`_haleru`** (1 000 Kč = 100 000 h);
  sazby v basis pointech, sufix **`_bp`** (2000 = 20 %). Jediné místo zaokrouhlení =
  `fn_pct_haleru` (HALF-UP, D5). Nikdy float, nikdy Kč jako číslo v datech.
- **ENUMy a stavy** výhradně z `04-datovy-model.md` §2.1: `user_role` **plný dle D10**
  (`customer, ambassador, mentor, leader, trade_partner, b2b_manager, admin`),
  `business_flow` (`community_own, community_customer, trade, organic`), `order_status`
  (`draft, awaiting_payment, paid, shipped, completed, cancelled, refunded`, D8),
  `commission_entry_type`, `commission_status` (`pending, available, reversed`),
  `credit_kind`, `credit_tx_type`, `payout_status`
  (`requested, approved, paid, rejected, cancelled`, D17), `trade_level`,
  `application_status`, `b2b_pipeline`. Žádné jiné stavy se nezavádějí.
- **Peněžní logika žije výhradně v Postgresu** (SECURITY DEFINER funkce z `04` §2.17);
  klient peníze jen čte přes kanonická views (`v_credit_overview`, `v_credit_balances`,
  `v_ambassador_dashboard`, `v_monthly_personal_turnover`). (D22)
- **Aplikace:** repo `pentariva-office`, Next.js static export na Firebase Hosting
  (target `office`, doména office.pentariva.com), struktura a CLAUDE.md přesně dle
  `07-aplikace.md`. (D28)
- **Jazyk:** DB a kód anglicky, UI/e-maily/chybové hlášky česky. Časy v DB v UTC.
- Stripe **v test módu** do vzniku IČO (R8, D23); e-maily Resend (R5, D24);
  prostředí jen `local` + `prod` (D25).

## 1. Guardrails pro AI vývoj (závazné)

**NIKDY bez explicitního schválení zadavatele napsaného v PR:**

1. Změna jakéhokoli procenta či provozní konstanty peněz: `commission_rates`,
   `trade_level_params`, `app_settings` (`commission_hold_days`,
   `payout_min_haleru`, `shipping_flat_haleru`, `shipping_free_from_haleru`),
   hodnoty zlatých testů.
2. Jakýkoli přímý zápis do `commission_entries` nebo `credit_transactions` mimo
   kanonické funkce `fn_generate_commissions`, `fn_settle_commissions`,
   `fn_refund_order`, `fn_allocate_leadership` a serverové čerpání kreditu —
   včetně „opravných skriptů". Oprava ledgeru = výhradně postup runbooku
   `09-provoz-email-naklady.md` §7.2 (kompenzační záznamy).
3. Změna nebo vypnutí kterékoli RLS policy; nová SECURITY DEFINER funkce obcházející
   RLS mimo výčet v `06-bezpecnost-rls.md`.
4. Cokoli kolem výplat (`payout_requests`): minima, schvalovací RPC, automatizace
   odesílání peněz (v MVP vyplácí admin ručně, D17).
5. Změna auth flow (vypnutí ověření e-mailu, magic link, D21); `service_role` /
   `sb_secret_` klíč mimo Edge Functions a CI secrets.
6. Destruktivní migrace (DROP/TRUNCATE tabulek s daty); zásah do prod DB mimo
   workflow `deploy-db` (`09` §3); editace už aplikovaných migrací.
7. Změny DNS, domén, produkčních secrets; přepnutí `PAYMENTS_MODE=live`,
   `PAYOUTS_ENABLED=true` nebo `BANK_TRANSFER_ENABLED=true` (`08` §9 — výhradně
   go-live checklist M3).

**Povinný postup migrace:** každá změna schématu = `supabase migration new <nazev>`
(forward-only) → lokálně `supabase db reset` + testy → PR → merge → ručně spuštěný
workflow `deploy-db` (`09` §3). Nová tabulka bez RLS = CI fail (pgTAP test
`tables_have_rls` iteruje `pg_tables`). Migrace měnící peněžní chování vyžaduje v PR
blok `SCHVÁLENÍ ZADAVATELE: ano/ne` — bez „ano" se nemerguje. Po každé migraci
`npm run db:types` a commit `database.types.ts`.

**Commity a PR:** Conventional Commits; jeden ticket = jeden PR, název PR začíná ID
ticketu; popis PR povinně obsahuje sekci „Dopad na DB/RLS/peníze" (i když „žádný").
Po každém epiku AI vypíše souhrn odchylek od tohoto plánu (i nulový); odchylky
schvaluje člověk.

**Globální Definition of Done (každý ticket):** TypeScript strict bez chyb, ESLint
čisté, CI zelená (lint, typecheck, vitest, `supabase test db`, build), každá nová
tabulka má RLS + pgTAP test, migrace projdou na čisté DB, UI texty česky, merge jen
přes zelenou CI.

## 2. Epiky MVP v pořadí implementace

Tvrdé závislosti: `E0 → E1 → E2 → E3 → E4 → E5`; `E6, E8, E9 vyžadují E2–E3`;
`E7 vyžaduje E2`; `E10, E11 jako poslední`. E6–E9 lze po E4 stavět paralelně.

### Epik 0 — Repo + infra bootstrap (8 h)

**Cíl:** prázdná, ale nasaditelná aplikace na office.pentariva.com s CI/CD, zálohami
a monitoringem od prvního dne.

- **E0-T1** (1 h): Repo `pentariva-office` dle stromu `07-aplikace.md` §1: Next.js 16
  + Tailwind 4 + TS strict, `output:'export'`, `trailingSlash:true`; brand tokeny
  `globals.css` + fonty zkopírované 1:1 z repa `pentariva`; **CLAUDE.md se závazným
  obsahem `07` §8**.
- **E0-T2** (1 h): Supabase projekt `pentariva-office` (eu-central-1), `supabase init`
  + `link`; struktura `supabase/migrations|functions|tests`, `seed.sql`;
  `.env.local.example`. Nové API klíče `sb_publishable_/sb_secret_` (`09` §2).
- **E0-T3** (1 h): Firebase multi-site: `hosting:sites:create pentariva-office`,
  `target:apply hosting office pentariva-office`, `firebase.json` s cache headers;
  první deploy. DNS `office.pentariva.com` na Forpsi, ověřit SSL.
- **E0-T4** (2 h): CI/CD přesně dle `09` §3: `ci.yml` (jobs `quality`,
  `sql-golden-tests` = `supabase db start` + `supabase test db`, `deploy-web`)
  a `deploy-db.yml` (`workflow_dispatch` s potvrzením `PUSH`). Secrets/vars dle
  tabulky `09` §2; zapnout secret scanning + push protection.
- **E0-T5** (1,5 h): Zálohy od prvního dne (D26): repo `pentariva-backups`,
  `backup.yml` (noční `pg_dump` přes session pooler, šifrování `age`, rotace 30 dní,
  orphan-branch push) přesně dle `09` §4; privátní age klíč jen offline.
- **E0-T6** (1 h): Resend: ověření domény pentariva.com (DNS dle `09` §1.2; do převodu
  domény sandbox `onboarding@resend.dev`), Edge Function `send-email` (skeleton
  s `Idempotency-Key`), testovací e-mail z `office@pentariva.com`.
- **E0-T7** (0,5 h): Monitoring (D27): Sentry projekt (frontend + `npm:@sentry/deno`
  ve funkcích), UptimeRobot 3 monitory vč. EF `health` (`09` §5).

**Akceptace:** office.pentariva.com přes HTTPS; push do main nasadí web; CI běží na
PR; záloha proběhla a je čitelná offline klíčem; testovací e-mail dorazí (SPF/DKIM
pass); Sentry přijímá chyby.

### Epik 1 — Kanonické schéma + peněžní funkce + zlaté testy (18 h)

**Cíl:** kompletní DDL z `04-datovy-model.md` v migracích, peněžní jádro v Postgresu
a **zlaté pgTAP testy zelené v CI** — dřív, než vznikne jediná obrazovka.

- **E1-T1** (2 h): Migrace `0001_extensions_enums`: pgcrypto, citext, všechny ENUMy
  z `04` §2.1 (**`user_role` plný dle D10**), `fn_pct_haleru`.
- **E1-T2** (1 h): Migrace `0002_config`: `app_settings` (hold 15 dní, min. výplata
  50 000 h, doprava 9 900 h / zdarma od 150 000 h), `commission_rates`
  (20/15/6/4/2/3 %), `trade_level_params` (3000/1000, 3500/800, 4000/500) — seedy
  přesně dle `04` §2.2.
- **E1-T3** (2 h): Migrace `0003_profiles`: `profiles` (sponsor_id + path + depth,
  `owner_ambassador_id`, `monthly_goal_haleru` D32, CHECK `chk_tree_membership`),
  trigger `trg_profiles_path`, `fn_admin_change_sponsor` (14denní okno, audit),
  `audit_log`.
- **E1-T4** (1,5 h): Migrace `0004_referral_products`: `referral_codes` (citext,
  `^[a-z0-9]{6,12}$`, product_id), `referral_events` (click/registration,
  visitor_hash), `products`, `product_prices`, `v_current_prices`.
- **E1-T5** (2 h): Migrace `0005_orders`: `trade_partners`, `orders` (kanonický
  vzorec D7 `chk_order_formula` **včetně dopravy R14**, `chk_credit_only_goods`,
  `chk_flow_shape`, generovaný `goods_paid_haleru`), `order_items`
  (**`is_gift` D18a**, per-položkové slevy), `order_status_transitions` + trigger,
  `fn_validate_order_pricing` (sleva per položka, doprava dle `app_settings`).
- **E1-T6** (2 h): Migrace `0006_money`: `payments` (webhook dedup unikát),
  `order_refunds`, `commission_entries` (všechny CHECKy + `uq_commission_once`),
  `credit_transactions` (append-only RULEs, `uq_credit_accrual_entry`),
  `payout_requests`.
- **E1-T7** (2 h): Migrace `0007_money_functions`: `fn_upline`,
  `fn_generate_commissions`, `fn_settle_commissions`, `fn_allocate_leadership`,
  `fn_refund_order` — doslovně dle `04` §2.17/§3.1; views `v_credit_balances`,
  `v_credit_overview` (R12), `v_monthly_personal_turnover`, `v_ambassador_dashboard`.
- **E1-T8** (1 h): Migrace `0008_crm_b2b_academy_gifts`: `crm_notes`,
  `interest_tags` + `customer_interest_tags` (D33), `b2b_companies` +
  `b2b_activities` (D14), `academy_*` tabulky + `ambassador_applications` (D34,
  D11), **`milestone_gifts` (D18b)**.
- **E1-T9** (3,5 h): **Zlaté pgTAP testy** = kapitola 3 níže: worked examples
  (a)–(f) z `05` §3 + povinná podmnožina property/hraničních testů z `05` §10.
- **E1-T10** (1 h): `seed.sql`: genealogie A→B→C→D z worked example, osobní zákazník,
  Trade partneři entry/active/strategic, organický zákazník, 5 produktů (katalog
  100 000 h), admin účet.

**Akceptace:** `supabase db reset` projde na čisté DB; `supabase test db` zelené
včetně všech zlatých testů; RLS zapnuté na všech tabulkách (test `tables_have_rls`).

### Epik 2 — Auth, registrace a RLS (12 h)

**Cíl:** všechny registrační cesty dle `06` a `07` §3; role vznikají jedině
kanonickými toky.

- **E2-T1** (1,5 h): Supabase Auth konfigurace (`06` §1.1): e-mail+heslo s povinným
  ověřením **i magic link** (D21), Resend SMTP, české šablony
  `auth_confirm|auth_magic_link|auth_recovery` (`09` §1.5 #1–3).
- **E2-T2** (2,5 h): Edge Function `register` (`07` §3): (a) zákazník s referral
  kódem → `role='customer'`, `owner_ambassador_id` = vlastník kódu, zápis
  `referral_events kind='registration'`; (b) organický zákazník; (c) **B2B
  samoobslužná registrace `?type=b2b` (D14)** → profil + řádek `b2b_companies`
  (`pipeline_status='new_contact'`, `approved_at NULL`) — účet čeká na schválení,
  do té doby nakupuje jako běžný zákazník.
- **E2-T3** (2 h): UI `(public)`: přihlášení (heslo i magic link), registrace
  (předvyplněný uzamčený kód z query/cookie, přepínač B2B), reset hesla.
- **E2-T4** (1,5 h): `AuthGuard`, `RoleGuard`, `AppShell` (sidebar/topbar dle role,
  routing mapa `07` §4); mentor/leader se chovají jako ambassador, `b2b_manager`
  UI neexistuje (vykonává admin, D10).
- **E2-T5** (3 h): RLS politiky všech tabulek dle `06` §4 (matice §2.3): peníze
  klient jen čte, downline max 3 generace a u cizích jen agregáty, `correct_index`
  kvízu nečitelný, `b2b_*` jen admin; `REVOKE EXECUTE` na peněžních funkcích pro
  klientské role.
- **E2-T6** (1,5 h): pgTAP RLS testy per role (customer/ambassador/trade_partner/
  admin) + test B-CLIENT-DENY (`05` §10 č. 24).

**Akceptace:** registrace všech tří cest E2E funguje; zákazník nevidí cizí data
(testy); klientská role nezapíše do žádné peněžní tabulky ani nezavolá peněžní
funkci.

### Epik 3 — Katalog, košík, checkout (14 h)

**Cíl:** nákupní cesta až po `awaiting_payment` se správnými cenami na halíř pro
všechna 4 flow, s dopravou dle R14 a dárky dle D18a.

- **E3-T1** (2 h): UI `/shop` (ceny per role z `v_current_prices` /
  `trade_level_params`), detail v dialogu, košík (context + localStorage).
- **E3-T2** (3 h): Edge Function `checkout` (`08` §4): klient posílá jen
  `product_id + quantity + credit_used`; server přepočítá ceny ze serverového
  ceníku, slevu per položka (`fn_pct_haleru`), **dopravu 99 Kč / zdarma od
  1 500 Kč z `app_settings` (R14)**, rezervuje kredit (`spend` pod advisory
  lockem), založí `orders` + `order_items` a překlopí `draft → awaiting_payment`
  (`fn_validate_order_pricing`). Kanonický vzorec D7 vč. dopravy platí na halíř.
- **E3-T3** (2 h): UI `/cart` + `/checkout`: rekapitulace dle vzorce D7 (zboží −
  sleva + doprava − kredit = k úhradě), pole „Uplatnit kredit" (max dostupný
  kredit ∧ max hodnota zboží — doprava vždy penězi, D6; čerpá se nejprve klubový,
  pak provizní, `08` §4.1).
- **E3-T4** (1,5 h): UI `/orders` (+ `?id=` detail s položkami vč. dárků
  `is_gift`); ambasador přepínač „moje / mých zákazníků".
- **E3-T5** (2 h): Admin `/admin/products` (CRUD `products` + `product_prices`,
  foto do Storage) a `/admin/orders` (přehled, přechody dle
  `order_status_transitions`, expedice `paid → shipped`).
- **E3-T6** (1,5 h): **Dárky k objednávce (D18a, R13):** admin může do objednávky
  přidat položku `is_gift=true` s cenou 0 (CHECK `chk_gift_zero`); zobrazuje se
  v detailu i e-mailové rekapitulaci jako „Dárek".
- **E3-T7** (2 h): pgTAP: ceny 100/70/65/60 % per flow na halíř, sleva per položka
  (ne z celku), doprava dle konfigurace, B-SHIPPING (žádné entry z dopravy),
  gift položky nevstupují do slev.

**Akceptace:** všechna 4 flow projdou checkoutem se správnými součty (CHECK
`chk_order_formula` nikdy nepadá na legitimní objednávce); kredit nelze použít na
dopravu; dárek má vždy cenu 0.

### Epik 4 — Platby (12 h)

**Cíl:** Stripe test mód za `PaymentProvider` rozhraním, webhookem potvrzené
zaplacení → provize, plný refund se stornem, kreditní checkout bez brány.

- **E4-T1** (2 h): Adaptér `PaymentProvider` + `StripeProvider`
  (`supabase/functions/_shared/gateway/`, kontrakt `08` §2 — jediné místo pro
  případný swap na Comgate).
- **E4-T2** (2,5 h): EF `payments-webhook-stripe` + RPC `fn_apply_payment_event`
  (`08` §5): ověření podpisu, livemode guard, dedup `(provider,
  provider_event_id)`, kontrola částky, `orders → paid` + `paid_at`,
  `fn_generate_commissions`, audit; e-mail rekapitulace po commitu.
- **E4-T3** (1,5 h): **Kreditní checkout bez brány** (`08` §4.3): `paid_money = 0`
  → rovnou `paid`, žádný řádek `payments`, `goods_paid = 0` → žádné provize.
- **E4-T4** (1,5 h): Crony (`08` §5.5): `payments-reconcile` (à 30 min, syntetické
  event ID `poll:…`), `orders-expire` (draft > 24 h, awaiting_payment > 7 dní →
  `cancelled` + vrácení rezervovaného kreditu `adjustment`); „Zaplatit znovu" =
  nový řádek `payments`.
- **E4-T5** (2 h): Refund (`08` §6): admin akce → `provider.refund` → webhook
  `charge.refunded` → `fn_apply_refund_event` → `fn_refund_order` (reversaly,
  clawbacky, vrácení kreditu); fallback „Ověřit stav u brány".
- **E4-T6** (1,5 h): Guardy `PAYMENTS_MODE=test|live` (`08` §9): odmítnutí
  live/test klíče v opačném režimu, `payments.livemode`, příznak „TESTOVACÍ
  OBJEDNÁVKA" v předmětu e-mailu.
- **E4-T7** (1 h): Deno testy webhook EF: neplatný podpis → 400, duplicitní event
  → no-op, nesouhlasící částka → výjimka + platba neoznačena.

**Akceptace:** platba kartou 4242… převede objednávku na `paid` do 60 s a v ledgeru
jsou správné entries; opakovaný webhook nic nezdvojí; refund reprodukuje worked
example (f) včetně clawbacků; kreditní objednávka projde bez brány.

### Epik 5 — Kredit a výplaty (8 h)

**Cíl:** settlement, R12 UI se dvěma čísly a výplatní proces D17.

- **E5-T1** (1 h): pg_cron `settle-commissions` denně 01:30 UTC →
  `SELECT fn_settle_commissions();` (`09` §1.5) — jediný aplikační cron nad
  penězi.
- **E5-T2** (2 h): UI `/commissions`: **dvě čísla dle R12** z `v_credit_overview`
  (kind `commission`): *Dostupný kredit* a *Čeká na aktivaci* + „aktivace
  nejblíže {next_activation_at}"; ledger tabulka z `commission_entries` (typ,
  částka, stav `pending|available|reversed`, důvod storna).
- **E5-T3** (2 h): UI `/payouts` + EF `request-payout`: žádost o výplatu
  provizního kreditu (min. `app_settings.payout_min_haleru` = 500 Kč; klubový
  kredit vyplatit nelze); stavy `requested → approved → paid | rejected |
  cancelled`; schválení vytváří rezervační `payout` transakci, zamítnutí ji vrací
  `adjustment` (`06` §5.2). Flag `PAYOUTS_ENABLED=false` do vzniku IČO (R8).
- **E5-T4** (1,5 h): Admin `/admin/payouts`: schválit/zamítnout/označit `paid`
  (po ručním převodu), CSV export příkazů.
- **E5-T5** (1,5 h): pgTAP: P-HOLD, P-SETTLE-IDEMP, B-MIN-PAYOUT, P-SPEND-RACE
  (`05` §10 č. 14–16, 22).

**Akceptace:** entry nikdy nedozraje před `paid_at + 15 dní`; UI vždy ukazuje obě
čísla s datem aktivace; výplata pod 500 Kč a výplata klubového kreditu selžou;
dvojí schválení téže žádosti nemožné.

### Epik 6 — Dashboard, CRM, osobní cíl (11 h)

**Cíl:** dashboardy per role dle `07` §7.2–7.3 a CRM dle §4 zadání (D33).

- **E6-T1** (2,5 h): Dashboard ambasadora (`v_ambassador_dashboard`): měsíční
  obrat, dvě provizní čísla (R12), zákazníci celkem/noví, posledních 5 objednávek,
  blok „Můj odkaz", statické doporučení „Další krok".
- **E6-T2** (1,5 h): **Karta Osobní cíl (D32):** progress
  `turnover_month_haleru / monthly_goal_haleru`; nastavení cíle v `/account`
  (zapisuje `profiles.monthly_goal_haleru`, parsování `parseKcToHaleru`).
- **E6-T3** (1,5 h): Dashboard zákazníka (klubový kredit **dvěma čísly dle R12**,
  kind `club`), dashboard Trade partnera (úroveň + sleva, „objednat znovu",
  stav „čeká na schválení" u neschválené B2B registrace), dashboard admina
  (obraty, provizní náklady, čekající žádosti).
- **E6-T4** (2,5 h): CRM `/customers`: tabulka dle §4 zadání; detail s historií
  objednávek, **poznámkami `crm_notes` a zájmovými tagy `interest_tags` ⟷
  `customer_interest_tags` (D33)** — číselník §4 (spánek, stres, imunita, …).
- **E6-T5** (1,5 h): `/account`: profil, změna hesla, osobní cíl.
- **E6-T6** (1,5 h): pgTAP + vitest: čísla dashboardu sedí s ručním SQL přepočtem
  na halíř; ambasador B nevidí zákazníky ambasadora A; poznámky vidí jen autor
  a admin.

**Akceptace:** dashboard reprodukuje vzor „ROMAN" ze zadání §3; CRM ukládá poznámky
a tagy; cíl se zobrazuje jen vlastníkovi.

### Epik 7 — Referral smyčka (9 h)

**Cíl:** kompletní atribuční smyčka link → klik → registrace → trvalá atribuce →
provize; jediná úprava repa `pentariva` (D29).

- **E7-T1** (2 h): Marketing web: statická routa `/r/[code]`
  (`public/r/index.html` + Firebase rewrite) dle `07` §6 — validace kódu, zápis
  kliku do **`referral_events`** (`kind='click'`, `visitor_hash`, anon RLS jen na
  tento INSERT), cookie `pnt_ref` (30 dní, last-touch), redirect na
  `office.pentariva.com/register?code={code}`.
- **E7-T2** (2 h): UI `/my-link`: osobní link + copy + QR (balíček `qrcode`),
  generátor produktových linků (nový řádek `referral_codes` s `product_id`,
  D12), konverzní statistiky z `referral_events` (kliky, registrace, obrat
  přivedených).
- **E7-T3** (1 h): Produktový link → po registraci/přihlášení redirect na
  `/shop?product={product_id}` (otevřený dialog).
- **E7-T4** (1,5 h): pgTAP: registrace přes kód nastaví `owner_ambassador_id`
  trvale; atribuce existujícího účtu se linkem nemění; `referral_events` páruje
  registraci na kód.
- **E7-T5** (2,5 h): Playwright smoke test kritické cesty (kapitola 3.3).

**Akceptace:** `/r/{code}` → registrace → nákup zákazníka vygeneruje
`personal_customer` 20 % + `club_credit` 3 % (smoke test); kliky se počítají;
poslední kliknutý kód vyhrává jen do registrace.

### Epik 8 — B2B CRM + Trade (9 h)

**Cíl:** pipeline dle §6 zadání, schvalování samoobslužných B2B registrací (D14)
a napojení Trade partnerů (D13).

- **E8-T1** (2,5 h): Admin `/admin/b2b`: pipeline board `b2b_companies`
  (stavy ENUM `b2b_pipeline` přesně dle §6), CRUD firem, follow-upy
  (`next_action`, `next_action_due`), aktivity `b2b_activities`.
- **E8-T2** (2 h): **Schválení samoobslužné B2B registrace (D14):** admin nastaví
  `approved_at/approved_by`, založí `trade_partners` (úroveň + získavatel
  `acquirer_profile_id`) a přepne `profiles.role='trade_partner'` — SECURITY
  DEFINER funkce s auditem; do schválení uživatel nakupuje jako zákazník.
- **E8-T3** (1,5 h): Konverze ručně vedené firmy z pipeline na Trade partnera
  (FK `b2b_companies.trade_partner_id`); změna Trade úrovně adminem (audit).
- **E8-T4** (1,5 h): Trade ceny v obchodě/checkoutu (70/65/60 % z
  `trade_level_params`) — ověření proti E3.
- **E8-T5** (1,5 h): pgTAP: Trade objednávka generuje jen `trade_acquirer` dle
  úrovně kupujícího (P-TRADE-ISOLATION), bez získavatele vše v `company_margin`
  (B-TRADE-NO-ACQ); B2B data vidí jen admin.

**Akceptace:** firma projde pipeline `new_contact → active_partner`; schválený
partner nakupuje za Trade cenu a získavateli vzniká 10/8/5 % na halíř; neschválený
B2B účet Trade ceny nevidí.

### Epik 9 — Akademie + povýšení na ambasadora (10 h)

**Cíl:** Modul 1 s kvízem (D34) jako jediná samoobslužná cesta k roli ambassador
(D11).

- **E9-T1** (2 h): UI `/academy`: moduly (`academy_modules`), lekce (video —
  YouTube unlisted embed / Supabase Storage dle dodaného obsahu + `body_md`),
  progress (`academy_progress`).
- **E9-T2** (2,5 h): **QuizRunner (D34):** otázky z `academy_quiz_questions`
  (klient NIKDY nečte `correct_index`), vyhodnocení SECURITY DEFINER funkcí přes
  `rpc()` → `academy_quiz_attempts` (`score_bp`, `passed` ≥ 8000 bp); pokusy
  neomezeny; **u Modulu 1 žádné ruční „označit dokončeno"**.
- **E9-T3** (2 h): Žádost o povýšení (D11): po `passed` CTA → souhlas s podmínkami
  + potvrzení 18+ → `ambassador_applications`; admin schválení
  (`/admin/users`) SECURITY DEFINER funkcí: `role='ambassador'`,
  `owner_ambassador_id → sponsor_id`, trigger dopočte `path/depth`; e-maily
  #10/#11 (`09` §1.5).
- **E9-T4** (1,5 h): Admin `/admin/academy`: CRUD modulů, lekcí a kvízových
  otázek; seed struktury Modulu 1 (placeholder texty — finální obsah dodá
  zadavatel, viz kapitola 7).
- **E9-T5** (2 h): pgTAP: kvíz pod 80 % roli nemění; žádost bez `passed` pokusu
  selže; schválení správně přepne strom (zákazník se stane 1. generací svého
  dosavadního ambasadora); `correct_index` pod klientskou rolí nečitelný.

**Akceptace:** zákazník dokončí lekce → složí kvíz ≥ 80 % → požádá → admin schválí
→ je ambasador se správným sponzorem; žádná jiná samoobslužná cesta k roli
neexistuje.

### Epik 10 — Administrace (10 h)

**Cíl:** admin ovládá vše bez DB konzole; každá akce má audit.

- **E10-T1** (2 h): `/admin/users`: vyhledávání, detail (sponzor, role,
  kódy), změna role a deaktivace přes RPC s auditem; založení root ambasadora
  (`is_network_root`); oprava sponzora do 14 dnů (`fn_admin_change_sponsor`).
- **E10-T2** (2 h): `/admin/commissions`: ledger s filtry, vratka objednávky
  (`fn_refund_order`), **leadership pool: zůstatek + ruční alokace
  `fn_allocate_leadership`** (Σ alokací ≤ pool, D15).
- **E10-T3** (1,5 h): `/admin/settings`: editace `app_settings`,
  `commission_rates`, `trade_level_params` — každá změna auditována; sazby se
  nikde nehardcodují.
- **E10-T4** (1,5 h): **Milníkové dárky (D18b, R13):** admin evidence
  `milestone_gifts` (komu, za co, kdy, kdo přidělil) + výpis v detailu uživatele.
- **E10-T5** (1,5 h): UI audit logu (filtr aktér/akce/entita); admin dashboard
  (obraty per flow, provizní náklady, počty, čekající žádosti).
- **E10-T6** (1,5 h): pgTAP: ne-admin neotevře žádnou admin RPC; změna sazby
  nemění existující entries (B-RATE-SNAPSHOT); B-ALLOC-CAP.

**Akceptace:** každá admin akce má řádek v `audit_log`; firemní čísla sedí s SQL
přepočtem; alokace poolu nikdy nepřekročí pool.

### Epik 11 — Reporty + transakční e-maily (8 h)

**Cíl:** routa `/reports` (D31) a kompletní sada 11 MVP šablon (`09` §1.5) — nic
víc.

- **E11-T1** (2,5 h): **UI `/reports` (D31):** osobní výkon (měsíční řady
  z `v_monthly_personal_turnover`), souhrn zákazníků a provizí
  (`v_ambassador_dashboard`, `v_credit_overview`), tabulka objednávek s filtrem
  období; **Export CSV** u každé tabulky (klient, Blob, UTF-8 s BOM). Žádné
  vlastní agregační tabulky, žádný report builder (D30).
- **E11-T2** (1 h): Admin CSV exporty (objednávky, provize, výplaty) na
  `/admin/*` obrazovkách týmž mechanismem — účetní podklad do go-live (`08` §7).
- **E11-T3** (3 h): Aplikační e-maily šablon #4–#11 (`09` §1.5): Database
  Webhooks (pg_net) → EF `send-email` → Resend API; idempotence
  `Idempotency-Key: {kod_sablony}:{id_zaznamu}`; kontrola cílových přechodů
  stavů (`record`/`old_record`).
- **E11-T4** (1,5 h): E2E kontrola: každá šablona odejde právě jednou na správný
  trigger (vč. #7 `commission_activated` po settlementu); Sentry hlásí selhání
  `send-email`.

**Akceptace:** všech 11 šablon chodí česky se správnými částkami v Kč; CSV čísla
sedí s dashboardem; žádný jiný e-mail ani notifikace v MVP neexistuje.

## 3. Testovací strategie

**Rozhodnutí (závazné, konzistentní s `07` §8 a `09` §3): pgTAP přes
`supabase test db`.** Testy žijí v `supabase/tests/*.sql`, každý si vytváří fixture
v transakci s rollbackem; CI job `sql-golden-tests` (`09` §3) je blokující pro
merge do main. Žádné plain-SQL assert skripty mimo pgTAP se nezavádějí. Selhání
zlatého testu se **nikdy** neopravuje úpravou testu — hodnoty jsou závazné
z `03-provizni-pravidla-zdroj.md`.

### 3.1 Zlaté testy = worked examples (a)–(f) z `05-provizni-engine.md` §3

Fixture ze `seed.sql`: řetěz A→B→C→D, osobní zákazník ambasadora A, Trade partner
úrovně `active`, organický zákazník; katalog testovacího produktu 100 000 h.
Hodnoty v haléřích, na halíř přesně, včetně stavů:

| # | Scénář (`05` §3) | Očekávané kalkulační entries (`amount_haleru`) |
|---|---|---|
| G-a | `community_own`, nakupuje D, katalog 100 000 → `goods_paid` 70 000 | `team_gen1` C +10 500; `team_gen2` B +4 200; `team_gen3` A +2 800; `leadership_pool` +1 400; `company_margin` +51 100; Σ = 70 000; kupující D nic (žádný `personal_customer`, žádný `club_credit`) |
| G-b | `community_customer`, zákazník A, 100 000 | `personal_customer` A +20 000; `club_credit` zákazník +3 000; `company_margin` +77 000; žádné `team_gen*` ani `leadership_pool` |
| G-c | `trade` úroveň `active`, katalog 100 000 → `goods_paid` 65 000 | `trade_acquirer` +5 200; `company_margin` +59 800 |
| G-d | `organic`, 100 000 | `club_credit` +3 000; `company_margin` +97 000 |
| G-e | `community_own`, ambasador E s jediným sponzorem S, `goods_paid` 70 000 | `team_gen1` S +10 500; `leadership_pool` +1 400; `company_margin` +58 100; **žádné** `team_gen2/3` záznamy (P4 — bez komprese) |
| G-f | Vratka objednávky (b) den 10 i den ≥ 15 | reversaly −20 000 / −3 000 / −77 000 s `reverses_entry_id`, originály `reversed`, Σ všech řádků objednávky = 0; před settlementem žádný `clawback`, po settlementu `clawback` −20 000 (commission) a −3 000 (club) |
| G-stav | stavy u (a)–(d) | `company_margin` `available` ihned; všechna ostatní entries `pending` s `hold_until = paid_at + 15 dní` |

### 3.2 Povinná podmnožina testů z `05` §10 (rovněž pgTAP, blokující)

P-INV1 (Σ kalkulačních entries = `goods_paid`), P-INV2 (storno → Σ = 0), P-ROUND
(`amount = fn_pct_haleru(base, rate_bp)`; HALF-UP ověřen: 70 000 × 1500 bp =
10 500; 233 310 × 1500 bp = 34 997), P-COMPANY (margin ≥ 0 i pro mikročástky),
P-IDEMP + P-IDEMP-SCOPE (dvojí/souběžné generování), P-FLOW-EXCL,
P-CUSTOMER-NO-TEAM, P-TRADE-ISOLATION, G-UPLINE-PARTIAL, P-REVERSE-IDEMP,
P-REVERSE-CLAWBACK, P-HOLD, P-SETTLE-IDEMP, P-SPEND-RACE, P-CREDIT-BASE,
B-TRADE-NO-ACQ, B-ROOT-AMB, B-RATE-SNAPSHOT, B-ALLOC-CAP, B-MIN-PAYOUT,
B-SHIPPING, B-CLIENT-DENY. Plné znění a sémantika: `05-provizni-engine.md` §10.

### 3.3 Playwright smoke test (E7-T5)

Proti lokálnímu stacku (`supabase start` + `next dev`):

1. `/r/{kód A}` → cookie + redirect na registraci; registrace zákazníka (Inbucket).
2. DB: `owner_ambassador_id = A`, `referral_events` obsahuje click + registration.
3. Nákup (Stripe test karta; webhook v CI simulován podepsaným payloadem přes
   `stripe trigger checkout.session.completed`).
4. Objednávka `paid`; ledger: `personal_customer` 20 % pro A + `club_credit` 3 %,
   oba `pending`; dashboard A zobrazuje obě čísla dle R12.
5. Druhý scénář: ambasador D nakoupí sám → ledger dle G-a.

### 3.4 CI gate (blokující pro merge do main)

`quality` (lint, `tsc --noEmit`, vitest) + `sql-golden-tests`
(`supabase db start` → migrace na čistou DB → `supabase test db`) + Deno testy
Edge Functions + `build` + `smoke` (Playwright na PR). Main je chráněná větev,
merge jen přes PR se zelenými checky.

## 4. Odhad pracnosti a kritická cesta

| Epik | Odhad (h AI-asistovaného vývoje) |
|---|---|
| E0 Infra bootstrap | 8 |
| E1 Kanonické schéma + peněžní funkce + zlaté testy | 18 |
| E2 Auth + registrace + RLS | 12 |
| E3 Katalog + objednávky + checkout | 14 |
| E4 Platby | 12 |
| E5 Kredit + výplaty | 8 |
| E6 Dashboard + CRM + osobní cíl | 11 |
| E7 Referral smyčka | 9 |
| E8 B2B CRM + Trade | 9 |
| E9 Akademie + povýšení | 10 |
| E10 Administrace | 10 |
| E11 Reporty + e-maily | 8 |
| **Celkem** | **≈ 129 h** (+ 15 % rezerva na integrační ladění ≈ **148 h**) |

**Kritická cesta:** E0 → E1 → E2 → E3 → E4 → E5 → E7 (smoke) = **81 h**. E6, E8,
E9 lze po E4 stavět paralelně; E10 a E11 jsou poslední. Nejrizikovější položka je
E1 (peněžní jádro) — proto jde hned na začátek a nese celou zlatou testovou síť;
žádná obrazovka nevzniká dřív, než jsou peníze v DB dokázané testy. Mimo AI práci
počítat s čekacími časy: DNS propagace, převod domény pentariva.com (blokuje
ověření Resend domény a `/r/**`), obsah akademie od zadavatele.

## 5. Milníky

### M1 — Interní demo (po E0–E4 + minimální dashboard)

Exit kritéria (všechna měřitelná, všechna splněna):

1. Registrace s ověřením e-mailu i magic linkem funguje na office.pentariva.com.
2. Nákup testovací kartou: objednávka `paid` do 60 s, v `commission_entries`
   správné záznamy, potvrzovací e-mail dorazí.
3. Všechny zlaté testy G-a…G-f + podmnožina §3.2 zelené v CI; ceny per flow sedí
   na halíř.
4. CI kompletně zelená; deploy na push; noční záloha běží; RLS testy pokrývají
   profiles, products, orders, payments, commission_entries, credit_transactions.

### M2 — Pilot s 5 ambasadory, plný money flow v test módu (po E5–E11)

Exit kritéria:

1. Playwright smoke zelený v CI; 5 pilotních ambasadorů zaregistrováno přes
   `/r/` linky; v datech existuje řetěz A→B→C→D.
2. ≥ 20 testovacích objednávek pokrývajících všechna 4 `business_flow`; ledger
   sedí s nezávislým ručním přepočtem na halíř (kontrolní tabulka v PR).
3. Proveden ≥ 1 refund se stornem a clawbackem, ≥ 1 čerpání kreditu v checkoutu,
   ≥ 1 žádost o výplatu schválena a označena `paid` (test) — vše s auditní stopou.
4. UI všude zobrazuje dvě kreditní čísla dle R12 (dostupný + čekající s datem
   aktivace) — u provizního i klubového kreditu.
5. Akademie: ≥ 1 pilot prošel kvíz Modulu 1 ≥ 80 % → žádost → schválení →
   ambasador se správným sponzorem.
6. B2B: 1 samoobslužná registrace schválena (D14) a 1 firma provedena pipeline
   po `active_partner` s Trade objednávkou a získavatelskou provizí.
7. `/reports` s CSV exportem funguje; všech 11 e-mailových šablon odchází.

### M3 — Go-live (po vzniku IČO)

Exit kritéria (pořadí dle `08` §9):

1. IČO existuje; padlo rozhodnutí o produkční bráně dle `08` Přílohy A (Stripe
   live vs Comgate) — **ostré klíče brány nasazeny**, nový live webhook endpoint
   + secret, guard `PAYMENTS_MODE` ověřen.
2. **Fakturoid** napojen (API v3) — vystavování dokladů od první ostré objednávky
   (`08` §7).
3. TRUNCATE testovacích transakčních dat dle tabulky `08` §9 (účty a `audit_log`
   se zachovávají); `PAYMENTS_MODE=live`.
4. Smoke test: live platba 10 Kč → webhook → provize → plný refund → clawback.
5. `PAYOUTS_ENABLED=true` po prvním úspěšném testovacím payoutu; **minimální
   výplata 500 Kč potvrzena zadavatelem** (jinak změna `app_settings` před
   zapnutím).
6. Rozhodnut **bankovní převod s VS** (`BANK_TRANSFER_ENABLED`, specifikace
   `08` §8) — zapnout jen rozhodnutím zadavatele.
7. pentariva.com primární doména (marketing + `/r/**`), pentariva.cz 301;
   Resend doména ověřená na pentariva.com; SSL platné.
8. Obchodní podmínky, GDPR dokumenty a podmínky partnerského programu publikované
   a odsouhlasené v registraci/checkoutu (texty dodá zadavatel).
9. Zálohy běží ≥ 7 dní po sobě + jednorázově ověřená obnova (`09` §4); Supabase
   upgrade na Pro dle pravidla `09` §6.1a (ostré platby ⇒ Pro).
10. Bezpečnostní revize: checklist `06` §9, rotace secrets, admin účty se silným
    heslem; runbook `09` §7 v repu.

## 6. Go-live / Fáze 2 — co v MVP záměrně NENÍ

Nic z tohoto seznamu se v MVP nestaví (D30 + D23/D24); tickety pro tyto oblasti
v epicích výše neexistují záměrně:

| Funkce | Kdy | Odkaz |
|---|---|---|
| **Bankovní převod s VS** (adaptér `BankTransferProvider`, ruční párování, `ALTER TYPE payment_method`) | Go-live, rozhodnutím zadavatele | `08` §8, M3 bod 6 |
| **PDF doklady / faktury** — v MVP jen e-mailová rekapitulace + CSV | Go-live = Fakturoid | `08` §7, D23, D30 |
| **Notifikační centrum / interní notifikace (zvoneček)** | Fáze 2 | D30 |
| **Týdenní digest ambasadorovi, vítací e-mail, bounce webhook Resend** | Fáze 2 | D24, `09` §1.5 |
| Mentor/leader dashboardy (`/tym`), downline UI | Fáze 2 | D30, D10 |
| Kampaně, Event Manager, dokumentové centrum | Fáze 2 | D30 |
| Benefit club 15/20/25 + VIP úrovně (konfigurovatelná vrstva) | Fáze 2 | R6, D30 |
| Kariérní automatika (povýšení mentor/leader, prahy Trade úrovní) | Fáze 2 | D30 |
| Report builder (uložené reporty, KPI výběr) | Fáze 2 | D30, D31 |
| Anti-fraud aparát nad rámec MVP (zůstává: unikátní e-mail/telefon, admin schvalování, 15denní lhůta) | Fáze 2 | D30 |
| Noční agregační joby, `partner_monthly_stats` | Fáze 2 | D30, `04` §4 |
| WhatsApp/SMS notifikace, push, mobilní aplikace | Fáze 2/3 | D30 |
| `b2b_manager` UI (roli vykonává admin) | Fáze 2 | D10 |
| **Odměna zákazníka za sdílení produktového linku** | Fáze 2, ke schválení zadavatelem | D30, kapitola 7 |
| Částečné vratky (poměrné storno) | Fáze 2 | D4, `08` §1 |
| Expirace kreditu, guest checkout, vícejazyčnost | Fáze 2/3 | D16, D30 |
| AI asistent, denní akční doporučení, predikce | Fáze 3 | D30 |
| Comgate adaptér (bankovní tlačítka, nižší poplatky) | Go-live/Fáze 2 dle rozhodovacího pravidla | `08` Příloha A |

## 7. Otevřené body pro zadavatele

Body, které blokují dílčí kroky plánu a vyžadují rozhodnutí zadavatele (nikoli
implementátora):

1. **Minimální výplata 500 Kč** — `app_settings.payout_min_haleru = 50000` je
   navržená hodnota (D17). Potvrdit před M3 bodem 5; do potvrzení platí 500 Kč.
2. **Odměna zákazníka za sdílení produktového linku** — finální provizní model
   žádnou zákaznickou odměnu nedefinuje, proto v MVP není (D30). Schválit, zda a
   v jaké podobě vstoupí do Fáze 2 (typicky spolu s Benefit club vrstvou).
3. **Výběr produkční platební brány před go-live** — Stripe live vs Comgate dle
   `08` Přílohy A (rozhodovací pravidlo: zamítnutí live aktivace Stripe, nebo
   objem × úspora poplatků > náklad swapu). Rozhodnutí je bod 1 go-live
   checklistu M3.
4. **Obsah akademie — kdo dodá videa a texty Modulu 1 + kvízové otázky.**
   Struktura a placeholder obsah vzniknou v E9-T4, ale povýšení na ambasadora
   (D11) stojí na reálném kvízu Modulu 1 — bez dodaného obsahu nelze splnit exit
   kritérium M2 bod 5. Určit dodavatele obsahu a termín.
5. **Texty obchodních podmínek, podmínek partnerského programu a GDPR
   dokumentů** — nutné pro registraci (souhlas s podmínkami, D11) a pro M3 bod 8.
6. **Převod domény pentariva.com** pod vlastní správu DNS (R4) — blokuje ověření
   odesílací domény Resend (`09` §1.2) a produkční `/r/**` linky.
