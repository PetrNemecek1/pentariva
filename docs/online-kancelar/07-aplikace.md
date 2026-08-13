# 07 — Architektura aplikace (office.pentariva.com)

> Závazný dokument pro implementaci Next.js aplikace Online kanceláře. Podřizuje se
> kontraktu `02-technicka-rozhodnuti.md` (D1–D34) a kanonickému schématu
> `04-datovy-model.md` — všechny názvy tabulek, sloupců, ENUMů a funkcí v tomto
> dokumentu jsou PŘEVZATY odtud a nesmí se přejmenovávat. Peníze na halíř dle
> `03-provizni-pravidla-zdroj.md`.

Aplikace žije v **samostatném repozitáři `pentariva-office`** (D28). Přebírá brand
z marketingového webu (repo `pentariva`): soubor `app/globals.css` s oklch tokeny
(forest/forest-deep/forest-soft, gold/gold-soft/gold-deep, ivory/ivory-warm, ink, cream)
a fonty Cormorant Garamond + Inter se **zkopírují 1:1** — žádný sdílený balíček, žádný
monorepo overhead; brand tokeny se mění jednou za rok, kopie je levnější než tooling.

## 1. Struktura repozitáře

Optimalizováno pro AI údržbu (R10): každá funkční oblast je samostatný modul ve
`features/`, route soubory v `app/` jsou tenké (jen import z features), veškerá peněžní
logika je v Postgresu (adresář `supabase/`, D22).

