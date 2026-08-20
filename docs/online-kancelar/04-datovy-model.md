# 04 — Kanonický datový model (Postgres / Supabase)

> **Aktualizace 20. 8. 2026 — model v2:** závazné změny schématu a peněžních
> funkcí jsou v `13-provizni-model-v2.md`. Pro nové objednávky platí
> `team_gen1/2/3 = 2000/800/400 bp` a `leadership_pool = 200 bp` z netto báze
> bez DPH; `community_customer` používá stejné `team_gen*` typy a
> `personal_customer` je deprecated. Benefit má tři měsíční úrovně
> 3/6/10 %, objednávka nese `welcome_benefit`, produkt `cost_haleru` a
> konfigurace obsahuje uvítací i ekonomické vstupy dle §13. Dřívější DDL
> ukázky níže jsou historický základ; při rozporu vítězí §13.
>
> **Jediný zdroj DDL celého systému (D1).** Žádný jiný dokument nesmí definovat vlastní
> `CREATE TABLE` — jen odkazovat sem. Model implementuje kontrakt
> `02-technicka-rozhodnuti.md` (D1–D35), rozhodnutí zadavatele R1–R15
> (`00-zadani-a-rozhodnuti.md`) a finální provizní model
> (`03-provizni-pravidla-zdroj.md`) — peníze na halíř dle závazného worked example.

## 0. Klíčová rozhodnutí (závazná)

| # | Rozhodnutí | Zdůvodnění (1 věta) |
|---|---|---|
| R1 | Genealogie = `sponsor_id` (adjacency) + **materialised path** (`profiles.path` text, trigger). Closure table zamítnuta. (D9) | Provize potřebují jen 3 generace nahoru (triviální rekurzivní CTE po `sponsor_id`), downline reporting Fáze 2 řeší levný prefix-scan po `path`; closure table = write-amplifikace bez přínosu. |
| R2 | Sponzor je po založení **neměnný** (trigger vyhazuje výjimku); admin oprava jen do **14 dnů od registrace** přes SECURITY DEFINER funkci se zápisem do auditu. (D9) | Zpětné přepojování větví by rozbilo historické provize i důvěru v síť. |
| R3 | Osobní zákazník **není** v sponsor stromu: má `owner_ambassador_id`, `sponsor_id` je NULL. (D9) | Provizní model výslovně říká „osobní zákazník není partnerská generace“. |
| R4 | Peníze: `BIGINT` v haléřích (`_haleru`), procenta v **basis pointech** (`_bp INTEGER`, 2000 = 20 %), zaokrouhlení HALF-UP jedinou funkcí `fn_pct_haleru`; sleva se zaokrouhluje **per položka objednávky** a souhrny objednávky = Σ položek. (D5, D19) | Jedno místo zaokrouhlení, chyba ≤ 0,5 h; per-položkové zaokrouhlení je jediné, které dává konzistentní součty při více položkách. |
| R5 | Partnerská cena se **nikde neukládá** — vždy odvozená (70 % katalogu, Trade dle úrovně), snapshot až v `order_items`. | Jediný zdroj pravdy ceny je katalog; snapshot v položce zafixuje historii. |
| R6 | Všechny peněžní důsledky objednávky (20 %, 15/6/4, leadership 2 %, Trade provize, 3% klubový kredit **i firemní margin**) jdou **jedním ledgerem** `commission_entries` se stavy `pending → available | reversed`. (D2) | Jeden auditovatelný akruální tok s jednotnou 15denní ochrannou lhůtou; margin dělá ledger bilančně úplný (Σ = `goods_paid`). |
| R7 | Klubový 3% kredit má **stejnou 15denní lhůtu** jako provize; UI vždy zobrazuje **dostupný** vs **čekající na aktivaci** kredit s datem aktivace. (R12 zadavatele) | Stejná ochrana proti vratkám, jednotný settlement job. |
| R8 | Settlement job překlopí `pending → available` a **v téže transakci** připíše `accrual` do `credit_transactions`; zůstatek kreditu = **Σ transakcí** (žádná tabulka účtů, žádná `ledger_accounts`). Výplata = debet provizního kreditu přes schválený `payout_request`. (D2, D3, D17) | Kredit je fungibilní — Σ append-only transakcí je auditovatelná bez denormalizace a bez FIFO párování. |
| R9 | Leadership pool 2 % vzniká **jen z `community_own`** obratů (základ = `goods_paid`), příjemce NULL = firemní pool; admin ho ručně alokuje položkami `leadership_alloc` (Σ alokací ≤ Σ poolu). (D15) | Závazný worked example dokládá pool pouze u vlastního nákupu partnera a §E.7 určuje ruční alokaci. |
| R10 | Klubový kredit **nelze vyplatit na účet**, jen utratit v nákupu; vyplatitelný je pouze provizní kredit. Kredit **bez expirace** (D16). | 3 % je věrnostní benefit zákazníka, ne odměna za práci; expirace byla návrh nad rámec zdrojů. |
| R11 | MVP storno = **vratka celé objednávky**: ke každému nestornovanému entry vznikne **nový záporný řádek** s `reverses_entry_id` (unikát), originál dostane `status='reversed'`; už připsaný akruál → `clawback`. Invariant: po plném stornu Σ (entries + reversaly) = 0. (D4) | Kompenzační záznamy drží ledger append-only a auditovatelný; poměrné storno = Fáze 2. |
| R12 | Měna pouze `CZK` (CHECK), sloupec ale existuje. | Nulové náklady dnes, otevřené dveře pro expanzi. |
| R13 | Sazby (20/15/6/4/2/3 %, Trade 30-10/35-8/40-5) žijí v `commission_rates` a `trade_level_params`; provozní konstanty (hold 15 dní, min. výplata 500 Kč, doprava 99 Kč / zdarma od 1 500 Kč) v `app_settings`. (D19, R14 zadavatele) | Admin „nastavuje provize“ i dopravu bez migrace. |
| R14 | Objednávka má povinný `business_flow` ENUM, kanonický vzorec `total_catalog − total_discount + shipping − credit_used = paid_money` (CHECK) a `goods_paid` jako generovaný sloupec; CHECK/triggery vynucují „jeden obrat = jedna obchodní logika“. (D6, D7) | Přímý požadavek §D provizního modelu + R11/R14 zadavatele (báze z peněz za zboží, nikdy z dopravy). |
| R15 | B2B CRM (`b2b_companies` s pipeline dle §6 zadání + nullable `profile_id`, `b2b_activities`) je oddělené od aktivního obchodního vztahu (`trade_partners`); konverze = FK. Žádné `b2b_contacts`/`b2b_opportunities` v MVP. (D13, D14) | CRM eviduje i firmy, které nikdy nenakoupí; Trade partner je až výsledek pipeline. |

## 1. Konvence

- PK: `uuid DEFAULT gen_random_uuid()`; `profiles.id` = `auth.users.id` (Supabase Auth).
- Časy: `timestamptz`, `created_at … DEFAULT now()`.
- Peníze: `*_haleru BIGINT`; procenta `*_bp INTEGER` (basis pointy, 2000 = 20 %).
- Vše má `COMMENT ON` (AI-udržovatelnost). Názvy tabulek anglicky, komentáře česky.
- Zůstatky se **nikde nedenormalizují** — vždy Σ append-only transakcí (D3). Neexistuje
  žádná tabulka `ledger_accounts` ani `credit_accounts`.
- Zápisy s byznys logikou (generování provizí, settlement, storno, čerpání kreditu,
  výplaty, změna sponzora) jdou výhradně přes `SECURITY DEFINER` funkce / service-role
  (Edge Functions); klient přes RLS jen čte a vytváří „své“ řádky (D22).
- RLS (závazně, detail v backend dokumentu): `ENABLE ROW LEVEL SECURITY` na všech
  tabulkách; ambasador vidí své zákazníky a downline max 3 generace (u cizích jen
  agregáty); peníze klient jen čte; `b2b_*` jen role `b2b_manager`/`admin`.

## 2. Kompletní DDL

### 2.1 Rozšíření, ENUMy, helper funkce

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;    -- case-insensitive e-maily a referral kódy

CREATE TYPE user_role AS ENUM
  ('customer','ambassador','mentor','leader','trade_partner','b2b_manager','admin');  -- D10
CREATE TYPE business_flow AS ENUM
  ('community_own','community_customer','trade','organic');                            -- D7
CREATE TYPE order_status AS ENUM
  ('draft','awaiting_payment','paid','shipped','completed','cancelled','refunded');    -- D8
CREATE TYPE payment_method AS ENUM ('card');           -- D23: MVP jen karta; rozšíření = ALTER TYPE ... ADD VALUE
CREATE TYPE payment_status AS ENUM
  ('initiated','pending','paid','failed','refunded','cancelled');
CREATE TYPE commission_entry_type AS ENUM                                              -- D2
  ('personal_customer',      -- 20 % ambasadorovi z nákupu jeho osobního zákazníka
   'team_gen1','team_gen2','team_gen3',  -- 15/6/4 % směrem nahoru od nakupujícího partnera
   'leadership_pool',        -- 2 % rezervovaný pool (beneficiary NULL = firma)
   'leadership_alloc',       -- ruční alokace poolu adminem (§E.7)
   'trade_acquirer',         -- 10/8/5 % získavateli Trade partnera
   'club_credit',            -- 3 % klubový kredit zákazníkovi
   'company_margin');        -- bilanční dopočet firmy (base − Σ příjemců), beneficiary NULL
CREATE TYPE commission_status AS ENUM ('pending','available','reversed');              -- D2
CREATE TYPE credit_kind    AS ENUM ('club','commission');                              -- D3
CREATE TYPE credit_tx_type AS ENUM ('accrual','spend','payout','clawback','adjustment');
CREATE TYPE payout_status  AS ENUM ('requested','approved','paid','rejected','cancelled'); -- D17
CREATE TYPE trade_level    AS ENUM ('entry','active','strategic');                     -- D13
CREATE TYPE application_status AS ENUM ('requested','approved','rejected');            -- D11
CREATE TYPE b2b_pipeline AS ENUM   -- přesně dle §6 zadání                             -- D14
  ('new_contact','contacted','meeting_scheduled','offer_sent',
   'first_order','active_partner','repeat_partner','inactive');

-- Jediné místo zaokrouhlování peněz v celém systému (D5). HALF-UP na celé haléře.
CREATE FUNCTION fn_pct_haleru(base_haleru BIGINT, rate_bp INTEGER) RETURNS BIGINT
LANGUAGE sql IMMUTABLE AS $$
  SELECT ROUND((base_haleru::numeric * rate_bp) / 10000)::bigint
