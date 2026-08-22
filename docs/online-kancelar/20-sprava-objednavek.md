# 20 — Správa objednávek: stavy, detail, ruční zásahy, historie, exporty dokladů pro účetní

> **Závazné zadání (22. 8. 2026).** Samonosné pro AI implementaci v repu
> `pentariva-office`. Vzor UX: administrace Shoptet (detail objednávky
> s kontaktem, fakturační a doručovací adresou, stavem, formou úhrady,
> platbou, číslem zásilky a záložkami Položky / Kompletace / Historie /
> Doplňující informace / Doklady / Zásilky / Platební transakce; akce Tisk,
> E-mail, Export, Doklad, Zásilky, Kopie, Smazat). Navazuje na 14 (sklad,
> vratky), 16 (lidská hlášení), 18 (promoakce), 19 (expedice, doklady).
>
> **Peněžní zásada (guardrail 10 §1):** každý ruční zásah, který mění
> zaplaceno / vráceno / provize, prochází **stejnými SECURITY DEFINER
> funkcemi jako automatika** (`fn_apply_payment_event`, `fn_refund_order`).
> Admin nikdy nepřepisuje `orders.status` přímo; UI nabízí jen akce, které
> tyto funkce volají, s důvodem a auditem.

## 1. Model stavů: systémové (pevné) + provozní (konfigurovatelné)

Shoptet má stavy volně konfigurovatelné. U nás na stavech visí peníze
(provize, hold 15 dní, sklad), proto dvě vrstvy:

- **Systémový stav `orders.status`** (enum, nemění se v adminu):
  `draft → awaiting_payment → paid → (partially_shipped) → shipped →
  completed`, větve `cancelled`, `refunded` (plně), nově
  **`partially_shipped`** a **`partially_refunded`** (částečná vratka,
  zůstává doručitelná/doručená). Přechody jen přes funkce níže.
- **Provozní stav `orders.ops_status`** (text FK `order_ops_statuses.code`)
  — **admin definuje** v `/admin/settings` → „Stavy objednávek":
  `order_ops_statuses(code, name_cs, name_en, color, system_status
  order_status — ke kterému systémovému stavu patří, customer_visible
  boolean, customer_label_cs/en, email_template text NULL — šablona
  odeslaná při vstupu do stavu, sort_order, is_default_for_system_status,
  active)`. Seed: Nová, Čeká na platbu, **Zaplaceno**, Připravuje se,
  Zabaleno, Částečně odesláno, Odesláno, Doručeno, Vyřízeno, Stornováno,
  Vráceno, Částečně vráceno, **Pozastaveno (řeší se)**, Čeká na doskladnění.
- Pravidlo: při změně systémového stavu se `ops_status` nastaví na výchozí
  provozní stav daného systémového stavu; admin ho může v rámci **téhož
  systémového stavu** přepnout ručně (např. Zaplaceno → Pozastaveno) bez
  peněžního dopadu. Přepnutí do provozního stavu jiného systémového stavu
  UI nedovolí — nabídne odpovídající akci (§3).
- `order_ops_transitions(from_code, to_code)` volitelně omezí ruční
  přechody (prázdné = vše v rámci systémového stavu povoleno).
- Zákazník vidí `customer_label` provozního stavu (lidský text), partner
  v CRM totéž.

## 2. Detail objednávky `/admin/orders/[id]` (vzor Shoptet)

**Hlavička:** „Objednávka {order_number}" + datum a čas, šipky
předchozí/další, štítky: typ toku (zákazník / partner vlastní / Trade /
organická), atribuce (ambasador s prokliknutím), `fulfillment_provider`,
kanál (`e-shop`, `ručně`, `B2B`).

