# Kanonická technická rozhodnutí (D1–D34)

> Tento dokument je **závazný kontrakt** pro všechny ostatní dokumenty i implementaci.
> Vznikl syntézou návrhové fáze (7 specialistů), dvou nezávislých auditů peněžní logiky
> a oponentury úplnosti. Precedence při rozporu:
> `03-provizni-pravidla-zdroj.md` → `00-zadani-a-rozhodnuti.md` (R1–R14) → tento soubor
> → `04-datovy-model.md` (kanonické schéma) → `05-provizni-engine.md` → ostatní.

## Ledger a peníze

- **D1 Kanonické schéma**: jediný zdroj DDL je `04-datovy-model.md`. Žádný jiný dokument
  nesmí definovat vlastní CREATE TABLE — jen odkazovat.
- **D2 Provizní ledger**: tabulka `commission_entries` obsahuje POUZE akruály a jejich
  storna. Typy: `personal_customer`, `team_gen1|2|3`, `leadership_pool`,
  `leadership_alloc`, `trade_acquirer`, `club_credit`, `company_margin`.
  Stavy: `pending → available | reversed`. Storno = nový záporný řádek
  s `reverses_entry_id` (unikát) + originál dostane status `reversed`.
  `company_margin` je `available` ihned (bilanční dopočet firmy); všechny ostatní kladné
  záznamy jsou `pending` do `paid_at + 15 dní` (settlement job je překlopí).
  Idempotence: unikát `(order_id, beneficiary_profile_id, entry_type)`; early-exit
  kontrola generátoru testuje výhradně kalkulační typy.
- **D3 Kreditní účty**: oddělená tabulka `credit_transactions`
  (kind `club|commission`; typ `accrual|spend|payout|clawback|adjustment`;
  `spent_on_order_id` pro čerpání). Zůstatek = Σ transakcí; smí jít do minusu po
  clawbacku (netuje se budoucími akruály). Akruál vzniká, když settlement překlopí
  entry na `available`. Žádné FIFO párování čerpání na konkrétní entries.
- **D4 Vratky**: v MVP jen **celá objednávka**. Refund → ke každému nestornovanému entry
  vznikne reversal −částka; pokud už byl akruál připsán na kredit, vznikne i `clawback`.
  Invariant: po plném stornu Σ (kalkulační entries + jejich reversaly) = 0.
- **D5 Zaokrouhlení**: jediná funkce `fn_pct_haleru(base, rate_bp)` — HALF-UP, chyba
  ≤ 0,5 h. Sleva se zaokrouhluje **per položka objednávky**; součty objednávky = Σ položek.
  `company_margin = base − Σ příjemců` (přesný dopočet, nikdy záporný — runtime guard).
  Invariant: Σ kalkulačních entries objednávky = `goods_paid_haleru`.
- **D6 Báze provizí (R11)**: `goods_paid = total_catalog − total_discount − credit_used`.
  Kredit se uplatňuje jen na zboží, doprava se platí vždy penězi. Provize i 3% kredit
  z `goods_paid`. Plně kreditem hrazené zboží → žádné nové provize (nulové záznamy se
  nikdy nezapisují).
- **D7 Vzorec objednávky (R14)**: `total_catalog − total_discount + shipping − credit_used
  = paid_money` (CHECK). `business_flow` ENUM: `community_own | community_customer |
  trade | organic` — exkluzivita vynucená CHECK/triggery.
- **D16 Klubový kredit BEZ expirace** (v MVP; expirace byla návrh nad rámec zdrojů).
- **D15 Leadership pool**: entries `leadership_pool` s `beneficiary_profile_id NULL`
  (= firemní pool). Ruční alokace adminem = `leadership_alloc` entries s vazbou na pool
  (Σ alokací ≤ Σ poolu, vynuceno funkcí).