$$;
COMMENT ON FUNCTION fn_pct_haleru IS
 'Procento z částky v haléřích, sazba v basis pointech (2000=20 %). ROUND(numeric) = half away from zero = HALF-UP pro kladné částky, chyba <= 0,5 haléře. Ověřeno na worked example: fn_pct_haleru(70000,1500)=10500 (105 Kč). Sleva se počítá per POLOŽKA objednávky, nikdy z celkového součtu (D5).';
```

### 2.2 Konfigurace

```sql
CREATE TABLE app_settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE app_settings IS 'Provozní konstanty. Čte je backend, mění jen admin (se zápisem do audit_log).';
INSERT INTO app_settings (key, value) VALUES
  ('commission_hold_days',     '15'),      -- ochranná lhůta R12 zadavatele
  ('payout_min_haleru',        '50000'),   -- min. výplata 500 Kč (D17)
  ('shipping_flat_haleru',     '9900'),    -- doprava 99 Kč (R14 zadavatele)
  ('shipping_free_from_haleru','150000');  -- doprava zdarma od 1 500 Kč (R14 zadavatele)

CREATE TABLE commission_rates (
  code        text PRIMARY KEY,   -- odpovídá commission_entry_type
  rate_bp     integer NOT NULL CHECK (rate_bp BETWEEN 0 AND 10000),
  description text NOT NULL
);
COMMENT ON TABLE commission_rates IS 'Konfigurovatelné sazby provizí (basis pointy, D19). Změna sazby platí pro NOVĚ generované entries; historické entries mají sazbu zafixovanou v řádku. company_margin sazbu nemá — je to přesný dopočet base − Σ příjemců (D5).';
INSERT INTO commission_rates VALUES
  ('personal_customer',2000,'20 % ambasadorovi z nákupu osobního zákazníka (základ = goods_paid)'),
  ('team_gen1',1500,'15 % přímému sponzorovi nakupujícího partnera (základ = goods_paid po partnerské slevě)'),
  ('team_gen2', 600,'6 % sponzorovi sponzora'),
  ('team_gen3', 400,'4 % pra-sponzorovi'),
  ('leadership_pool',200,'2 % rezervovaný leadership pool (jen community_own)'),
  ('club_credit',300,'3 % klubový kredit zákazníkovi');

CREATE TABLE trade_level_params (
  level            trade_level PRIMARY KEY,
  discount_bp      integer NOT NULL CHECK (discount_bp BETWEEN 0 AND 10000),
  acquirer_rate_bp integer NOT NULL CHECK (acquirer_rate_bp BETWEEN 0 AND 10000)
);
COMMENT ON TABLE trade_level_params IS 'Parametry úrovní PENTARIVA TRADE (D19): sleva z katalogu + provize získavateli (počítá se ze ZAPLACENÉ částky za zboží = goods_paid).';
INSERT INTO trade_level_params VALUES
  ('entry',3000,1000),('active',3500,800),('strategic',4000,500);
```

### 2.3 Profily, role, genealogie (D9, D10, D32)

```sql
CREATE TABLE profiles (
  id                   uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
  role                 user_role NOT NULL DEFAULT 'customer',
  display_name         text NOT NULL,
  email                citext NOT NULL UNIQUE,
  phone                text UNIQUE,       -- unikátní telefon = jediný anti-fraud aparát MVP (D30)
  birth_date           date,
  address              jsonb,             -- {street, city, zip, country}
  registration_source  text,              -- 'organic' | 'referral' | 'admin'
  -- genealogie (jen role ambassador/mentor/leader):
  sponsor_id           uuid REFERENCES profiles(id) ON DELETE RESTRICT,
  path                 text,              -- materialised path '/uuid-root/…/uuid-vlastni/'
  depth                integer,
  is_network_root      boolean NOT NULL DEFAULT false,  -- firemní kořen sítě (jediný bez sponzora)
  -- příslušnost zákazníka (NENÍ generace):
  owner_ambassador_id  uuid REFERENCES profiles(id) ON DELETE RESTRICT,
  monthly_goal_haleru  bigint CHECK (monthly_goal_haleru IS NULL OR monthly_goal_haleru >= 0),  -- D32
  is_active            boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_no_self_sponsor CHECK (sponsor_id <> id),
  CONSTRAINT chk_tree_membership CHECK (
    (role IN ('ambassador','mentor','leader')
       AND (sponsor_id IS NOT NULL OR is_network_root) AND path IS NOT NULL AND depth IS NOT NULL)
    OR
    (role IN ('customer','trade_partner','b2b_manager','admin')
       AND sponsor_id IS NULL AND path IS NULL AND depth IS NULL)
  )
);
COMMENT ON TABLE profiles IS 'Uživatelé všech rolí (D10). Sponsor strom (sponsor_id+path) existuje JEN pro Community partnery; osobní zákazník visí přes owner_ambassador_id a NENÍ partnerská generace (D9); Trade partner ve stromu není (získavatele má v trade_partners, D13).';
COMMENT ON COLUMN profiles.path IS 'Materialised path ''/id1/id2/…/'' udržovaná triggerem, ručně needitovat. Downline dotaz: WHERE path LIKE mujpath || ''%''.';
COMMENT ON COLUMN profiles.owner_ambassador_id IS 'Ambasador, kterému zákazník „patří" (20% provize z jeho nákupů). Při povýšení zákazníka na ambasadora se stane jeho sponsor_id.';
COMMENT ON COLUMN profiles.monthly_goal_haleru IS 'Osobní měsíční cíl obratu (D32); v MVP si ho nastavuje uživatel sám.';

CREATE INDEX idx_profiles_sponsor ON profiles (sponsor_id);
CREATE INDEX idx_profiles_owner   ON profiles (owner_ambassador_id);
CREATE INDEX idx_profiles_path    ON profiles (path text_pattern_ops); -- prefix-scan downline
CREATE UNIQUE INDEX uq_profiles_single_root ON profiles ((true)) WHERE is_network_root;

-- Trigger: nastaví path/depth při INSERTu, zakáže změnu sponzora (R2/D9).
CREATE FUNCTION trg_profiles_path_fn() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.sponsor_id IS DISTINCT FROM OLD.sponsor_id THEN
      RAISE EXCEPTION 'sponsor_id je neměnný (D9); použij fn_admin_change_sponsor';
    END IF;
    RETURN NEW;
  END IF;
  IF NEW.role IN ('ambassador','mentor','leader') THEN
    IF NEW.sponsor_id IS NULL THEN         -- kořen sítě
      NEW.path  := '/' || NEW.id || '/';
      NEW.depth := 0;
    ELSE
      SELECT p.path || NEW.id || '/', p.depth + 1 INTO NEW.path, NEW.depth
      FROM profiles p WHERE p.id = NEW.sponsor_id
        AND p.role IN ('ambassador','mentor','leader');
      IF NEW.path IS NULL THEN RAISE EXCEPTION 'sponzor % není partner v síti', NEW.sponsor_id; END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_profiles_path BEFORE INSERT OR UPDATE OF sponsor_id, role
  ON profiles FOR EACH ROW EXECUTE FUNCTION trg_profiles_path_fn();

-- Jediná povolená cesta ke změně sponzora: admin, do 14 dnů od registrace, s auditem (D9).
CREATE FUNCTION fn_admin_change_sponsor(p_profile uuid, p_new_sponsor uuid, p_actor uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_old profiles%ROWTYPE; v_new_path text; v_new_depth integer;
BEGIN
  SELECT * INTO v_old FROM profiles WHERE id = p_profile FOR UPDATE;
  IF v_old.created_at < now() - interval '14 days' THEN
    RAISE EXCEPTION 'Sponzora lze opravit jen do 14 dnů od registrace (D9)';
  END IF;
  SELECT p.path || p_profile || '/', p.depth + 1 INTO v_new_path, v_new_depth
    FROM profiles p WHERE p.id = p_new_sponsor AND p.role IN ('ambassador','mentor','leader');
  IF v_new_path IS NULL THEN RAISE EXCEPTION 'Nový sponzor není partner v síti'; END IF;
  -- přepsat path celé podvětve + vlastní řádek (obchází immutability trigger vypnutím session_replication_role NE — trigger hlídá jen sponsor_id, path přepisujeme přímo):
  ALTER TABLE profiles DISABLE TRIGGER trg_profiles_path;
  UPDATE profiles SET path = v_new_path || substring(path from length(v_old.path)+1),
                      depth = depth - v_old.depth + v_new_depth
   WHERE path LIKE v_old.path || '%' AND id <> p_profile;
  UPDATE profiles SET sponsor_id = p_new_sponsor, path = v_new_path, depth = v_new_depth
   WHERE id = p_profile;
  ALTER TABLE profiles ENABLE TRIGGER trg_profiles_path;
  INSERT INTO audit_log (actor_profile_id, entity, entity_id, action, before, after)
  VALUES (p_actor, 'profiles', p_profile::text, 'profile.sponsor_changed',
          jsonb_build_object('sponsor_id', v_old.sponsor_id, 'path', v_old.path),
          jsonb_build_object('sponsor_id', p_new_sponsor,   'path', v_new_path));
END $$;
COMMENT ON FUNCTION fn_admin_change_sponsor IS 'Admin oprava chybného sponzora do 14 dnů od registrace (D9): přepíše sponsor_id + path celé podvětve a zapíše audit. Po 14 dnech neexistuje žádná cesta ke změně.';
```

### 2.4 Doporučovací kódy a události (D12)

```sql
CREATE TABLE referral_codes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code             citext NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9]{6,12}$'),
  product_id       uuid,   -- FK doplněn po CREATE TABLE products; NULL = osobní link
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE referral_codes IS 'Doporučovací kódy (D12): 6–12 znaků [a-z0-9], citext = case-insensitive resolve. URL = pentariva.com/r/{code}. Vanity alias = další řádek téhož vlastníka (víc aktivních kódů je povoleno). product_id NOT NULL = produktový link. QR kód je čistě odvozenina URL — generuje klient, nic se neukládá.';
CREATE INDEX idx_referral_owner ON referral_codes (owner_profile_id);

