# 06 — Bezpečnost: Auth, role, RLS, GDPR a audit

> Závazná specifikace. Veškeré názvy tabulek, sloupců, ENUMů a stavů přebírá
> z kanonického schématu `04-datovy-model.md` (D1) — tento dokument **nedefinuje žádné
> vlastní CREATE TABLE ani CREATE TYPE**, pouze RLS politiky, GRANTy, triggery a
> SECURITY DEFINER funkce bezpečnostní vrstvy. Peněžní funkce
> (`fn_generate_commissions`, `fn_settle_commissions`, `fn_allocate_leadership`,
> `fn_refund_order`, `fn_admin_change_sponsor`, `fn_validate_order_pricing`,
> `fn_upline`, `fn_pct_haleru`) jsou definované v `04-datovy-model.md` a tady se na ně
> jen odkazuje. Precedence dle `02-technicka-rozhodnuti.md`.
>
> Kanonické tabulky (jiné neexistují): `app_settings`, `commission_rates`,
> `trade_level_params`, `profiles`, `referral_codes`, `referral_events`, `products`,
> `product_prices`, `trade_partners`, `orders`, `order_items`,
> `order_status_transitions`, `payments`, `order_refunds`, `commission_entries`,
> `credit_transactions`, `payout_requests`, `crm_notes`, `interest_tags`,
> `customer_interest_tags`, `b2b_companies`, `b2b_activities`, `academy_modules`,
> `academy_lessons`, `academy_progress`, `academy_quiz_questions`,
> `academy_quiz_attempts`, `ambassador_applications`, `milestone_gifts`, `audit_log`.

---

## 1. Supabase Auth — konfigurace a registrační tok

### 1.1 Závazná konfigurace projektu

| Položka | Hodnota | Zdůvodnění |
|---|---|---|
| Region Supabase | **eu-central-1 (Frankfurt)** | GDPR — data v EU, žádný transfer mimo EHP. |
| Přihlášení | E-mail + heslo **a zároveň** magic link (Email OTP) — **magic link je POVOLEN** | D21. Magic link snižuje tření u zákazníků; bezpečnost drží RLS, ne způsob přihlášení. |
| Potvrzení e-mailu | **Povinné** (Confirm email ON) | Unikátní ověřený e-mail = součást MVP anti-abuse (§6). |
| Min. délka hesla | 12 znaků + Leaked password protection (HIBP) ON | Levná ochrana zdarma. |
| Secure email change | ON (double confirm) | Chrání převzetí účtu s provizním zůstatkem. |
| MFA | TOTP zapnuto; **pro admin povinné** (vynuceno v `is_admin()`, §2.2) | Admin vidí vše — druhý faktor je nutnost. |
| JWT expiry / refresh | 3600 s, rotace refresh tokenů ON | Claim slouží jen UI; RLS čte roli z DB, odebrání práv platí okamžitě. |
| Site URL | `https://office.pentariva.com` | R4/D28. |
| SMTP | Custom SMTP přes Resend (`smtp.resend.com`), odesílatel **`office@pentariva.com`** | D21/D24; auth šablony přeložit do češtiny. Do DNS (Forpsi) se přidají jen Resend DKIM/SPF/Return-Path záznamy. |
| Rate limity Auth | Výchozí limity Supabase (bez zpřísnění) | MVP anti-abuse je jen §6; CAPTCHA není v MVP (Fáze 2). |
| Livemode | Testovací režim do vzniku IČO | R8 — reálné osobní údaje až po vzniku správce (§7). |

Bootstrap: seed migrace vytvoří (a) **firemní kořen sítě** — profil s `is_network_root = true`,
`role = 'ambassador'`, `sponsor_id NULL` (jediný, vynuceno `uq_profiles_single_root`),
(b) **prvního admina** (`UPDATE profiles SET role='admin' WHERE email = …`). Admin si při
prvním přihlášení musí zapsat TOTP — bez `aal2` neuvidí žádná admin data.

### 1.2 Registrace přes referral link (D11, D12)

Tok (závazný):

1. `pentariva.com/r/{kód}` (statická routa na stávajícím Firebase hostingu, D29) uloží
   first-party cookie `pnt_ref={kód}` s platností **30 dní, last-click wins**, zaloguje
   klik přes edge funkci `log-referral-event` (INSERT do `referral_events` s
   `kind='click'` a `visitor_hash` = hash IP+UA, žádná PII) a přesměruje na
   `office.pentariva.com/registrace?ref={kód}`.
2. Registrační formulář načte kód z `?ref` nebo cookie a pošle ho v
   `options.data.referral_code` při `supabase.auth.signUp()` / `signInWithOtp()`.
   Součástí registrace jsou povinné checkboxy VOP + zásad zpracování; verze dokumentů
   jde v `options.data.doc_version` (§7.1).
3. DB trigger `handle_new_user` (níže) založí profil **vždy jako `customer`** (D11).
   Platný kód ⇒ `owner_ambassador_id` = vlastník kódu, `registration_source='referral'`
   a řádek `referral_events` s `kind='registration'`. **`sponsor_id` zůstává NULL a
   `path`/`depth` NULL — osobní zákazník není partnerská generace (D9).**
   Neplatný/neaktivní kód nikdy nevyhodí chybu — registrace proběhne jako `organic`.
4. `owner_ambassador_id` je po vzniku řádku neměnný pro klienta (guard trigger §4.3).
   Jediná cesta ke změně sponzorské vazby partnera je `fn_admin_change_sponsor`
   z `04-datovy-model.md` — admin, **max. 14 dní od registrace**, vždy s auditem;
   po 14 dnech žádná cesta neexistuje.

Rozhodnutí: **referral kód mají v MVP jen role `ambassador`/`mentor`/`leader`.**
Zákazník kód nemá — finální provizní model žádnou zákaznickou odměnu za sdílení
nedefinuje (D30, Fáze 2).

```sql
-- Založení profilu + trvalá atribuce zákazníka (kanonické sloupce: owner_ambassador_id,
-- sponsor_id NULL, registration_source). profiles.id = auth.users.id (FK ON DELETE RESTRICT).
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_code        citext := nullif(lower(new.raw_user_meta_data->>'referral_code'), '');
  v_owner       uuid;
  v_ref_code_id uuid;
begin
  if v_code is not null then
    select rc.owner_profile_id, rc.id into v_owner, v_ref_code_id
    from public.referral_codes rc
    join public.profiles p on p.id = rc.owner_profile_id
    where rc.code = v_code
      and rc.is_active
      and p.is_active
      and p.role in ('ambassador','mentor','leader');
  end if;

  insert into public.profiles (id, role, display_name, email, owner_ambassador_id, registration_source)
  values (new.id, 'customer',
          coalesce(nullif(new.raw_user_meta_data->>'display_name',''), split_part(new.email,'@',1)),
          new.email,
          v_owner,
          case when v_owner is null then 'organic' else 'referral' end);

  -- důkazní stopa souhlasu s VOP + zásadami zpracování (§7.1):
  insert into public.audit_log (actor_profile_id, entity, entity_id, action, after)
  values (new.id, 'profiles', new.id::text, 'consent.granted',
          jsonb_build_object('types', jsonb_build_array('terms','privacy'),
                             'doc_version', new.raw_user_meta_data->>'doc_version'));

  if v_ref_code_id is not null then
    insert into public.referral_events (referral_code_id, kind, registered_profile_id)
    values (v_ref_code_id, 'registration', new.id);
  end if;
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
```

Resolve kódu pro registrační/objednávkovou stránku (anon) — výhradně přes RPC, které
vrací jen křestní jméno a případný produkt, nic víc:

