# 14 — Obchodní provoz: sklad, expedice, vratky, souhlasy, obsah katalogu

> **Závazné zadání (21. 8. 2026), pokračování po `13-provizni-model-v2.md`.**
> Samonosné zadání pro AI implementaci v repu `pentariva-office`; platí guardraily
> `10-implementacni-plan.md` §1 a konvence `04` (kanonické DDL tam doplnit).
> Cíl: z „funkčního demo e-shopu" udělat provozuschopný obchod — nic z toho
> nemění provizní logiku z dokumentu 13.
>
> **Pořadí a kolize:** kapitoly 1–2 sahají na `fn_checkout`/`fn_apply_payment_event`
> — implementovat **až po dokončení 13** (stejné funkce). Kapitoly 3–7 jsou
> nezávislé a lze je dělat souběžně s 13.

## 1. Sklad (nová funkcionalita)

- `products.stock_qty integer NOT NULL DEFAULT 0` + append-only
  `stock_movements(id, product_id, delta, reason ENUM('receipt','sale',
  'release','correction','return'), order_id NULL, note, created_by, created_at)`.
  Stav skladu = `stock_qty` udržovaný výhradně SECURITY DEFINER funkcemi spolu
  se zápisem pohybu (žádné přímé UPDATE z klienta; RLS: SELECT authenticated,
  write nikdo).
- **Rezervace při vzniku objednávky:** `fn_checkout` pod advisory lockem per
  produkt ověří dostupnost a odečte (`reason='sale'`, vazba na order). Expirace
  / storno / plná vratka množství vrací (`release`/`return` — napojit na
  existující `orders-expire` cron a `fn_refund_order`). Částečná vratka vrací
  vrácené kusy.
- Nedostatek: chyba „Produkt {name} není skladem (zbývá X ks)". Konfig
  `allow_backorder` (`app_settings`, default `false`) — při `true` se sklad
  smí dostat do minusu (jen zaloguje varování).
- Obchod: skladem/vyprodáno badge; vyprodaný produkt nelze přidat do košíku
  (server to stejně vynutí). Admin `/admin/products`: příjem na sklad
  (množství + poznámka), historie pohybů, dárek (`is_gift`) sklad odečítá také.

## 2. Expedice

- `orders` + sloupce: `carrier text NULL` (číselník v `app_settings`:
  `carriers = ["Zásilkovna","PPL","Česká pošta","Osobní odběr"]`, editovatelný),
  `tracking_number text NULL`, `tracking_url text NULL` (šablony URL per
  dopravce v konfigu, dosadí se číslo).
- Pozdější WMS (Authentica, dokument 17) je výměna téhož toku paid→shipped,
  ne druhý sklad; teď se odesílá interně.
- Admin `/admin/orders`: **expediční fronta** (filtr `paid`), hromadný tisk
  **podacího/balicího lístku** (HTML print view: adresa, položky, počty, dárky,
  order_number + čárový kód není nutný), přechod `paid → shipped` vyžaduje
  vyplněného dopravce (tracking volitelný).
- E-mail #6 `order_shipped` rozšířit o dopravce + tracking odkaz.
- Zákazník: detail objednávky ukazuje dopravce a tracking odkaz.
- **API integrace dopravců (výdejní místa, štítky) NENÍ v tomto rozsahu** —
  zaznamenat jako Fázi 3; výběr výdejního místa zatím textové pole
  `shipping_address.note`.

## 3. Odstoupení od smlouvy a reklamace (zákonná povinnost e-shopu)

- Nová tabulka `return_requests(id, order_id FK, kind ENUM('withdrawal',
  'complaint'), status ENUM('requested','approved','rejected','resolved'),
  customer_note, admin_note, requested_at, decided_at, decided_by,
  refund_id NULL FK order_refunds)`. RLS: kupující vlastní CRUD jen INSERT
  + SELECT; admin vše.
