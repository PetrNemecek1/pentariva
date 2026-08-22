# 22 — Informační architektura administrace: navigace, vzory obrazovek, nápověda a tooltipy

> **Závazné zadání (22. 8. 2026).** Vzniklo auditem skutečného stavu admin
> UI v `pentariva-office` (21 plochých položek menu, ~8 400 řádků
> feature komponent, 6 shadcn primitiv) a srovnáním se Shoptetem (sekce →
> podsekce, vše pojmenované, nápověda u každé volby). **Cíl: admin musí
> být srozumitelný člověku, který nečetl dokumentaci** — každá volba má
> název, vysvětlení a důsledek; každá funkce má své místo, které se dá
> najít v menu.
>
> Nemění datový model ani peněžní logiku; mění strukturu obrazovek,
> komponenty a texty. Navazuje na 16 (lidská komunikace), 18–21.

## 0. Nálezy auditu (proč to dnes není srozumitelné)

| # | Nález | Dopad |
|---|---|---|
| 1 | Menu = 21 položek v jedné úrovni, bez skupin, podsekcí a drobečkové navigace | člověk neví, kam patří kategorie, ceny, sklad, exporty |
| 2 | **Žádný tooltip/help komponent** (`title=` jen na 2 vypnutých tlačítkách); nápověda jen jako popisy karet a `placeholder` | desítky přepínačů bez vysvětlení (viz §6 tabulka) |
| 3 | Produkty: jeden formulář 600 řádků; **6 polí jen s placeholderem bez popisku**, řádek `seo-slug / sort / datetime` bez jakéhokoli popisku, zaškrtávátka bez vysvětlení, příznaky jako řada tlačítek bez nadpisu | nelze pochopit, co je „sort", k čemu je datum, co dělá „Doporučený" |
| 4 | **Kategorie** = tři pole (`slug / Česky / English`) + Uložit na konci stránky Produkty; bez seznamu, editace, mazání, řazení, stromu | admin nenašel, kde se kategorie zakládá |
| 5 | Řazení produktů v katalogu = číslo `sort` (výchozí 100) bez směru a bez vazby na kategorii; pořadí per kategorie neexistuje | nelze řídit pořadí ve výpisech |
| 6 | Produkty bez vyhledávání, filtru, stránkování; související produkty bez UI; překlady jen název+popis EN | katalog se 50+ položkami bude neovladatelný |
| 7 | Promoakce: selecty zobrazují **surové hodnoty enumů** (`percent_off`, `community_customer`), sleva v „basis pointech (2000 = 20 %)", produkty jako ručně vepsané UUID | nepoužitelné bez programátora |
| 8 | Nastavení: 14 karet, každá hodnota = textové pole + Uložit; **booleany se píší jako `true`/`false`**, UUID dárku ručně, klíče bez překladu se zobrazí jako `snake_case` | riziko chyb v peněžních konstantách |
| 9 | Detailní pohledy přes `?id=` bez URL struktury, bez breadcrumbs, bez „předchozí/další" (kromě objednávek) | špatná orientace, nelze sdílet odkaz přirozeně |
| 10 | Tabulky jako surové `<table>`, záložky jako řada tlačítek, selecty nativní; chybí Tooltip, Select, Switch, Tabs, Dialog, Table, Badge, Command, Breadcrumb | nekonzistence a nemožnost přidat nápovědu jednotně |
| 11 | Žádné globální hledání (objednávka / zákazník / produkt) | každá věc se hledá jinde |
| 12 | Nápověda `/help` je 1 kapitola „admin" s 21 nadpisy, bez prokliku z obrazovek | nápověda existuje, ale nikdo ji z místa problému neotevře |

## 1. Zásady (závazné pro každou obrazovku)

1. **Každý ovládací prvek má tři texty:** název (label), vysvětlení (co to
   je) a důsledek (co se stane, když to změním / kliknu). Název je vždy
   vidět; vysvětlení a důsledek v tooltipu ⓘ (hover, focus, tap) — a u
   nevratných / peněžních akcí navíc v potvrzovacím dialogu.