```sql
create or replace function public.fn_resolve_referral(p_code citext)
returns table (owner_first_name text, product_id uuid)
language sql stable security definer set search_path = public
as $$
  select split_part(p.display_name, ' ', 1), rc.product_id
  from public.referral_codes rc
  join public.profiles p on p.id = rc.owner_profile_id
  where rc.code = p_code and rc.is_active and p.is_active
    and p.role in ('ambassador','mentor','leader')
$$;
grant execute on function public.fn_resolve_referral(citext) to anon, authenticated;
```

---

## 2. Role model

### 2.1 Role a custom claim

Role = kanonický ENUM `user_role`
(`customer`,`ambassador`,`mentor`,`leader`,`trade_partner`,`b2b_manager`,`admin` — D10),
uložený v `profiles.role` (**jediný zdroj pravdy**). Jedna role na uživatele.
`mentor`/`leader` jsou v MVP funkčně nadmnožinou ambasadora (Fáze 2 přidá týmové
dashboardy); `b2b_manager` v MVP vykonává admin (D10); B2B partner (hotel, salon…) se
přihlašuje jako `trade_partner`. Role se mění výhradně SECURITY DEFINER funkcemi
(`fn_approve_ambassador`, admin správa uživatelů), nikdy přímým UPDATE z klienta.

Custom claim `user_role` do JWT přes Custom Access Token Hook — slouží **jen** pro
UI/routing v Next.js middleware; každé bezpečnostní rozhodnutí v RLS čte `profiles`
(okamžitá platnost odebrání práv, žádný stale-claim problém):

```sql
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable as $$
declare claims jsonb; v_role public.user_role;
begin
  select role into v_role from public.profiles where id = (event->>'user_id')::uuid;
  claims := jsonb_set(event->'claims', '{user_role}', to_jsonb(coalesce(v_role::text,'customer')));
  return jsonb_set(event, '{claims}', claims);
end $$;
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from public, anon, authenticated;
create policy profiles_auth_admin_read on public.profiles
  for select to supabase_auth_admin using (true);
-- Dashboard: Authentication → Hooks → Custom Access Token → tato funkce
```

### 2.2 Pomocné funkce (používají všechny RLS politiky)

Kanonická genealogie: `profiles.path` je **materialised path jako text**
(`'/uuid-root/…/uuid-vlastni/'`, D9) + `profiles.depth`; zákazník má
`owner_ambassador_id` a `sponsor_id NULL`.

```sql
create or replace function public.my_role() returns public.user_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select public.my_role() = 'admin'
         and coalesce(auth.jwt()->>'aal','aal1') = 'aal2' $$;  -- admin MUSÍ mít TOTP (MFA)

create or replace function public.is_partner() returns boolean  -- partner sítě
language sql stable as $$ select public.my_role() in ('ambassador','mentor','leader') $$;

-- Osobní zákazník = owner_ambassador_id, NE sponsor_id (D9).
create or replace function public.is_my_customer(p uuid) returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles
                     where id = p and owner_ambassador_id = auth.uid()
                       and role = 'customer') $$;

-- Downline max 3 generace přes materialised path (prefix + rozdíl hloubek).
create or replace function public.is_in_my_downline(p uuid) returns boolean
language sql stable security definer set search_path = public
as $$ select exists (
        select 1
        from public.profiles me
        join public.profiles t on t.id = p
        where me.id = auth.uid()
          and t.id <> me.id
          and t.path like me.path || '%'
          and t.depth - me.depth between 1 and 3) $$;
```

`revoke execute … from public, anon` na všech čtyřech definer funkcích;
`grant execute … to authenticated`.

### 2.3 Matice role×akce (MVP, plný enum D10)

Legenda: **R** čtení, **W** zápis, **RW** obojí, **A** jen agregáty (přes RPC),
**S** jen systém (service_role / SECURITY DEFINER), **—** nic. „vlastní“ = řádky
uživatele. Mentor/leader = sloupec ambasador (Fáze 2 přidá týmové pohledy).

| Modul / akce | customer | ambassador | mentor | leader | trade_partner | b2b_manager | admin |
|---|---|---|---|---|---|---|---|
| Vlastní profil — kontaktní údaje, cíl (D32) | RW | RW | RW | RW | RW | RW | RW |
| Vlastní role, sponzor/owner, referral kód | R | R | R | R | R | R | RW (přes fn) |
| Profily vlastních zákazníků (detail) | — | R | R | R | — | — | RW |
| Downline ≤ 3 generace | — | A | A | A | — | — | R |
| Zákazníci cizích ambasadorů | — | — | — | — | — | — | R |
| Katalog + ceník (`products`, `product_prices`) | R | R | R | R | R | R | RW |
| Trade parametry (`trade_level_params`), vlastní `trade_partners` řádek | — | — | — | — | R | R | RW |
| Objednávka — vytvoření (checkout + brána) | S | S | S | S | S | S | S |
| Vlastní objednávky + platby | R | R | R | R | R | R | RW (stavy přes fn) |
| Objednávky vlastních zákazníků | — | R | R | R | — | — | R |
| Objednávky downline | — | A | A | A | — | — | R |
| Provizní ledger — vlastní záznamy (`commission_entries`) | R¹ | R | R | R | R¹ | R¹ | R (korekce jen fn) |
| Kreditní transakce + zůstatky — vlastní | R | R | R | R | R | R | RW (přes fn) |
| Žádost o výplatu (`payout_requests`) | — | W (RPC) | W (RPC) | W (RPC) | W (RPC)¹ | W (RPC)¹ | schvaluje (fn) |
| CRM poznámky + zájmové tagy vlastních zákazníků | tagy sebe | RW | RW | RW | — | — | R |
| B2B CRM (`b2b_companies`, `b2b_activities`) | — | — | — | — | — | RW (přiřazené) | RW |
| Akademie — obsah (published) | R | R | R | R | R | R | RW |
| Akademie — vlastní progres + pokusy kvízu | R+W² | R+W² | R+W² | R+W² | R+W² | R+W² | R |
| Žádost o povýšení (`ambassador_applications`) | W (RPC) | — | — | — | — | — | rozhoduje (fn) |
| Milníkové dárky — vlastní | R | R | R | R | R | R | RW |
| Reporty (`/reporty`, D31) | A (vlastní) | A | A | A | A (vlastní) | A (B2B) | vše |
| Konfigurace (`app_settings`, `commission_rates`), texty, školení | — | — | — | — | — | — | RW (fn s auditem) |
| Správa uživatelů, rolí, schvalování | — | — | — | — | — | — | RW |
| Audit log | — | — | — | — | — | — | R |
| GDPR export vlastních dat | W (RPC) | W | W | W | W | W | vše |

¹ Provizní záznamy (`trade_acquirer` apod.) má jen ten, kdo je jejich
`beneficiary_profile_id`; kdo má provizní kredit, smí žádat o výplatu. Klubový kredit
vyplatit nelze (R10). ² Dokončení lekce zapisuje uživatel sám (`academy_progress`);
pokus o kvíz zapisuje výhradně `fn_submit_quiz` (§3.1) — u Modulu 1 neexistuje žádné
ruční „označit dokončeno“ (D34).

---

## 3. Vznik ambasadora (D11) — jediný tok

Registrace vytváří vždy **zákazníka** (§1.2). Povýšení `customer → ambassador` má
právě jednu cestu a čtyři podmínky (všechny současně, závazně):

1. **Kvíz Modulu 1 akademie složen na ≥ 80 %** (`academy_quiz_attempts.passed`,
   generovaný sloupec `score_bp >= 8000`; vyhodnocuje výhradně `fn_submit_quiz` —
   klient správné odpovědi nikdy nevidí, §4.2).