CREATE TABLE referral_events (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id      uuid NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  kind                  text NOT NULL CHECK (kind IN ('click','registration')),
  visitor_hash          text,      -- anonymizovaný otisk návštěvníka (hash IP+UA), žádná PII
  user_agent            text,
  registered_profile_id uuid REFERENCES profiles(id),
  created_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_registration_profile CHECK (kind <> 'registration' OR registered_profile_id IS NOT NULL)
);
COMMENT ON TABLE referral_events IS 'Kliky na referral linky a z nich vzešlé registrace (D12). Zapisuje edge routa /r/[code]; slouží ke konverzním statistikám ambasadora.';
CREATE INDEX idx_referral_events_code ON referral_events (referral_code_id, created_at DESC);
```

### 2.5 Produkty a ceník

```sql
CREATE TABLE products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku         text NOT NULL UNIQUE,
  name        text NOT NULL,
  description text,
  vat_rate_bp integer NOT NULL DEFAULT 2100 CHECK (vat_rate_bp IN (0,1200,2100)),
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE products IS 'Katalog. Ceny VČETNĚ DPH (§D provizního modelu — všechna procenta se počítají z cen s DPH). Partnerská/Trade cena se NEUKLÁDÁ, je odvozená (R5).';

ALTER TABLE referral_codes
  ADD CONSTRAINT fk_referral_product FOREIGN KEY (product_id) REFERENCES products(id);

CREATE TABLE product_prices (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id           uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  catalog_price_haleru bigint NOT NULL CHECK (catalog_price_haleru > 0),
  valid_from           timestamptz NOT NULL DEFAULT now(),
  created_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, valid_from)
);
COMMENT ON TABLE product_prices IS 'Časovaný ceník (katalogová cena v haléřích vč. DPH). Aktuální cena = řádek s max valid_from <= now(). Historie se nemaže.';
CREATE INDEX idx_product_prices_lookup ON product_prices (product_id, valid_from DESC);

CREATE VIEW v_current_prices AS
SELECT DISTINCT ON (pp.product_id)
  pp.product_id,
  pp.catalog_price_haleru,
  pp.catalog_price_haleru - fn_pct_haleru(pp.catalog_price_haleru, 3000) AS partner_price_haleru
FROM product_prices pp
WHERE pp.valid_from <= now()
ORDER BY pp.product_id, pp.valid_from DESC;
COMMENT ON VIEW v_current_prices IS 'Aktuální katalogová + odvozená partnerská cena (katalog − 30% sleva zaokrouhlená HALF-UP, konzistentně s per-položkovým výpočtem slevy). Trade ceny pro konkrétní úroveň počítá aplikace stejným vzorcem z trade_level_params.';
```

### 2.6 Trade partneři (D13)

```sql
CREATE TABLE trade_partners (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          uuid NOT NULL UNIQUE REFERENCES profiles(id),
  company_name        text NOT NULL,
  ico                 text,
  dic                 text,
  level               trade_level NOT NULL DEFAULT 'entry',
  acquirer_profile_id uuid REFERENCES profiles(id),  -- kdo partnera přivedl; NULL = provize propadá firmě (zůstává v marginu)
  is_active           boolean NOT NULL DEFAULT true,
  approved_by         uuid REFERENCES profiles(id),
  approved_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE trade_partners IS 'Aktivní PENTARIVA TRADE vztah (D13): úroveň i získavatel žijí TADY, ne na profiles. Slevy 30/35/40 % dle trade_level_params; úroveň v MVP nastavuje admin ručně. Trade obrat NEgeneruje týmové 15/6/4 — jen provizi získavateli dle úrovně; bez získavatele provize propadá firmě.';
CREATE INDEX idx_trade_acquirer ON trade_partners (acquirer_profile_id);
```

### 2.7 Objednávky, položky, stavová mašina (D6, D7, D8, D18)

```sql
CREATE TABLE orders (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number             bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  buyer_profile_id         uuid NOT NULL REFERENCES profiles(id),
  business_flow            business_flow NOT NULL,
  attributed_ambassador_id uuid REFERENCES profiles(id),   -- komu patří zákaznický obrat (20 %)
  referral_code_id         uuid REFERENCES referral_codes(id),
  trade_partner_id         uuid REFERENCES trade_partners(id),
  status                   order_status NOT NULL DEFAULT 'draft',
  currency                 char(3) NOT NULL DEFAULT 'CZK' CHECK (currency = 'CZK'),
  total_catalog_haleru     bigint NOT NULL DEFAULT 0 CHECK (total_catalog_haleru >= 0),
  total_discount_haleru    bigint NOT NULL DEFAULT 0 CHECK (total_discount_haleru >= 0),
  shipping_haleru          bigint NOT NULL DEFAULT 0 CHECK (shipping_haleru >= 0),
  credit_used_haleru       bigint NOT NULL DEFAULT 0 CHECK (credit_used_haleru >= 0),
  paid_money_haleru        bigint NOT NULL DEFAULT 0 CHECK (paid_money_haleru >= 0),
  goods_paid_haleru        bigint GENERATED ALWAYS AS
    (total_catalog_haleru - total_discount_haleru - credit_used_haleru) STORED,  -- D6: báze provizí
  shipping_address         jsonb,
  paid_at                  timestamptz,   -- nastavuje VÝHRADNĚ webhook platby (D8)
  shipped_at               timestamptz,
  completed_at             timestamptz,
  cancelled_at             timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now(),
  -- D7: kanonický vzorec objednávky
  CONSTRAINT chk_order_formula CHECK
    (total_catalog_haleru - total_discount_haleru + shipping_haleru - credit_used_haleru
     = paid_money_haleru),
  -- D6: kredit se uplatňuje jen na zboží, doprava se platí vždy penězi
  CONSTRAINT chk_credit_only_goods CHECK
    (credit_used_haleru <= total_catalog_haleru - total_discount_haleru),
  -- „JEDEN OBRAT = JEDNA OBCHODNÍ LOGIKA" (§D) — deklarativní část:
  CONSTRAINT chk_flow_shape CHECK (
    (business_flow = 'community_own'
       AND attributed_ambassador_id IS NULL AND trade_partner_id IS NULL)          -- 30% sleva, žádné 20 %
    OR (business_flow = 'community_customer'
       AND attributed_ambassador_id IS NOT NULL AND trade_partner_id IS NULL
       AND total_discount_haleru = 0)                                              -- plná cena, 20 % + 3 %
    OR (business_flow = 'trade'
       AND trade_partner_id IS NOT NULL AND attributed_ambassador_id IS NULL)      -- Trade sleva, provize získavateli
    OR (business_flow = 'organic'
       AND attributed_ambassador_id IS NULL AND trade_partner_id IS NULL
       AND total_discount_haleru = 0)                                              -- plná cena, jen 3 %
  )
);
COMMENT ON TABLE orders IS 'Objednávky. business_flow se určí PŘI VYTVOŘENÍ a už se nemění (trigger). Kanonický vzorec (D7): catalog − discount + shipping − credit = paid_money; goods_paid (generovaný) = báze provizí i 3% kreditu (D6, R11 zadavatele). Plně kreditem hrazené zboží → goods_paid=0 → žádné nové provize. Provize se NIKDY nepočítají z dopravy.';
COMMENT ON COLUMN orders.attributed_ambassador_id IS 'Denormalizovaný vlastník zákaznického obratu = buyer.owner_ambassador_id v okamžiku objednávky (historická pravda nezávislá na pozdějších změnách).';
COMMENT ON COLUMN orders.paid_at IS 'Okamžik zaplacení; nastavuje webhook brány spolu s přechodem na status paid. Žádný sloupec payment_status na orders neexistuje — stav brány žije v payments (D8).';
CREATE INDEX idx_orders_buyer_month   ON orders (buyer_profile_id, paid_at);
CREATE INDEX idx_orders_attributed    ON orders (attributed_ambassador_id, paid_at);
CREATE INDEX idx_orders_trade         ON orders (trade_partner_id, paid_at);
CREATE INDEX idx_orders_status        ON orders (status);
CREATE INDEX idx_orders_flow_paid     ON orders (business_flow, paid_at);

CREATE TABLE order_items (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                  uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id                uuid NOT NULL REFERENCES products(id),
  quantity                  integer NOT NULL CHECK (quantity > 0),
  unit_catalog_price_haleru bigint NOT NULL CHECK (unit_catalog_price_haleru >= 0),  -- snapshot ceníku
  line_catalog_haleru       bigint GENERATED ALWAYS AS (unit_catalog_price_haleru * quantity) STORED,
  line_discount_haleru      bigint NOT NULL DEFAULT 0,
  line_paid_haleru          bigint GENERATED ALWAYS AS
    (unit_catalog_price_haleru * quantity - line_discount_haleru) STORED,
  vat_rate_bp               integer NOT NULL,     -- snapshot z products
  is_gift                   boolean NOT NULL DEFAULT false,   -- D18a
  UNIQUE (order_id, product_id, is_gift),
  CONSTRAINT chk_discount_range CHECK
    (line_discount_haleru >= 0 AND line_discount_haleru <= unit_catalog_price_haleru * quantity),
  CONSTRAINT chk_gift_zero CHECK
    ((is_gift AND unit_catalog_price_haleru = 0 AND line_discount_haleru = 0)
     OR (NOT is_gift AND unit_catalog_price_haleru > 0))
);
COMMENT ON TABLE order_items IS 'Položky se snapshotem cen. Sleva se počítá a zaokrouhluje PER POLOŽKA (D5): line_discount = fn_pct_haleru(line_catalog, sazba flow) — vynucuje fn_validate_order_pricing při odeslání objednávky. Souhrny objednávky = Σ položek.';
COMMENT ON COLUMN order_items.is_gift IS 'Dárek k objednávce (D18a, R13 zadavatele): položka s cenou 0 (snapshot ceny = 0, žádná sleva) — fyzický dárek v balíčku. Milníkové dárky eviduje milestone_gifts.';
CREATE INDEX idx_order_items_product ON order_items (product_id);

-- Stavová mašina D8: povolené přechody jako data + guard trigger.
CREATE TABLE order_status_transitions (
  from_status order_status NOT NULL,
  to_status   order_status NOT NULL,
  PRIMARY KEY (from_status, to_status)
);
COMMENT ON TABLE order_status_transitions IS 'Whitelist přechodů stavů objednávky dle D8; vynucuje trigger trg_orders_status. cancelled jen před zaplacením; refunded jen po zaplacení (vždy celá objednávka, D4).';
INSERT INTO order_status_transitions VALUES
  ('draft','awaiting_payment'),('draft','cancelled'),
  ('awaiting_payment','paid'),('awaiting_payment','cancelled'),
  ('paid','shipped'),('paid','refunded'),
  ('shipped','completed'),('shipped','refunded'),
  ('completed','refunded');

-- Validace cen per položka (D5) — volá se při odeslání objednávky do platby.
CREATE FUNCTION fn_validate_order_pricing(p_order uuid) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  o orders%ROWTYPE; v_role user_role; v_bp integer;
  v_cat bigint; v_disc bigint; v_bad integer;
  v_flat bigint; v_free_from bigint; v_expected_ship bigint;
BEGIN
  SELECT * INTO o FROM orders WHERE id = p_order;
  SELECT role INTO v_role FROM profiles WHERE id = o.buyer_profile_id;
  CASE o.business_flow
    WHEN 'community_own' THEN
      IF v_role NOT IN ('ambassador','mentor','leader') THEN
        RAISE EXCEPTION 'community_own smí nakoupit jen partner sítě'; END IF;
      v_bp := 3000;
    WHEN 'trade' THEN
      SELECT tlp.discount_bp INTO v_bp
      FROM trade_partners tp JOIN trade_level_params tlp ON tlp.level = tp.level
      WHERE tp.id = o.trade_partner_id AND tp.profile_id = o.buyer_profile_id AND tp.is_active;
      IF v_bp IS NULL THEN
        RAISE EXCEPTION 'trade objednávka: kupující není aktivní Trade partner'; END IF;
    ELSE v_bp := 0;
  END CASE;
  -- souhrny objednávky = Σ položek (D5)
  SELECT COALESCE(SUM(line_catalog_haleru),0), COALESCE(SUM(line_discount_haleru),0)
    INTO v_cat, v_disc FROM order_items WHERE order_id = p_order;
  IF v_cat <> o.total_catalog_haleru OR v_disc <> o.total_discount_haleru THEN
    RAISE EXCEPTION 'Souhrny objednávky neodpovídají Σ položek'; END IF;
  -- sleva zaokrouhlená PER POLOŽKA, nikdy z celkového součtu (D5):
  SELECT COUNT(*) INTO v_bad FROM order_items i
   WHERE i.order_id = p_order AND NOT i.is_gift
     AND i.line_discount_haleru <> fn_pct_haleru(i.line_catalog_haleru, v_bp);
  IF v_bad > 0 THEN
    RAISE EXCEPTION 'Sleva musí být % bp z KAŽDÉ položky zvlášť (HALF-UP per položka)', v_bp; END IF;
  -- doprava dle konfigurace (R14 zadavatele): paušál / zdarma od limitu
  SELECT (value)::bigint INTO v_flat      FROM app_settings WHERE key='shipping_flat_haleru';
  SELECT (value)::bigint INTO v_free_from FROM app_settings WHERE key='shipping_free_from_haleru';
  v_expected_ship := CASE WHEN o.total_catalog_haleru - o.total_discount_haleru >= v_free_from
                          THEN 0 ELSE v_flat END;
  IF o.shipping_haleru <> v_expected_ship THEN
    RAISE EXCEPTION 'Doprava neodpovídá konfiguraci (očekáváno %)', v_expected_ship; END IF;
END $$;
COMMENT ON FUNCTION fn_validate_order_pricing IS 'Validace cen před platbou: role kupujícího, sleva per POLOŽKA (D5 — u vícepoložkových objednávek se sleva NEPOČÍTÁ z celkového součtu; legitimní objednávky se Σ per-položkových zaokrouhlení ≠ pct(celek) musí projít), souhrny = Σ položek, doprava dle app_settings.';

CREATE FUNCTION trg_orders_status_fn() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NOT EXISTS (SELECT 1 FROM order_status_transitions
                     WHERE from_status = OLD.status AND to_status = NEW.status) THEN
    RAISE EXCEPTION 'Nepovolený přechod stavu objednávky % -> %', OLD.status, NEW.status;
  END IF;
  IF NEW.business_flow IS DISTINCT FROM OLD.business_flow THEN
    RAISE EXCEPTION 'business_flow je po vytvoření objednávky neměnný (jeden obrat = jedna logika)';
  END IF;
  IF OLD.status = 'draft' AND NEW.status = 'awaiting_payment' THEN
    PERFORM fn_validate_order_pricing(NEW.id);
  END IF;
  IF NEW.status = 'paid' AND NEW.paid_at IS NULL THEN
    RAISE EXCEPTION 'Přechod na paid vyžaduje paid_at (nastavuje webhook platby, D8)';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_orders_status BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION trg_orders_status_fn();
```

### 2.8 Platby (D23) a vratky (D4)

```sql
CREATE TABLE payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid NOT NULL REFERENCES orders(id),
  provider            text NOT NULL DEFAULT 'stripe',  -- za tenkým PaymentProvider rozhraním (D23)
  provider_payment_id text,            -- ID platby/intentu u brány
  provider_event_id   text,            -- ID webhook události — deduplikace
  livemode            boolean NOT NULL DEFAULT false,  -- R8 zadavatele: MVP běží v test módu
  method              payment_method NOT NULL DEFAULT 'card',
  amount_haleru       bigint NOT NULL CHECK (amount_haleru > 0),
  status              payment_status NOT NULL DEFAULT 'initiated',
  payload             jsonb,           -- surový webhook/odpověď brány pro forenziku
  created_at          timestamptz NOT NULL DEFAULT now(),
  paid_at             timestamptz,
  UNIQUE (provider, provider_payment_id),
  UNIQUE (provider, provider_event_id)   -- webhook dedup: stejná událost se nikdy nezpracuje dvakrát
);
COMMENT ON TABLE payments IS 'Platby PENĚZI za objednávku, gateway-agnostické (D23: Stripe test mód, swap na Comgate izolovaný). amount = orders.paid_money_haleru (hlídá webhook handler). Čerpání kreditu NENÍ platba — žije v credit_transactions (spend, spent_on_order_id). Stav brány žije výhradně tady; orders.paid_at nastavuje webhook (D8). livemode=false dokud firma nemá IČO.';
COMMENT ON COLUMN payments.provider_event_id IS 'Unikát (provider, provider_event_id) = idempotentní zpracování webhooků; opakované doručení téže události skončí na konfliktu a nic nepřepíše.';
CREATE INDEX idx_payments_order ON payments (order_id);