- Zákazník v detailu objednávky (`paid`/`shipped`/`completed`):
  - **„Odstoupit od smlouvy"** — dostupné do **14 dnů od doručení**; protože
    doručení nesledujeme, počítat od `shipped_at + doba přepravy
    `withdrawal_transit_days` (konfig, default 3) — po limitu tlačítko zmizí,
    admin může žádost založit ručně kdykoli.
  - **„Reklamovat"** — bez časového limitu tlačítka (zákonně 24 měsíců),
    povinný popis vady.
- Admin `/admin/orders` detail: seznam žádostí, schválení odstoupení spouští
  existující plnou/částečnou vratku (`fn_refund_order` / partial), reklamaci
  lze vyřešit vratkou, výměnou (nová objednávka 0 Kč s `is_gift` položkami)
  nebo zamítnout s poznámkou. Vše auditovat (`return.requested/decided`).
- E-maily: potvrzení přijetí žádosti + rozhodnutí (2 nové šablony, stejná
  pg_net mechanika).
- Texty reklamačního řádu dodá zadavatel (kapitola 5 — verzované dokumenty).

## 4. Marketingový souhlas (před spuštěním kampaní nutné)

- `profiles.marketing_consent_at timestamptz NULL` + checkbox v registraci
  (nepovinný!) a přepínač v `/account`; audit `consent.granted/revoked`
  s typem `marketing`.
- Každý marketingový e-mail (kampaně, cokoliv nad transakční + týdenní
  partnerský digest) se smí poslat jen příjemcům se souhlasem; odhlašovací
  odkaz v patičce (tokenová EF `unsubscribe`, bez přihlášení). Transakčních
  e-mailů #1–#11 se netýká.

## 5. Právní dokumenty s verzí a re-souhlasem

- Tabulka `legal_documents(id, kind ENUM('terms_shop','terms_partner',
  'privacy','complaints','cookies'), version text, body_md, effective_from,
  published boolean)`; admin CRUD (`/admin/settings` sekce). Veřejné čtení
  publikovaných (anon SELECT) + statické stránky `/legal/{kind}` v office.
- Registrace ukládá do `consent.granted` konkrétní verze (dnes placeholder
  `doc_version` — napojit na skutečné verze).
- **Re-souhlas:** zvýší-li se verze `terms_shop`/`privacy` (u partnerů i
  `terms_partner`), přihlášenému uživateli se před vstupem do aplikace zobrazí
  blokující dialog s odsouhlasením; zápis do `audit_log`. Bez odsouhlasení lze
  jen prohlížet `/account` a odhlásit se.
- Obsah dokumentů dodá zadavatel/právník — do té doby zůstávají placeholder
  texty s viditelným označením „NÁVRH".

## 6. Katalog: kategorie, překlady, vyhledávání (D35)

- `product_categories(id, slug, name_cs, name_en, sort_order)` +
  `products.category_id FK NULL`; filtr v obchodě + admin CRUD.
- Překlady obsahu per D35: `products.name_en text NULL`,
  `description_en text NULL` (u malého katalogu stačí sloupce, žádná
  translations tabulka); shop/e-maily volí dle jazyka UI, fallback čeština.
  Akademie/knihovna EN obsah = Fáze 3 (nezahrnovat).
- Fulltext: jednoduché `ilike` vyhledávání v obchodě (name+description).
- Fotky: zůstává jeden `image_path`; galerie/Storage upload = Fáze 3.

## 7. Dodatky k dokumentu 13 (upřesnění, závazné)

- **Kalendářní měsíc Benefit Clubu = Europe/Prague**, ne UTC (obchodní měsíc
  musí sedět s tím, co vidí zákazník; `date_trunc('month', paid_at AT TIME
  ZONE 'Europe/Prague')`).
- Anti-abuse report z 13 §8 doplnit o počet účtů na stejné dodací adrese
  napříč celou DB (ne jen uvítací výhody).

## 8. Akceptace

1. Nákup vyprodaného produktu server odmítne; expirace objednávky vrátí kusy
   (pgTAP na rezervaci/uvolnění/vratku, min. 6 asercí).
2. Objednávku lze expedovat jen s dopravcem; zákazník vidí tracking; e-mail
   odchází s odkazem.
3. Zákazník podá odstoupení do limitu; admin schválí → vratka projde
   existující mechanikou; ledger Σ = 0 (napojení na D4 testy).
4. Kampaň nelze odeslat příjemci bez marketingového souhlasu (test EF).
5. Zvýšení verze VOP vynutí re-souhlas při dalším přihlášení (e2e/manual).
6. Kategorie + EN název se projeví v obchodě při přepnutí jazyka.