2. **Souhlas s ambasadorskými podmínkami** (`ambassador_applications.terms_accepted_at`).
3. **Potvrzení 18+** (`ambassador_applications.adult_confirmed` + kontrola
   `profiles.birth_date`; zákazník 15+ dle § 7 zák. č. 110/2019 Sb.).
4. **Schválení adminem** (`fn_approve_ambassador`).

Evidence výhradně v `ambassador_applications` se stavy `requested → approved | rejected`
(ENUM `application_status`); otevřená žádost max jedna (`uq_ambassador_application_open`).

### 3.1 Vyhodnocení kvízu

```sql
create or replace function public.fn_submit_quiz(p_module uuid, p_answers jsonb)
returns uuid language plpgsql security definer set search_path = public
as $$
declare v_total int; v_correct int; v_attempt uuid;
begin
  if auth.uid() is null then raise exception 'Nepřihlášený uživatel'; end if;
  select count(*),
         count(*) filter (where (p_answers->>q.id::text)::int = q.correct_index)
    into v_total, v_correct
  from public.academy_quiz_questions q
  where q.module_id = p_module and q.is_active;
  if v_total = 0 then raise exception 'Modul nemá aktivní otázky'; end if;
  insert into public.academy_quiz_attempts (profile_id, module_id, answers, score_bp)
  values (auth.uid(), p_module, p_answers, (v_correct * 10000) / v_total)
  returning id into v_attempt;
  return v_attempt;
end $$;
revoke execute on function public.fn_submit_quiz(uuid, jsonb) from public, anon;
grant  execute on function public.fn_submit_quiz(uuid, jsonb) to authenticated;
```

### 3.2 Žádost o povýšení (RPC zákazníka)

```sql
create or replace function public.fn_request_ambassador_upgrade(
  p_quiz_attempt uuid, p_terms_accepted boolean, p_adult_confirmed boolean)
returns uuid language plpgsql security definer set search_path = public
as $$
declare v_app uuid; v_birth date; v_mod1 uuid;
begin
  if public.my_role() <> 'customer' then raise exception 'Žádat může jen zákazník'; end if;
  if not coalesce(p_terms_accepted, false) then
    raise exception 'Chybí souhlas s ambasadorskými podmínkami (D11)'; end if;
  if not coalesce(p_adult_confirmed, false) then
    raise exception 'Chybí potvrzení 18+ (D11)'; end if;
  select birth_date into v_birth from public.profiles where id = auth.uid();
  if v_birth is null or v_birth > current_date - interval '18 years' then
    raise exception 'Ambasador musí mít vyplněné datum narození a být 18+ (D11)'; end if;
  select id into v_mod1 from public.academy_modules where position = 1;
  if not exists (select 1 from public.academy_quiz_attempts a
                 where a.id = p_quiz_attempt and a.profile_id = auth.uid()
                   and a.module_id = v_mod1 and a.passed) then
    raise exception 'Kvíz Modulu 1 není složen na >= 80 %% (D11)'; end if;

  insert into public.ambassador_applications
    (profile_id, quiz_attempt_id, terms_accepted_at, adult_confirmed)
  values (auth.uid(), p_quiz_attempt, now(), true)
  returning id into v_app;   -- druhá otevřená žádost padne na uq_ambassador_application_open

  insert into public.audit_log (actor_profile_id, entity, entity_id, action, after)
  values (auth.uid(), 'ambassador_applications', v_app::text, 'ambassador.requested',
          jsonb_build_object('quiz_attempt_id', p_quiz_attempt));
  return v_app;
end $$;
revoke execute on function public.fn_request_ambassador_upgrade(uuid, boolean, boolean) from public, anon;
grant  execute on function public.fn_request_ambassador_upgrade(uuid, boolean, boolean) to authenticated;
```

### 3.3 Rozhodnutí admina

Schválení nastaví `role='ambassador'` a **přesune `owner_ambassador_id` do
`sponsor_id`** (kanonický komentář `profiles.owner_ambassador_id`): dosavadní ambasador
povýšeného zákazníka se stává jeho přímým sponzorem — 1. generací. Organický zákazník
(bez ambasadora) se zavěsí pod firemní kořen sítě (`is_network_root`). Funkce počítá
`path`/`depth` stejně jako kanonický trigger a pro zápis ho krátkodobě vypíná
(stejný vzor jako `fn_admin_change_sponsor` v `04-datovy-model.md`).

```sql
create or replace function public.fn_approve_ambassador(p_application uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare
  a public.ambassador_applications%rowtype;
  prof public.profiles%rowtype;
  v_sponsor uuid; v_path text; v_depth int;
begin
  if not public.is_admin() then raise exception 'Jen admin (D11)'; end if;
  select * into a from public.ambassador_applications where id = p_application for update;
  if a.status <> 'requested' then raise exception 'Žádost není ve stavu requested'; end if;
  select * into prof from public.profiles where id = a.profile_id for update;
  if prof.role <> 'customer' then raise exception 'Profil není zákazník'; end if;
  -- re-validace všech podmínek D11:
  if not exists (select 1 from public.academy_quiz_attempts q
                 where q.id = a.quiz_attempt_id and q.profile_id = a.profile_id and q.passed)
    then raise exception 'Kvíz Modulu 1 nesplněn'; end if;
  if a.terms_accepted_at is null or not a.adult_confirmed
    then raise exception 'Chybí souhlas s podmínkami / potvrzení 18+'; end if;
  if prof.birth_date is null or prof.birth_date > current_date - interval '18 years'
    then raise exception 'Podmínka 18+ nesplněna'; end if;

  v_sponsor := prof.owner_ambassador_id;
  if v_sponsor is null then
    select id into v_sponsor from public.profiles where is_network_root;
  end if;
  select p.path || prof.id || '/', p.depth + 1 into v_path, v_depth
    from public.profiles p
   where p.id = v_sponsor and p.role in ('ambassador','mentor','leader');
  if v_path is null then raise exception 'Sponzor není partner v síti'; end if;

  alter table public.profiles disable trigger trg_profiles_path;
  update public.profiles
     set role = 'ambassador', sponsor_id = v_sponsor, path = v_path, depth = v_depth,
         owner_ambassador_id = null
   where id = prof.id;
  alter table public.profiles enable trigger trg_profiles_path;

  update public.ambassador_applications
     set status = 'approved', decided_by = auth.uid(), decided_at = now()
   where id = p_application;

  insert into public.referral_codes (owner_profile_id, code)
  values (prof.id, public.fn_generate_code());

  insert into public.audit_log (actor_profile_id, entity, entity_id, action, before, after)
  values (auth.uid(), 'profiles', prof.id::text, 'ambassador.approved',
          jsonb_build_object('role', 'customer', 'owner_ambassador_id', prof.owner_ambassador_id),
          jsonb_build_object('role', 'ambassador', 'sponsor_id', v_sponsor));
end $$;

create or replace function public.fn_reject_ambassador(p_application uuid, p_note text)
returns void language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Jen admin (D11)'; end if;
  update public.ambassador_applications
     set status = 'rejected', decided_by = auth.uid(), decided_at = now(), note = p_note
   where id = p_application and status = 'requested';
  if not found then raise exception 'Žádost není ve stavu requested'; end if;
  insert into public.audit_log (actor_profile_id, entity, entity_id, action, after)
  values (auth.uid(), 'ambassador_applications', p_application::text, 'ambassador.rejected',
          jsonb_build_object('note', p_note));
end $$;
revoke execute on function public.fn_approve_ambassador(uuid)      from public, anon;
revoke execute on function public.fn_reject_ambassador(uuid, text) from public, anon;
grant  execute on function public.fn_approve_ambassador(uuid)      to authenticated; -- uvnitř is_admin()
grant  execute on function public.fn_reject_ambassador(uuid, text) to authenticated; -- uvnitř is_admin()
```