CREATE TABLE order_refunds (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid NOT NULL UNIQUE REFERENCES orders(id),  -- UNIQUE: v MVP jen jedna (plná) vratka
  amount_haleru bigint NOT NULL CHECK (amount_haleru > 0),
  reason        text NOT NULL,
  created_by    uuid REFERENCES profiles(id),
  created_at    timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE order_refunds IS 'MVP podporuje pouze vratku CELÉ objednávky (D4): amount = orders.paid_money_haleru (hlídá fn_refund_order). Vratka přepne objednávku na refunded, ke každému nestornovanému entry vytvoří záporný reversal a už připsané akruály clawbackne; použitý kredit se vrací adjustmentem.';
```

### 2.9 Provizní ledger (D2, D5, D6, D15)

```sql
CREATE TABLE commission_entries (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id               uuid NOT NULL REFERENCES orders(id),
  order_flow             business_flow NOT NULL,   -- kopie orders.business_flow kvůli CHECKu níže
  entry_type             commission_entry_type NOT NULL,
  beneficiary_profile_id uuid REFERENCES profiles(id),  -- NULL = firemní pool (leadership_pool) / margin (company_margin)
  generation             smallint CHECK (generation BETWEEN 1 AND 3),
  base_haleru            bigint NOT NULL CHECK (base_haleru >= 0),
  rate_bp                integer NOT NULL CHECK (rate_bp BETWEEN 0 AND 10000),
  amount_haleru          bigint NOT NULL,
  status                 commission_status NOT NULL DEFAULT 'pending',
  hold_until             timestamptz NOT NULL,     -- = orders.paid_at + commission_hold_days
  parent_entry_id        uuid REFERENCES commission_entries(id),  -- leadership_alloc -> pool entry (D15)
  reverses_entry_id      uuid UNIQUE REFERENCES commission_entries(id),  -- storno: záporný řádek míří na originál (D2/D4)
  reversal_reason        text,
  status_changed_at      timestamptz NOT NULL DEFAULT now(),
  created_at             timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_hold CHECK (hold_until >= created_at OR reverses_entry_id IS NOT NULL),
  -- originály kladné (nulové záznamy se NIKDY nezapisují, D6), reversaly záporné:
  CONSTRAINT chk_amount_sign CHECK (
    (reverses_entry_id IS NULL AND amount_haleru > 0)
    OR (reverses_entry_id IS NOT NULL AND amount_haleru < 0)
  ),
  -- vzorec platí pro kalkulační sazbové typy; leadership_alloc je ruční částka,
  -- company_margin je dopočet base − Σ příjemců (D5), reversal je −originál:
  CONSTRAINT chk_amount_formula CHECK (
    reverses_entry_id IS NOT NULL
    OR entry_type IN ('leadership_alloc','company_margin')
    OR amount_haleru = fn_pct_haleru(base_haleru, rate_bp)
  ),
  CONSTRAINT chk_pool_no_beneficiary CHECK
    (entry_type NOT IN ('leadership_pool','company_margin') OR beneficiary_profile_id IS NULL),
  CONSTRAINT chk_others_have_beneficiary CHECK
    (entry_type IN ('leadership_pool','company_margin') OR beneficiary_profile_id IS NOT NULL),
  CONSTRAINT chk_alloc_has_parent CHECK
    (entry_type <> 'leadership_alloc' OR parent_entry_id IS NOT NULL),
  CONSTRAINT chk_generation_only_team CHECK
    ((entry_type IN ('team_gen1','team_gen2','team_gen3')) = (generation IS NOT NULL)),
  -- „JEDEN OBRAT = JEDNA LOGIKA" na úrovni ledgeru — company_margin je povolen VŠUDE
  -- (bilanční dopočet firmy existuje u každého flow):
  CONSTRAINT chk_flow_type CHECK (
    entry_type = 'company_margin'
    OR (order_flow = 'community_customer' AND entry_type IN ('personal_customer','club_credit'))
    OR (order_flow = 'community_own'
        AND entry_type IN ('team_gen1','team_gen2','team_gen3','leadership_pool','leadership_alloc'))
    OR (order_flow = 'trade'   AND entry_type = 'trade_acquirer')
    OR (order_flow = 'organic' AND entry_type = 'club_credit')
  )
);
COMMENT ON TABLE commission_entries IS 'Jediný ledger všech peněžních důsledků objednávek (D2): provize, týmové odměny, leadership pool, Trade provize, 3% klubový kredit i firemní margin. POUZE akruály a jejich storna. Stavy: pending (do paid_at+15 dní) -> available (settlement) | reversed (originál po stornu). company_margin je available IHNED (bilanční dopočet firmy). Storno = nový záporný řádek s reverses_entry_id. Řádky se NIKDY nemažou ani neupravují.';
COMMENT ON COLUMN commission_entries.order_flow IS 'Denormalizace orders.business_flow — umožňuje deklarativní CHECK chk_flow_type; shodu s objednávkou vynucuje fn_generate_commissions (jediný producent řádků).';
COMMENT ON COLUMN commission_entries.base_haleru IS 'Základ výpočtu = orders.goods_paid_haleru (D6): community_own = částka za zboží PO 30% slevě a po odečtení kreditu; community_customer/organic = plná zaplacená částka za zboží; trade = částka po Trade slevě. NIKDY nezahrnuje dopravu.';
COMMENT ON COLUMN commission_entries.beneficiary_profile_id IS 'NULL = firemní strana ledgeru: leadership_pool (čeká na ruční alokaci) a company_margin (zůstává firmě).';
COMMENT ON COLUMN commission_entries.reverses_entry_id IS 'Vyplněno jen u storno řádků: FK + UNIQUE na originál (každé entry lze stornovat max jednou). Originál současně dostává status=reversed.';

-- Idempotence (D2): jeden typ pro jednoho příjemce na objednávku; NULLS NOT DISTINCT
-- kvůli firemním řádkům (beneficiary NULL). Reversaly mimo unikát.
CREATE UNIQUE INDEX uq_commission_once
  ON commission_entries (order_id, beneficiary_profile_id, entry_type) NULLS NOT DISTINCT
  WHERE reverses_entry_id IS NULL AND entry_type <> 'leadership_alloc';
COMMENT ON INDEX uq_commission_once IS 'Idempotence generátoru (D2): unikát (order_id, beneficiary_profile_id, entry_type) pro originály; leadership_alloc (více ručních alokací) a storno řádky mimo.';
CREATE INDEX idx_commission_beneficiary ON commission_entries (beneficiary_profile_id, status);
CREATE INDEX idx_commission_order       ON commission_entries (order_id);
CREATE INDEX idx_commission_release     ON commission_entries (status, hold_until)
  WHERE status = 'pending';   -- pro denní settlement job
```

### 2.10 Kreditní transakce (D3) — zůstatek = Σ, žádná tabulka účtů

```sql
CREATE TABLE credit_transactions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          uuid NOT NULL REFERENCES profiles(id),
  kind                credit_kind NOT NULL,       -- club | commission
  type                credit_tx_type NOT NULL,    -- accrual | spend | payout | clawback | adjustment
  amount_haleru       bigint NOT NULL CHECK (amount_haleru <> 0),  -- + připsání / − čerpání
  commission_entry_id uuid REFERENCES commission_entries(id),
  spent_on_order_id   uuid REFERENCES orders(id),
  payout_request_id   uuid,   -- FK doplněn po CREATE TABLE payout_requests
  note                text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_tx_sign CHECK (
    (type = 'accrual'                        AND amount_haleru > 0) OR
    (type IN ('spend','payout','clawback')   AND amount_haleru < 0) OR
    (type = 'adjustment')
  ),
  CONSTRAINT chk_tx_link CHECK (
    (type IN ('accrual','clawback') AND commission_entry_id IS NOT NULL) OR
    (type = 'spend'                 AND spent_on_order_id  IS NOT NULL) OR
    (type = 'payout'                AND payout_request_id  IS NOT NULL) OR
    (type = 'adjustment')
  )
);
COMMENT ON TABLE credit_transactions IS 'Append-only pohyby kreditu (D3). Zůstatek = Σ amount_haleru per (profile_id, kind) — ŽÁDNÁ tabulka účtů/ledger_accounts neexistuje. accrual = připsání entry překlopeného na available (settlement); spend = úhrada zboží kreditem (spent_on_order_id); payout = výplata provizního kreditu; clawback = zpětvzetí po vratce (zůstatek SMÍ jít do minusu, netuje se budoucími akruály); adjustment = ruční korekce adminem (vždy s note + audit). Žádné FIFO párování čerpání na konkrétní entries. Přečerpání u spend/payout hlídají SECURITY DEFINER funkce pod pg_advisory_xact_lock(profile, kind).';
CREATE INDEX idx_credit_tx_profile ON credit_transactions (profile_id, kind, created_at DESC);
-- Idempotence settlementu: jedno available entry = max jeden accrual.
CREATE UNIQUE INDEX uq_credit_accrual_entry ON credit_transactions (commission_entry_id)
  WHERE type = 'accrual';