```
pentariva-office/
├── CLAUDE.md                     # pravidla pro AI (obsah viz §8)
├── README.md                     # setup: env, supabase link, deploy
├── package.json
├── next.config.ts                # output:'export', trailingSlash:true, images:{unoptimized:true}
├── firebase.json                 # hosting target "office", cache headers
├── .firebaserc                   # projekt pentariva-web, target office → site pentariva-office
├── tsconfig.json                 # paths: @/* → ./, @shared/* → supabase/functions/_shared/*
├── postcss.config.mjs            # @tailwindcss/postcss (Tailwind 4, bez tailwind.config)
├── components.json               # shadcn/ui konfigurace (cssVariables: true)
├── vitest.config.ts
├── .env.local.example            # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
│
├── app/                          # POUZE routing — page.tsx je 3řádkový re-export z features
│   ├── globals.css               # brand tokeny zkopírované z repa pentariva
│   ├── layout.tsx                # fonty (next/font), QueryClientProvider, Toaster
│   ├── (verejne)/                # bez auth guardu
│   │   ├── prihlaseni/page.tsx
│   │   ├── registrace/page.tsx   # čte ?kod= a ?typ=b2b přes useSearchParams (v <Suspense>)
│   │   ├── zapomenute-heslo/page.tsx
│   │   └── reset-hesla/page.tsx
│   ├── (aplikace)/               # layout.tsx = <AuthGuard> + <AppShell> (sidebar, topbar)
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── obchod/page.tsx       # katalog; detail produktu = dialog, ne samostatná routa
│   │   ├── kosik/page.tsx
│   │   ├── pokladna/page.tsx
│   │   ├── pokladna/vysledek/page.tsx   # návratová URL z platební brány (?order=...)
│   │   ├── objednavky/page.tsx   # detail přes ?id=
│   │   ├── zakaznici/page.tsx    # CRM ambasadora; detail přes ?id=
│   │   ├── muj-odkaz/page.tsx    # osobní link, QR, produktové linky
│   │   ├── provize/page.tsx      # dostupný vs čekající kredit (R12) + ledger
│   │   ├── vyplaty/page.tsx      # žádosti o výplatu na účet (payout_requests)
│   │   ├── reporty/page.tsx      # D31: osobní výkon, CSV export
│   │   ├── akademie/page.tsx     # moduly/lekce přes ?modul= a ?lekce=; kvíz Modulu 1 (D34)
│   │   └── ucet/page.tsx         # profil, osobní cíl (profiles.monthly_goal_haleru)
│   └── admin/                    # layout.tsx = <RoleGuard role="admin">
│       ├── layout.tsx
│       ├── page.tsx              # přehled (obraty, provizní náklady, počty)
│       ├── uzivatele/page.tsx    # role, deaktivace, root ambasador, schvalování ambassador_applications
│       ├── produkty/page.tsx
│       ├── objednavky/page.tsx   # přehled, stavy, vratka (fn_refund_order), CSV export
│       ├── provize/page.tsx      # ledger, storna, leadership pool (fn_allocate_leadership)
│       ├── vyplaty/page.tsx      # zpracování payout_requests
│       ├── b2b/page.tsx          # pipeline board b2b_companies + schvalování B2B registrací + Trade úrovně
│       ├── akademie/page.tsx     # správa modulů, lekcí a kvízových otázek
│       └── nastaveni/page.tsx    # app_settings, commission_rates, trade_level_params
│
├── features/                     # 1 modul = 1 doména; NIC se neimportuje napříč features
│   ├── auth/                     # LoginForm, RegisterForm (zákazník + B2B), AuthGuard, RoleGuard;
│   │   │                         #   hooks/useSession, useRole; api.ts; schemas.ts
│   ├── dashboard/                # karty per role, GoalCard (D32), hooks/useDashboardStats
│   ├── shop/                     # ProductGrid, ProductDialog, CartDrawer; hooks/useCart (React context + localStorage)
│   ├── orders/                   # OrderTable, OrderDetail; api.ts (jen SELECT — vznik objednávky dělá Edge Function checkout)
│   ├── referrals/                # ReferralLinkCard, QrCode (balíček `qrcode`, žádné externí API), ProductLinkList
│   ├── commissions/              # CreditOverviewCards (R12), LedgerTable, PayoutRequestForm, PayoutHistory
│   ├── reports/                  # D31: PersonalPerformance, MonthlyTurnoverTable, CsvExportButton
│   ├── crm/                      # CustomerTable, CustomerDetail, NotesPanel (crm_notes), InterestTags (customer_interest_tags)
│   ├── academy/                  # ModuleList, LessonView, ProgressBadge, QuizRunner (D34), AmbassadorApplicationCta (D11)
│   ├── b2b/                      # PipelineBoard (b2b_pipeline dle §6), CompanyCard, ActivityLog (b2b_activities)
│   └── admin/                    # podsložka per admin obrazovka; smí importovat api ostatních features
│       └── <oblast>/components + api.ts
│
├── components/
│   ├── ui/                       # shadcn/ui generované komponenty (button, card, dialog, table, form, ...)
│   └── layout/                   # AppShell, Sidebar, Topbar, PageHeader, EmptyState
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # createClient<Database>(URL, ANON_KEY) — jediná instance
│   │   └── database.types.ts     # GENEROVANÝ soubor (npm run db:types), needitovat ručně
│   ├── money/
│   │   ├── money.ts              # formatHaleru, parseKcToHaleru — JEN zobrazení a parsování formulářů
│   │   └── money.test.ts
│   ├── query/
│   │   ├── client.ts             # QueryClient (staleTime 30 s, retry 1)
│   │   └── keys.ts               # centrální queryKey factory: keys.orders.list(userId) atd.
│   └── utils.ts                  # cn() a drobnosti
│
├── supabase/
│   ├── config.toml
│   ├── migrations/               # výhradně `supabase migration new <nazev>`; nikdy needitovat aplikované
│   ├── seed.sql                  # testovací uživatelé + produkty pro lokální vývoj
│   ├── tests/                    # pgTAP testy peněžních funkcí (zlaté worked examples z 03, D25)
│   └── functions/
│       ├── _shared/
│       │   ├── schemas/          # zod schémata sdílená app ↔ functions (checkout, payout, register)
│       │   └── gateway/          # adaptér PaymentProvider (D23) — jediné místo, kde se mění brána
│       ├── register/             # registrace: zákazník s atribucí / B2B žádost (viz §3)
│       ├── checkout/             # validace košíku PROTI DB cenám, vznik objednávky, payment session
│       ├── payment-webhook/      # potvrzení platby → orders.paid_at + fn_generate_commissions
│       ├── request-payout/       # žádost o výplatu (payout_requests, min. částka z app_settings)
│       └── settle/               # scheduled (denní cron) → fn_settle_commissions
│
└── e2e/                          # Playwright: smoke test login → nákup → provize v commission_entries
```

**Sdílení zod schémat:** schémata, která validují i Edge Functions, leží
v `supabase/functions/_shared/schemas/` (functions musí být samonosné). Aplikace je
importuje přes alias `@shared/*`; v Deno se `zod` mapuje přes
`supabase/functions/deno.json` → `{"imports": {"zod": "npm:zod@4"}}`, v aplikaci je
normální npm závislost. Jedna definice, dvě runtime.