Referral kódy: generuje výhradně server — 8 znaků z abecedy
`abcdefghjkmnpqrstuvwxyz23456789` (bez matoucích 0/o/1/l/i; splňuje kanonický CHECK
`^[a-z0-9]{6,12}$`), kolize řeší retry proti UNIQUE:

```sql
create or replace function public.fn_generate_code() returns text
language plpgsql volatile as $$
declare
  v_alphabet constant text := 'abcdefghjkmnpqrstuvwxyz23456789';
  v_code text;
begin
  loop
    select string_agg(substr(v_alphabet, 1 + floor(random()*length(v_alphabet))::int, 1), '')
      into v_code from generate_series(1, 8);
    exit when not exists (select 1 from public.referral_codes where code = v_code);
  end loop;
  return v_code;
end $$;
revoke execute on function public.fn_generate_code() from public, anon, authenticated;
```

Vanity alias (`/roman`) = další řádek v `referral_codes` téhož vlastníka, přiděluje
jen admin; musí splnit kanonický CHECK a blacklist rezervovaných slov (`admin`,
`shop`, `office`, `api`, názvy produktů) hlídá admin UI. Produktový link = řádek
s `product_id` (D12).

---

## 4. RLS

### 4.1 Zásady (D22, závazné)

1. `alter table … enable row level security;` na **každé** kanonické tabulce ve schématu
   `public` bez výjimky. Bez policy = deny.
2. **Peníze klient jen čte.** Všechny zápisy do `orders`, `order_items`, `payments`,
   `order_refunds`, `commission_entries`, `credit_transactions`, `payout_requests`
   jdou výhradně přes SECURITY DEFINER funkce nebo edge funkce se `service_role`.
   Navíc odebrat GRANTy:
   ```sql
   revoke insert, update, delete on
     public.orders, public.order_items, public.payments, public.order_refunds,
     public.commission_entries, public.credit_transactions, public.payout_requests,
     public.audit_log, public.academy_quiz_attempts, public.ambassador_applications,
     public.referral_codes, public.referral_events, public.trade_partners,
     public.app_settings, public.commission_rates, public.trade_level_params,
     public.order_status_transitions
   from anon, authenticated;
   ```
3. Každá SECURITY DEFINER funkce má `set search_path = public` (ochrana proti
   search-path hijacku); interní funkce mají `revoke execute … from public, anon,
   authenticated` (v `public` schématu je default EXECUTE pro všechny — nutno odebrat).
4. Všechny kanonické views (`v_current_prices`, `v_credit_balances`,
   `v_credit_overview`, `v_monthly_personal_turnover`, `v_ambassador_dashboard`) se po
   vytvoření přepnou: `alter view … set (security_invoker = on);` — respektují RLS
   dotazujícího.
5. Edge funkce se `service_role` klíčem vždy nejdřív ověří JWT volajícího
   (`supabase.auth.getUser(token)`), pokud jednají za uživatele.
6. Přečerpání kreditu u `spend`/`payout` hlídají SECURITY DEFINER funkce pod
   `pg_advisory_xact_lock(hashtext(profile_id::text || ':' || kind))` (kanonický
   komentář `credit_transactions`).

### 4.2 Přehled RLS pro všechny kanonické tabulky

| Tabulka | SELECT | INSERT/UPDATE/DELETE |
|---|---|---|
| `app_settings` | authenticated | jen `fn_admin_update_setting` (§5.4) |
| `commission_rates`, `trade_level_params` | authenticated | jen admin fn s auditem (§5.4) |
| `profiles` | vlastní řádek; partner → své zákazníky (`owner_ambassador_id = auth.uid()`); admin vše; downline **jen agregáty** přes `fn_downline` (§4.4) | UPDATE vlastní (chráněné sloupce hlídá guard trigger §4.3); ostatní jen fn/admin |
| `referral_codes` | vlastní (`owner_profile_id = auth.uid()`); admin | jen fn (`fn_approve_ambassador`, admin vanity/deaktivace); anon resolve jen RPC `fn_resolve_referral` |
| `referral_events` | admin | jen S (edge `log-referral-event`, `handle_new_user`) |
| `products`, `product_prices` | anon + authenticated (jen `is_active` produkty); admin vše | admin |
| `order_status_transitions` | authenticated (číselník) | nikdo (jen migrace) |
| `trade_partners` | vlastní řádek (`profile_id = auth.uid()`); admin | admin (úroveň v MVP nastavuje admin ručně, D13; změna s auditem) |
| `orders` | buyer vlastní; ambasador objednávky svých zákazníků (`attributed_ambassador_id = auth.uid()`); admin | jen S (checkout edge funkce + webhook brány; refund `fn_refund_order`) |
| `order_items` | zděděně přes `orders` (EXISTS subquery) | jen S |
| `payments` | přes vlastní objednávku; admin | jen S (webhook brány, dedup `provider_event_id`) |
| `order_refunds` | přes vlastní objednávku; admin | jen `fn_refund_order` |
| `commission_entries` | `beneficiary_profile_id = auth.uid()`; admin vše (vč. řádků s beneficiary NULL — pool/margin) | **nikdo** — jen `fn_generate_commissions` / `fn_settle_commissions` / `fn_allocate_leadership` / `fn_refund_order` |
| `credit_transactions` | vlastní; admin | jen fn/S; UPDATE/DELETE blokují kanonické RULEs |
| `payout_requests` | vlastní; admin | INSERT jen RPC `fn_request_payout`; stavy jen admin fn / `fn_cancel_payout` (§5.2) |
| `crm_notes` | autor svých zákazníků; admin | autor CRUD (`author_profile_id = auth.uid()` + `is_my_customer`) |
| `interest_tags` | authenticated | admin |
| `customer_interest_tags` | zákazník své; owner-ambasador svých zákazníků; admin | zákazník své; owner-ambasador svých zákazníků (`added_by = auth.uid()`); admin |
| `b2b_companies` | b2b_manager přiřazené (`assigned_manager_profile_id = auth.uid()`); admin | dtto; samoobslužnou registraci zapisuje S (edge funkce: profil + řádek `new_contact`, D14) |
| `b2b_activities` | přes přiřazenou firmu; admin | dtto |
| `academy_modules`, `academy_lessons` | authenticated (jen `is_published`); admin vše | admin |
| `academy_progress` | vlastní; admin | INSERT vlastní (jen published lekce); DELETE/UPDATE nikdo |
| `academy_quiz_questions` | authenticated **bez sloupce `correct_index`** (sloupcové GRANTy níže); admin vše | admin |
| `academy_quiz_attempts` | vlastní; admin | jen `fn_submit_quiz` |
| `ambassador_applications` | vlastní; admin | jen RPC `fn_request_ambassador_upgrade` / admin fn |
| `milestone_gifts` | vlastní (`profile_id = auth.uid()`); admin | admin |
| `audit_log` | admin | jen definer funkce/S; UPDATE/DELETE **nikdo, ani admin** |

Ochrana správných odpovědí kvízu (kanonický komentář `academy_quiz_questions`):

```sql
revoke select on table public.academy_quiz_questions from anon, authenticated;
grant select (id, module_id, position, question, options, is_active)
  on public.academy_quiz_questions to authenticated;
```

Storage buckety (MVP jen dva): `academy-media` (authenticated read, admin write),
`gdpr-exports` (žádný public přístup, jen signed URL na 24 h, §7.3). Vzor:

```sql
create policy academy_media_read on storage.objects
for select to authenticated using (bucket_id = 'academy-media');
create policy academy_media_admin on storage.objects
for all to authenticated
using (bucket_id = 'academy-media' and public.is_admin())
with check (bucket_id = 'academy-media' and public.is_admin());
```

