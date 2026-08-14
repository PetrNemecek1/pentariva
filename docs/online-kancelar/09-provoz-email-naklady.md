# 09 — Provoz: e-maily, zálohy, CI/CD, náklady, runbook

> Finální provozní specifikace. Implementuje kontrakt `02-technicka-rozhodnuti.md`
> (zejm. D8, D17, D21, D23–D27) a rozhodnutí zadavatele R1–R15. Všechny názvy tabulek,
> sloupců, ENUMů a stavů přebírá z kanonického schématu `04-datovy-model.md` (D1) —
> tento dokument žádné DDL nedefinuje. Peníze: `_haleru` BIGINT, sazby `_bp`,
> zaokrouhlení výhradně `fn_pct_haleru` (HALF-UP, D5). Časy v DB v UTC; cron v UTC.

---

## 1. E-maily: Resend (D21, D24)

### 1.1 Volba a limity

Resend je závazná volba (R5, účet existuje). Free tier: **3 000 e-mailů/měsíc,
max 100 e-mailů/den, 1 ověřená doména, retence logů 1 den**. Pro start i ~100 uživatelů
stačí (kalkulace §6). Jediná služba pokrývá transakční e-maily aplikace i auth e-maily
Supabase (přes SMTP) — nespravujeme dva systémy.

### 1.2 DNS pro odesílání z pentariva.com (zadat na Forpsi)

Odesílací doména je **pentariva.com** — záznamy se zadávají do zóny pentariva.com,
tedy až po převodu domény pod naši správu DNS (R4). Do té doby se vyvíjí se sandbox
doménou Resend `onboarding@resend.dev` (doručuje jen na vlastní adresu).

Postup: Resend dashboard → Domains → Add Domain → `pentariva.com`, region
**EU (eu-west-1)**. Resend vygeneruje přesné hodnoty; odpovídají této šabloně
(názvy na Forpsi relativně k zóně pentariva.com):

| Typ | Název (Forpsi) | Hodnota | Priorita | TTL |
|---|---|---|---|---|
| MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` (přesnou hodnotu opsat z Resend dashboardu) | 10 | 1800 |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | — | 1800 |
| TXT | `resend._domainkey` | `p=<DKIM veřejný klíč z Resend dashboardu>` | — | 1800 |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:admin@pentariva.cz` | — | 1800 |

Po propagaci (do 1 h) kliknout v Resend na Verify. DMARC po 4 týdnech bezproblémového
provozu zpřísnit na `p=quarantine` (jedna změna TXT záznamu).

**Bezkonfliktnost s emailprofi (ověřeno):** stávající MX záznamy emailprofi jsou
v zóně **pentariva.cz** — jiná DNS zóna, Resend se jí vůbec nedotýká. V zóně
pentariva.com vyžaduje Resend MX pouze na subdoméně `send.pentariva.com` (Return-Path
pro bounce); **kořenový MX pentariva.com zůstává volný**. Pokud později vzniknou
schránky @pentariva.com (např. u emailprofi), přidá se kořenový MX bez konfliktu
s Resendem. SPF Resendu sedí jen na subdoméně `send`, DKIM selektor
`resend._domainkey` nekoliduje se selektory emailprofi. Na zóně pentariva.cz se
nemění nic.

### 1.3 Odesílatel

Jednotný odesílatel **všech** e-mailů (auth i aplikačních):
`Pentariva <office@pentariva.com>` (D21, D24). Hlavička
`Reply-To: info@pentariva.cz` (existující schránka emailprofi), dokud nevzniknou
schránky na .com. Žádné další odesílací adresy v MVP — méně adres = lepší reputace.

### 1.4 Dvě cesty odeslání

**Cesta 1 — auth e-maily: Supabase Auth + Resend SMTP.** V Supabase
(Authentication → SMTP Settings) nastavit custom SMTP: host `smtp.resend.com`,
port `465`, user `resend`, heslo = Resend API klíč, sender `office@pentariva.com`.
Odpadá vestavěný limit Supabase (2 e-maily/hod). České šablony se upraví v Supabase
dashboardu (Authentication → Email Templates). Přihlašování dle D21: **e-mail + heslo
s povinným ověřením e-mailu I magic link** — oba flow zapnuté, obě šablony
lokalizované.