**Závislosti (MVP, nic navíc):** `next@^16`, `react@^19`, `tailwindcss@^4`,
`@supabase/supabase-js@^2`, `@tanstack/react-query@^5`, `react-hook-form@^7`,
`@hookform/resolvers`, `zod@^4`, `lucide-react`, `qrcode`, shadcn/ui (kopíruje kód, není
runtime závislost), dev: `vitest`, `@playwright/test`, `supabase` CLI, `firebase-tools`.

## 2. Rendering strategie — rozhodnutí: plný static export

**Rozhodnutí (D28): `output: 'export'` + client-side Supabase, hosting na stávajícím
Firebase Hostingu** (druhý hosting site `pentariva-office` ve stejném projektu
`pentariva-web`, custom doména office.pentariva.com). Zdůvodnění: 0 Kč a nulový
server-ops (free tier Firebase + free tier Supabase, R9), přičemž veškerá citlivá logika
stejně žije v Postgresu (RLS, SECURITY DEFINER funkce) a Edge Functions — Next.js server
by nepřidal žádnou bezpečnostní hodnotu; SEO je u přihlášené aplikace irelevantní.

Závazné důsledky, se kterými implementace musí počítat:

1. **RLS je jediná skutečná bezpečnostní hranice (D22).** Client-side
   `AuthGuard`/`RoleGuard` jsou pouze UX (přesměrování na /prihlaseni, skrytí menu) —
   obejít je umí každý, kdo otevře DevTools. Proto: každá tabulka má RLS zapnuté, anon
   key je z principu veřejný, `service_role` klíč se NIKDY nedostane do Next.js kódu
   (žije jen v secrets Edge Functions).
2. **Žádné API routes, žádné server components s daty, žádný middleware.** Všechny
   stránky jsou client components (`"use client"`) nad statickou skořápkou. Server-side
   operace = Supabase Edge Functions.
3. **Žádné dynamické segmenty** (`[id]` vyžaduje `generateStaticParams`, což u DB dat
   nejde). Konvence: **detail = query param** (`/objednavky?id=…`, `/registrace?kod=…`),
   čtený přes `useSearchParams` v komponentě obalené `<Suspense>`.
4. **Platební webhooky jdou do Supabase Edge Functions**, ne do Next.js — brána volá
   `https://<projekt>.supabase.co/functions/v1/payment-webhook`.
5. `next.config.ts`: `trailingSlash: true` (export vytváří `slozka/index.html`, což
   Firebase Hosting servíruje nativně) a `images: { unoptimized: true }`.
6. Auth stav se řeší přes `supabase.auth.onAuthStateChange` (přihlášení e-mail+heslo
   i magic link, D21); při načtení chráněné stránky se zobrazí brandovaný splash loader,
   dokud není session ověřena (žádný FOUC s cizími daty — data se bez session vůbec
   nefetchují).
7. **Supabase Realtime se v MVP nepoužívá** (notifikační mechanismy nejsou v MVP, D30).
   Data se obnovují výhradně refetchem TanStack Query (staleTime 30 s + invalidace po
   mutacích + refetchOnWindowFocus). Žádné realtime badge, žádné channels.
8. Deploy = `npm run build && firebase deploy --only hosting:office`. Rollback =
   redeploy předchozího commitu.

## 3. Registrace a vznik rolí (D11, D14)

Registrační stránka je jedna: `/registrace`, varianty řídí query parametry.

1. **Zákazník přes referral link** (`/registrace?kod=X`): registrace přes doporučovací
   link vytváří **VŽDY zákazníka** (`role='customer'`) — nikdy přímo ambasadora. Edge
   Function `register` rozřeší kód přes `referral_codes` (citext, case-insensitive),
   nastaví `profiles.owner_ambassador_id` na vlastníka kódu (trvalá atribuce, sponzorem
   se stane až při případném povýšení), `registration_source='referral'` a zapíše
   `referral_events` s `kind='registration'`. Kód je ve formuláři předvyplněný
   a uzamčený, fallback z cookie `pnt_ref` (viz §6).
2. **Organický zákazník** (bez kódu): `role='customer'`, `owner_ambassador_id` NULL,
   `registration_source='organic'`. Jeho nákupy jsou `business_flow='organic'` (jen 3%
   klubový kredit).
3. **Povýšení na ambasadora (D11)** — jediná cesta, jak ambasador vzniká samoobslužně:
   zákazník složí **kvíz Modulu 1 akademie na ≥ 80 %** (viz §7.10), odsouhlasí podmínky,
   potvrdí 18+ a odešle žádost → řádek v `ambassador_applications`
   (`status='requested'`). **Admin schvaluje**; schválení přes SECURITY DEFINER funkci
   (viz `04-datovy-model.md` §2.14) nastaví `profiles.role='ambassador'` a překlopí
   `owner_ambassador_id → sponsor_id` (dosavadní ambasador = sponzor, trigger dopočítá
   `path`/`depth`). Root ambasadory zakládá výhradně admin (`is_network_root`).
   **Žádný „pozvánkový link rovnou do role ambasador" neexistuje.**