### 4.3 Konkrétní politiky — klíčové tabulky

```sql
-- ===== profiles =====
alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
for select to authenticated using (id = auth.uid());

-- partner vidí detail JEN svých osobních zákazníků (owner_ambassador_id, D9)
create policy profiles_select_my_customers on public.profiles
for select to authenticated
using (public.is_partner() and role = 'customer' and owner_ambassador_id = auth.uid());

create policy profiles_admin_all on public.profiles
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy profiles_update_own on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Chráněné sloupce: roli, atribuci, strom, e-mail a aktivitu nemění nikdo kromě
-- admina / service role. sponsor_id navíc hlídá kanonický trg_profiles_path (D9).
create or replace function public.tg_profiles_guard()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.role                is distinct from old.role
    or new.owner_ambassador_id is distinct from old.owner_ambassador_id
    or new.path                is distinct from old.path
    or new.depth               is distinct from old.depth
    or new.is_network_root     is distinct from old.is_network_root
    or new.email               is distinct from old.email
    or new.is_active           is distinct from old.is_active then
      raise exception 'Změna chráněných sloupců profilu není povolena';
    end if;
  end if;
  return new;
end $$;
create trigger tg_profiles_guard before update on public.profiles
for each row execute function public.tg_profiles_guard();

-- ===== orders =====
alter table public.orders enable row level security;

create policy orders_select_own on public.orders
for select to authenticated using (buyer_profile_id = auth.uid());

-- ambasador vidí objednávky svých zákazníků (attributed_ambassador_id = snapshot
-- vlastníka obratu v okamžiku objednávky)
create policy orders_select_my_customers on public.orders
for select to authenticated
using (public.is_partner() and attributed_ambassador_id = auth.uid()
       and buyer_profile_id <> auth.uid());

create policy orders_admin_all on public.orders
for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- Žádná klientská write policy: objednávky zakládá checkout edge funkce (service_role,
-- volá fn_validate_order_pricing), na paid je překlápí webhook brány (D8),
-- refunduje fn_refund_order.

alter table public.order_items enable row level security;
create policy order_items_via_order on public.order_items
for select to authenticated
using (exists (select 1 from public.orders o where o.id = order_items.order_id));

alter table public.payments enable row level security;
create policy payments_via_order on public.payments
for select to authenticated
using (public.is_admin()
       or exists (select 1 from public.orders o
                  where o.id = payments.order_id and o.buyer_profile_id = auth.uid()));

alter table public.order_refunds enable row level security;
create policy refunds_via_order on public.order_refunds
for select to authenticated
using (public.is_admin()
       or exists (select 1 from public.orders o
                  where o.id = order_refunds.order_id and o.buyer_profile_id = auth.uid()));

-- ===== commission_entries (jediný ledger, D2) =====
alter table public.commission_entries enable row level security;

create policy ce_select_own on public.commission_entries
for select to authenticated using (beneficiary_profile_id = auth.uid());

create policy ce_select_admin on public.commission_entries
for select to authenticated using (public.is_admin());
-- ŽÁDNÁ write policy pro nikoho (ani admina). Řádky se nikdy nemažou ani neupravují;
-- korekce = kompenzační záporný řádek s reverses_entry_id (D2/D4). Stavy
-- pending → available | reversed mění výhradně kanonické definer funkce.

-- ===== credit_transactions =====
alter table public.credit_transactions enable row level security;
create policy ct_select_own on public.credit_transactions
for select to authenticated using (profile_id = auth.uid() or public.is_admin());
-- Zápis jen definer funkce; UPDATE/DELETE blokují kanonické RULEs
-- credit_tx_no_update / credit_tx_no_delete.

-- ===== payout_requests =====
alter table public.payout_requests enable row level security;
create policy pr_select_own on public.payout_requests
for select to authenticated
using (beneficiary_profile_id = auth.uid() or public.is_admin());
-- INSERT jen fn_request_payout, stavy jen fn_approve_payout / fn_mark_payout_paid /
-- fn_reject_payout / fn_cancel_payout (§5.2).

-- ===== crm_notes =====
alter table public.crm_notes enable row level security;

create policy crm_notes_author_crud on public.crm_notes
for all to authenticated
using (author_profile_id = auth.uid() and public.is_my_customer(customer_profile_id))
with check (author_profile_id = auth.uid() and public.is_my_customer(customer_profile_id));

create policy crm_notes_admin_read on public.crm_notes
for select to authenticated using (public.is_admin());
-- Zákazník poznámky o sobě v aplikaci nevidí; dostane je v GDPR exportu (§7.3).

-- ===== b2b_companies / b2b_activities (jen b2b_manager/admin — konvence 04 §1) =====
alter table public.b2b_companies enable row level security;

create policy b2b_companies_mgr on public.b2b_companies
for all to authenticated
using (public.my_role() = 'b2b_manager' and assigned_manager_profile_id = auth.uid())
with check (public.my_role() = 'b2b_manager' and assigned_manager_profile_id = auth.uid());

create policy b2b_companies_admin on public.b2b_companies
for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.b2b_activities enable row level security;
create policy b2b_activities_mgr on public.b2b_activities
for all to authenticated
using (exists (select 1 from public.b2b_companies c
               where c.id = b2b_activities.company_id
                 and (public.is_admin()
                      or (public.my_role() = 'b2b_manager'
                          and c.assigned_manager_profile_id = auth.uid()))))
with check (exists (select 1 from public.b2b_companies c
               where c.id = b2b_activities.company_id
                 and (public.is_admin()
                      or (public.my_role() = 'b2b_manager'
                          and c.assigned_manager_profile_id = auth.uid()))));
-- Ambasadoři/mentoři/leadeři ani trade_partner do b2b_* tabulek nevidí vůbec.
```

### 4.4 Downline — jen agregáty, max 3 generace

Detaily downline profilů (e-maily, telefony, jejich zákazníci) se **nikdy** nevydávají.
Jediný přístup je RPC, které agregáty počítá **živě** z `orders` a `profiles`
(stejná definice obratu jako kanonický `v_ambassador_dashboard`; žádná agregační
tabulka, žádný noční job — D30):

```sql
create or replace function public.fn_downline(p_max_gen int default 3)
returns table (profile_id uuid, display_name text, role public.user_role,
               generation int, joined_at date,
               month_turnover_haleru bigint, customers_count int)
language sql stable security definer set search_path = public
as $$
  with me as (select path, depth from public.profiles where id = auth.uid())
  select p.id, p.display_name, p.role,
         p.depth - me.depth,
         p.created_at::date,
         coalesce((select sum(o.goods_paid_haleru) from public.orders o
                   where (o.attributed_ambassador_id = p.id
                          or (o.buyer_profile_id = p.id and o.business_flow = 'community_own'))
                     and o.status not in ('cancelled','refunded')
                     and o.paid_at >= date_trunc('month', now())), 0),
         (select count(*)::int from public.profiles c where c.owner_ambassador_id = p.id)
  from public.profiles p, me
  where p.path like me.path || '%'
    and p.id <> auth.uid()
    and p.depth - me.depth <= least(greatest(p_max_gen, 1), 3)
    and p.role in ('ambassador','mentor','leader')
$$;
revoke execute on function public.fn_downline(int) from public, anon;
grant  execute on function public.fn_downline(int) to authenticated;
```

---

## 5. Peníze — jen přes SECURITY DEFINER (D22)

### 5.1 Kanoničtí producenti (definice v `04-datovy-model.md`, tady se nedefinují)