- **D17 Výplaty**: `payout_requests` stavy `requested → approved → paid | rejected |
  cancelled`. Nárok = aktuální zůstatek provizního kreditu (díky 15denní lhůtě R12 je už
  „zralý"). Minimální výplata 500 Kč (`app_settings`, ke schválení zadavatelem).
  Vyplácí admin ručně převodem, pak označí `paid`.
- **D19 Konvence**: peněžní sloupce `_haleru` (BIGINT), sazby `_bp` basis pointy
  (INTEGER, 2000 = 20 %). `commission_rates(code PK, rate_bp, description)`;
  `trade_level_params(level PK, discount_bp, acquirer_rate_bp)`.

## Struktura sítě a atribuce

- **D9 Genealogie**: `profiles.sponsor_id` (adjacency) + `profiles.path` (materialised
  path, text, trigger). Zákazník: `sponsor_id NULL` + `owner_ambassador_id` („osobní
  zákazník není partnerská generace"). Sponzor neměnný; admin oprava jen do **14 dnů**
  od registrace přes SECURITY DEFINER funkci s auditem.
- **D10 Role**: ENUM `customer, ambassador, mentor, leader, trade_partner, b2b_manager,
  admin`. B2B partner (hotel, salon…) se přihlašuje jako `trade_partner` (B2B CRM je
  evidence vztahu, Trade účet je jeho obchodní realizace). `mentor`/`leader` v enumu
  existují (Fáze 2 UI), `b2b_manager` v MVP vykonává admin.
- **D11 Vznik ambasadora**: registrace přes referral link vytváří **zákazníka**;
  povýšení = kvíz Modulu 1 akademie (≥ 80 %) + souhlas s podmínkami + **schválení
  adminem** + 18+. Evidence v `ambassador_applications`.
- **D12 Referral kódy**: tabulka `referral_codes` — kód 6–12 znaků `[a-z0-9]`, citext,
  case-insensitive resolve, vanity alias jako další řádek, produktové linky = řádek
  s `product_id`. Kliky v `referral_events`. QR generuje klient.
- **D13 Trade**: `trade_partners(profile_id, level, acquirer_profile_id, …)` — úroveň
  i získavatel žijí TADY, ne na profiles. Bez získavatele → provize propadá firmě
  (zůstává v marginu).
- **D14 B2B CRM**: jen `b2b_companies` (pipeline dle §6 zadání + nullable `profile_id`)
  a `b2b_activities`. Samoobslužná B2B registrace = profil čekající na schválení
  + řádek v pipeline `new_contact`. Žádné `b2b_contacts`/`b2b_opportunities` v MVP.
- **D18 Dárky (R13)**: (a) `order_items.is_gift` s cenou 0; (b) tabulka
  `milestone_gifts(profile_id, reason, note, granted_by, granted_at)`.

## Aplikace a provoz

- **D8 Stavová mašina objednávky**: `draft → awaiting_payment → paid → shipped →
  completed`; `cancelled` (před zaplacením); `refunded` (po zaplacení, celá).
  Stav brány žije v tabulce `payments`; `orders.paid_at` nastavuje webhook.
  Žádný sloupec `orders.payment_status`.
- **D21 Auth**: Supabase Auth — e-mail+heslo **i** magic link. Odesílatel
  `office@pentariva.com` přes Resend (SMTP integrace pro auth maily).
- **D22 RLS**: klient peníze jen čte; všechny zápisy peněz přes SECURITY DEFINER
  funkce/Edge Functions. Ambasador vidí své zákazníky a downline max 3 generace
  (u cizích jen agregáty). UI provizí zobrazuje **dostupný** vs **čekající na aktivaci**
  kredit (R12) — view s `pending` entries + datem aktivace.
- **D23 Platby**: **Stripe v test módu** za tenkým `PaymentProvider` rozhraním; před
  go-live přehodnotit Comgate (nižší poplatky CZ) — swap je izolovaný. Bankovní převod
  s VS a PDF doklady NEJSOU v MVP (e-mailová rekapitulace stačí); Fakturoid při go-live.
- **D24 E-maily**: Resend, odesílatel `office@pentariva.com`; jen transakční šablony
  MVP; bounce-webhook a týdenní digesty Fáze 2.
- **D25 Prostředí**: local (supabase cli) + produkce; bez stagingu. CI GitHub Actions:
  lint, typecheck, SQL testy provizí (zlaté worked examples), build, deploy na Firebase
  Hosting; `supabase db push` s ručním schválením.
- **D26 Zálohy**: noční šifrovaný (age) `pg_dump` do privátního repa `pentariva-backups`,
  rotace 30 dní.
- **D27 Monitoring**: Sentry free, UptimeRobot free.
- **D28 Aplikace**: samostatný repozitář `pentariva-office`; Next.js statický export na
  Firebase Hosting (nový hosting target ve stávajícím projektu pentariva-web),
  office.pentariva.com; shadcn/ui + brand tokeny z marketing webu; supabase-js +
  TanStack Query; react-hook-form + zod; generované DB typy.
- **D29 Marketing web**: přidat statickou routu `/r/[kod]` (uloží kód, přesměruje na
  registraci v office) — jediná úprava stávajícího repa pentariva.
- **D31 Reporty v MVP**: routa `/reporty` (osobní výkon, zákazníci, objednávky, CSV
  export) + admin exporty. Nic víc (report builder = Fáze 2).
- **D32 Osobní cíl**: `profiles.monthly_goal_haleru`, v MVP nastavovaný uživatelem.
- **D33 CRM**: `crm_notes` + zájmové okruhy zákazníka (tagy dle §4 zadání) v kanonickém
  schématu.
- **D34 Akademie**: moduly/lekce/progress + kvíz (otázky, pokusy, práh 80 %) — Modul 1
  podmiňuje povýšení (D11). Žádné ruční „označit dokončeno" u Modulu 1.

## Co v MVP záměrně NENÍ (D30)

Mentor/leader dashboardy, kampaně, Event Manager, dokumentové centrum, AI asistent,
WhatsApp/SMS, benefit/VIP úrovně, kariérní automatika, report builder, anti-fraud aparát
(zůstává: unikátní e-mail/telefon, admin schvalování ambasadorů a výplat, 15denní
lhůta), noční agregační joby, notifikační centrum, PDF faktury, bankovní převod jako
platební metoda, b2b_manager UI, **odměna zákazníka za sdílení produktového linku**
(§21 ji zmiňuje, ale finální provizní model žádnou zákaznickou odměnu nedefinuje —
odsunuto do Fáze 2, ke schválení zadavatelem).