2. **Žádná surová hodnota enumu ani technická jednotka v UI.** `percent_off`
   → „Procentní sleva"; basis pointy → procenta s jedním desetinným
   místem (převod v kódu); haléře → Kč; UUID → výběr ze seznamu s názvem.
3. **Vše má své místo v menu** (sekce → podsekce), URL odpovídá místu
   (`/admin/products/categories/`), breadcrumbs nahoře, detail má vlastní
   URL (`/admin/orders/{id}/` — statický export: dynamické segmenty řešit
   `?id=` **jen interně**, ale v UI vždy breadcrumbs + název).
4. **Jednotné vzory obrazovek** (§3): seznam · detail · nastavení ·
   průvodce. Nic se nevymýšlí per stránka.
5. **Nápověda na dvou úrovních:** tooltip u prvku + ikona „?" v záhlaví
   stránky, která otevře **příslušnou kapitolu a kotvu** v `/help`.
6. **Typované ovládání nastavení:** přepínač pro boolean, číslo s
   jednotkou, výběr ze seznamu pro enumy, výběr produktu pro
   `*_product_id`; textové pole jen pro text. Peněžní konstanty s náhledem
   dopadu („2 000 Kč = doprava zdarma u 38 % objednávek posledního měsíce").
7. **Destruktivní a peněžní akce**: červené/oranžové tlačítko, dialog s
   důsledkem v lidské větě (16), povinný důvod tam, kde se audituje.

## 2. Navigace: sekce a podsekce (vzor Shoptet)

Postranní menu se skupinami (rozbalitelné, aktivní skupina otevřená),
nahoře globální hledání (⌘K / Ctrl+K), zvoneček, uživatel.

```
Přehled                         /admin/
Objednávky
  Přehled objednávek            /admin/orders/
  Nová objednávka               /admin/orders/new/
  Expedice (balicí stanice)     /admin/orders/packing/
  Vratky a reklamace            /admin/orders/returns/
  Platby a spory                /admin/orders/payments/
  Doklady a export pro účetní   /admin/orders/documents/
Produkty
  Přehled produktů              /admin/products/
  Kategorie                     /admin/products/categories/
  Ceny a akční ceny             /admin/products/prices/        (per trh po 21 fázi A)
  Sklad                         /admin/products/stock/          (příjem, inventura, pohyby, čekající objednávky)
  Příznaky a štítky             /admin/products/flags/
  Zájmové okruhy                /admin/products/interests/
  Trhy a překlady               /admin/products/markets/        (po 21 fázi A)
  Import / export               /admin/products/import-export/
Marketing
  Promoakce a kupóny            /admin/promotions/
  Kampaně                       /admin/campaigns/
  Události                      /admin/events/
  Knihovna materiálů            /admin/library/
  E-mailové šablony             /admin/emails/
  Oznámení partnerům            /admin/notifications/
Komunita
  Uživatelé                     /admin/users/
  Žádosti o ambasadora          /admin/users/applications/
  B2B a Trade                   /admin/b2b/
  Benefit klub                  /admin/users/benefit-club/
  Akademie                      /admin/academy/
Peníze
  Provize (ledger)              /admin/commissions/
  Leadership pool               /admin/commissions/pool/
  Výplaty                       /admin/payouts/
  Ekonomika (semafor)           /admin/economics/
  Reporty                       /admin/reports/
Nastavení
  Firma a doklady               /admin/settings/company/
  Trhy a jazyky                 /admin/settings/markets/        (po 21 fázi A)
  Doprava a tiskárna            /admin/settings/shipping/
  Platby                        /admin/settings/payments/
  Stavy objednávek              /admin/settings/order-statuses/
  Provizní model                /admin/settings/commissions/    (sazby, Benefit, uvítací výhoda, Trade, limity)
  Právní dokumenty              /admin/settings/legal/
  Slovník hlášení               /admin/settings/issue-catalog/
  Integrace                     /admin/settings/integrations/   (WMS, WhatsApp, AI, brána)
  Provozní konstanty            /admin/settings/advanced/       (zbytek, s varováním)
Systém
  Hlášení                       /admin/issues/
  Deník změn                    /admin/audit/
  Nápověda                      /help/?topic=admin
```

- `lib/nav.ts` dostane strukturu `{group, items[]}`; skupiny mají ikonu
  (lucide) a popis v tooltipu. Zkrácený režim (jen ikony) pro tablet.
- **Breadcrumbs** (`components/ui/breadcrumb`) na každé admin stránce:
  `Administrace › Produkty › Kategorie` / `… › Objednávky › #2025054980`.
- V záhlaví stránky vpravo: primární akce (Nový produkt, Nová objednávka)
  + sekundární v menu „⋯" (export, tisk) — stejně jako lišta Shoptetu.

## 3. Vzory obrazovek

### 3.1 Seznam (`ListPage`)
Hledání (fulltext nad tím, co tabulka ukazuje), filtry jako chipy s
možností uložit pohled, volitelné sloupce, řazení klikem na hlavičku,
stránkování (50/100), hromadný výběr + akce, export CSV/XLSX vybraných.
Prázdný stav s vysvětlením a tlačítkem první akce. Platí pro: objednávky,
produkty, uživatelé, promoakce, výplaty, hlášení, deník, kampaně,
události, knihovna, e-maily.

### 3.2 Detail (`DetailPage`)
Záhlaví: breadcrumbs, název + štítky stavu, „‹ ›" předchozí/další, lišta
akcí (jen ty, které v daném stavu dávají smysl; ostatní šedé **s tooltipem,
proč nejsou dostupné**). Tělo v **záložkách** (`Tabs`), každá záložka
krátká. Boční panel (desktop) se souhrnem a historií. Platí pro:
objednávka (20 §2), produkt (§4), uživatel, B2B firma, promoakce,
hlášení, výplata.

### 3.3 Nastavení (`SettingsPage`)
Skupiny polí s nadpisem a úvodní větou; každé pole = `Field` (§5) s typem
(switch / number+unit / select / product-picker / text / markdown).
Uložení **per skupina** (ne per řádek) s diffem v potvrzení („Měníte:
Doprava zdarma od 2 000 → 1 500 Kč"). Změny peněžních konstant vyžadují
důvod (audit). Náhled dopadu tam, kde to dává smysl.

### 3.4 Průvodce (`Wizard`)
Kroky s čísly a stavem, každý krok validuje, souhrn na konci. Použít pro
promoakci (dnešní 6 kroků, ale s lidskými názvy a výběrem produktů/kategorií
ze seznamu), založení trhu, aktivaci produktu pro trh, ruční objednávku.

## 4. Produkty — cílová podoba (nejvíc stížností)

### 4.1 Přehled produktů
Seznam s miniaturou, SKU, název, kategorie, cena, sklad, stav (koncept /
aktivní / archiv), **úplnost obsahu** (ukazatel %, tooltip co chybí),
per-trh ikonky (21). Hledání, filtry (kategorie, stav, příznak, skladem),
hromadné akce (aktivovat, archivovat, přidat příznak, změnit kategorii,
export). Řazení sloupců.

### 4.2 Detail produktu — záložky
| Záložka | Obsah |
|---|---|
| **Základní** | SKU, název, kategorie (strom, více kategorií: `product_categories_links`, primární kategorie), typ plnění (fyzický/digitální/služba — s vysvětlením), EAN, stav, zveřejnit od (s popisem „produkt se v obchodě objeví od…"), **Doporučený** (tooltip: „zobrazí se v sekci Doporučujeme na úvodní stránce obchodu a má přednost v řazení") |
| **Obsah** | per jazyk (přepínač jazyků nahoře, stav překladu): podtitul, popis, složení, použití, upozornění, příběh, specifikace, FAQ — markdown s náhledem; „Zkopírovat z češtiny", „Předpřeložit AI (koncept)" |
| **Média** | galerie (dnešní editor) + videa, alt texty per jazyk, hlavní snímek |
| **Ceny a DPH** | katalogová cena, DPH, nákladová cena (jen AAL2), **akční cena od–do** s náhledem 30denní referenční ceny (18), „uplatnit i partnerům" s vysvětlením; historie cen (tabulka); po 21: per trh |
| **Sklad** | stav, příjem/korekce s důvodem, pohyby, čekající objednávky na doskladnění, `allow_backorder` per produkt |
| **Parametry a příznaky** | příznaky (s vysvětlením každého: „Bez slevy = nelze uplatnit kupón, 18 §"), zájmové okruhy, hmotnost/rozměry (s tím, k čemu slouží), related products (výběr ze seznamu s náhledem) |
| **SEO** | slug (s náhledem URL), title, description |
| **Řazení** | pořadí v hlavním výpisu (číslo + vysvětlení směru: „nižší = dřív"; tlačítka ↑↓ v seznamu) a pořadí v každé přiřazené kategorii (§4.3) |
| **Trhy** | (po 21) aktivace per trh, úplnost, lokální cena/DPH/překlady |

### 4.3 Kategorie — samostatná obrazovka (vzor Shoptet „Kategorie zboží")
- **Strom** s drag&drop (podkategorie, přesun), inline přejmenování,
  název per jazyk, „text odkazu v menu" (kratší název), slug, popis pro
  stránku kategorie, obrázek, viditelnost v menu obchodu (skrytá kategorie
  = např. „Akční produkty" plněná automaticky), **výchozí řazení produktů
  v kategorii** (ručně / dle názvu / dle ceny / nejnovější / nejprodávanější)
  a **ruční pořadí produktů v kategorii** (drag&drop seznam produktů
  kategorie — `product_category_links(product_id, category_id, sort_order)`).
- **Automatické kategorie** (Shoptet „dynamické"): pravidlo = příznak /
  akce / nové (např. „Akce" = vše s akční cenou) — jen čtení produktů.
- Tlačítka „Přidat hlavní kategorii" / „Přidat podkategorii" nahoře;
  export/import CSV; log změn (z `audit_log`).
- Odstranění kategorie s produkty: dialog „Přesunout produkty do …".
- Datový model: `product_categories` + `parent_id`, `labels jsonb`,
  `menu_label jsonb`, `slug`, `description_md jsonb`, `image_path`,
  `visible_in_menu`, `default_sort`, `kind ENUM('manual','auto')`,
  `auto_rule jsonb`; `product_category_links`. `products.category_id`
  zůstává jako **primární** kategorie (breadcrumbs v obchodě).

### 4.4 Řazení ve výpisech obchodu — kde co platí
| Výpis | Řídí se |
|---|---|
| Úvodní stránka „Doporučujeme" | `is_featured` + `sort_order` |
| Hlavní katalog (bez kategorie) | `sort_order` (ručně) nebo volba zákazníka (cena, název, nové) |
| Kategorie | `product_category_links.sort_order` při `default_sort='manual'`, jinak pravidlo kategorie |
| Vyhledávání | relevance, pak `sort_order` |
| „Související" na detailu | pořadí v `related_product_ids` |
Vše vysvětleno v tooltipu u příslušného pole.

## 5. Nápověda a tooltipy — jednotný systém

- **Komponenty (shadcn doplnit):** `tooltip`, `popover`, `select`,
  `switch`, `checkbox`, `tabs`, `dialog`, `alert-dialog`, `table`, `badge`,
  `breadcrumb`, `command` (⌘K), `dropdown-menu`, `collapsible`, `sheet`,
  `separator`, `form`. Nativní `<select>`/`<input type=checkbox>` v adminu
  zmizí.
- **`Field`** — jediná obálka pro každý ovládací prvek: `label`, `help`
  (krátké vysvětlení, vždy viditelné pod polem nebo v ⓘ), `consequence`
  (volitelně, co změna způsobí), `unit`, `locked` (důvod, proč nelze
  měnit — tooltip), `docAnchor` (proklik do nápovědy). **`help` je
  povinný prop** — ESLint/vitest pravidlo: `Field` bez `help` = chyba
  buildu. Tím se „žádný přepínač bez vysvětlení" vynucuje strojově.
- **`HelpHint`** — ikona ⓘ s tooltipem (hover/focus) a na dotyku popover;
  obsah z i18n slovníku `help.*` (cs/en), takže je překládaný a
  centralizovaný; dlouhé texty mají odkaz „Více v nápovědě →" na
  kapitolu+kotvu v `/help`.
- **`ActionButton`** — tlačítko akce s `tooltip` (co udělá), `disabledReason`
  (proč teď nejde), `confirm` (dialog s důsledkem v lidské větě, volitelně
  povinný důvod) a `severity` (neutral / money / destructive → barva).
- **Záhlaví stránky** má ikonu „?" → `/help/?topic=admin#<slug>`; manuál
  `docs/manual/17-admin.md` se rozdělí na kapitoly podle skupin menu (§2)
  a každá obrazovka dostane kotvu; nápověda dostane **vyhledávání**.
- **Texty píše** zadavatel/AI ve slovníku `help.*`; pravidlo stylu: jedna
  věta „co to je", jedna věta „co se stane", případně „kdy použít".
  Příklad: `help.products.is_featured`: „Doporučený produkt se zobrazí
  v sekci Doporučujeme na úvodní stránce obchodu. Ve výpisech má přednost
  před ostatními se stejným pořadím."

## 6. Konkrétní opravy existujících obrazovek (checklist)

| Obrazovka | Oprava |
|---|---|
| Přehled | legenda semaforu „Kontrola peněz"; tooltip u každé StatCard, jak se číslo počítá a za jaké období |
| Uživatelé › detail | tooltipy + potvrzení u Deaktivovat (důsledky R21), Kořen sítě, Admin role; oprava sponzora s vysvětlením 14 dnů; doporučovací kódy s popisem; záložky (Účet · Síť · Objednávky · Kredity · Dárky · GDPR) |
| Produkty | rozdělit dle §4; všech 6 placeholder polí → `Field` s labelem; `sort`/`published_at`/`seo-slug` s popisky; hmotnost vypnutá s důvodem („u digitálního produktu se nepoužívá"); příznaky se skupinovým nadpisem a tooltipem per příznak; sklad s výslovným „vyberte produkt" |
| Kategorie | samostatná obrazovka §4.3 |
| Promoakce | průvodce s lidskými názvy akcí (Procentní sleva / Pevná sleva / Doprava zdarma / Dárek k produktu / Dárek k nákupu / Kup X získej Y), sleva v %, výběr produktů/kategorií/příznaků ze seznamu (multi-select s hledáním), toky jako „Zákazníci ambasadorů / Vlastní nákupy partnerů / Trade / Organičtí" s tooltipem, priorita s vysvětlením („při kolizi vyhrává vyšší“), badge per jazyk s náhledem |
| Objednávky | záložky jako `Tabs`; akce přes `ActionButton` (Označit zaplaceno (test) s dialogem 20 §3.1b); uložené pohledy s tooltipem |
| Provize | filtry s labely; typy záznamů lidsky (Linie 1 / Linie 2 / Linie 3 / Pool / Benefit kredit / Marže firmy) |
| Výplaty | tooltipy u Schválit/Zamítnout, co se stane s kreditem; odkaz na statement |
| Reporty | rozdělit na „Partneři" a „Finance" jako podzáložky; exporty dle 20 §6 |
| Nastavení | rozdělit na podsekce §2; typované `Field`; booleany jako `Switch`; `welcome_gift_product_id` jako výběr produktu; bp → %; `HIDDEN_SETTING_KEYS` → „Provozní konstanty (pokročilé)" s varováním místo skrytí; Slovník hlášení s labely polí a náhledem výsledné věty |
| Trade úrovně / Sazby | popis karty + tooltip „změna platí jen pro nové objednávky (verze sazeb)" |
| Akademie | „Pozice" → „Pořadí (nižší = dřív)" |
| Všechny seznamy | hledání + filtry + stránkování (§3.1) |
| Globální | ⌘K hledání: číslo objednávky, jméno/e-mail, SKU/název, barcode → skok na detail |

## 7. Technické poznámky

- Statický export: podsekce jsou normální složky `app/admin/products/categories/page.tsx`;
  detaily zůstávají `?id=` (nebo `generateStaticParams` nelze pro dynamická
  ID) — breadcrumbs čtou název entity po načtení.
- `lib/nav.ts`: `adminNavGroups: {key, icon, items:[{href,labelKey,helpKey}]}`;
  `AppShell` umí skupiny, sbalení, aktivní cestu podle prefixu.
- i18n: nové klíče `nav.group.*`, `help.*`, `enum.*` (lidské názvy všech
  enumů na jednom místě — `labels.ts` rozšířit; **žádný enum se nesmí
  renderovat přímo**, lint pravidlo na `value={x}` bez `enumLabel()` je
  nerealistické → alespoň vitest, který projde `MESSAGES.enum` a ověří,
  že každá hodnota každého DB enumu má překlad cs+en).
- Rozpad monolitů: `AdminProducts.tsx` (614) → `ProductList`, `ProductForm/*Tab`,
  `CategoryTree`; `AdminSettings.tsx` (833) → per podsekce; `AdminOrderDetail`
  (946) → per záložka.
- Nic z toho nemění RPC ani schéma kromě §4.3 (kategorie strom + vazby).

## 8. Akceptace

1. Každý `Field` a `ActionButton` v adminu má `help`/`tooltip`; test
   selže při chybějícím textu; ruční průchod: na žádné obrazovce není
   surová hodnota enumu, `snake_case` klíč ani „bp".
2. Menu má 8 skupin s podsekcemi dle §2; breadcrumbs na každé stránce;
   ⌘K najde objednávku, zákazníka i produkt.
3. Kategorie: založení podkategorie, přesun drag&drop, ruční pořadí
   produktů v kategorii se projeví v obchodě; smazání s přesunem produktů.
4. Produkt: záložky; uložení bez popisku složení u fyzického produktu
   ukáže úplnost < 100 % s výčtem chybějícího; související produkty jdou
   vybrat.
5. Nastavení: boolean jako přepínač; změna peněžní konstanty vyžaduje
   důvod a ukáže diff; výběr dárkového produktu ze seznamu.
6. Promoakce: celý průvodce bez zadání jediného UUID nebo bp.
7. Nápověda: z každé admin obrazovky vede „?" na správnou kapitolu a
   kotvu; nápověda má vyhledávání.

## 9. Pořadí

1. Základ: shadcn komponenty, `Field`/`HelpHint`/`ActionButton`, skupinová
   navigace + breadcrumbs, ⌘K. (Týden práce, odemkne zbytek.)
2. Produkty + Kategorie (§4) — největší bolest.
3. Nastavení rozdělit a typovat (§6).
4. Promoakce průvodce; Objednávky/Uživatelé záložky a tooltipy.
5. Seznamy: hledání/filtry/stránkování všude; nápověda rozdělená na kapitoly.

## 9a. Stav implementace (22. 8. 2026, větev `feat/22-admin-ia`, PR #29)

Hotovo: §2 menu sekce → podsekce + breadcrumbs + ⌘K; §5 `Field`/`HelpHint`/
`ActionButton` + kotvy `route-…` v nápovědě + hledání v nápovědě; §4
Produkty v záložkách, **Kategorie strom** (migrace `product_category_links`,
`fn_admin_upsert/delete/reorder_category`, `fn_admin_set_category_products`,
`fn_category_product_ids`; obchod řadí podle vazeb), Sklad; §3.3 Nastavení
v 9 podstránkách s registrem typů (`features/admin/settings/registry.ts`);
§3.4 průvodce Promoakcí; §3.1 `ListToolbar`/`Pagination` v Promoakcích,
Výplatách, Kampaních, Událostech, Knihovně, E-mailech; §6 tooltipy a
potvrzení v Uživatelích, Objednávkách, Provizích, Přehledu. Odloženo:
drag&drop ve stromu kategorií (šipky + „Přesunout pod“ místo něj), editace
provozních stavů objednávek (jen čtení), automatické kategorie.

## 10. Souběh s dokumentem 21 (fáze A běží současně) — pravidla, aby se týmy nepřekrývaly

Překryv je jen v **produktech, nastavení, kategoriích a i18n souboru**.
Zbytek je nezávislý.

| Oblast 22 | Souběžně s 21 A? | Proč / podmínka |
|---|---|---|
| shadcn komponenty, `Field`/`HelpHint`/`ActionButton`, `lib/nav.ts` skupiny, breadcrumbs, `AppShell`, ⌘K | **ano, hned** | 21 A se těchto souborů nedotýká |
| Uživatelé, Provize, Výplaty, Reporty, Hlášení, Deník, Akademie, Kampaně, Události, Knihovna, E-maily, Oznámení, Přehled | **ano, hned** | 21 A tyto obrazovky nemění (měna v reportech až 21 B) |
| Promoakce průvodce | **ano** | `market_code` u akcí je až 21 **B**; průvodce ať má připravené místo pro výběr trhu |
| Objednávky detail (záložky, `ActionButton`) | **ano** | 21 A přidává jen `market_code`/`currency` na objednávku — zobrazení měny v detailu řešit přes jednu util `formatMoney(amount, currency)` už teď |
| Nápověda: rozdělení `17-admin.md`, `help.*` klíče | **ano** | — |
| **Produkty detail (záložky Obsah/Ceny/Trhy)** | **až po merge 21 A** | 21 A přepisuje `product_prices` → `product_market_prices`, překlady → `product_translations`, `AdminProducts.tsx` a `features/admin/api.ts` (upsert). Dvojí zásah = jistý konflikt. Do té doby: jen **popisky a tooltipy** do stávajícího formuláře (bezpečná, malá změna) |
| **Kategorie strom** (`parent_id`, `product_category_links`, `labels jsonb`) | **schéma předat týmu 21** (jedna migrace s jejich `labels jsonb`), **UI stromu až po ní** | jinak dvě migrace nad toutéž tabulkou ve stejném týdnu |
| **Nastavení rozdělit na podsekce** | **po 21 A** | 21 A přidává sekci Trhy; rozdělit najednou. Mezitím jen typované `Field` uvnitř stávajících karet |
| Seznamy: hledání/filtry/stránkování | **ano** (kromě Produktů) | — |

**Provozní pravidla:**
1. Každý dokument = vlastní větev (`feat/21-markets-a`, `feat/22-admin-ia`),
   malé PR, **rebase na `main` denně**; 21 A merguje první (je
   strukturální a kratší).
2. **Vlastnictví souborů po dobu souběhu:** tým 21 vlastní
   `supabase/migrations/*`, `features/admin/api.ts` (produktové funkce),
   `features/admin/AdminProducts.tsx`, `features/shop/api.ts`; tým 22
   vlastní `components/ui/*`, `components/layout/*`, `lib/nav.ts`,
   `features/help/*` a nové soubory. Kdo potřebuje sáhnout do cizího,
   pošle PR druhému týmu, nemerguje sám.
3. **i18n bez konfliktů:** nové klíče **ne** do `lib/i18n/messages.ts`
   (3 959 řádků, jistý konflikt), ale do nových modulů `lib/i18n/messages.help.ts`,
   `messages.nav.ts`, `messages.enum.ts`, `messages.markets.ts`, které se
   v `messages.ts` jen spojí (`{...MESSAGES, help, nav, enum}`) — jedna
   řádka, kterou přidá první merge.
4. Nové admin obrazovky 22 = **nové soubory** (`features/admin/products/*`,
   `features/admin/settings/*`); staré monolity se mažou až po přepnutí
   routy, ne editují.
5. Peněžní formátování všude přes `formatMoney(haleru, currency='CZK')`
   z `lib/money.ts` už teď — až 21 A přidá měnu, nic v 22 se nemění.
6. Před každým mergem: `npm run typecheck`, vitest, pgTAP lokálně; CI je
   do 1. 9. throttlovaná (commit `3d46892`), takže lokální běh je povinný.
