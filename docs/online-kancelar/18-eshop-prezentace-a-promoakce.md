# 18 — E-shop: prezentace produktu a promoakce

> **Závazné zadání (22. 8. 2026).** Samonosné pro AI implementaci v repu
> `pentariva-office`. Platí guardraily `10` §1 — **každá sleva, dárek i doprava
> zdarma se počítá výhradně v `fn_checkout` / `fn_validate_order_pricing`**
> (CLAUDE.md pravidlo 1); klient nikdy neposílá částky. Navazuje na 13
> (provizní model v2, uvítací výhoda), 14 (sklad, kategorie, EN), 15 §5/13 §7
> (ekonomika), 16 (hlášení).
>
> **Pořadí a kolize:** §1 (prezentace) je nezávislá a lze ji dělat hned.
> §2–§4 (promoakce) sahají na `fn_checkout`/`fn_validate_order_pricing`
> a sklad → **až po dokončení 13 a 14 §1**.

## 0. Cíl

Prémiový obchod, ne katalog: zákazník (i partner, který produkt doporučuje)
najde u každého produktu všechno, co potřebuje k rozhodnutí — a firma má
standardní nástroje pro práci s poptávkou: časované akce, slevy, dárky,
dopravu zdarma, kódy. Vše konfigurovatelné v adminu, nic v kódu.

## 1. Prezentace produktu

### 1.1 Obsahový model (`products` + nové tabulky)