**Cesta 2 — aplikační e-maily: DB událost → Supabase Database Webhook (pg_net)
→ Edge Function `send-email` → Resend API.** Webhooky se navěsí na tabulky níže;
`send-email` z payloadu (`record` + `old_record`) ověří, že jde o cílový přechod
stavu (`record.status = cíl AND old_record.status <> cíl`), vyrenderuje šablonu
(React Email / HTML string v kódu funkce) a zavolá `POST https://api.resend.com/emails`.

### 1.5 Kompletní seznam MVP šablon (závazný a úplný)

Jen transakční šablony MVP (D24). Triggery používají výhradně kanonické stavy:
`order_status` dle D8, `payout_status` dle D17 (`paid`, žádný stav „sent" neexistuje).

| # | Šablona (kód) | Předmět | Trigger | Příjemce |
|---|---|---|---|---|
| 1 | `auth_confirm` | Potvrďte svou registraci | Supabase Auth — signup (Confirm signup) | nový uživatel |
| 2 | `auth_magic_link` | Přihlášení do Online kanceláře PENTARIVA | Supabase Auth — magic link (D21) | uživatel |
| 3 | `auth_recovery` | Obnovení hesla | Supabase Auth — recovery | uživatel |
| 4 | `order_received` | Přijali jsme objednávku č. {order_number} | `orders` UPDATE `status`: `draft → awaiting_payment` | kupující |
| 5 | `order_paid` | Platba přijata — objednávka č. {order_number} | `orders` UPDATE `status → paid` (nastavuje výhradně webhook brány, D8) | kupující |
| 6 | `order_shipped` | Objednávka č. {order_number} je na cestě | `orders` UPDATE `status → shipped` (akce admina) | kupující |
| 7 | `commission_activated` | Provize {částka} Kč je nyní dostupná | `credit_transactions` INSERT `type='accrual' AND kind='commission'` (zapisuje `fn_settle_commissions` po uplynutí `hold_until` = `paid_at` + 15 dní) | příjemce provize |
| 8 | `payout_approved` | Žádost o výplatu schválena | `payout_requests` UPDATE `status → approved` | žadatel |
| 9 | `payout_paid` | Výplata {částka} Kč odeslána na váš účet | `payout_requests` UPDATE `status → paid` (admin po odeslání převodu, D17) | žadatel |
| 10 | `promotion_approved` | Vítejte mezi ambasadory PENTARIVA | `ambassador_applications` UPDATE `status → approved` | žadatel |
| 11 | `promotion_rejected` | K vaší žádosti o povýšení | `ambassador_applications` UPDATE `status → rejected` (obsahuje `note` s důvodem) | žadatel |

Šablona `auth_magic_link` (Supabase → Email Templates → Magic Link): oslovení,
tlačítko s `{{ .ConfirmationURL }}`, upozornění „odkaz je jednorázový a platí
1 hodinu; pokud jste o přihlášení nežádali, e-mail ignorujte".

**Co v MVP záměrně není (Fáze 2, D24/D30):** bounce/complaint webhook Resendu,
vítací e-mail s osobním linkem, notifikace „nová objednávka ve vaší síti",
potvrzení přijetí žádosti o výplatu, e-mail o vratce a stornu provize (vratka je
řídká adminní akce — komunikuje ji admin ručně), týdenní digesty. Změna e-mailu
v profilu není v MVP UI, šablona „Change Email" se tedy nepoužívá.

**Idempotence (povinná):** webhooky se mohou opakovat. `send-email` posílá každý
e-mail s hlavičkou **`Idempotency-Key: {kod_sablony}:{id_zaznamu}`** (Resend API
duplicitní klíč do 24 h neodešle znovu). Retry okno pg_net webhooků je řádově
minuty, 24 h okno ho s rezervou kryje. Žádná vlastní tabulka logu e-mailů
neexistuje (D1 — v kanonickém schématu není); historie odeslání = Resend dashboard.

**Cron (pg_cron, Dashboard → Integrations → Cron):** job `settle-commissions`
denně v **01:30 UTC** spustí `SELECT fn_settle_commissions();` — překlopí zralé
entries `pending → available` a v téže transakci zapíše `accrual` do
`credit_transactions`; e-mail #7 pak vyvolá webhook nad tímto INSERTem. Žádný jiný
aplikační cron v MVP není.

---

## 2. Prostředí (D25)

**Závazně pouze `local` + `prod`, žádný staging.** Druhý Supabase projekt by zdvojil
správu secrets, migrací a webhooků; identickou ochranu dává lokální stack
(`supabase start` = plný Postgres + Auth + Storage + Functions v Dockeru)
s deterministickým migračním workflow.

| Prostředí | Co to je | Data | Platby |
|---|---|---|---|
| local | `supabase start` (CLI + Docker) + `next dev`; migrace a seed z repa | `supabase/seed.sql` (testovací uživatelé, produkty, genealogie A→B→C→D z worked example) | Stripe test mód |
| prod | Supabase projekt `pentariva-office`, region **eu-central-1 (Frankfurt)** + Firebase Hosting site `pentariva-office` (target `office`, doména office.pentariva.com, D28) | ostrá | Stripe test mód do vzniku IČO (R8, D23), pak produkční onboarding brány (příp. swap na Comgate) |

**Repo:** samostatné `PetrNemecek1/pentariva-office` (D28): Next.js app + adresář
`supabase/` (migrace, funkce, pgTAP testy). Aplikace `output: 'export'` — statická
SPA, data klientsky přes supabase-js; stejný deploy model jako marketingový web.

**Migrační workflow (závazné):** `supabase migration new <nazev>` →
`supabase db reset` lokálně (přehraje migrace + seed) → testy → PR → merge do
`main` → ručně spuštěný workflow `deploy-db` (§3) provede `supabase db push` na
prod. Nikdy neměnit prod schéma ručně v dashboardu.

**Secrets:**

| Secret | Kde žije | Poznámka |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | GitHub Actions **vars** (veřejné by design) | používat nové API klíče `sb_publishable_…`/`sb_secret_…`, ne legacy anon/service_role — jdou rotovat bez odhlášení uživatelů |
| `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`, `SUPABASE_POOLER_URL` | GitHub Actions secrets | CI migrace a zálohy |
| `FIREBASE_SERVICE_ACCOUNT` | GitHub Actions secret | service account JSON projektu pentariva-web |
| `RESEND_API_KEY`, `GATEWAY_SECRET`, `SENTRY_DSN` | `supabase secrets set …` (Edge Functions) | nikdy ve frontendu |
| `BACKUPS_DEPLOY_KEY` | GitHub Actions secret | SSH deploy key s právem zápisu do repa `pentariva-backups` (D26) |
| `BACKUP_AGE_RECIPIENT` | GitHub Actions **var** | veřejný age klíč (`age1…`) — šifruje zálohy; **privátní age klíč jen offline** (password manager), nikdy v GitHubu |
| lokální vývoj | `.env.local` (v `.gitignore`) | lokální klíče ze `supabase start` |

V obou repech zapnout GitHub secret scanning + push protection (zdarma).

---

## 3. CI/CD — GitHub Actions (D25)

Dva workflow. Web se nasazuje automaticky (statický build, nízké riziko); **DB
migrace výhradně ručně spuštěným workflow** — `workflow_dispatch` s potvrzovacím
vstupem je schvalovací krok (environment protection rules nejsou na free plánu
privátních repozitářů).

`.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request:

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test            # vitest — jednotkové testy (vč. TS výpočtů UI)

  sql-golden-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
        with: { version: latest }
      - run: supabase db start          # lokální Postgres + přehrání migrací
      - name: SQL zlaté testy provizí (pgTAP, supabase/tests/)
        run: supabase test db
        # POVINNÉ zlaté testy = worked examples z 03-provizni-pravidla-zdroj.md
        # proti kanonickému schématu (04-datovy-model.md), částky v haléřích:
        # 1) community_own, nakupuje D, katalog 100000: goods_paid 70000;
        #    entries: team_gen1 (C) 10500, team_gen2 (B) 4200, team_gen3 (A) 2800,
        #    leadership_pool 1400, company_margin 51100; Σ kalkulačních = 70000.
        # 2) community_customer 100000: personal_customer 20000, club_credit 3000,
        #    company_margin 77000.
        # 3) organic 100000: club_credit 3000, company_margin 97000.
        # 4) trade (entry) 100000: goods_paid 70000, trade_acquirer 7000,
        #    company_margin 63000.
        # 5) fn_pct_haleru = HALF-UP, sleva per položka (D5).
        # 6) fn_refund_order: po plném stornu Σ (kalkulační entries + reversaly) = 0,
        #    už připsané akruály mají clawback (D4).
        # 7) fn_settle_commissions: pending -> available až po hold_until
        #    (paid_at + 15 dní) + accrual v credit_transactions (R12).

  deploy-web:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: [quality, sql-golden-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build              # next build => out/ (output: 'export')
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ vars.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${{ vars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY }}
          NEXT_PUBLIC_SENTRY_DSN: ${{ vars.NEXT_PUBLIC_SENTRY_DSN }}
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: pentariva-web
          target: office                 # firebase target:apply hosting office pentariva-office
          channelId: live
```

`.github/workflows/deploy-db.yml` (ruční schválení = ruční spuštění):

```yaml
name: Deploy DB + Edge Functions (manual)
on:
  workflow_dispatch:
    inputs:
      confirm:
        description: 'Napiš PUSH pro potvrzení nasazení migrací na PROD'
        required: true

jobs:
  migrate:
    if: inputs.confirm == 'PUSH'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
        with: { version: latest }
      - run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env: { SUPABASE_ACCESS_TOKEN: '${{ secrets.SUPABASE_ACCESS_TOKEN }}' }
      - run: supabase db push --dry-run    # výpis plánovaných migrací do logu
        env: { SUPABASE_DB_PASSWORD: '${{ secrets.SUPABASE_DB_PASSWORD }}' }
      - run: supabase db push
        env: { SUPABASE_DB_PASSWORD: '${{ secrets.SUPABASE_DB_PASSWORD }}' }
      - run: supabase functions deploy      # nasadí všechny funkce ze supabase/functions/
        env: { SUPABASE_ACCESS_TOKEN: '${{ secrets.SUPABASE_ACCESS_TOKEN }}' }
```

Jednorázový setup Firebase multi-site: `firebase hosting:sites:create
pentariva-office` → `firebase target:apply hosting office pentariva-office` →
v konzoli přidat custom doménu `office.pentariva.com` → na Forpsi zadat A/TXT
záznamy, které konzole vypíše.

---

## 4. Zálohy (D26)

Supabase **free tier nemá žádné automatické zálohy** (denní zálohy až na Pro).
Do upgradu je jediná ochrana dat vlastní dump — povinný od prvního dne provozu.

**Závazné řešení (D26): noční `pg_dump` šifrovaný nástrojem `age` → privátní
GitHub repo `pentariva-backups`, rotace 30 dní.** Žádné R2 ani jiný object
storage, žádné Actions artefakty. Šifruje se veřejným age klíčem
(`BACKUP_AGE_RECIPIENT`); privátní klíč existuje **jen offline** v password
manageru — do repa se ukládá výhradně ciphertext `*.dump.age`.

`.github/workflows/backup.yml` (v repu pentariva-office):

```yaml
name: Nightly DB backup
on:
  schedule: [{ cron: '15 2 * * *' }]   # 02:15 UTC denně
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Install pg_dump 17 + age
        run: |
          sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
          curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
          sudo apt-get update && sudo apt-get install -y postgresql-client-17 age
      - name: Checkout pentariva-backups
        uses: actions/checkout@v4
        with:
          repository: PetrNemecek1/pentariva-backups
          ssh-key: ${{ secrets.BACKUPS_DEPLOY_KEY }}
          path: backups
      - name: Dump + encrypt (age)
        env:
          DB_URL: ${{ secrets.SUPABASE_POOLER_URL }}   # session pooler, port 5432!
          AGE_RECIPIENT: ${{ vars.BACKUP_AGE_RECIPIENT }}
        run: |
          F="pentariva-$(date -u +%F).dump"
          pg_dump "$DB_URL" -Fc -f "$F"
          mkdir -p backups/daily
          age -r "$AGE_RECIPIENT" -o "backups/daily/$F.age" "$F"
          S=$(stat -c%s "backups/daily/$F.age")
          if [ "$S" -gt 83886080 ]; then echo "::error::Dump > 80 MB — blíží se limit GitHubu 100 MB/soubor, přesunout zálohy mimo git (Fáze 2)"; exit 1; fi
      - name: Rotace 30 dní + push (jediný commit, historie neroste)
        working-directory: backups
        run: |
          CUTOFF=$(date -u -d '30 days ago' +%F)
          for f in daily/pentariva-*.dump.age; do
            d="${f#daily/pentariva-}"; d="${d%.dump.age}"
            [ "$d" \< "$CUTOFF" ] && rm -f "$f"
          done
          git checkout --orphan snapshot
          git add -A
          git -c user.name=backup-bot -c user.email=office@pentariva.com \
            commit -m "backup $(date -u +%F)"
          git push --force origin snapshot:main
```

Klíčové detaily:

- **Připojení přes Supavisor session pooler** (`aws-0-eu-central-1.pooler.supabase.com:5432`)
  — přímé `db.<ref>.supabase.co` je IPv6-only a z GitHub runnerů (IPv4) nefunguje.
- **Rotace podle data v názvu souboru** (`pentariva-RRRR-MM-DD.dump.age`), ne podle
  mtime — git checkout časy souborů nezachovává. V repu je vždy posledních 30 dumpů.
- **Historie repa neroste:** každou noc se vytvoří orphan větev s jediným commitem
  (aktuální 30denní okno) a force-pushne do `main` — smazané dumpy nezůstávají
  v git historii, velikost repa je omezená ~30× velikost dumpu.
- Guard 80 MB hlídá GitHub limit 100 MB/soubor; při překročení je to signál přesunout
  zálohy mimo git (rozhodnutí Fáze 2, mimo D26).
- **Test obnovy 1× měsíčně** (runbook úloha): stáhnout poslední dump,
  `age -d -i <offline privátní klíč>` → `pg_restore` do lokálního `supabase start`,
  zkontrolovat počet řádků `orders` a invariant Σ kalkulačních `commission_entries`
  = `goods_paid_haleru` na vzorku objednávek.
- Bez offline privátního age klíče jsou zálohy bezcenné — jeho existenci ověřuje
  měsíční test obnovy.

---

## 5. Monitoring (D27)

- **Sentry (free Developer plán, ~5 000 eventů/měsíc):** jeden projekt
  `pentariva-office`. Frontend `@sentry/nextjs` (browser část — funguje se statickým
  exportem). Edge Functions `npm:@sentry/deno` se `SENTRY_DSN` ze supabase secrets;
  chyby ve funkcích `send-email`, `payment-webhook` a v cron jobu
  `settle-commissions` se hlásí povinně. Alert: e-mail na nemecekpetr@gmail.com při
  nové chybě (issue alert „first seen").
- **Supabase logy:** Dashboard → Logs (free retence 1 den) — ad-hoc debugování
  webhooků a funkcí; pravidlo „chybu vyšetřuj tentýž den, jinak ze Sentry".
- **UptimeRobot (free: 50 monitorů, interval 5 min):** 3 monitory —
  `https://office.pentariva.com` (HTTP 200), `https://pentariva.com` (HTTP 200)
  a Edge Function `https://<ref>.functions.supabase.co/health` (provede `select 1`
  přes DB a vrátí 200; zároveň drží free projekt aktivní — Supabase pauzne projekt
  po 7 dnech neaktivity). Alerty na e-mail.
- **Resend dashboard:** týdně zkontrolovat bounce rate; > 2 % řešit ručně (typicky
  překlepy v adresách z registrací). Automatický bounce/complaint webhook je Fáze 2
  (D24).

---

## 6. Měsíční náklady 0 → 100 → 1 000 uživatelů (R9)

Předpoklady: průměrná objednávka 1 000 Kč, ~0,6 objednávky na uživatele měsíčně;
~3 objednávkové e-maily + auth a aktivační e-maily; kurz 23 Kč/USD. Brána: v MVP
Stripe **test mód** (R8, D23) = 0 Kč; kalkulace ostrého provozu počítá se sazbou
1,2 % + 3 Kč/transakce (úroveň Comgate — argument pro swap dle D23; Stripe by byl
~1,5 % + 6,5 Kč). Poplatky brány jsou transakční náklad hrazený z marže (§D
provizního modelu), ne fixní provozní náklad.

| Položka | Start (0 uživ.) | 100 uživ. (~60 obj., GMV 60 000 Kč) | 1 000 uživ. (~600 obj., GMV 600 000 Kč) |
|---|---|---|---|
| Supabase | Free — 0 Kč | Free — 0 Kč | **Pro 25 USD ≈ 575 Kč** |
| Resend | Free — 0 Kč | Free — 0 Kč (~400 e-mailů/měs) | **Pro 20 USD ≈ 460 Kč** (~3 500 e-mailů/měs, denní špičky > 100) |
| Firebase Hosting (2 sites) | 0 Kč (Spark kvóty stačí) | 0 Kč | 0 Kč (statický web hluboko pod kvótou) |
| Domény pentariva.com + .cz | ≈ 60 Kč (roční poplatky /12) | ≈ 60 Kč | ≈ 60 Kč |
| Sentry, UptimeRobot, GitHub (vč. repa záloh) | 0 Kč | 0 Kč | 0 Kč |
| **Fixní náklady celkem** | **≈ 60 Kč** | **≈ 60 Kč** | **≈ 1 095 Kč** |
| Platební brána (test mód / 1,2 % + 3 Kč) | 0 Kč (test) | ≈ 900 Kč | ≈ 9 000 Kč |

**Pravidla upgradu (závazná):**

1. **Supabase Free → Pro (25 USD):** při prvním z: (a) spuštění produkčních plateb
   po vzniku IČO — od chvíle, kdy tečou skutečné peníze, jsou denní zálohy Supabase
   + žádné pauzování projektu povinnost (vlastní zálohy D26 běží dál);
   (b) DB > 400 MB (80 % limitu 500 MB — kontrola měsíčně); (c) Storage > 800 MB.
2. **Resend Free → Pro (20 USD):** jakmile 3 dny po sobě odejde > 80 e-mailů/den,
   nebo měsíční objem překročí 2 500 (80 % limitu). Denní limit 100 je těsnější než
   měsíční — hlídat ten.
3. **Firebase Spark → Blaze:** pro hosting není potřeba; přejít jen pokud by jiná
   sekce vyžadovala službu mimo Spark (aktuálně nic).
4. **Sentry / UptimeRobot / GitHub:** free tier vydrží i na 1 000 uživatelů;
   neupgradovat.

---

## 7. Runbook

### 7.1 Výpadek platební brány

1. **Detekce:** Sentry chyby z funkce vytvářející platbu / `payment-webhook`;
   status page brány. UptimeRobot výpadek třetí strany nezachytí — proto při > 3
   chybách platby za 10 min jednat.
2. **Okamžitě:** v `app_settings` nastavit provozní příznak `payments_degraded =
   true` → UI zobrazí banner „Platby jsou dočasně nedostupné, objednávku uložíme
   a pošleme vám platební odkaz". Objednávky se dál vytvářejí a přecházejí do
   `awaiting_payment` — **nikdy nezavírat objednávkový proces**.
3. **Zakázáno:** ručně přepnout objednávku na `paid`. Stav `paid` + `orders.paid_at`
   smí nastavit výhradně ověřený webhook brány (podpis `GATEWAY_SECRET`, D8);
   deduplikaci zajišťuje unikát `(provider, provider_event_id)` v `payments`.
4. **Po obnovení:** spustit Edge Function `reconcile-payments` — stáhne přes API
   brány transakce za okno výpadku, spáruje s objednávkami a doplní chybějící stavy
   toutéž idempotentní cestou jako webhook. Kupujícím s nezaplacenou objednávkou
   starší 2 h poslat platební odkaz.
5. Vypnout `payments_degraded`, zapsat incident do
   `docs/incidents/RRRR-MM-DD-nazev.md` v repu.

### 7.2 Chybný výpočet provize — oprava ledgeru

Zásada (D2/D4): `commission_entries` je **append-only. NIKDY `UPDATE` částek ani
`DELETE`** — **každá oprava je VŽDY kompenzační záznam**: nový záporný řádek
s `reverses_entry_id` na chybný originál, nebo `adjustment` v `credit_transactions`.
Jen tak sedí auditní stopa s historickými výplatami a e-maily.

1. **Zastavit škody:** `app_settings.payouts_paused = true` (blokuje podání
   i vyřizování `payout_requests`); pokud je chyba v settlementu, pauznout pg_cron
   job `settle-commissions`.
2. **Vymezit rozsah:** SQL dotazem najít dotčené řádky (typicky vše od nasazení
   vadné verze — čas z git tagu deploye); exportovat seznam (příjemce, objednávka,
   chybná částka, správná částka v haléřích).
3. **Nejdřív test, pak fix:** napsat pgTAP test reprodukující chybu (musí selhat),
   opravit `fn_generate_commissions`/`fn_settle_commissions`, test zezelená,
   nasadit přes `deploy-db`.
4. **Kompenzace jednou transakcí, jako SQL migrace v repu** (auditovatelná,
   přehratelná lokálně):
   - **Přeplatek:** k chybnému entry vložit kompenzační záporný řádek ve výši
     rozdílu — `reverses_entry_id = <chybné entry>`, `amount_haleru = −rozdíl`,
     `status = 'available'`, `hold_until = now()`, `reversal_reason = 'Oprava
     výpočtu, incident RRRR-MM-DD'`. Pokud už byl chybný akruál připsán na kredit,
     v téže transakci `credit_transactions` typ `clawback` (−rozdíl,
     `commission_entry_id` = chybné entry). Pozor: `reverses_entry_id` je UNIQUE —
     originál s delta-kompenzací už nejde stornovat podruhé; případná pozdější
     vratka celé objednávky se u takového entry dořeší ručně toutéž technikou.
   - **Nedoplatek:** reversal smí být jen záporný (`chk_amount_sign`)
     a `uq_commission_once` nedovolí druhý originál téhož typu — doplatek se proto
     připisuje jako `credit_transactions` typ `adjustment` (+rozdíl, `note`
     s incidentem). Rozdíl vůči invariantu ledgeru se zdokumentuje v incident
     reportu.
   - Vše zapsat do `audit_log` (akce `commission.corrected`) v téže transakci.
5. **Přeplatky už vyplacené:** zůstatek provizního kreditu smí jít do minusu (D3)
   a započte se proti budoucím akruálům; nad 500 Kč příjemce kontaktovat
   individuálně.
6. **Komunikace:** dotčeným příjemcům poslat vysvětlující e-mail (ruční odeslání
   z office@pentariva.com přes Resend je v MVP v pořádku — mimo šablony §1.5).
   Odemknout výplaty, obnovit cron, sepsat incident.

### 7.3 Únik klíčů

Pořadí rotace (nejcennější první), vše tentýž den:

1. **Supabase secret key (`sb_secret_…`)** — revoke v dashboardu + nový,
   `supabase secrets set` pro funkce. (Proto od začátku nové API klíče: legacy
   `service_role` jde rotovat jen výměnou JWT secretu = odhlášení všech uživatelů.)
2. **Heslo DB** (Settings → Database → Reset password) → aktualizovat
   `SUPABASE_DB_PASSWORD` a `SUPABASE_POOLER_URL` v GitHub secrets.
3. **Resend API klíč** — revoke + nový → `supabase secrets set RESEND_API_KEY`
   + přepsat SMTP heslo v Supabase Auth.
4. **Klíče brány** — regenerovat v administraci brány →
   `supabase secrets set GATEWAY_SECRET`.
5. **Zálohy** — revoke deploy key repa `pentariva-backups` (Settings → Deploy keys)
   + nový do `BACKUPS_DEPLOY_KEY`; při podezření na únik privátního age klíče
   vygenerovat nový pár, nový veřejný klíč do `BACKUP_AGE_RECIPIENT`, starý
   privátní klíč ponechat offline (starší zálohy jím zůstávají čitelné).
6. **Redeploy:** `supabase functions deploy` + nový build webu.
7. **Audit dopadu:** projít Supabase Auth audit log (neznámé adminské účty,
   hromadné čtení), porovnat kontrolní součty `commission_entries` a `orders`
   s poslední zálohou. Při možném úniku osobních údajů běží **72hodinová lhůta
   pro ohlášení ÚOOÚ (GDPR čl. 33)** — rozhodnout a zdokumentovat tentýž den.
8. Incident zapsat; ověřit zapnutý secret scanning + push protection v obou repech.