| Funkce | Volá | Co dělá |
|---|---|---|
| `fn_generate_commissions(order)` | webhook brány po `paid` | jediný producent entries; idempotentní; margin dopočtem |
| `fn_settle_commissions()` | denní pg_cron | `pending → available` po `hold_until` (paid_at + 15 dní, R12) + accrual na kredit v téže transakci |
| `fn_allocate_leadership(pool, benef, amount, actor)` | admin | ruční alokace poolu (D15), Σ ≤ pool, audit |
| `fn_refund_order(order, reason, actor)` | admin | plná vratka: reversaly + clawbacky + vrácení spendu (D4) |
| `fn_admin_change_sponsor(profile, new_sponsor, actor)` | admin | oprava sponzora **jen do 14 dnů od registrace** (D9), přepis podvětve, audit; po 14 dnech žádná cesta |

Čerpání kreditu v checkoutu (`spend`, `spent_on_order_id`) zapisuje checkout edge
funkce (service_role) v transakci vytvoření objednávky pod advisory lockem (§4.1
bod 6); kredit se uplatňuje jen na zboží (D6, CHECK `chk_credit_only_goods`).
UI provizí vždy zobrazuje **dostupný** vs **čekající na aktivaci** kredit s datem
aktivace — čte výhradně kanonický `v_credit_overview` (R12).

### 5.2 Výplaty (D17) — stavy `requested → approved → paid | rejected | cancelled`

Nárok = aktuální zůstatek **provizního** kreditu (`kind='commission'`); klubový kredit
vyplatit nelze (R10). Minimální částka `app_settings.payout_min_haleru` (500 Kč).
Vyplácí admin ručně převodem. Číslo účtu žije přímo na žádosti
(`payout_requests.bank_account`); správnost ověřuje admin při schválení.

```sql
create or replace function public.fn_request_payout(p_amount_haleru bigint, p_bank_account text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare v_min bigint; v_available bigint; v_open bigint; v_id uuid;
begin
  if public.my_role() not in ('ambassador','mentor','leader','trade_partner','b2b_manager') then
    raise exception 'O výplatu může žádat jen partner'; end if;
  if p_bank_account is null or btrim(p_bank_account) = '' then
    raise exception 'Chybí číslo účtu'; end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text || ':commission'));
  select (value)::bigint into v_min from public.app_settings where key = 'payout_min_haleru';
  if p_amount_haleru < v_min then
    raise exception 'Minimální výplata je % haléřů (D17)', v_min; end if;
  select coalesce(sum(amount_haleru), 0) into v_available
    from public.credit_transactions
   where profile_id = auth.uid() and kind = 'commission';
  select coalesce(sum(amount_haleru), 0) into v_open
    from public.payout_requests
   where beneficiary_profile_id = auth.uid() and status = 'requested';
  -- approved žádosti už zůstatek snížily rezervační transakcí type=payout
  if p_amount_haleru > v_available - v_open then
    raise exception 'Nedostatečný dostupný provizní kredit'; end if;
  insert into public.payout_requests (beneficiary_profile_id, amount_haleru, bank_account)
  values (auth.uid(), p_amount_haleru, p_bank_account) returning id into v_id;
  insert into public.audit_log (actor_profile_id, entity, entity_id, action, after)
  values (auth.uid(), 'payout_requests', v_id::text, 'payout.requested',
          jsonb_build_object('amount_haleru', p_amount_haleru));
  return v_id;
end $$;

create or replace function public.fn_approve_payout(p_request uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare r public.payout_requests%rowtype; v_available bigint;
begin
  if not public.is_admin() then raise exception 'Jen admin (D17)'; end if;
  select * into r from public.payout_requests where id = p_request for update;
  if r.status <> 'requested' then raise exception 'Žádost není ve stavu requested'; end if;
  perform pg_advisory_xact_lock(hashtext(r.beneficiary_profile_id::text || ':commission'));
  select coalesce(sum(amount_haleru), 0) into v_available
    from public.credit_transactions
   where profile_id = r.beneficiary_profile_id and kind = 'commission';
  if r.amount_haleru > v_available then
    raise exception 'Zůstatek už nekryje žádanou částku'; end if;
  update public.payout_requests
     set status = 'approved', decided_by = auth.uid(), decided_at = now()
   where id = p_request;
  -- rezervace: debet provizního kreditu (D17)
  insert into public.credit_transactions
    (profile_id, kind, type, amount_haleru, payout_request_id)
  values (r.beneficiary_profile_id, 'commission', 'payout', -r.amount_haleru, p_request);
  insert into public.audit_log (actor_profile_id, entity, entity_id, action, after)
  values (auth.uid(), 'payout_requests', p_request::text, 'payout.approved',
          jsonb_build_object('amount_haleru', r.amount_haleru));
end $$;

create or replace function public.fn_mark_payout_paid(p_request uuid)
returns void language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Jen admin (D17)'; end if;
  update public.payout_requests set status = 'paid', paid_at = now()
   where id = p_request and status = 'approved';
  if not found then raise exception 'Žádost není ve stavu approved'; end if;
  insert into public.audit_log (actor_profile_id, entity, entity_id, action)
  values (auth.uid(), 'payout_requests', p_request::text, 'payout.paid');
end $$;

create or replace function public.fn_reject_payout(p_request uuid, p_reason text)
returns void language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Jen admin (D17)'; end if;
  update public.payout_requests
     set status = 'rejected', decided_by = auth.uid(), decided_at = now(),
         rejection_reason = p_reason
   where id = p_request and status = 'requested';   -- rezervace ještě neexistuje
  if not found then raise exception 'Žádost není ve stavu requested'; end if;
  insert into public.audit_log (actor_profile_id, entity, entity_id, action, after)
  values (auth.uid(), 'payout_requests', p_request::text, 'payout.rejected',
          jsonb_build_object('reason', p_reason));
end $$;

-- cancelled: vlastník ruší requested; admin ruší approved (rezervace se vrací adjustmentem)
create or replace function public.fn_cancel_payout(p_request uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare r public.payout_requests%rowtype;
begin
  select * into r from public.payout_requests where id = p_request for update;
  if r.status = 'requested' and (r.beneficiary_profile_id = auth.uid() or public.is_admin()) then
    update public.payout_requests
       set status = 'cancelled', decided_by = auth.uid(), decided_at = now()
     where id = p_request;
  elsif r.status = 'approved' and public.is_admin() then
    update public.payout_requests
       set status = 'cancelled', decided_by = auth.uid(), decided_at = now()
     where id = p_request;
    insert into public.credit_transactions
      (profile_id, kind, type, amount_haleru, payout_request_id, note)
    values (r.beneficiary_profile_id, 'commission', 'adjustment', r.amount_haleru,
            p_request, 'Vrácení rezervace zrušené výplaty');
  else
    raise exception 'Žádost nelze v tomto stavu zrušit';
  end if;
  insert into public.audit_log (actor_profile_id, entity, entity_id, action)
  values (auth.uid(), 'payout_requests', p_request::text, 'payout.cancelled');
end $$;

revoke execute on function public.fn_request_payout(bigint, text) from public, anon;
revoke execute on function public.fn_approve_payout(uuid)         from public, anon;
revoke execute on function public.fn_mark_payout_paid(uuid)       from public, anon;
revoke execute on function public.fn_reject_payout(uuid, text)    from public, anon;
revoke execute on function public.fn_cancel_payout(uuid)          from public, anon;
grant  execute on function public.fn_request_payout(bigint, text) to authenticated;
grant  execute on function public.fn_approve_payout(uuid)         to authenticated;
grant  execute on function public.fn_mark_payout_paid(uuid)       to authenticated;
grant  execute on function public.fn_reject_payout(uuid, text)    to authenticated;
grant  execute on function public.fn_cancel_payout(uuid)          to authenticated;
```

