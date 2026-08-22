# 18 — E-shop: prezentace produktu a promoakce

> **Závazné zadání (22. 8. 2026, revize téhož dne po zpětné vazbě zadavatele).**
> Samonosné pro AI implementaci v repu `pentariva-office`. Platí guardraily
> `10` §1 — **každá sleva, dárek i doprava zdarma se počítá výhradně
> v `fn_checkout` / `fn_validate_order_pricing`** (CLAUDE.md pravidlo 1);
> klient nikdy neposílá částky. Navazuje na 13 (provizní model v2, uvítací
> výhoda), 14 (sklad, kategorie, EN), 13 §7 / 15 §5 (ekonomika), 16 (hlášení).
> Mechanika akcí přebírá osvědčený model Shoptet (šablony kupónů, „Platí pro",
> příznaky produktů s třemi stavy, akční cena od–do) a Vendure (podmínky ×
> akce, priorita, limity na zákazníka) — nevymýšlíme kolo.
>
> **Pořadí a kolize:** §1 (prezentace) je nezávislá a lze ji dělat hned.
> §2–§5 (akce) sahají na `fn_checkout`/`fn_validate_order_pricing` a sklad
> → **až po dokončení 13 a 14 §1**.

## 0. Strategický rámec (rozhodnutí zadavatele, R17)

Obchodní model PENTARIVA je **komunitní/ambasadorský a B2B prodej**. Zákazníky
na e-shop přivádí komunita prodejců, ne slevy. **Přímé B2C slevy na e-shopu by
kanibalizovaly model** — zákazník by neměl důvod jít přes partnera. Proto:

1. Promo nástroje jsou primárně **nástroje komunity**: partner je sdílí svým
   zákazníkům (kód, produktový odkaz, kampaň) a atribuce zákazníka k partnerovi
   zůstává zachována — provize se počítají z ponížené báze, ale partner
   neztrácí zákazníka.
2. **Výchozí stav: akce se neaplikují na organické zákazníky** (bez
   ambasadora). Master přepínač `b2c_promotions_enabled` (`app_settings`,
   default `false`); jeho zapnutí v adminu zobrazí červené varování
   „Zapínáte B2C slevy — riziko kanibalizace komunitního modelu" a zapíše
   audit. Teprve potom lze u konkrétní akce povolit `organic`.
3. Akce nikdy nezlepšuje zákazníkovi cenu pod partnerskou 30% slevu ani
   pod Trade ceny (kontrola při ukládání, §3.3).
4. Reporting hlídá kanibalizaci: podíl promo objednávek bez atribuce
   a průměrná sleva per flow (§5).

## 1. Prezentace produktu

### 1.1 Obsahový model