**Lišta akcí** (jen ty, které dávají v aktuálním stavu smysl; ostatní
šedé s tooltipem proč): Uložit · E-mail (znovu poslat potvrzení / odeslání /
vlastní zprávu ze šablony) · Tisk (balicí lístek, štítek, faktura) ·
Doklad (faktura PDF/ISDOC, dobropis, dovystavit) · Zásilky (vytvořit,
štítek, storno, doposlat) · Platba (označit zaplaceno ručně, vrátit) ·
Kopie (nová objednávka se stejnými položkami pro téhož zákazníka — jde do
`draft`) · Storno · Pozastavit.

**Tři bloky:** Kontakt (jméno, e-mail, telefon, účet → proklik do
`/admin/users`), Fakturační adresa (+ IČ/DIČ u B2B, editovatelná do
vystavení dokladu), Doručovací adresa / výdejní místo (editovatelná do
založení zásilky; po ní jen přes storno zásilky).

**Řádek polí:** Provozní stav (select dle §1) · Forma úhrady (karta /
kredit / převod / ručně) · Platba (nezaplaceno / zaplaceno / částečně
vráceno / vráceno — **jen čtení**, mění se akcemi) · Číslo zásilky
(odkaz na tracking) · Zdroj · Daňový režim (normální / neplátce / OSS
později) · Poznámka zákazníka.

**Záložky:**
1. **Položky** — kód, název, množství, cena za m. j., sleva, DPH, celkem
   vč. DPH; dárky a slevové řádky (kupón/kredit) zvlášť; součty bez DPH /
   DPH / k úhradě. **Editace jen ve stavech `draft`/`awaiting_payment`**
   (přidat/odebrat položku, množství, ruční sleva s důvodem — propíše se
   jako `promotions` typu `manual` pro audit marže 18 §semafor). Po
   zaplacení se položky nemění — výjimky řeší vratka (§3.5) nebo doposlání
   (§3.4).
2. **Kompletace** — per položka: objednáno / skladem teď / zabaleno /
   odesláno / vráceno; zdroj pro rozdělení zásilky (§3.3) a balicí stanici
   (19 §5.1).