### 5.3 Webhook platební brány

Edge funkce `stripe-webhook` (service_role): ověří podpis, zapíše/aktualizuje
`payments` (idempotence = kanonický unikát `(provider, provider_event_id)`), při
úspěšné platbě nastaví `orders.paid_at` + `status='paid'` (D8), zavolá
`fn_generate_commissions(order_id)` a zapíše `audit_log` akci `order.paid` —
vše v jedné transakci. `payments.livemode=false` do vzniku IČO (R8).

### 5.4 Konfigurace s auditem

```sql
create or replace function public.fn_admin_update_setting(p_key text, p_value jsonb)
returns void language plpgsql security definer set search_path = public
as $$
declare v_old jsonb;
begin
  if not public.is_admin() then raise exception 'Jen admin'; end if;
  select value into v_old from public.app_settings where key = p_key;
  if v_old is null then raise exception 'Neznámý klíč %', p_key; end if;
  update public.app_settings set value = p_value, updated_at = now() where key = p_key;
  insert into public.audit_log (actor_profile_id, entity, entity_id, action, before, after)
  values (auth.uid(), 'app_settings', p_key, 'settings.changed',
          jsonb_build_object('value', v_old), jsonb_build_object('value', p_value));
end $$;
revoke execute on function public.fn_admin_update_setting(text, jsonb) from public, anon;
grant  execute on function public.fn_admin_update_setting(text, jsonb) to authenticated;
```

Stejným vzorem (admin-only definer fn + `audit_log`) se mění `commission_rates`
(`fn_admin_update_rate(code, rate_bp)` → akce `rates.changed`) a `trade_level_params`
(`fn_admin_update_trade_level(level, discount_bp, acquirer_rate_bp)` → akce
`trade_level.changed`). Přímý UPDATE těchto tabulek nemá nikdo (GRANTy odebrány, §4.1).

---

## 6. Anti-abuse v MVP (D30 — úplný výčet)

MVP obsahuje **právě tyto čtyři** mechanismy, nic víc:

1. **Unikátní ověřený e-mail** — Supabase Auth (Confirm email ON) + `profiles.email`
   UNIQUE (citext).
2. **Unikátní telefon v normalizovaném tvaru** — aplikace/edge funkce ukládá telefon
   výhradně v E.164 (`+420…`); unikátnost vynucuje kanonický UNIQUE na
   `profiles.phone`.
3. **Admin schvalování** — povýšení na ambasadora (D11, §3) a každé výplaty (D17, §5.2).
4. **15denní ochranná lhůta** — všechny kladné entries `pending` do `paid_at + 15 dní`
   (R12); vratka je plně stornuje (D4).

Pokročilý anti-fraud aparát (e-mail/device fingerprinting, IP heuristiky, karetní
otisky, stav `held`, tabulka `fraud_flags`) je Fáze 2.

---

## 7. GDPR

Správce: zakládaná společnost PENTARIVA. Do vzniku IČO běží systém v testovacím
režimu s testovacími daty — reálné osobní údaje zákazníků se začnou zpracovávat až po
vzniku správce a publikaci zásad zpracování (R8).

### 7.1 Souhlasy (bez vlastní tabulky — evidence v kanonickém schématu)

| Souhlas | Kde je evidován | Kdy |
|---|---|---|
| VOP + zásady zpracování (`terms`, `privacy`) | `audit_log` akce `consent.granted` s verzí dokumentů (zapisuje `handle_new_user`, §1.2) | povinné checkboxy při registraci |
| Ambasadorské podmínky | `ambassador_applications.terms_accepted_at` + `adult_confirmed` (D11) | při žádosti o povýšení |
| B2B podmínky | `b2b_companies.approved_by`/`approved_at` + `audit_log` akce `b2b.approved` | při schválení B2B partnera |
| Marketingový souhlas | **v MVP se nesbírá** — odesílají se jen transakční e-maily (D24); opt-in vrstva přijde s digesty ve Fázi 2 | — |

### 7.2 Právo na výmaz = anonymizace, ne DELETE

Princip: **objednávky, platby, provizní ledger a kreditní transakce se NIKDY nemažou**
— uchovávají se ze zákonné povinnosti (daňové doklady 10 let dle § 35 zákona o DPH,
účetní záznamy 5 let dle zákona o účetnictví); maže/anonymizuje se identita.
`profiles.id` má FK na `auth.users` s `ON DELETE RESTRICT` (kanonické schéma), proto
se auth účet **nemaže**: edge funkce `gdpr-erase` ho po anonymizaci profilu trvale
zablokuje (`supabase.auth.admin.updateUserById` — ban) a přepíše jeho e-mail na
anonymizovanou adresu. `path` u downline zůstává (UUID je po anonymizaci pseudonym
bez vazby na identitu). Nevyčerpaný kredit výmazem zaniká (musí být ve VOP) — vynuluje
se adjustmentem, aby Σ transakcí zůstala auditovatelná.

```sql
create or replace function public.fn_gdpr_erase(p_profile uuid)
returns void language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Jen admin nebo service role'; end if;
  if exists (select 1 from public.payout_requests
             where beneficiary_profile_id = p_profile
               and status in ('requested','approved')) then
    raise exception 'Nejdřív vyřešit rozpracované výplaty'; end if;

  -- zánik zbývajícího kreditu (klub i provize):
  insert into public.credit_transactions (profile_id, kind, type, amount_haleru, note)
  select profile_id, kind, 'adjustment', -balance_haleru, 'GDPR výmaz — zánik kreditu'
  from public.v_credit_balances
  where profile_id = p_profile and balance_haleru <> 0;

  update public.profiles set
    display_name = 'Anonymizovaný uživatel',
    email = ('erased+' || left(id::text, 8) || '@pentariva.invalid')::citext,
    phone = null, birth_date = null, address = null,
    monthly_goal_haleru = null, is_active = false
  where id = p_profile;

  delete from public.crm_notes where customer_profile_id = p_profile;   -- bez právního titulu
  delete from public.customer_interest_tags where customer_profile_id = p_profile;
  update public.referral_events set user_agent = null, visitor_hash = null
   where registered_profile_id = p_profile;
  update public.referral_codes set is_active = false where owner_profile_id = p_profile;
  update public.orders set shipping_address = null where buyer_profile_id = p_profile;
  update public.payout_requests set bank_account = 'ERASED'
   where beneficiary_profile_id = p_profile and status in ('rejected','cancelled');
  -- bank_account u stavu paid zůstává: součást účetního dokladu (retence 10 let)

  insert into public.audit_log (actor_profile_id, entity, entity_id, action)
  values (auth.uid(), 'profiles', p_profile::text, 'profile.gdpr_erased');
  -- Poté edge funkce 'gdpr-erase' auth účet zabanuje a přepíše jeho e-mail.
end $$;
revoke execute on function public.fn_gdpr_erase(uuid) from public, anon;
grant  execute on function public.fn_gdpr_erase(uuid) to authenticated; -- uvnitř is_admin()
```

Co zůstává (anonymizovaně navázané na UUID): `orders` + `order_items`, `payments`,
`order_refunds`, `commission_entries`, `credit_transactions`, vyplacené
`payout_requests`, `milestone_gifts`, `academy_progress`/`academy_quiz_attempts`
a `audit_log` (loguje jen nechráněné sloupce, §8).

Žádosti subjektů: schránka `gdpr@pentariva.com` + formulář v aplikaci (odešle e-mail
adminovi přes Resend); admin vyřizuje do 30 dnů a každé vyřízení zapisuje `audit_log`
akcí `gdpr.request_resolved` (samostatná tabulka žádostí v MVP neexistuje — D1).