4. **B2B samoobslužná registrace (D14)** (`/registrace?typ=b2b`): formulář s údaji firmy
   (název, segment dle číselníku `b2b_companies.segment`, kontakt). Edge Function
   `register` vytvoří účet + řádek `b2b_companies` s `profile_id`,
   `pipeline_status='new_contact'` a `approved_at=NULL` — účet je ve stavu **„čeká na
   schválení"**: po přihlášení vidí B2B žadatel na dashboardu stavovou obrazovku „Vaše
   registrace čeká na schválení" a do té doby může nakupovat jen jako běžný zákazník
   (plná cena, `organic`). Schválení adminem (`/admin/b2b`) založí `trade_partners`
   (úroveň + získavatel) a přepne `profiles.role='trade_partner'`.
5. Role `mentor`/`leader` v ENUMu existují, ale v MVP se chovají jako `ambassador`
   (žádné vlastní routy, Fáze 2 přidá `/tym`). Roli `b2b_manager` v MVP vykonává admin
   (D10) — pipeline UI proto žije pod `/admin/b2b`.

## 4. Routing mapa per role

Po přihlášení vždy redirect na `/dashboard`. Sloupec „ambassador" platí i pro
`mentor`/`leader`.

| Cesta | customer | ambassador | trade_partner | admin | Poznámka |
|---|---|---|---|---|---|
| `/prihlaseni`, `/registrace`, `/zapomenute-heslo`, `/reset-hesla` | veřejné | veřejné | veřejné | veřejné | `/registrace?kod=X` (zákazník) nebo `?typ=b2b` (B2B žádost, §3) |
| `/dashboard` | ✓ | ✓ | ✓ | ✓ | obsah per role (§7.2–7.3), karta osobního cíle (D32) |
| `/obchod`, `/kosik`, `/pokladna`, `/pokladna/vysledek` | ✓ | ✓ | ✓ | ✓ | ceny per role z DB: katalogová / partnerská (70 %) / Trade dle `trade_level_params` (platí 70/65/60 %) |
| `/objednavky` | ✓ | ✓ | ✓ | ✓ | vlastní objednávky; ambasador vidí i objednávky svých zákazníků (RLS) |
| `/zakaznici` | — | ✓ | — | ✓ | CRM zákazníků (§4 zadání; `crm_notes`, `customer_interest_tags`) |
| `/muj-odkaz` | — | ✓ | — | ✓ | osobní link, QR, produktové linky (`referral_codes`) |
| `/provize` | — | ✓ | — | ✓ | DVĚ čísla dle R12: dostupný + čekající kredit s datem aktivace (§7.8); zákazník provize nemá — jeho klubový kredit (rovněž obě čísla) je na dashboardu |
| `/vyplaty` | — | ✓ | — | ✓ | žádost o výplatu provizního kreditu (`payout_requests`); klubový kredit vyplatit nelze |
| `/reporty` | — | ✓ | — | ✓ | **D31: osobní výkon, zákazníci, objednávky, CSV export** (§7.9) |
| `/akademie` | ✓ | ✓ | ✓ | ✓ | moduly/lekce; **kvíz Modulu 1** (D34) — vstup do povýšení (D11) |
| `/ucet` | ✓ | ✓ | ✓ | ✓ | profil, změna hesla, **osobní měsíční cíl** (`profiles.monthly_goal_haleru`, D32) |
| `/admin/**` | — | — | — | ✓ | viz strom v §1; obsahuje i B2B pipeline a admin CSV exporty (D31) |

## 5. Datová vrstva

- **Klient:** jediná instance `createClient<Database>(...)` v `lib/supabase/client.ts`.
  Komponenty NIKDY nevolají supabase přímo — jen přes funkce ve `features/*/api.ts`
  (AI pak ví, kde hledat každý dotaz).
- **Typy z DB:** `npm run db:types` = `supabase gen types typescript --linked >
  lib/supabase/database.types.ts`. Spouští se po každé migraci a soubor se commituje —
  typová chyba v CI odhalí drift mezi schématem a kódem.
- **TanStack Query v5:** veškeré čtení přes `useQuery` s klíči výhradně z factory
  `lib/query/keys.ts` (např. `keys.commissions.overview(userId)`); mutace invalidují
  přes tutéž factory. Default `staleTime: 30_000`, `retry: 1`. Žádný Realtime (§2.7).