CREATE RULE credit_tx_no_update AS ON UPDATE TO credit_transactions DO INSTEAD NOTHING;
CREATE RULE credit_tx_no_delete AS ON DELETE TO credit_transactions DO INSTEAD NOTHING;
```

### 2.11 Výplaty (D17)

```sql
CREATE TABLE payout_requests (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_profile_id uuid NOT NULL REFERENCES profiles(id),
  amount_haleru          bigint NOT NULL CHECK (amount_haleru > 0),
  bank_account           text NOT NULL,   -- české č.ú./IBAN; validace v aplikaci
  status                 payout_status NOT NULL DEFAULT 'requested',
  requested_at           timestamptz NOT NULL DEFAULT now(),
  decided_at             timestamptz,
  decided_by             uuid REFERENCES profiles(id),
  rejection_reason       text,
  paid_at                timestamptz,
  CONSTRAINT chk_decision CHECK (status = 'requested' OR decided_at IS NOT NULL)
);
COMMENT ON TABLE payout_requests IS 'Žádosti o výplatu PROVIZNÍHO kreditu (D17): requested -> approved (admin; vzniká rezervační credit_transaction type=payout) -> paid (admin odeslal převod z banky) | rejected | cancelled (případná rezervace se vrací adjustmentem). Klubový kredit vyplatit NELZE (R10). Nárok = aktuální zůstatek provizního kreditu — díky 15denní lhůtě je už „zralý". Min. částka = app_settings.payout_min_haleru (500 Kč).';
ALTER TABLE credit_transactions ADD CONSTRAINT fk_credit_tx_payout
  FOREIGN KEY (payout_request_id) REFERENCES payout_requests(id);
CREATE INDEX idx_payout_beneficiary ON payout_requests (beneficiary_profile_id, status);
CREATE INDEX idx_payout_open ON payout_requests (status) WHERE status IN ('requested','approved');
```

### 2.12 CRM zákazníků (D33, §4 zadání)

```sql
CREATE TABLE crm_notes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_profile_id   uuid NOT NULL REFERENCES profiles(id),
  body                text NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE crm_notes IS 'Poznámky ambasadora k jeho zákazníkovi (D33, §4 zadání — „vztahový systém, ne anonymní e-shop"). RLS: autor + admin.';
CREATE INDEX idx_crm_notes_customer ON crm_notes (customer_profile_id, created_at DESC);

CREATE TABLE interest_tags (
  code  text PRIMARY KEY,
  label text NOT NULL
);
COMMENT ON TABLE interest_tags IS 'Číselník zájmových okruhů zákazníka přesně dle §4 zadání.';
INSERT INTO interest_tags VALUES
  ('spanek','Spánek'),('stres','Stres'),('imunita','Imunita'),('plet','Pleť'),
  ('detox','Detox'),('energie','Energie'),('menopauza','Menopauza'),('sport','Sport'),
  ('traveni','Trávení'),('regenerace','Regenerace'),
  ('hormonalni_rovnovaha','Hormonální rovnováha');