- Nové sloupce `products`: `subtitle` (jedna věta „proč"), `description_md`,
  `ingredients_md` (složení), `usage_md` (použití/dávkování), `warnings_md`
  (upozornění, alergeny), `specs jsonb` (objem/hmotnost/balení/trvanlivost),
  `story_md` (původ), `faq jsonb` (`[{q,a}]`), `seo_slug`, `is_featured`,
  `sort_order`, `related_product_ids uuid[]`, `published_at` (pro automatický
  příznak Novinka). Vše + `*_en` dle D35 (fallback čeština).
- `product_media(id, product_id, kind ENUM('image','video'), storage_path,
  alt_cs, alt_en, sort_order, is_primary)` — bucket `product-media` (public
  read, admin write; upload zmenšuje na ≤ 1600 px, WebP). `image_path`
  zůstává fallback.
- **Příznaky produktu `product_flags`** (Shoptet „příznaky/štítky"):
  `(code PK, label_cs, label_en, color, kind ENUM('manual','auto'))`.
  Manuální: `bio`, `vegan`, `gluten_free`, `handmade`, `tip`, **`gift`
  (produkt slouží jako dárek)**, `no_discount` (nikdy neslevňovat — např.
  dárkové sady, limitované edice). Automatické (počítané, nelze ručně
  nastavit): `sale` (má platnou akční cenu §2.1), `new` (`published_at`
  < `new_flag_days`, default 30), `free_shipping` (platí promo §2.3),
  `last_pieces` (sklad ≤ `last_pieces_threshold`). Vazba
  `product_flag_links(product_id, flag_code)` pro manuální.

### 1.2 Obrazovky

- **Detail `/shop/product/?id=`** (query param, ne dialog): galerie, název +
  subtitle, cena v roli uživatele (škrtnutá referenční cena jen podle §2.1
  pravidla 30 dní), příznaky, dostupnost („skladem / posledních X ks /
  vyprodáno", 14 §1), „expedujeme do N dnů", promo box (§4), záložky
  Popis / Složení / Použití / Časté otázky, tabulka parametrů, související
  produkty, „Sdílet" (partner: produktový referral odkaz D12).
- **Katalog `/shop/`**: karty s primárním obrázkem, příznaky, cena,
  dostupnost; filtr kategorie/příznak, řazení (doporučené = `is_featured,
  sort_order`; cena; novinky), hledání (14 §6).
- Prázdné pole se nezobrazuje. Admin vidí „kompletnost obsahu" (x/8 polí,
  chybí foto) — checklist, ne blokace. Recenze = Fáze 3. Varianty = ne
  (každá varianta = samostatné SKU).

## 2. Promoakce — datový model (podmínky × akce)

### 2.1 Akční cena produktu (nejjednodušší akce, Shoptet „Akce od/do")

- `product_prices` (existuje, časovaný ceník) + nové sloupce
  `sale_price_haleru bigint NULL`, `sale_from timestamptz NULL`,
  `sale_to timestamptz NULL`. Akční cena platí, když `now()` je v okně;
  automaticky nastavuje příznak `sale`. Do `v_current_prices` přibude
  `effective_price_haleru` a `reference_price_haleru`.
- **Právní pravidlo (směrnice EU 98/6/ES čl. 6a, v ČR § 12a zákona o
  ochraně spotřebitele):** přeškrtnutá referenční cena = **nejnižší cena,
  za kterou se produkt prodával v posledních 30 dnech před slevou**, ne
  katalog. Počítá se z historie `product_prices` (`valid_from`) — funkce
  `fn_reference_price_haleru(product_id, at)`; UI škrtá jen tuto hodnotu.
  Platí pro zákaznické zobrazení; partnerská/Trade cena se neškrtá (není
  sleva z ceny spotřebitele).
- Akční cena se pro partnery a Trade **neuplatňuje** (platí jejich vlastní
  sleva z katalogu), pokud admin u konkrétní akční ceny nezvolí
  `applies_to_partners=true` (pak dostanou lepší z obou, ne obě).

### 2.2 Šablony akcí (kupóny i automatické akce)

```
promotions(
  id, name, internal_note,
  -- AKCE (co se stane)
  action ENUM('percent_off','amount_off','free_shipping',
              'gift_with_product','gift_with_order','buy_x_get_y'),
  value_bp int NULL, value_haleru bigint NULL,
  gift_product_id uuid NULL, gift_qty int DEFAULT 1,
  buy_qty int NULL, get_qty int NULL,            -- buy_x_get_y (nejlevnější zdarma)
  -- PLATÍ PRO (Shoptet „Platí pro" / Vendure conditions)
  scope ENUM('shop','categories','products','by_parameters'),
  product_ids uuid[], category_ids uuid[],
  flag_rules jsonb,        -- [{flag:'gift', rule:'must_not'}, {flag:'sale', rule:'must_not'}, ...]
                           -- rule ∈ 'any' | 'must' | 'must_not' (Shoptet tři stavy; všechny 'must' současně)
  exclude_sale_priced boolean DEFAULT true,      -- „neaplikovat na zlevněné zboží" (akční cena §2.1)
  exclude_flag_no_discount boolean DEFAULT true, -- respektovat příznak no_discount
  min_order_goods_haleru bigint NULL,            -- „Od částky" (zboží po slevách, před kreditem)
  -- KDO
  applies_to_flows business_flow[] DEFAULT '{community_customer}',
  requires_attribution boolean DEFAULT true,     -- jen zákazníci s ambasadorem (R17)
  partner_scope ENUM('all','listed') DEFAULT 'all', partner_ids uuid[],  -- kód jen pro zákazníky vybraných partnerů
  -- KÓD A LIMITY
  code citext NULL UNIQUE,                        -- NULL = automatická akce
  max_uses_total int NULL, max_uses_per_customer int NULL,
  first_order_only boolean DEFAULT false,
  -- ČAS A SKLÁDÁNÍ
  valid_from timestamptz NOT NULL, valid_to timestamptz NULL,
  is_active boolean DEFAULT true, priority int DEFAULT 100,
  combinable_with_sale_price boolean DEFAULT false,
  -- PREZENTACE
  badge_label_cs, badge_label_en, landing_text_md,
  created_by, created_at, updated_at)
order_promotions(order_id, promotion_id, action, amount_haleru, gift_product_id)
```

- Platnost je čistě časová (`is_active AND now() BETWEEN valid_from AND
  COALESCE(valid_to,'infinity')`), vyhodnocuje se při každém dotazu — **žádný
  cron**; admin zadává Europe/Prague.
- `flag_rules` je jádro požadavku zadavatele: u šablony kupónu lze říct
  „platí jen pro produkty s příznakem `sale`" nebo „nikdy pro produkty
  s příznakem `gift`/`no_discount`". Sémantika přesně dle Shoptetu: produkt
  musí splnit všechna `must` současně a žádné `must_not`.
- RLS: SELECT platných akcí authenticated (bez `internal_note`, limitů,
  `partner_ids`); zápis jen admin RPC s auditem
  (`promotion.created/changed/ended`).

### 2.3 Co jednotlivé akce dělají

| Akce | Efekt v `fn_checkout` |
|---|---|
| `percent_off` | `fn_pct_haleru(line_catalog, value_bp)` per způsobilá položka |
| `amount_off` | `LEAST(value_haleru × qty, line_catalog)` per způsobilá položka |
| `free_shipping` | `shipping_haleru = 0` (jen způsobilé flow; zlepšuje práh 13 §5, nikdy nezhoršuje) |
| `gift_with_product` | ke způsobilé položce přidá `gift_product_id` jako `is_gift` řádek (cena 0, sklad −qty) |
| `gift_with_order` | totéž nad `min_order_goods_haleru`; `first_order_only` = uvítací dárek z 13 §4 (po implementaci se uvítací dárek **migruje sem**) |
| `buy_x_get_y` | z každých `buy_qty` kusů způsobilých položek je `get_qty` nejlevnějších zdarma (sleva 100 % na řádek) |

## 3. Pravidla uplatnění (vynucená v DB)

### 3.1 Kdo
- Způsobilé flow dle `applies_to_flows`; `requires_attribution=true` vylučuje
  `organic` (R17). `organic` lze přidat jen při `b2c_promotions_enabled`.
- `partner_scope='listed'`: akce platí jen zákazníkům, jejichž
  `owner_ambassador_id ∈ partner_ids` — partnerský kód „jen pro moje lidi".
- `community_own`/`trade`: jen pokud jsou výslovně v `applies_to_flows`;
  pak dostanou **lepší** z {jejich sleva, akce}, nikdy obě (13 §7 zůstatek
  ≥ 45 %).

### 3.2 Způsobilost položky
Položka je způsobilá, když: je ve `scope`; splňuje `flag_rules`; není
akčně zlevněná při `exclude_sale_priced` (ledaže `combinable_with_sale_price`);
nemá `no_discount` při `exclude_flag_no_discount`; není `is_gift`.

### 3.3 Skládání (priorita, ne sčítání)
- **Na položku právě jedna sleva**: nejvýhodnější z {akční cena §2.1,
  automatické akce, zadaný kód (max. 1 na objednávku), uvítací sleva 13 §4};
  remíza → nižší `priority`. Zapisuje se `order_items.discount_source
  ENUM('partner','trade','sale_price','welcome','promotion')` +
  `promotion_id`; `chk_flow_shape` povolí slevu na zákaznických flow jen
  s vyplněným `discount_source` (generalizace `welcome_benefit` z 13 §4).
- **Dárky se skládají** se slevou i mezi sebou (`gift_with_product` +
  `gift_with_order`). Dárek bez skladu → objednávka projde bez něj +
  hlášení `info`.
- **Ochrana modelu při ukládání akce** (admin RPC): pokud by výsledná cena
  pro zákazníka klesla pod partnerskou cenu (katalog −30 %) nebo pod
  nejnižší Trade cenu, uložení se **odmítne** s vysvětlením — jediný tvrdý
  blok v tomto dokumentu (R17).
- Limity kódů: kontrola v `fn_checkout` pod zámkem (`order_promotions`
  zaplacených i čekajících objednávek); per zákazník se počítá vůči účtu
  **i telefonu E.164** (obchází trik s novým e-mailem, 13 §8).
- `fn_validate_order_pricing` při `draft → awaiting_payment` nárok přepočítá
  znovu (čas, scope, příznaky, limity, flow); nesouhlas = výjimka.

### 3.4 Dopad na peníze
Sleva snižuje `goods_paid` → linie i Benefit kredit z ponížené báze (13).
Dárek = cena 0, bez provize, sklad a náklad. `order_promotions` je trvalý
otisk (15 §5: „poskytnuté slevy", „hodnota dárků" v podkladu DPH).

## 4. Storefront

- Karta i detail: badge z příznaků a akcí (`−20 %`, `Dárek`, `Doprava
  zdarma`, `Akce do 31. 8.`), odpočet u časované akce, promo box
  s `landing_text_md`, referenční cena dle §2.1.
- Košík: uplatněné akce, pole pro kód, **nudge lišta** („přidejte ještě
  350 Kč a máte dopravu zdarma / dárek X") z aktivních prahů — povinné.
- Pokladna: řádek „Slevy a akce −X Kč", dárky s cenou 0; server po odeslání
  potvrdí přesné částky (jako dnes).
- Organický zákazník při `b2c_promotions_enabled=false` akce **nevidí vůbec**
  (ani badge) — vidí místo toho blok „Nakupujte přes svého ambasadora" s
  odkazem na registraci kódem (R17).

## 5. Administrace, ekonomika, partneři

- `/admin/promotions`: seznam (aktivní / naplánované / skončené), CRUD
  šablony přesně v pořadí §2.2 (Akce → Platí pro → Kdo → Kód a limity → Čas
  → Prezentace), klon, kalendář, audit.
- **Ekonomický odhad před uložením** (z 13 §7 / 15 vstupů, průměrná
  objednávka): semafor **červeně** při hrubé marži < `min_gross_margin_bp`
  (30 %) s textem „Akce sráží marži pod cíl — PENTARIVA by na průměrné
  objednávce vydělala jen X %", **oranžově** 30–35 %, **zeleně** ≥ 35 %;
  u dárků náklad dárku (`cost_haleru`). Neblokuje (kromě §3.3 ochrany
  modelu) — rozhoduje admin; uložení pod cíl založí hlášení `low` (16).
- Kanibalizační ukazatel v `/admin/reports`: podíl promo objednávek bez
  atribuce, průměrná sleva per flow, obrat partnerů před/po akci.
- Partneři: aktivní akce pro jejich zákazníky v `/my-link` a kampaních s
  hotovým textem + odkazem; „jen pro moje zákazníky" kódy si partner vidí
  u sebe; partnerům samotným se akce neaplikuje (UI to říká).

## 6. Hlášení (16)

`PROMO-GIFT-OUT-OF-STOCK` (info), `PROMO-MARGIN-BELOW-TARGET` (low),
`PROMO-CODE-BRUTEFORCE` (medium, rate limit 15 §3), `PROMO-USAGE-LIMIT-HIT`
(info), `PROMO-B2C-ENABLED` (medium — master přepínač zapnut, kým, kdy),
`PRICE-REFERENCE-30D-MISSING` (low — akční cena bez 30denní historie:
UI škrtnutou cenu neukáže).

## 7. Zlaté testy (pgTAP, min. 20 asercí)

1. Časové okno: před/uvnitř/po; konec akce mezi košíkem a odesláním →
   validace odmítne.
2. Zákazník s ambasadorem, 1 500 Kč katalog, akce −20 %: paid 120 000 h,
   netto 99 174, linie 19 835 / 7 934 / 3 967 (= G-N1 z 13 §9); promo ×
   uvítací sleva se nesčítají.
3. Organický zákazník: akce se neuplatní při `b2c_promotions_enabled=false`;
   po zapnutí + `organic` ve flows ano.
4. `flag_rules`: kupón `must_not gift` přeskočí dárkový produkt; `must sale`
   platí jen na akčně zlevněné; `exclude_sale_priced` vs
   `combinable_with_sale_price`.
5. Partner `community_own`: akce se neuplatní; s flow povoleným dostane
   lepší z obou; uložení akce pod partnerskou cenu se odmítne.
6. `gift_with_order` nad 2 000 Kč (+ bez skladu → bez dárku + hlášení);
   `gift_with_product`; oba zároveň.
7. `free_shipping` na produkt v košíku → doprava 0 pod prahem.
8. `buy_x_get_y` 3+1: nejlevnější kus zdarma.
9. Kód `max_uses_per_customer=1` vůči účtu i telefonu; souběh pod zámkem.
10. Referenční cena = min za 30 dní z historie; bez historie NULL.
11. `order_promotions` otisk = sleva v položkách; P-INV1 (15 §1) prochází.

## 8. Akceptace

Akce s `valid_from` v budoucnu se sama objeví a sama zmizí; organický
zákazník bez master přepínače ji nevidí; partner z detailu vygeneruje
produktový odkaz; košík „splní" nudge; semafor marže svítí správnou barvou;
uložení akce pod partnerskou cenu je nemožné; všech 11 skupin testů zelených.