- **Čtení peněz = kanonické views** (`04-datovy-model.md` §3): zůstatky
  z `v_credit_overview` (dostupné + čekající + datum aktivace, R12), dashboard
  z `v_ambassador_dashboard`, reporty z `v_monthly_personal_turnover`. Klient nikdy
  nesčítá `credit_transactions` ani `commission_entries` sám.
- **Zápisy s dopadem na peníze** (checkout, žádost o výplatu, registrace s atribucí,
  vyhodnocení kvízu) jdou výhradně přes Edge Functions / `rpc()` na SECURITY DEFINER
  funkce (D22). Klient posílá u checkoutu **jen `product_id` + `quantity` + požadované
  čerpání kreditu** — ceny, slevy, dopravu (`app_settings`) a provize počítá DB
  z vlastních dat (`fn_validate_order_pricing`); částka z klienta se nikdy nepřijímá.
  Čerpání kreditu (`credit_transactions` typ `spend` se `spent_on_order_id`) zapisuje DB
  při zaplacení — detail v `05-provizni-engine.md`.
- **Formuláře:** react-hook-form + `zodResolver`. Schéma je jediný zdroj pravdy: totéž
  zod schéma validuje formulář v prohlížeči i payload v Edge Function (import
  z `@shared/schemas`). Peněžní vstupy se parsují `parseKcToHaleru()` („1 234,50 Kč" →
  `123450` haléřů, integer) — do API nikdy neodchází float.
- **Peníze:** všechny částky v celé aplikaci i DB jsou **integer haléře** (BIGINT,
  sloupce se sufixem `_haleru`, např. `paid_money_haleru`, `goods_paid_haleru`), sazby
  v basis pointech (`_bp`, D19). Zaokrouhlení HALF-UP probíhá **výhradně v DB** jedinou
  funkcí `fn_pct_haleru` (D5); `lib/money` slouží jen k formátování a parsování.
  Testy v `lib/money` i pgTAP zrcadlí závazný worked example z 03: katalog 100 000 h →
  sleva 30 % = 30 000 h; generace 15/6/4 % ze 70 000 h = 10 500 / 4 200 / 2 800 h;
  leadership 2 % = 1 400 h; `company_margin` = 51 100 h.

## 6. Veřejná část: `/r/[kod]` na marketing webu (D29)

**Jediná úprava stávajícího repa `pentariva`** (D29): statická routa `/r/[kod]`, která
uloží kód a přesměruje na registraci v office.

1. Statický soubor **`public/r/index.html`** — čisté HTML + inline JS v brand stylu (bez
   Next hydratace). Do `firebase.json` marketing webu se přidá rewrite
   `{"source": "/r/**", "destination": "/r/index.html"}`.
2. Skript: z `location.pathname` vyparsuje kód (validace dle D12:
   `/^[a-z0-9]{6,12}$/i`, jinak redirect na homepage), přes Supabase REST (anon key)
   rozřeší kód v `referral_codes` (citext, `is_active`) a zapíše klik do
   `referral_events` (`kind='click'`, `visitor_hash` = hash IP+UA bez PII; RLS povoluje
   anonu právě tento INSERT a SELECT aktivních kódů — fire-and-forget, chyba logování
   neblokuje redirect).
3. **Atribuce:** nastaví cookie `pnt_ref={kod}; Domain=.pentariva.com; Max-Age=2592000;
   Secure; SameSite=Lax` (30denní okno, **last-touch** — novější kód přepisuje starší)
   a přesměruje na `https://office.pentariva.com/registrace?kod={kod}`. Registrace čte
   kód primárně z query, fallback z cookie; Edge Function `register` uloží
   `owner_ambassador_id` do profilu **trvale** — od té chvíle patří všechny objednávky
   zákazníka jeho ambasadorovi, cookie už nehraje roli. Už přihlášeného uživatele
   `/registrace` přesměruje na `/obchod` (atribuce existujícího účtu se linkem nemění).
4. **Produktové linky (D12):** produktový link = samostatný řádek `referral_codes`
   s vyplněným `product_id` (žádný `?p=` parametr). Nese-li kód `product_id`, předá se
   po registraci/přihlášení do `/obchod?produkt={product_id}` (otevřený detail-dialog).

Registrace přes `/r/[kod]` vytváří vždy zákazníka (§3.1). Odměna zákazníka za sdílení
linku v MVP **není** (D30) — finální provizní model žádnou zákaznickou odměnu
nedefinuje; připraví se až s Benefit club vrstvou ve Fázi 2.