3. **Historie** — časová osa `order_events` (§4): kdo, kdy, co, z → do,
   poznámka; filtr systém/člověk; vše včetně e-mailů (odesláno / doručeno
   / otevřeno z Resend webhooku), plateb, provizí (lidsky dle 16: „Připsáno
   provize 3 partnerům, celkem 1 983 Kč, uvolnění 6. 9."), zásilek.
4. **Doplňující informace** — interní poznámky (`order_notes`, s autorem),
   štítky (`orders.tags text[]`), „vyžaduje pozornost" flag, odkaz na
   hlášení 16 k objednávce.
5. **Doklady** — faktura / dobropisy: číslo, datum, částka, stav, PDF,
   ISDOC, „Odeslat znovu e-mailem", „Dovystavit" (jen když chybí).
6. **Zásilky** — všechny `shipments` (odchozí, doposlání, vratky): stav,
   barcode, položky v zásilce, štítek znovu, storno, tracking historie.
7. **Platby** — `payments` (Stripe ID, částka, stav, čas), kredit použit,
   refundy (ID, částka, stav, důvod), Σ zaplaceno − vráceno; **Provize**
   (sekce pod tím): ledger řádky k objednávce lidsky + technický rozbal
   (16).

## 3. Ruční zásahy (každý = SECURITY DEFINER funkce, důvod povinný, audit + `order_events`)

### 3.1 Označit zaplaceno ručně (testování, převod na účet, nesrovnalost brány)
- `fn_admin_mark_paid(order_id, method payment_method ('manual'|
  'bank_transfer' — rozšířit enum), amount_haleru, reference text, reason
  text)`: založí `payments` řádek `provider='manual'`, `status='paid'` a
  zavolá **`fn_apply_payment_event`** — tedy provize, kredit, sklad, doklad
  a e-maily vzniknou přesně jako po webhooku. Částka musí = `paid_money`
  objednávky (jinak chyba; částečné platby nepodporujeme).
- Guard: v `PAYMENTS_MODE=live` vyžaduje druhé potvrzení v UI („Tato akce
  připíše provize partnerům") a založí hlášení `info` `ORDER-MANUAL-PAID`
  (16) s odkazem — viditelné v denním přehledu; v testu bez hlášení.
- Opak („omylem označeno") = plná vratka (§3.5) s důvodem `admin_error`
  → provize se stornují standardní cestou. **Neexistuje „odznačit".**
- Stav dnes: existující `fn_admin_set_order_status` správně odmítá `paid`
  i `refunded` (D8/D4) — zůstává, ale **zúžit** jen na přechody bez
  peněžního a skladového dopadu (`completed`, zpět z `completed` ne);
  `shipped` jen přes `fn_admin_ship_order`, `cancelled` jen přes
  `fn_admin_cancel_order` (uvolnění skladu), aby nešlo obejít sklad
  a zásilky. UI „Stav" pro testování nabízí tlačítko „Označit jako
  zaplaceno (test)" = `fn_admin_mark_paid` s `method='manual'`.

### 3.2 Storno
- Před zaplacením: `fn_admin_cancel_order(order_id, reason)` → `cancelled`,
  uvolní sklad (`fn_release_order_stock`), zruší zásilku, e-mail.
- Po zaplacení: = plná vratka (§3.5) + storno zásilky, je-li nepodaná;
  po podání nejdřív vrátit balík (19 §7), pak vratka — UI vede krok za
  krokem („Balík je na cestě, nejdřív vytvořte zpětnou zásilku").

### 3.3 Rozdělení zásilky (máme skladem jen část)
- `shipments` povolit **více odchozích zásilek na objednávku** (zrušit
  UNIQUE z 19 §3, nahradit `shipment_items(shipment_id, order_item_id,
  quantity)`, kontrola Σ odeslaných ≤ objednaných per položka).
- Akce **„Odeslat část"**: admin zaškrtne položky/množství dostupné
  teď → zásilka č. 1 (19 §5), objednávka `partially_shipped`, provozní
  stav „Čeká na doskladnění" pro zbytek; zákazníkovi e-mail „Část
  objednávky odesíláme, zbytek do X dní" (šablona editovatelná). Při
  naskladnění (14 §1 `stock_movements.receipt`) dashboard upozorní
  „3 objednávky čekají na produkt {name}" → „Odeslat zbytek" → zásilka
  č. 2 → `shipped`. Druhá doprava jde na náklady firmy (bez účtování).
- Pokud zbytek doskladnit nelze: částečná vratka nedodaných položek
  (§3.5) → `shipped` + `partially_refunded`.

### 3.4 Doposlání / výměna (poškozené, chybějící, reklamace výměnou)
- Akce **„Doposlat"**: zásilka `kind='replacement'` na téže objednávce
  s libovolnými položkami z katalogu (typicky stejné), 0 Kč, sklad
  `stock_movements.reason='replacement'`, důvod (chybělo / poškozeno /
  reklamace / gesto), **bez dopadu na ledger a doklady** (není prodej).
  Nahrazuje „nová objednávka 0 Kč" ze 14 §3 — historie zůstává u jedné
  objednávky. Volitelně požadovat nejdřív zpětnou zásilku (19 §7).
- Náklad doposlání se eviduje (`replacement_cost_haleru` = nákupní cena
  položek + doprava) pro marži (18 semafor, reporty).

### 3.5 Vratka: plná i částečná
- Z `return_requests` (14 §3) nebo přímo adminem: výběr položek a množství
  (`return_items(return_request_id, order_item_id, quantity, restock
  boolean, condition)`), volitelně poměrná část dopravy; náhled částky
  (`fn_admin_quote_refund` existuje) → `fn_refund_order` (plný/částečný —
  existující, storno provizí poměrně, kredit zpět, Stripe refund) →
  dobropis (19 §6) → `restock=true` vrací kusy na sklad, jinak
  `stock_movements.reason='writeoff'` (nový důvod). Stav
  `partially_refunded` / `refunded`.
- Vrácení **na kartu** (default) nebo **do kreditu** (dohoda se
  zákazníkem; `credit_transactions` typ `refund_to_credit`, žádná provize
  znovu) — volba v dialogu, důvod.

### 3.6 Ruční založení objednávky (telefon, B2B, interní)
- `/admin/orders/new`: výběr zákazníka (nebo nový účet s pozvánkou),
  položky, doprava, atribuce (předvyplněná sponzorem zákazníka, admin
  smí změnit s důvodem), forma úhrady `bank_transfer`/`manual` → objednávka
  `awaiting_payment` se stejným `fn_checkout` (server počítá ceny/slevy),
  e-mail s platebními údaji (VS = order_number, QR platba). Zaplacení =
  §3.1. Trade objednávky (13) tudy také.

### 3.7 Pozastavit / vyžaduje pozornost
- Provozní stav „Pozastaveno" + flag `needs_attention` + poznámka; balicí
  stanice takovou objednávku přeskočí; dashboard ji počítá zvlášť.

## 4. Historie: `order_events`

- `order_events(id, order_id, at, actor_profile_id NULL — NULL = systém,
  actor_kind ENUM('admin','customer','partner','system','cron','webhook'),
  kind text — `status.changed`, `ops_status.changed`, `payment.received`,
  `payment.manual`, `refund.requested/completed`, `shipment.created/
  label_printed/handed_over/status`, `email.sent/delivered/opened`,
  `note.added`, `item.changed`, `address.changed`, `document.issued`,
  `commission.accrued/reversed`, `return.requested/decided`,
  `replacement.sent`, `split.shipped`, from jsonb, to jsonb, reason text,
  human_text text — věta pro lidi dle 16, tech jsonb)`. Append-only, RLS
  admin SELECT; zákazník/partner vidí filtrovanou podmnožinu přes view
  (`customer_visible`).
- Všechny funkce z §3 a existující (`fn_apply_payment_event`,
  `fn_refund_order`, `fn_admin_ship_order`, EF e-mailů, Resend webhook,
  shipping-sync) zapisují událost; `audit_log` zůstává (technická vrstva),
  `order_events` je lidská vrstva k objednávce.

## 5. Přehled objednávek `/admin/orders` (rozšíření)

- Filtry: období, systémový i provozní stav, platba, dopravce/metoda,
  typ toku, ambasador, „vyžaduje pozornost", fulltext (číslo, jméno,
  e-mail, barcode zásilky). Sloupce konfigurovatelné, uložené pohledy
  („Expedice dnes", „Čeká na doskladnění", „Vratky k vyřízení").
- Hromadné akce: změna provozního stavu (v rámci systémového), tisk
  balicích lístků, export CSV/XLSX vybraných objednávek (položkově i
  hlavičkově).

## 6. Exporty dokladů pro účetní (`/admin/reports` → „Doklady")

Účetní si „jednou za čas" stáhne vše sama — bez vývojáře:

1. **Výběr období** (měsíc / čtvrtletí / od–do) + **typ dokladu**:
   faktury, dobropisy (opravné daňové doklady), *(později: doklady
   k přijaté platbě, zálohové — u nás nevznikají, platí se při objednávce;
   dodací listy = balicí lístky, volitelně)*, stav (vystaveno / stornováno).
2. **Tlačítka:** „Stáhnout PDF (ZIP)", „Stáhnout ISDOC (ZIP)", „Stáhnout
   vše (ZIP: `{number}.pdf` + `{number}.isdoc` + `prehled.csv`)", „Přehled
   CSV", „Přehled XLSX". Generuje EF `documents-export` (streamovaný ZIP
   ze Storage; `npm:xlsx` pro XLSX), výsledek jako signed URL platná 1 h;
   velké exporty na pozadí s notifikací.
3. **Přehledová tabulka** (CSV/XLSX, i na obrazovce s řazením): typ
   dokladu, číslo, datum vystavení, DUZP, splatnost, odběratel (název,
   IČO, DIČ, země), VS, objednávka, základ 12 %, DPH 12 %, základ 21 %,
   DPH 21 %, základ 0 %, celkem bez DPH, DPH celkem, celkem vč. DPH,
   uhrazeno dne, forma úhrady, ID platby brány, vráceno, odkaz na původní
   doklad (u dobropisu), stav. Kontrolní součet dole = Σ `paid_money` −
   Σ vratek období (15 §5 bod 1 sjednotit s tímto exportem — jeden zdroj).
4. Doplňkové exporty na téže obrazovce: přehled objednávek období
   (hlavičky + položky), přehled vratek, přehled kreditů a provizí
   (15 §5 body 2–3), Stripe payouts vs. doklady (rekonciliace brány).
5. Každý export se zaloguje (`audit_log` `documents.exported`, kdo, období,
   typ) — GDPR.

## 7. Hlášení 16 — nové kódy

| Kód | Závažnost | Text |
|---|---|---|
| `ORDER-MANUAL-PAID` | `info` | „Objednávka č. {n} byla označena jako zaplacená ručně ({who}, důvod: {reason}). Provize připsány standardně." |
| `ORDER-WAITING-STOCK` | `low`, `medium` > 7 dní | „{count} objednávek čeká na doskladnění produktu {name}." |
| `ORDER-ATTENTION` | `low` | objednávka označena „vyžaduje pozornost" déle než 3 dny bez události |
| `ORDER-PARTIAL-OVERSHIP` | `critical` | pokus odeslat více kusů než objednáno (blokováno funkcí, hlášení pro programátora) |

## 8. Akceptace

1. Ruční zaplacení vytvoří provize identické s webhookem (pgTAP: stejná
   objednávka oběma cestami → stejné `commission_entries`); v live režimu
   vznikne `info` hlášení; neexistuje cesta, jak nastavit `status='paid'`
   bez `payments` řádku.
2. Provozní stav lze přepnout jen v rámci systémového stavu; přidání
   nového provozního stavu v adminu (barva, e-mail) funguje bez nasazení.
3. Rozdělení: dvě zásilky na jedné objednávce, Σ odesláno ≤ objednáno
   (pokus o překročení = chyba + `critical` hlášení), stavy
   `partially_shipped → shipped`, e-maily oba.
4. Doposlání nemění ledger ani doklady; sklad se odečte s důvodem
   `replacement`.
5. Částečná vratka 1 ks ze 3: refund poměrný, provize stornovány poměrně
   (13 G-testy), dobropis na 1 ks, sklad +1 při `restock`.
6. Historie objednávky obsahuje všechny události z testů 1–5 s lidským
   textem a aktérem; zákazník vidí jen `customer_visible`.
7. Export „Stáhnout vše" za měsíc: ZIP obsahuje PDF + ISDOC každého
   dokladu + `prehled.csv`, kontrolní součet = Σ `paid_money` − vratky;
   XLSX otevře Excel bez varování.
8. Editace položek po zaplacení je odmítnuta serverem (ne jen UI).

## 9. Pořadí

1. §1 stavy (enum rozšíření + `order_ops_statuses`) a §4 historie —
   zapisovat začnou všechny existující funkce.
2. §3.1 ruční zaplacení + §3.2 storno (testování hned potřebuje).
3. §2 detail objednávky se záložkami.
4. §3.3–3.5 dělení, doposlání, částečné vratky (po 19 §3 `shipment_items`).
5. §6 exporty pro účetní (po 19 §6.3 ISDOC).
6. §3.6 ruční objednávky, §5 uložené pohledy.