CREATE TABLE customer_interest_tags (
  customer_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tag_code            text NOT NULL REFERENCES interest_tags(code),
  added_by            uuid REFERENCES profiles(id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (customer_profile_id, tag_code)
);
COMMENT ON TABLE customer_interest_tags IS 'Zájmové okruhy zákazníka (M:N na číselník interest_tags, D33). Přiřazuje ambasador nebo zákazník sám; podklad pro doporučený další kontakt a Fázi 3.';
```

### 2.13 B2B CRM (D14, §6 zadání)

```sql
CREATE TABLE b2b_companies (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                        text NOT NULL,
  profile_id                  uuid UNIQUE REFERENCES profiles(id),  -- nullable: vyplněno u samoobslužné registrace
  segment                     text NOT NULL CHECK (segment IN
    ('hotel','wellness','maser','fyzioterapeut','kosmetika','fitness','lekar','klinika','firma','jine')),
  location                    text,
  size_note                   text,          -- velikost provozu volným textem
  potential                   text CHECK (potential IS NULL OR potential IN ('low','medium','high')),
  contact_name                text,
  contact_email               citext,
  contact_phone               text,
  pipeline_status             b2b_pipeline NOT NULL DEFAULT 'new_contact',
  assigned_manager_profile_id uuid REFERENCES profiles(id),
  trade_partner_id            uuid UNIQUE REFERENCES trade_partners(id),  -- vyplněno po konverzi
  approved_by                 uuid REFERENCES profiles(id),
  approved_at                 timestamptz,   -- NULL = samoobslužná registrace čeká na schválení (D14)
  next_action                 text,
  next_action_due             date,
  last_order_at               timestamptz,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE b2b_companies IS 'B2B CRM pipeline přesně dle §6 zadání (nový kontakt -> osloven -> schůzka -> nabídka -> první objednávka -> aktivní -> opakovaný -> neaktivní). Samoobslužná B2B registrace = profil (profile_id) čekající na schválení (approved_at NULL) + řádek new_contact (D14). Konverze na obchodní vztah = FK trade_partner_id (R15). Pořadí stavů DB nevynucuje — pipeline se legitimně vrací zpět. Žádné b2b_contacts/b2b_opportunities v MVP.';
CREATE INDEX idx_b2b_pipeline ON b2b_companies (pipeline_status);
CREATE INDEX idx_b2b_manager  ON b2b_companies (assigned_manager_profile_id, next_action_due);

CREATE TABLE b2b_activities (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        uuid NOT NULL REFERENCES b2b_companies(id) ON DELETE CASCADE,
  author_profile_id uuid REFERENCES profiles(id),
  kind              text NOT NULL CHECK (kind IN ('note','call','meeting','email','task')),
  body              text NOT NULL,
  due_at            timestamptz,
  done_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE b2b_activities IS 'Historie komunikace a úkoly k B2B firmě (D14): poznámky, hovory, schůzky, follow-upy. V MVP je vykonává admin (b2b_manager UI = Fáze 2, D10).';
CREATE INDEX idx_b2b_activities_company ON b2b_activities (company_id, created_at DESC);
```

### 2.14 Akademie a povýšení na ambasadora (D34, D11)

```sql
CREATE TABLE academy_modules (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position     integer NOT NULL UNIQUE,
  title        text NOT NULL,
  description  text,
  is_published boolean NOT NULL DEFAULT false
);
COMMENT ON TABLE academy_modules IS 'Školicí moduly (§13 zadání). MVP naplní Modul 1 „Start" — jeho složený kvíz podmiňuje povýšení na ambasadora (D11); žádné ruční „označit dokončeno" u Modulu 1 (D34).';

CREATE TABLE academy_lessons (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id    uuid NOT NULL REFERENCES academy_modules(id) ON DELETE CASCADE,
  position     integer NOT NULL,
  title        text NOT NULL,
  video_url    text,        -- Supabase Storage / externí embed
  body_md      text,        -- obsah lekce v Markdownu
  is_published boolean NOT NULL DEFAULT false,
  UNIQUE (module_id, position)
);
COMMENT ON TABLE academy_lessons IS 'Lekce modulu (video + text).';

CREATE TABLE academy_progress (
  profile_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id    uuid NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, lesson_id)
);
COMMENT ON TABLE academy_progress IS 'Dokončené lekce uživatele; progress modulu = poměr dokončených lekcí.';

CREATE TABLE academy_quiz_questions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id     uuid NOT NULL REFERENCES academy_modules(id) ON DELETE CASCADE,
  position      integer NOT NULL,
  question      text NOT NULL,
  options       jsonb NOT NULL CHECK (jsonb_typeof(options) = 'array'),
  correct_index integer NOT NULL CHECK (correct_index >= 0),
  is_active     boolean NOT NULL DEFAULT true,
  UNIQUE (module_id, position)
);
COMMENT ON TABLE academy_quiz_questions IS 'Otázky závěrečného kvízu modulu (D34): options = pole textů odpovědí, correct_index = index správné. correct_index klient NIKDY nečte (RLS sloupcová ochrana / vyhodnocení v SECURITY DEFINER funkci).';

CREATE TABLE academy_quiz_attempts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id  uuid NOT NULL REFERENCES academy_modules(id),
  answers    jsonb NOT NULL,   -- {question_id: zvolený index}
  score_bp   integer NOT NULL CHECK (score_bp BETWEEN 0 AND 10000),
  passed     boolean GENERATED ALWAYS AS (score_bp >= 8000) STORED,  -- práh 80 % (D34)
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE academy_quiz_attempts IS 'Pokusy o kvíz. passed je generovaný: score_bp >= 8000 = práh 80 % (D34, D11). Vyhodnocuje výhradně SECURITY DEFINER funkce (klient nezná správné odpovědi). Počet pokusů neomezen.';
CREATE INDEX idx_quiz_attempts ON academy_quiz_attempts (profile_id, module_id, created_at DESC);

CREATE TABLE ambassador_applications (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        uuid NOT NULL REFERENCES profiles(id),
  quiz_attempt_id   uuid NOT NULL REFERENCES academy_quiz_attempts(id),
  terms_accepted_at timestamptz NOT NULL,
  adult_confirmed   boolean NOT NULL DEFAULT false,   -- 18+ (D11)
  status            application_status NOT NULL DEFAULT 'requested',
  decided_by        uuid REFERENCES profiles(id),
  decided_at        timestamptz,
  note              text,
  created_at        timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE ambassador_applications IS 'Žádosti o povýšení customer -> ambassador (D11): vyžaduje passed pokus kvízu Modulu 1 (>= 80 %), souhlas s podmínkami, 18+ a SCHVÁLENÍ ADMINEM. Schválení nastaví profiles.role=ambassador a owner_ambassador_id -> sponsor_id (SECURITY DEFINER funkce + audit).';
CREATE UNIQUE INDEX uq_ambassador_application_open
  ON ambassador_applications (profile_id) WHERE status = 'requested';
```

### 2.15 Dárky (D18)

```sql
CREATE TABLE milestone_gifts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id),
  reason     text NOT NULL,     -- za co (milník, výročí, soutěž…)
  note       text,
  granted_by uuid REFERENCES profiles(id),
  granted_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE milestone_gifts IS 'Evidence milníkových dárků (D18b, R13 zadavatele): komu, za co, kdy, kdo přidělil. Fyzický dárek v konkrétní objednávce = order_items.is_gift (D18a).';
CREATE INDEX idx_milestone_gifts_profile ON milestone_gifts (profile_id, granted_at DESC);
```

### 2.16 Audit log

```sql
CREATE TABLE audit_log (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_profile_id uuid REFERENCES profiles(id),  -- NULL = systém/cron
  entity           text NOT NULL,      -- název tabulky
  entity_id        text NOT NULL,
  action           text NOT NULL,      -- 'order.paid','commission.reversed','payout.approved','profile.sponsor_changed'…
  before           jsonb,
  after            jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE audit_log IS 'Append-only auditní stopa. Povinně zapisují: změny stavů objednávek/plateb/provizí/výplat, ruční adminské zásahy (alokace poolu, adjustmenty, změna sponzora, změna Trade úrovně, změna sazeb a app_settings, schválení ambasadora/B2B). Zapisuje backend v téže transakci.';
CREATE INDEX idx_audit_entity ON audit_log (entity, entity_id, created_at DESC);
CREATE INDEX idx_audit_actor  ON audit_log (actor_profile_id, created_at DESC);
```

### 2.17 Peněžní funkce (jediní producenti ledgeru)

```sql
-- Generátor provizí — volá webhook handler po přechodu objednávky na paid.
CREATE FUNCTION fn_generate_commissions(p_order uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  o orders%ROWTYPE; r RECORD;
  v_hold timestamptz; v_rate integer;
  v_recipients bigint := 0; v_margin bigint;
BEGIN
  SELECT * INTO o FROM orders WHERE id = p_order FOR UPDATE;
  IF o.status <> 'paid' OR o.paid_at IS NULL THEN
    RAISE EXCEPTION 'Objednávka % není paid', p_order; END IF;
  -- early-exit idempotence: testuje VÝHRADNĚ kalkulační typy (D2) — ne ruční alokace, ne storna
  IF EXISTS (SELECT 1 FROM commission_entries
             WHERE order_id = p_order AND reverses_entry_id IS NULL
               AND entry_type <> 'leadership_alloc') THEN RETURN; END IF;
  IF o.goods_paid_haleru = 0 THEN RETURN; END IF;  -- plně kreditem: žádné entries (D6)
  v_hold := o.paid_at + make_interval(days =>
    (SELECT (value)::int FROM app_settings WHERE key = 'commission_hold_days'));

  IF o.business_flow = 'community_customer' THEN
    -- 3 % kredit zákazníkovi + 20 % ambasadorovi; základ = goods_paid (D6)
    FOR r IN SELECT * FROM (VALUES
        ('club_credit',       o.buyer_profile_id),
        ('personal_customer', o.attributed_ambassador_id)) AS t(code, benef) LOOP
      SELECT rate_bp INTO v_rate FROM commission_rates WHERE code = r.code;
      IF fn_pct_haleru(o.goods_paid_haleru, v_rate) > 0 THEN
        INSERT INTO commission_entries (order_id, order_flow, entry_type, beneficiary_profile_id,
                                        base_haleru, rate_bp, amount_haleru, hold_until)
        VALUES (o.id, o.business_flow, r.code::commission_entry_type, r.benef,
                o.goods_paid_haleru, v_rate, fn_pct_haleru(o.goods_paid_haleru, v_rate), v_hold);
        v_recipients := v_recipients + fn_pct_haleru(o.goods_paid_haleru, v_rate);
      END IF;
    END LOOP;

  ELSIF o.business_flow = 'organic' THEN
    SELECT rate_bp INTO v_rate FROM commission_rates WHERE code = 'club_credit';
    IF fn_pct_haleru(o.goods_paid_haleru, v_rate) > 0 THEN
      INSERT INTO commission_entries (order_id, order_flow, entry_type, beneficiary_profile_id,
                                      base_haleru, rate_bp, amount_haleru, hold_until)
      VALUES (o.id, 'organic', 'club_credit', o.buyer_profile_id,
              o.goods_paid_haleru, v_rate, fn_pct_haleru(o.goods_paid_haleru, v_rate), v_hold);
      v_recipients := fn_pct_haleru(o.goods_paid_haleru, v_rate);
    END IF;

  ELSIF o.business_flow = 'community_own' THEN
    -- týmové 15/6/4 z goods_paid (po 30% slevě) + 2% leadership pool
    FOR r IN SELECT * FROM fn_upline(o.buyer_profile_id, 3) LOOP
      SELECT rate_bp INTO v_rate FROM commission_rates WHERE code = 'team_gen' || r.generation;
      IF fn_pct_haleru(o.goods_paid_haleru, v_rate) > 0 THEN
        INSERT INTO commission_entries (order_id, order_flow, entry_type, beneficiary_profile_id,
                                        generation, base_haleru, rate_bp, amount_haleru, hold_until)
        VALUES (o.id, 'community_own', ('team_gen' || r.generation)::commission_entry_type,
                r.ancestor_id, r.generation, o.goods_paid_haleru, v_rate,
                fn_pct_haleru(o.goods_paid_haleru, v_rate), v_hold);
        v_recipients := v_recipients + fn_pct_haleru(o.goods_paid_haleru, v_rate);
      END IF;
    END LOOP;
    SELECT rate_bp INTO v_rate FROM commission_rates WHERE code = 'leadership_pool';
    IF fn_pct_haleru(o.goods_paid_haleru, v_rate) > 0 THEN
      INSERT INTO commission_entries (order_id, order_flow, entry_type, beneficiary_profile_id,
                                      base_haleru, rate_bp, amount_haleru, hold_until)
      VALUES (o.id, 'community_own', 'leadership_pool', NULL,
              o.goods_paid_haleru, v_rate, fn_pct_haleru(o.goods_paid_haleru, v_rate), v_hold);
      v_recipients := v_recipients + fn_pct_haleru(o.goods_paid_haleru, v_rate);
    END IF;

  ELSIF o.business_flow = 'trade' THEN
    -- provize získavateli z goods_paid dle úrovně partnera; bez získavatele vše zůstává v marginu
    FOR r IN SELECT tp.acquirer_profile_id, tlp.acquirer_rate_bp
             FROM trade_partners tp JOIN trade_level_params tlp ON tlp.level = tp.level
             WHERE tp.id = o.trade_partner_id AND tp.acquirer_profile_id IS NOT NULL LOOP
      IF fn_pct_haleru(o.goods_paid_haleru, r.acquirer_rate_bp) > 0 THEN
        INSERT INTO commission_entries (order_id, order_flow, entry_type, beneficiary_profile_id,
                                        base_haleru, rate_bp, amount_haleru, hold_until)
        VALUES (o.id, 'trade', 'trade_acquirer', r.acquirer_profile_id,
                o.goods_paid_haleru, r.acquirer_rate_bp,
                fn_pct_haleru(o.goods_paid_haleru, r.acquirer_rate_bp), v_hold);
        v_recipients := fn_pct_haleru(o.goods_paid_haleru, r.acquirer_rate_bp);
      END IF;
    END LOOP;
  END IF;

  -- Firemní margin = přesný dopočet base − Σ příjemců (D5); available IHNED (D2).
  -- hold_until = now(), NE o.paid_at: chk_hold vyžaduje hold_until >= created_at
  -- a fn_generate_commissions vždy běží PO paid_at (webhook nastaví paid_at dřív,
  -- než se tahle funkce zavolá), takže o.paid_at by chk_hold vždy porušilo.
  -- Stejný vzorec jako u leadership_alloc ("mimo hold", hodnota je informační).
  -- (Nalezeno a opraveno při ověření Epiku 1 proti reálnému Postgresu 2026-08-13.)
  v_margin := o.goods_paid_haleru - v_recipients;
  IF v_margin < 0 THEN RAISE EXCEPTION 'company_margin < 0 (runtime guard D5)'; END IF;
  IF v_margin > 0 THEN
    INSERT INTO commission_entries (order_id, order_flow, entry_type, beneficiary_profile_id,
                                    base_haleru, rate_bp, amount_haleru, status, hold_until)
    VALUES (o.id, o.business_flow, 'company_margin', NULL,
            o.goods_paid_haleru, 0, v_margin, 'available', now());
  END IF;
END $$;
COMMENT ON FUNCTION fn_generate_commissions IS 'Jediný producent commission_entries; idempotentní (early-exit jen přes kalkulační typy + uq_commission_once). Invariant D5: Σ kalkulačních entries = goods_paid. Kontrola worked example (katalog 1000 Kč, community_own od D): goods_paid=70000; C gen1 15 %=10500, B gen2 6 %=4200, A gen3 4 %=2800, pool 2 %=1400, margin=70000−18900=51100 (511 Kč = „PENTARIVĚ zbývá"). Σ=70000. Organic 1000 Kč: kredit 3000, margin 97000 (970 Kč). Trade entry 1000 Kč: acquirer 7000, margin 63000 (630 Kč).';

-- Denní settlement (pg_cron / Edge Function): pending -> available + accrual na kredit.
CREATE FUNCTION fn_settle_commissions() RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE e RECORD; v_cnt integer := 0;
BEGIN
  FOR e IN SELECT * FROM commission_entries
            WHERE status = 'pending' AND hold_until <= now()
            FOR UPDATE SKIP LOCKED LOOP
    UPDATE commission_entries SET status = 'available', status_changed_at = now()
     WHERE id = e.id;
    IF e.beneficiary_profile_id IS NOT NULL THEN   -- firemní řádky (pool/margin) se nekreditují
      INSERT INTO credit_transactions (profile_id, kind, type, amount_haleru, commission_entry_id)
      VALUES (e.beneficiary_profile_id,
              CASE WHEN e.entry_type = 'club_credit' THEN 'club' ELSE 'commission' END::credit_kind,
              'accrual', e.amount_haleru, e.id);
    END IF;
    v_cnt := v_cnt + 1;
  END LOOP;
  RETURN v_cnt;
END $$;
COMMENT ON FUNCTION fn_settle_commissions IS 'Denní settlement (D2/D3): pending -> available po uplynutí hold_until (paid_at + 15 dní) a V TÉŽE TRANSAKCI accrual pohyb na kredit příjemce (club_credit -> club, ostatní -> commission). Leadership pool (beneficiary NULL) jen zraje na available a čeká na ruční alokaci (fn_allocate_leadership). Idempotence: uq_credit_accrual_entry.';

-- Ruční alokace leadership poolu adminem (D15, §E.7).
CREATE FUNCTION fn_allocate_leadership(p_pool_entry uuid, p_beneficiary uuid,
                                       p_amount_haleru bigint, p_actor uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE pool commission_entries%ROWTYPE; v_allocated bigint; v_id uuid;
BEGIN
  SELECT * INTO pool FROM commission_entries WHERE id = p_pool_entry FOR UPDATE;
  IF pool.entry_type <> 'leadership_pool' OR pool.status <> 'available' THEN
    RAISE EXCEPTION 'Entry % není available leadership_pool', p_pool_entry; END IF;
  SELECT COALESCE(SUM(amount_haleru),0) INTO v_allocated
    FROM commission_entries WHERE parent_entry_id = p_pool_entry AND reverses_entry_id IS NULL;
  IF v_allocated + p_amount_haleru > pool.amount_haleru THEN
    RAISE EXCEPTION 'Σ alokací (%) by překročila pool (%)', v_allocated + p_amount_haleru, pool.amount_haleru;
  END IF;
  INSERT INTO commission_entries (order_id, order_flow, entry_type, beneficiary_profile_id,
                                  base_haleru, rate_bp, amount_haleru, status, hold_until, parent_entry_id)
  VALUES (pool.order_id, pool.order_flow, 'leadership_alloc', p_beneficiary,
          pool.base_haleru, 0, p_amount_haleru, 'pending', now(), p_pool_entry)
  RETURNING id INTO v_id;
  INSERT INTO audit_log (actor_profile_id, entity, entity_id, action, after)
  VALUES (p_actor, 'commission_entries', v_id::text, 'leadership.allocated',
          jsonb_build_object('pool', p_pool_entry, 'beneficiary', p_beneficiary, 'amount', p_amount_haleru));
  RETURN v_id;
END $$;
COMMENT ON FUNCTION fn_allocate_leadership IS 'Ruční alokace leadership poolu (D15): vytváří leadership_alloc s parent_entry_id na pool, Σ alokací <= Σ poolu. Alokace vzniká pending s hold_until=now() — nejbližší settlement ji připíše na provizní kredit (pool už 15denní lhůtou prošel).';

-- Storno celé objednávky (D4).
CREATE FUNCTION fn_refund_order(p_order uuid, p_reason text, p_actor uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE o orders%ROWTYPE; e RECORD;
BEGIN
  SELECT * INTO o FROM orders WHERE id = p_order FOR UPDATE;
  INSERT INTO order_refunds (order_id, amount_haleru, reason, created_by)
  VALUES (o.id, o.paid_money_haleru, p_reason, p_actor);        -- MVP: jen plná vratka
  UPDATE orders SET status = 'refunded' WHERE id = o.id;        -- projde stavovou mašinou D8
  FOR e IN SELECT * FROM commission_entries
            WHERE order_id = o.id AND status <> 'reversed' AND reverses_entry_id IS NULL
            FOR UPDATE LOOP
    -- kompenzační záporný řádek (D2/D4):
    INSERT INTO commission_entries (order_id, order_flow, entry_type, beneficiary_profile_id,
                                    generation, base_haleru, rate_bp, amount_haleru,
                                    status, hold_until, parent_entry_id, reverses_entry_id, reversal_reason)
    VALUES (e.order_id, e.order_flow, e.entry_type, e.beneficiary_profile_id,
            e.generation, e.base_haleru, e.rate_bp, -e.amount_haleru,
            'available', now(), e.parent_entry_id, e.id, p_reason);
    UPDATE commission_entries SET status = 'reversed', status_changed_at = now(),
                                  reversal_reason = p_reason WHERE id = e.id;
    -- už připsaný akruál -> clawback (zůstatek smí jít do minusu, D3):
    IF e.beneficiary_profile_id IS NOT NULL AND EXISTS
       (SELECT 1 FROM credit_transactions WHERE commission_entry_id = e.id AND type = 'accrual') THEN
      INSERT INTO credit_transactions (profile_id, kind, type, amount_haleru, commission_entry_id, note)
      VALUES (e.beneficiary_profile_id,
              CASE WHEN e.entry_type = 'club_credit' THEN 'club' ELSE 'commission' END::credit_kind,
              'clawback', -e.amount_haleru, e.id, 'Vratka objednávky ' || o.order_number);
    END IF;
  END LOOP;
  -- vrácení kreditu použitého na úhradu zboží:
  INSERT INTO credit_transactions (profile_id, kind, type, amount_haleru, note)
  SELECT ct.profile_id, ct.kind, 'adjustment', -ct.amount_haleru,
         'Vrácení kreditu po vratce objednávky ' || o.order_number
  FROM credit_transactions ct
  WHERE ct.spent_on_order_id = o.id AND ct.type = 'spend';
END $$;
COMMENT ON FUNCTION fn_refund_order IS 'Storno celé objednávky (D4): ke každému nestornovanému entry vznikne záporný reversal s reverses_entry_id, originál dostane status=reversed; už připsané akruály se clawbacknou; kredit použitý na úhradu se vrací adjustmentem. Invariant: po plném stornu Σ (kalkulační entries + reversaly) objednávky = 0.';
```

## 3. Upline CTE a klíčové views

### 3.1 Upline 3 generace (D9)

```sql
CREATE FUNCTION fn_upline(p_profile uuid, p_max integer DEFAULT 3)
RETURNS TABLE (ancestor_id uuid, generation integer)
LANGUAGE sql STABLE AS $$
WITH RECURSIVE up AS (
  SELECT id, sponsor_id, 0 AS gen
  FROM profiles WHERE id = p_profile
  UNION ALL
  SELECT p.id, p.sponsor_id, up.gen + 1
  FROM up JOIN profiles p ON p.id = up.sponsor_id
  WHERE up.gen < p_max
)
SELECT id, gen FROM up WHERE gen BETWEEN 1 AND p_max
$$;
COMMENT ON FUNCTION fn_upline IS 'Sponzorská linie nakupujícího: generation 1 = přímý sponzor (15 %), 2 = sponzor sponzora (6 %), 3 = pra-sponzor (4 %) — přesně dle worked example (nakupuje D: C=15 %, B=6 %, A=4 %). Kratší řetěz vrátí méně řádků. O(3) přes idx_profiles_sponsor.';
```

### 3.2 Kreditní views (D3, R12 zadavatele)

```sql
CREATE VIEW v_credit_balances AS
SELECT profile_id, kind, SUM(amount_haleru) AS balance_haleru
FROM credit_transactions
GROUP BY profile_id, kind;
COMMENT ON VIEW v_credit_balances IS 'Zůstatek kreditu = Σ transakcí per (profil, druh) — jediná definice zůstatku v systému (D3). Smí být záporný po clawbacku.';

CREATE VIEW v_credit_overview AS
WITH pend AS (
  SELECT beneficiary_profile_id AS profile_id,
         CASE WHEN entry_type = 'club_credit' THEN 'club' ELSE 'commission' END::credit_kind AS kind,
         SUM(amount_haleru) AS pending_haleru,
         MIN(hold_until)    AS next_activation_at
  FROM commission_entries
  WHERE status = 'pending' AND beneficiary_profile_id IS NOT NULL
  GROUP BY 1, 2
)
SELECT COALESCE(b.profile_id, p.profile_id) AS profile_id,
       COALESCE(b.kind, p.kind)             AS kind,
       COALESCE(b.balance_haleru, 0)        AS available_haleru,
       COALESCE(p.pending_haleru, 0)        AS pending_haleru,
       p.next_activation_at
FROM v_credit_balances b
FULL OUTER JOIN pend p ON p.profile_id = b.profile_id AND p.kind = b.kind;
COMMENT ON VIEW v_credit_overview IS 'R12 zadavatele: UI vždy zobrazuje DVĚ čísla — dostupný kredit (Σ transakcí) a kredit čekající na aktivaci (Σ pending entries) s datem nejbližší aktivace (min hold_until = paid_at + 15 dní). Zvlášť pro club a commission kredit.';
```

### 3.3 Dashboard views (D31)

```sql
CREATE VIEW v_monthly_personal_turnover AS
SELECT buyer_profile_id              AS profile_id,
       date_trunc('month', paid_at)  AS month,
       SUM(goods_paid_haleru)        AS turnover_haleru,
       COUNT(*)                      AS orders_count
FROM orders
WHERE paid_at IS NOT NULL AND status NOT IN ('cancelled','refunded')
GROUP BY 1, 2;
COMMENT ON VIEW v_monthly_personal_turnover IS 'Osobní měsíční obrat ze zboží (goods_paid; bez dopravy, bez stornovaných/vrácených). Kryje idx_orders_buyer_month.';

CREATE VIEW v_ambassador_dashboard AS
SELECT a.id                    AS ambassador_id,
       a.monthly_goal_haleru,
       (SELECT COUNT(*) FROM profiles c WHERE c.owner_ambassador_id = a.id)  AS customers_total,
       (SELECT COUNT(*) FROM profiles c WHERE c.owner_ambassador_id = a.id
          AND c.created_at >= date_trunc('month', now()))                    AS customers_new_month,
       -- OBRAT = objednávky mých zákazníků + MOJE vlastní nákupy (community_own):
       COALESCE((SELECT SUM(o.goods_paid_haleru) FROM orders o
          WHERE (o.attributed_ambassador_id = a.id
                 OR (o.buyer_profile_id = a.id AND o.business_flow = 'community_own'))
            AND o.status NOT IN ('cancelled','refunded')
            AND o.paid_at >= date_trunc('month', now())), 0)                 AS turnover_month_haleru,
       COALESCE((SELECT COUNT(*) FROM orders o
          WHERE (o.attributed_ambassador_id = a.id
                 OR (o.buyer_profile_id = a.id AND o.business_flow = 'community_own'))
            AND o.status NOT IN ('cancelled','refunded')
            AND o.paid_at >= date_trunc('month', now())), 0)                 AS orders_new_month,
       COALESCE((SELECT SUM(ce.amount_haleru) FROM commission_entries ce
          WHERE ce.beneficiary_profile_id = a.id AND ce.status = 'pending'), 0) AS commission_pending_haleru,
       COALESCE((SELECT b.balance_haleru FROM v_credit_balances b
          WHERE b.profile_id = a.id AND b.kind = 'commission'), 0)           AS commission_credit_haleru,
       COALESCE((SELECT b.balance_haleru FROM v_credit_balances b
          WHERE b.profile_id = a.id AND b.kind = 'club'), 0)                 AS club_credit_haleru
FROM profiles a
WHERE a.role IN ('ambassador','mentor','leader');
COMMENT ON VIEW v_ambassador_dashboard IS 'Dashboard §21 (př. ROMAN). Obrat měsíce = goods_paid objednávek MÝCH ZÁKAZNÍKŮ (attributed_ambassador_id) + MOJE VLASTNÍ nákupy (buyer + community_own) — vlastní obrat ambasadora do jeho čísel patří. Dále počty zákazníků (celkem/noví), nové objednávky, provize čekající na aktivaci a oba kreditní zůstatky vůči osobnímu cíli (monthly_goal_haleru, D32). Kryjí idx_orders_attributed, idx_orders_buyer_month, idx_commission_beneficiary, idx_profiles_owner.';
```

Další klíčové přístupy:

- **Downline (Fáze 2 Leader)**: `SELECT … FROM profiles WHERE path LIKE (SELECT path FROM profiles WHERE id = :leader) || '%'` — prefix scan přes `idx_profiles_path`.
- **Settlement job**: `idx_commission_release` (partial na `pending`).
- **Výpis kreditu**: `idx_credit_tx_profile (profile_id, kind, created_at DESC)`.
- **B2B pipeline board**: `idx_b2b_pipeline`; follow-upy `idx_b2b_manager (…, next_action_due)`.
- **Reporty D31** (`/reports`, CSV): čtou výhradně `v_monthly_personal_turnover`, `v_ambassador_dashboard`, `v_credit_overview` a `orders` — žádné vlastní agregační tabulky (žádná `partner_monthly_stats`).

## 4. ER přehled (textově)

| Tabulka | Vztahy |
|---|---|
| `profiles` | self-FK `sponsor_id` (strom partnerů) + `path`; self-FK `owner_ambassador_id` (zákazník→ambasador); 1:N na téměř vše |
| `referral_codes` | N:1 `profiles` (owner); N:1 `products` (nullable — produktový link); 1:N `referral_events` |
| `referral_events` | N:1 `referral_codes`; N:1 `profiles` (registered, nullable) |
| `products` | 1:N `product_prices`, `order_items`, `referral_codes` |
| `product_prices` | N:1 `products` (časovaný ceník) |
| `trade_partners` | 1:1 `profiles`; N:1 `profiles` (acquirer); N:1 `trade_level_params`; 0..1 `b2b_companies` |
| `orders` | N:1 `profiles` (buyer), N:1 `profiles` (attributed ambassador), N:1 `referral_codes`, N:1 `trade_partners`; 1:N `order_items`, `payments`, `commission_entries`; 1:0..1 `order_refunds` |
| `order_items` | N:1 `orders`, N:1 `products` (snapshot cen, `is_gift`) |
| `order_status_transitions` | číselník povolených přechodů (guard trigger) |
| `payments` | N:1 `orders`; unikát (provider, provider_event_id) pro webhook dedup |
| `order_refunds` | 1:1 `orders` (MVP plná vratka) |
| `commission_entries` | N:1 `orders`; N:1 `profiles` (beneficiary, NULL = pool/margin); self-FK `parent_entry_id` (alokace→pool); self-FK `reverses_entry_id` UNIQUE (storno→originál) |
| `credit_transactions` | N:1 `profiles`; volitelné FK `commission_entries` / `orders` (`spent_on_order_id`) / `payout_requests`; zůstatek = Σ (view) |
| `payout_requests` | N:1 `profiles` (beneficiary + decided_by); 1:N `credit_transactions` (rezervace payout) |
| `crm_notes` | N:1 `profiles` (customer + author) |
| `interest_tags` ⟷ `customer_interest_tags` | číselník §4 ⟷ M:N na `profiles` |
| `b2b_companies` | 0..1 `profiles` (samoobslužná registrace, nullable); N:1 `profiles` (assigned manager); 0..1 `trade_partners`; 1:N `b2b_activities` |
| `academy_modules` | 1:N `academy_lessons`, `academy_quiz_questions`, `academy_quiz_attempts` |
| `academy_lessons` | N:1 `academy_modules`; 1:N `academy_progress` |
| `academy_progress` | M:N `profiles`×`academy_lessons` |
| `academy_quiz_attempts` | N:1 `profiles`, N:1 `academy_modules`; 1:N `ambassador_applications` |
| `ambassador_applications` | N:1 `profiles`, N:1 `academy_quiz_attempts` |
| `milestone_gifts` | N:1 `profiles` (obdarovaný + granted_by) |
| `audit_log` | N:1 `profiles` (actor); polymorfní (entity, entity_id) |
| `app_settings`, `commission_rates`, `trade_level_params`, `interest_tags` | konfigurační číselníky bez závislostí |

Záměrně **neexistují** (D30, D16, D14): `career_levels`, `benefit_tiers`, `partner_monthly_stats`, `b2b_contacts`, `b2b_opportunities`, `fraud_flags`, `ledger_accounts`/`credit_accounts`, expirace kreditu. Fáze 2 je doplní vlastní migrací — nic ve stávajícím schématu jim nestojí v cestě.

## 5. Jak schéma vynucuje „jeden obrat = jedna obchodní logika“ (§D)

Šest nezávislých pojistek — objednávka nemůže „míchat režimy“ ani omylem:

1. **`orders.business_flow` ENUM NOT NULL** — každá objednávka má právě jednu logiku, přiřazenou při vzniku; trigger `trg_orders_status` zakazuje pozdější změnu.
2. **`chk_flow_shape` + `chk_order_formula` CHECK na `orders`** — tvar dat musí odpovídat režimu (`community_customer`/`organic` = nulová sleva, `trade` = povinný `trade_partner_id`, `community_own` = žádná zákaznická atribuce) a součty sedí na kanonický vzorec D7 na halíř.
3. **`fn_validate_order_pricing`** — sleva je přesně sazba flow, zaokrouhlená **per položka** (D5), souhrny = Σ položek, doprava dle konfigurace; validuje se při odeslání do platby.
4. **`chk_flow_type` CHECK na `commission_entries`** — ledger fyzicky nedovolí zapsat provizi cizí logiky: 20 % nemůže vzniknout k vlastnímu nákupu ambasadora (sleva a osobní provize se nikdy nesčítají), 15/6/4 nemůže vzniknout k zákaznickému ani Trade nákupu, organický nákup umí jen 3% kredit; `company_margin` je povolen všude (bilanční dopočet každého flow).
5. **`uq_commission_once`** (partial unique, NULLS NOT DISTINCT) — generátor je idempotentní: jeden typ × příjemce × objednávka; storna přes unikátní `reverses_entry_id`.
6. **Jediný producent** — řádky ledgeru vytváří výhradně `fn_generate_commissions` / `fn_allocate_leadership` / `fn_refund_order` (SECURITY DEFINER; klient nemá INSERT přes RLS), takže dispatch logiky je na jednom místě a kryjí ho constrainty výše. Invariant D5 (Σ kalkulačních entries = `goods_paid`) je testován zlatými worked examples v CI (D25).