## 7. UI: shadcn/ui + brand, seznam MVP obrazovek

shadcn/ui se inicializuje s `cssVariables: true` a namapuje na zkopírované tokeny
(`--primary` = forest, `--accent` = gold, `--background` = ivory, radius 0.5rem — vše už
v `globals.css` marketing webu, včetně dark varianty forest-deep). Fonty přes
`next/font/google`: Inter (UI, čísla) a Cormorant Garamond (nadpisy). Žádné vlastní
barvy mimo tokeny.

MVP obrazovky (kompletní výčet, nic dalšího se v MVP nestaví; nic z D30 se nestaví):

1. **Přihlášení / Registrace / Reset hesla** — přihlášení e-mail+heslo i magic link
   (D21); registrace dle §3: e-mail+heslo, jméno, telefon, souhlas s podmínkami;
   předvyplněný a uzamčený doporučující kód, je-li v query/cookie; přepínač „Registrace
   pro firmy (B2B)" = varianta `?typ=b2b`.
2. **Dashboard ambasadora** (data: `v_ambassador_dashboard`; přesně dle §3 zadání,
   př. „ROMAN: obrat 120 000 Kč, provize 8 500 Kč, 32 zákazníků, 4 noví"):
   karta *Měsíční obrat* (`turnover_month_haleru` — zaplacené objednávky mých zákazníků
   + moje vlastní `community_own`); **karta *Osobní cíl* (D32)** — progress bar
   `turnover_month_haleru / profiles.monthly_goal_haleru` s textem „Splněno X %
   měsíčního cíle, chybí Y Kč"; není-li cíl nastaven, karta vede na `/ucet`;
   karta *Provize* — dvě čísla dle R12 (`commission_pending_haleru` +
   `commission_credit_haleru`); karta *Zákazníci* (celkem + noví tento měsíc);
   blok *Nové objednávky* (posledních 5, obnovuje se refetchem — žádný realtime badge);
   blok *Můj odkaz* (kopírovat + QR + tlačítko na `/muj-odkaz`); *Další krok* — v MVP
   statické doporučení vázané na stav (nemá zákazníka → lekce „První zákazník";
   AI doporučení až Fáze 3).
3. **Dashboard zákazníka**: klubový kredit **dvěma čísly dle R12** — *dostupný*
   a *čekající na aktivaci s datem* (`v_credit_overview`, kind `club`); poslední
   objednávky; odkaz do akademie s CTA „Staň se ambasadorem" (vede na Modul 1).
   **Dashboard Trade partnera**: jeho úroveň a sleva (`trade_partners` +
   `trade_level_params`), poslední objednávky, tlačítko „objednat znovu"; neschválený
   B2B žadatel zde vidí stav „čeká na schválení" (§3.4). **Dashboard admina**: celkový
   obrat, provizní náklady, počty aktivních uživatelů, čekající žádosti (ambasadoři,
   B2B, výplaty).
4. **Obchod** — grid produktů (foto, název, cena v roli uživatele z `v_current_prices`,
   resp. Trade výpočet z `trade_level_params`), detail v dialogu, přidání do košíku.
   **Košík / Pokladna** — dodací údaje, souhrn dle kanonického vzorce D7 (zboží − sleva
   + doprava − kredit = k úhradě), pole **„Uplatnit kredit"** (max. dostupný kredit
   a zároveň max. hodnota zboží — doprava se platí vždy penězi, D6; doprava 99 Kč /
   zdarma od 1 500 Kč z `app_settings`, R14), tlačítko „Zaplatit" → redirect na bránu
   (Stripe test mód, D23). **Výsledek platby** — polling stavu objednávky (zaplaceno
   potvrzuje výhradně webhook → `orders.paid_at`, nikdy návratová URL).
5. **Objednávky** — tabulka (číslo, datum, stav dle `order_status`, částka), detail
   s položkami (`order_items`, vč. dárků `is_gift`); ambasador přepínač „moje / mých
   zákazníků".
6. **Zákazníci (CRM)** — tabulka dle §4 zadání: kontakt, datum registrace, poslední
   objednávka, celkový obrat, počet objednávek; detail s historií objednávek, poznámkami
   (`crm_notes`) a tagy zájmových okruhů (`interest_tags` ⟷ `customer_interest_tags`:
   spánek, stres, imunita, …).