### 7.3 Export dat (právo na přístup / přenositelnost)

Self-service: tlačítko v profilu → edge funkce `gdpr-export` (ověří JWT, pak
service_role) sestaví JSON z kanonických tabulek: `profiles` (všechny sloupce),
`orders` + `order_items` + `payments` + `order_refunds`, `commission_entries`
(vlastní), `credit_transactions`, `payout_requests`, `crm_notes` **kde je subjekt
zákazníkem** (poznámky o něm jsou jeho osobní údaje), `customer_interest_tags`,
`academy_progress` + `academy_quiz_attempts`, `ambassador_applications`,
`referral_codes` + `referral_events` (vlastní registrace), `milestone_gifts`
a `audit_log` řádky `consent.*` subjektu. Soubor do bucketu
`gdpr-exports/{uid}/export-{date}.json`, signed URL na 24 h odeslaná Resendem,
soubory auto-mazané po 7 dnech. Limit 1 export / 24 h / uživatel. Každý export
zapíše `audit_log` akci `gdpr.export_generated`.

### 7.4 Retence (závazná tabulka; měsíční pg_cron job `fn_retention_job`)

| Data | Retence | Akce po uplynutí |
|---|---|---|
| Auth logy Supabase | 90 dní | spravuje Supabase |
| `referral_events.user_agent` | 12 měsíců | UPDATE na NULL |
| `referral_events` (řádky) | 24 měsíců | DELETE |
| Neaktivní zákaznický účet (bez loginu i objednávky 5 let) | 5 let + 60 dní po e-mailovém upozornění | `fn_gdpr_erase` |
| Účetní a daňové záznamy (`orders`, `payments`, ledger, `payout_requests` paid) | 10 let od konce zdaňovacího období | pak teprve smazatelné |
| `audit_log` | 10 let | DELETE |
| GDPR export soubory (`gdpr-exports`) | 7 dní | DELETE |

### 7.5 Zpracovatelé a provozní rozhodnutí

Zpracovatelé (u všech uzavřít DPA před ostrým provozem): Supabase (DB/Auth/Storage,
region Frankfurt), Resend (e-maily), Stripe — po případném swapu Comgate (platby;
v test módu bez reálných dat, D23), Google Firebase Hosting (statický web — bez
osobních údajů), Forpsi (DNS — bez osobních údajů). Věkové hranice: zákazník 15+,
ambasador 18+ (§3).

---

## 8. Audit log

Kanonická tabulka `audit_log` (`actor_profile_id`, `entity`, `entity_id`, `action`,
`before`, `after`, `created_at`) — append-only, zapisuje **backend v téže transakci**
(definer funkce a edge funkce; žádné plošné row-level audit triggery).

### 8.1 Povinně logované akce (závazný výčet)

| Akce | Zapisuje |
|---|---|
| `consent.granted` | `handle_new_user` (§1.2) |
| `ambassador.requested` / `ambassador.approved` / `ambassador.rejected` | §3 funkce |
| `profile.sponsor_changed` | `fn_admin_change_sponsor` (04) |
| `profile.gdpr_erased`, `gdpr.export_generated`, `gdpr.request_resolved` | §7 |
| `order.paid`, `order.refunded` | webhook brány / admin edge volající `fn_refund_order` |
| `leadership.allocated` | `fn_allocate_leadership` (04) |
| `credit.adjustment` | admin edge funkce při ruční korekci kreditu (vždy s `note`) |
| `payout.requested` / `payout.approved` / `payout.paid` / `payout.rejected` / `payout.cancelled` | §5.2 funkce |
| `settings.changed`, `rates.changed`, `trade_level.changed` | §5.4 funkce |
| `trade_partner.level_changed`, `b2b.approved` | admin edge funkce |
| `referral_code.created` / `referral_code.deactivated` | `fn_approve_ambassador` / admin |

Do `before`/`after` se u `profiles` zapisují **jen nechráněné sloupce** (role,
sponsor_id, owner_ambassador_id) — nikdy kontaktní údaje (GDPR).

### 8.2 RLS

```sql
alter table public.audit_log enable row level security;
create policy audit_admin_read on public.audit_log
for select to authenticated using (public.is_admin());
-- Žádná write policy: INSERT jen definer funkce / service_role.
-- UPDATE/DELETE neexistuje pro nikoho, ani pro admina (GRANTy odebrány §4.1);
-- mazání až retenčním jobem po 10 letech (§7.4).
```

---

## 9. Akceptační checklist pro implementaci

- [ ] RLS zapnuto na všech kanonických tabulkách v `public`; `anon` čte jen
      `products`/`product_prices` (+ RPC `fn_resolve_referral`); write GRANTy dle §4.1
      odebrány.
- [ ] Všechny SECURITY DEFINER funkce mají `set search_path = public`; interní mají
      revoke EXECUTE pro `public/anon/authenticated`; kanonické views běží
      s `security_invoker = on`.
- [ ] Magic link i e-mail+heslo funkční (D21); auth e-maily česky přes Resend SMTP
      z `office@pentariva.com`.
- [ ] Test: ambasador A nevidí (a) profil/objednávky zákazníka ambasadora B,
      (b) e-mail/telefon nikoho z downline (jen agregáty z `fn_downline`),
      (c) 4. generaci ve `fn_downline`, (d) žádný `b2b_*` řádek,
      (e) `correct_index` v `academy_quiz_questions`.
- [ ] Test: klient nemůže INSERT/UPDATE/DELETE na `orders`, `order_items`, `payments`,
      `commission_entries`, `credit_transactions`, `payout_requests`, `audit_log`,
      `academy_quiz_attempts` (očekávaná chyba 42501 / RULE no-op).
- [ ] Test: UPDATE `profiles.role`/`owner_ambassador_id`/`sponsor_id` z klienta selže
      (guard trigger + kanonický `trg_profiles_path`); `handle_new_user` s neplatným
      kódem založí organického zákazníka bez chyby; s platným kódem nastaví
      `owner_ambassador_id` a `sponsor_id` zůstane NULL.
- [ ] Test D11: `fn_request_ambassador_upgrade` selže bez složeného kvízu / souhlasu /
      18+; `fn_approve_ambassador` přepne roli, přesune `owner_ambassador_id` do
      `sponsor_id`, dopočítá `path`/`depth` a vygeneruje referral kód; druhá otevřená
      žádost padne na `uq_ambassador_application_open`.
- [ ] Test D17: `fn_request_payout` pod 500 Kč selže; `approved` vytvoří rezervační
      transakci `payout`; `cancelled` po `approved` vrátí rezervaci adjustmentem;
      klubový kredit vyplatit nejde.
- [ ] Test worked example (zlatý test CI, D25): vlastní objednávka ambasadora D za
      100 000 haléřů katalogu → `goods_paid` 70 000; ledger: C `team_gen1` 10 500,
      B `team_gen2` 4 200, A `team_gen3` 2 800, `leadership_pool` 1 400,
      `company_margin` 51 100; vše `pending` s `hold_until = paid_at + 15 dní`
      (margin `available` ihned); `fn_refund_order` vše stornuje na Σ = 0.
- [ ] Test: admin bez zapsaného TOTP (aal1) nevidí admin data; s aal2 vidí.
- [ ] Test: `fn_gdpr_erase` anonymizuje profil, vynuluje kredit adjustmentem, smaže
      `crm_notes`/zájmové tagy, vyNULLuje `orders.shipping_address`; objednávky,
      platby a ledger zůstávají; auth účet je zabanován, ne smazán; GDPR export vrací
      i `crm_notes` o subjektu.
- [ ] Custom Access Token Hook aktivován v dashboardu (claim `user_role` jen pro UI).