- Nové sloupce `products`: `subtitle` (jedna věta „proč" — benefit),
  `description_md` (bohatý popis, Markdown), `ingredients_md` (složení),
  `usage_md` (použití / dávkování), `warnings_md` (upozornění, alergeny),
  `specs jsonb` (objem/hmotnost/balení/trvanlivost — klíč→hodnota zobrazené
  jako tabulka), `story_md` (původ, levandule chodouňská — volitelné),
  `faq jsonb` (`[{q,a}]`), `seo_slug` (pro sdílitelný odkaz), `is_featured`,
  `sort_order`, `related_product_ids uuid[]`. Vše + `*_en` varianty dle D35
  (fallback čeština).
- `product_media(id, product_id, kind ENUM('image','video'), storage_path,
  alt_cs, alt_en, sort_order, is_primary)` — Storage bucket `product-media`
  (public read, admin write; upload v adminu s automatickým zmenšením
  na ≤ 1600 px a WebP). `products.image_path` zůstává jako fallback,
  primární médium má přednost.
- `product_badges(code PK, label_cs, label_en, color)` + `product_badge_links`
  (bio, vegan, bez lepku, bez cukru, ručně vyráběno…) — admin číselník.

### 1.2 Obrazovky

- **Detail produktu `/shop/product/?id=`** (static export → query param, ne
  dialog): galerie, název + subtitle, **cena v roli uživatele** (partner vidí
  partnerskou, zákazník svou; škrtnutá katalogová jen když je reálná sleva),
  štítky, dostupnost („skladem" / „posledních X ks" / „vyprodáno" z 14 §1),
  doručení („expedujeme do N dnů" z konfigurace), promo box (§3.4),
  záložky Popis / Složení / Použití / Časté otázky, tabulka parametrů,
  související produkty, tlačítko „Sdílet" (partner: vygeneruje produktový
  referral odkaz dle D12 přímo odsud).
- **Katalog `/shop/`**: karty s primárním obrázkem, štítky, promo badge,
  cena, dostupnost; filtr kategorie/štítek, řazení (doporučené =
  `is_featured, sort_order`; cena; novinky), hledání (14 §6).
- Prázdné/chybějící obsahové pole se **neukazuje** (žádné „—" a prázdné
  záložky). Admin vidí u produktu „kompletnost obsahu" (x/8 polí, chybí
  fotografie…) — checklist, ne blokace.
- Recenze zákazníků: **Fáze 3** (vyžaduje moderaci a právní text).
  Varianty (velikost/příchuť): **ne** — každá varianta je samostatné SKU.

## 2. Promoakce — datový model

```
promotions(
  id, name, internal_note,
  kind ENUM('percent_off','amount_off','free_shipping','gift_with_product',
            'gift_with_order'),
  scope ENUM('product','category','shop'), product_ids uuid[], category_id,
  value_bp int NULL,            -- percent_off
  value_haleru bigint NULL,     -- amount_off (z položky)
  gift_product_id uuid NULL, gift_qty int DEFAULT 1,
  min_order_goods_haleru bigint NULL,   -- gift_with_order / free_shipping na objednávku
  code citext NULL UNIQUE,      -- NULL = automatická akce; jinak slevový kód
  valid_from timestamptz NOT NULL, valid_to timestamptz NULL,
  is_active boolean, priority int DEFAULT 100,
  applies_to ENUM('customers','partners','all') DEFAULT 'customers',
  max_uses_total int NULL, max_uses_per_customer int NULL,
  badge_label_cs, badge_label_en, landing_text_md,
  created_by, created_at, updated_at)
order_promotions(order_id, promotion_id, kind, amount_haleru, gift_product_id)
```

- **Zapnutí/vypnutí je čistě časové:** akce platí, když `is_active AND now()
  BETWEEN valid_from AND COALESCE(valid_to, 'infinity')` — vyhodnocuje se při
  každém dotazu, **žádný cron**. Časy zadává admin v Europe/Prague.
- RLS: SELECT platných akcí anon/authenticated (bez `internal_note`,
  `max_uses_*`); zápis admin přes RPC s auditem (`promotion.created/changed/
  ended`). `order_promotions` čte kupující svých objednávek + admin.

## 3. Pravidla uplatnění (závazná, vynucená v DB)

### 3.1 Kdo na akci dosáhne
- `applies_to='customers'` (výchozí): flow `community_customer` a `organic`.
  **Partnerské (`community_own`, 30 %) a Trade objednávky zákaznické akce
  nedostávají** — stacking se slevou 30 % by prolomil kontrolu „zůstatek
  ≥ 45 % katalogu" (13 §7). `partners`/`all` povolí admin výslovně.
- Slevový kód: zákazník ho zadá v košíku; **max. jeden kód na objednávku**;
  limity použití se kontrolují v `fn_checkout` pod zámkem (počítáno
  z `order_promotions` zaplacených i čekajících objednávek); kódy podléhají
  rate limitu (15 §3).

### 3.2 Jak se slevy skládají (priorita, ne sčítání)
- **Na položku platí právě jedna sleva**: nejvýhodnější z {automatické
  akce na produkt/kategorii/obchod, zadaný kód, uvítací sleva 13 §4}.
  Při shodě rozhoduje `priority` (nižší = dřív). Výsledek se zapíše do
  `order_items.discount_source ENUM('partner','trade','welcome','promotion')`
  + `order_items.promotion_id` — generalizuje flag `welcome_benefit` z 13 §4
  (`chk_flow_shape` povolí slevu na zákaznických flow, jen když má každá
  slevněná položka `discount_source IS NOT NULL`).
- Výpočet vždy `fn_pct_haleru(line_catalog, value_bp)` per položka, resp.
  `LEAST(value_haleru × qty, line_catalog)` u pevné částky (D5).
- **Dárky se skládají se slevami** (sleva na položku + dárek k produktu +
  dárek k objednávce mohou platit zároveň). Dárek = položka `is_gift=true`
  s cenou 0 (D18a), odečítá sklad (14 §1); není-li dárek skladem, objednávka
  projde bez něj + hlášení `info` (16).
- **Doprava zdarma**: promo `free_shipping` (na produkt v košíku nebo na
  objednávku nad `min_order_goods_haleru`) nastaví `shipping_haleru=0`
  u zákaznických flow; u partnerů jen při `applies_to ∈ {partners, all}`.
  Prahové pravidlo z 13 §5 zůstává jako základ, promo ho může jen zlepšit.
- `gift_with_order`: práh se porovnává se **zbožím po slevách, před
  kreditem** (stejná veličina jako doprava zdarma, 13 §5).
- Uvítací režim `gift` (13 §4) je technicky `gift_with_order` s
  `min_order = welcome_min_catalog` a podmínkou „první objednávka" — po
  implementaci tohoto dokumentu se uvítací dárek **migruje na promoakci**
  s příznakem `first_order_only boolean` (nový sloupec), ať existuje jeden
  mechanismus. Uvítací sleva (`discount` režim) zůstává v 13 (vstupuje do
  volby „nejvýhodnější slevy" výše).

### 3.3 Dopad na peníze (nic nového — jen potvrzení)
- Sleva z promoakce snižuje `goods_paid` → provizní linie i Benefit kredit
  se počítají z ponížené báze automaticky (13). Dárek má cenu 0 → žádná
  provize, jen sklad a náklad.
- `fn_validate_order_pricing` při `draft → awaiting_payment` **přepočítá
  nárok znovu** (platnost akce v čase, scope, limity, flow) — nesouhlas =
  výjimka; tím je vyloučeno uplatnění akce po jejím konci přes zastaralý
  košík.
- `order_promotions` = trvalý otisk pro reporting a účetnictví (15 §5:
  sloupec „poskytnuté slevy" a „hodnota dárků" v DPH podkladu).

### 3.4 Storefront
- Karta i detail: badge (`−20 %`, `Dárek`, `Doprava zdarma`, `Akce do
  31. 8.`), u časované akce odpočet („končí za 2 dny"), promo box s
  `landing_text_md`.
- Košík: seznam uplatněných akcí, pole pro kód, **nudge lišta**: „Přidejte
  ještě 350 Kč a máte dopravu zdarma / dárek X" (z aktivních `free_shipping`
  a `gift_with_order` prahů) — nejsilnější konverzní prvek, povinné.
- Pokladna: souhrn ukazuje řádek „Slevy a akce −X Kč" a dárky s cenou 0;
  přesné částky po odeslání potvrdí server (stejně jako dnes).

## 4. Administrace a partneři

- `/admin/promotions`: seznam (aktivní / naplánované / skončené), CRUD,
  klon, kalendář. **Ekonomický odhad před uložením** (z 13 §7 / 15): u
  `percent_off`/`amount_off` na průměrné objednávce ukáže odhad hrubé marže
  a varování, klesne-li pod `min_gross_margin_bp` (30 %); u dárků náklad
  dárku (`cost_haleru`). Nikdy neblokuje — admin rozhoduje.
- Reporting (`/admin/reports`): per akce objednávky, obrat, poskytnutá
  sleva, počet dárků, nové zákaznice/-íci, použití kódů.
- Partneři: aktivní zákaznické akce se zobrazí v `/my-link` a v kampaních
  (existující modul) s hotovým sdílitelným textem + produktovým odkazem;
  partnerům samotným se akce neaplikuje (§3.1), což UI jasně říká.

## 5. Hlášení (16) a anti-abuse

`PROMO-GIFT-OUT-OF-STOCK` (info), `PROMO-MARGIN-BELOW-TARGET` (low — akce
uložena pod cílovou marží), `PROMO-CODE-BRUTEFORCE` (medium — rate limit
zásah), `PROMO-USAGE-LIMIT-HIT` (info). Kódy per zákazník se kontrolují
vůči účtu i telefonu (E.164) — obchází se tím trik s novým e-mailem
(návaznost na 13 §8).

## 6. Zlaté testy (pgTAP, min. 16 asercí)

1. Akce mimo časové okno se neuplatní; uvnitř ano; konec akce mezi košíkem
   a odesláním → `fn_validate_order_pricing` odmítne.
2. Zákazník 1 500 Kč katalog, akce −20 %: paid 120 000 h, netto 99 174,
   linie 19 835 / 7 934 / 3 967 (= G-N1 z 13 §9) — promo a uvítací sleva se
   **nesčítají**, platí lepší.
3. Partner (`community_own`) s aktivní zákaznickou akcí: sleva zůstává
   30 %, promo se neuplatní; s `applies_to='all'` se uplatní lepší z obou.
4. `gift_with_order` nad 2 000 Kč: dárek přidán, cena 0, sklad −1; bez
   skladu → bez dárku + hlášení.
5. `free_shipping` na produkt v košíku → doprava 0 i pod prahem.
6. Kód s `max_uses_per_customer=1`: druhé použití odmítne; souběh pod zámkem
   nezdvojí.
7. `order_promotions` otisk sedí se slevou v `order_items`; P-INV1 (15 §1)
   prochází i s promoakcemi (báze po slevě).

## 7. Akceptace

- Admin založí akci s `valid_from` v budoucnu → v obchodě se objeví sama
  v daný čas a sama zmizí; bez zásahu a bez cronu.
- Detail produktu zobrazuje galerii, záložky a parametry; prázdná pole
  nejsou vidět; partner z detailu vygeneruje produktový odkaz.
- Košík ukazuje nudge na dopravu zdarma/dárek a správně ho „splní".
- Všech 7 testovacích skupin zelených; marže v `/admin/economics` (13 §7)
  zohledňuje poskytnuté slevy a náklad dárků.