7. **Můj odkaz** — osobní link `pentariva.com/r/{kod}` s copy tlačítkem, QR ke stažení,
   generátor produktových linků (= nový řádek `referral_codes` s `product_id`, D12),
   čítač konverzí z `referral_events`: kliky, registrace, obrat přivedených zákazníků.
8. **Provize** (`/provize`) — nahoře **DVĚ čísla dle R12** z `v_credit_overview` (kind
   `commission`): karta *Dostupný kredit* (`available_haleru`) a karta *Čeká na
   aktivaci* (`pending_haleru` + „aktivace nejblíže {next_activation_at}" = paid_at +
   15 dní); pod tím souhrn výplat (požádáno/vyplaceno z `payout_requests`) a ledger
   tabulka z `commission_entries` (datum, objednávka, typ — osobní 20 % / generace
   15–6–4 % / Trade 10–8–5 % / leadership alokace / storno, částka, stav
   `pending|available|reversed`, důvod storna).
9. **Reporty** (`/reporty`, **D31**) — osobní výkon ambasadora: měsíční řady obratu
   a objednávek (`v_monthly_personal_turnover`), souhrn zákazníků a provizí
   (`v_ambassador_dashboard`, `v_credit_overview`) a tabulka objednávek (`orders`)
   s filtrem období. Každá tabulka má tlačítko **Export CSV** (generuje klient
   z načtených dat, Blob + download; UTF-8 s BOM kvůli Excelu). Žádné vlastní agregační
   tabulky — čte se výhradně z kanonických views. Admin exporty (všechny objednávky,
   provize, výplaty) jsou na příslušných `/admin/*` obrazovkách stejným mechanismem.
   Report builder v MVP není (D30).
10. **Akademie** — seznam modulů (`academy_modules`; MVP naplní Modul 1 „Start"), lekce
    = video (Supabase Storage) + text (`academy_lessons.body_md`), dokončení lekce se
    zapisuje do `academy_progress`. **Kvíz Modulu 1 (D34):** po dokončení lekcí se
    odemkne QuizRunner — otázky z `academy_quiz_questions` (klient NIKDY nečte
    `correct_index`; vyhodnocení dělá SECURITY DEFINER funkce přes `rpc()`, výsledek =
    `academy_quiz_attempts` se `score_bp`, `passed` při ≥ 80 %). Počet pokusů
    neomezen. **U Modulu 1 neexistuje žádné ruční „označit dokončeno" — modul je splněn
    výhradně složeným kvízem.** Po `passed` pokusu se zákazníkovi zobrazí CTA „Požádat
    o povýšení na ambasadora" (souhlas s podmínkami + potvrzení 18+ →
    `ambassador_applications`, D11) a stav žádosti (čeká na schválení / schváleno /
    zamítnuto).
11. **Účet** — profil (jméno, telefon, adresa), změna hesla, **osobní měsíční cíl v Kč**
    (zapisuje `profiles.monthly_goal_haleru`, parsování přes `parseKcToHaleru`; D32 —
    v MVP si ho nastavuje uživatel sám).
12. **Admin obrazovky** — dle stromu v §1: uzivatele (role, deaktivace, založení root
    ambasadora, schvalování `ambassador_applications`), produkty (CRUD nad `products` +
    `product_prices`, foto do Storage), objednavky (přehled, ruční stavy dle
    `order_status_transitions`, vratka celé objednávky přes `fn_refund_order`, CSV
    export), provize (ledger, ruční alokace leadership poolu přes
    `fn_allocate_leadership`, přehled poolu), vyplaty (schválení/zamítnutí/označení
    `paid` u `payout_requests`, CSV export příkazů), b2b (pipeline board
    `b2b_companies` + aktivity `b2b_activities` + schvalování samoobslužných registrací
    a nastavení Trade úrovní — založení `trade_partners`), akademie (CRUD modulů, lekcí
    a kvízových otázek), nastaveni (editace `app_settings`, `commission_rates`,
    `trade_level_params` — sazby se nikdy nehardcodují v TS; každá změna se audituje).

## 8. CLAUDE.md pro repo pentariva-office (závazný obsah)

```markdown
# CLAUDE.md — pentariva-office

Online kancelář PENTARIVA. Next.js 16 static export + Supabase. Provozní jazyk UI: čeština.
Zdroje pravdy: docs/online-kancelar v repu pentariva — 02 (kontrakt D1–D34),
04 (kanonické schéma), 03 (provizní model na halíř).

## Nepřekročitelná pravidla

1. PENÍZE: všechny částky jsou integer haléře (BIGINT, sloupce `*_haleru`), sazby basis
   pointy (`*_bp`). Nikdy float, nikdy Kč jako číslo. Zaokrouhlení HALF-UP výhradně
   v DB funkcí fn_pct_haleru. Výpočty provizí, slev a cen probíhají VÝHRADNĚ v Postgres
   funkcích — nikdy v TypeScriptu. lib/money slouží jen k formátování a parsování.
2. PENĚŽNÍ LOGIKA SE MĚNÍ JEN MIGRACÍ DB FUNKCÍ: jakákoli změna peněžního chování
   (fn_generate_commissions, fn_settle_commissions, fn_refund_order,
   fn_allocate_leadership, fn_validate_order_pricing, fn_pct_haleru) = nová migrace
   v supabase/migrations. Zákaz implementovat či obcházet peněžní logiku v TypeScriptu
   nebo Edge Functions. ZLATÉ TESTY (pgTAP fixtures se závazným worked example z 03)
   MUSÍ PROJÍT — bez zeleného `supabase test db` se změna peněz nesmí commitnout.
3. LEDGER: commission_entries a credit_transactions jsou append-only. Zákaz
   UPDATE/DELETE — storno = nový záporný řádek s reverses_entry_id (dělá výhradně
   fn_refund_order). Klient do ledgeru NIKDY nezapisuje (RLS: jen SELECT vlastních
   řádků); zapisují jen SECURITY DEFINER funkce.
4. SCHÉMA DB: každá změna = `supabase migration new <nazev>` + commit. Zákaz úprav přes
   Supabase dashboard, zákaz editace již aplikovaných migrací. Po migraci vždy
   `npm run db:types` a commitnout database.types.ts (needitovat ručně).
5. TEST-FIRST U PENĚZ: před změnou peněžní logiky napiš/uprav pgTAP test v supabase/tests
   (závazný fixture: katalog 100 000 h → sleva 30 000; 15/6/4 % ze 70 000 h =
   10 500/4 200/2 800; leadership 2 % = 1 400; company_margin = 51 100) a vitest
   v lib/money. `npm test` musí projít před commitem.
6. BEZPEČNOST: RLS na každé tabulce, bez výjimky. service_role klíč nikdy v Next.js kódu
   ani v NEXT_PUBLIC_* proměnných. Checkout přijímá jen product_id + quantity + čerpání
   kreditu — částky z klienta se ignorují. Client-side guardy jsou UX, ne bezpečnost.
   correct_index kvízových otázek se ke klientovi nikdy nedostane.
7. STATIC EXPORT: žádné API routes, server actions, middleware ani dynamické segmenty.
   Detaily přes query param (?id=), useSearchParams vždy v <Suspense>. Server logika
   patří do supabase/functions. Žádný Supabase Realtime (D30).
8. STRUKTURA: routy v app/ jsou tenké re-exporty. Logika ve features/<domena>/
   (components, hooks, api.ts, schemas.ts). Features se nesmí importovat navzájem
   (výjimka: admin smí api ostatních). Supabase se volá jen z api.ts. Query klíče jen
   z lib/query/keys.ts. Zod schémata sdílená s Edge Functions žijí
   v supabase/functions/_shared/schemas (@shared/*).
9. KONVENCE: komponenty PascalCase.tsx, hooky useX.ts, DB anglicky snake_case, routy
   česky kebab-case. Barvy jen přes tokeny v globals.css (forest/gold/ivory), komponenty
   shadcn/ui. Sazby a provozní konstanty se čtou z commission_rates, trade_level_params
   a app_settings — nikdy se nehardcodují. Zůstatky kreditu se čtou jen
   z v_credit_overview / v_credit_balances, nikdy se nesčítají v klientovi.

## Příkazy
- npm run dev              # lokálně proti `supabase start` (lokální stack)
- npm run build            # statický export do out/
- npm test                 # vitest + `supabase test db` (pgTAP — zlaté testy provizí)
- npm run db:types         # supabase gen types typescript --linked > lib/supabase/database.types.ts
- npm run db:new -- <n>    # nová migrace
- npm run db:reset         # supabase db reset (lokálně, aplikuje migrace + seed)
- npm run deploy           # build + firebase deploy --only hosting:office
- supabase functions deploy <fn>

## Prostředí
- Supabase projekt: <doplnit ref>; Firebase projekt pentariva-web, hosting target office.
- Platební brána Stripe v TEST módu do vzniku IČO (R8, D23). Adaptér brány jen
  v supabase/functions/_shared/gateway/ — jediné místo pro případný swap na Comgate.
```
