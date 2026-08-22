# 17 — Napojení na Authentica fulfillment (sklad, expedice, vratky přes WMS)

> **Zadání připravené 22. 8. 2026 pro případ podpisu smlouvy s Authentica.**
> Samonosné pro AI implementaci v repu `pentariva-office`. Vychází z API
> dokumentace `https://authenticawms.docs.apiary.io` (changelog 26W26,
> 22. 6. 2026; base URL `https://app.authentica.cz/api`). Platí guardraily
> `10` §1; peněžní logika (13) se nemění. Navazuje na `14-provoz-obchodu.md`
> (sklad, expedice, vratky) a `16-lidska-komunikace-systemu.md` (hlášení).
>
> **Princip: Authentica = zaměnitelný adaptér** (stejný vzor jako
> `PaymentProvider`, D23). Dokud `FULFILLMENT_MODE=off`, platí ruční provoz
> z dokumentu 14. Přepnutí na `authentica` je konfigurační krok, ne nasazení
> jiného kódu.

## 0. Co Authentica přebírá a co zůstává v kanceláři

| Oblast | Authentica (`FULFILLMENT_MODE=authentica`) | Kancelář |
|---|---|---|
| Fyzický sklad | **zdroj pravdy** (webhook `stock.update`, rozpad `orderable/reserved/quarantined`) | zrcadlo + vlastní rezervace nezaplacených objednávek |
| Expedice | automaticky po zaplacení (Create Order), štítky, dopravci, výdejní místa | stavový přehled, ruční zásah jen výjimečně |
| Tracking | `order.dispatch` + `package.balikobot.trackingStatus.update` | zobrazení zákazníkovi, e-mail #6 |
| Doručení | `delivered` webhook → `completed` | nahrazuje 14denní auto-completion u WMS objednávek |
| Vratky | Return Authorization, příjem, kontrola poškození | schvalování žádosti (14 §3), refund (D4) |
| Naskladnění | Receipt (avízo) + `receipt.done` | admin zakládá avízo z `/admin/products` |
| Faktura do balíku | Order Invoice (base64 PDF) | jen při `INVOICING_MODE=fakturoid` (15 §6) |

## 1. Adaptér a konfigurace

- `supabase/functions/_shared/fulfillment/types.ts` — rozhraní
  `FulfillmentProvider`: `createOrder`, `updateOrder`, `cancelOrder`,
  `getOrder`, `createReturn`, `getReturnFiles`, `createReceipt`,
  `syncProduct`, `getStockBreakdown`, `listCarriers`, `listBranches`,
  `parseWebhook(rawBody, signature) → NormalizedWmsEvent | null`.
- `authentica.ts` — jediná implementace. OAuth2 `client_credentials`
  (`POST /token`, `scope=default api`), token cache v tabulce
  `integration_tokens(provider PK, access_token, expires_at)` — obnovit,
  zbývá-li < 5 min. Všechna volání s `Authorization: Bearer`.
- Secrets: `AUTHENTICA_CLIENT_ID`, `AUTHENTICA_CLIENT_SECRET`,
  `AUTHENTICA_SHOP_ID`, `AUTHENTICA_WEBHOOK_SECRET`. `app_settings`:
  `FULFILLMENT_MODE` (`off`|`authentica`), `wms_attach_invoice` (bool),
  `wms_default_carrier_id`, `wms_order_tags` (`["pentariva"]`).
- Chyby API (`422` validace, `409`, `410` „už nelze") se mapují na hlášení
  dle 16 §4 (viz §8), nikdy neblokují platbu ani provize.

## 2. Produkty (párování přes SKU)

- Nové sloupce `products`: `wms_product_id int NULL`, `weight_g int`,
  `length_cm/width_cm/height_cm numeric`, `tracks_lot boolean DEFAULT false`,
  `tracks_expiration boolean DEFAULT false`, `country_of_origin char(2)
  DEFAULT 'CZ'`, `wms_synced_at`.
- Admin akce „Odeslat do Authentica" (`/admin/products`): `POST
  /shop/{shop}/product` s `name`, `declarationName`, rozměry, `skus:[sku]`,
  `barcodes`, `hasLot`/`hasLotExpiration` dle příznaků, `countryOfOrigin`;
  uložit vrácené `id`. Existuje-li `wms_product_id`, použít `PUT`.
  **Pozor:** `hasLot`, `hasImei`, `hasLotExpiration` nelze po vytvoření měnit
  — u potravin/doplňků nastavit `tracks_expiration=true` PŘED prvním
  odesláním (validace v UI: varování, pokud chybí rozměry/hmotnost).
- Párování při importu existujícího WMS katalogu: `POST
  /product/get-by/sku` pro všechna naše SKU; revize produktu
  (`revisions[]`) — vždy pracovat s aktuálním `productId`, webhooky nesou
  `productRevisions` → mapovat přes `wms_product_id` i historické revize
  (tabulka `wms_product_revisions(wms_id, product_id)`).

## 3. Sklad (zrcadlo + vlastní rezervace)

- Webhook `stock.update` → `fn_apply_wms_event`: `products.stock_qty :=
  amount` (je-li k dispozici rozpad, použít `orderable`), zápis do
  `stock_movements(reason='wms_sync', delta=amountDelta)`.
- **Dostupnost pro checkout** = `stock_qty (WMS orderable) − Σ rezervací
  objednávek, které ještě nebyly odeslány do WMS` (`awaiting_payment` a
  `paid` bez `wms_order_id`). View `v_product_availability`; `fn_checkout`
  z dokumentu 14 §1 používá tuto hodnotu místo holého `stock_qty`. Po
  odeslání do WMS se lokální rezervace „předává" WMS (`reserved`).
- Rekonciliace: cron `wms-stock-reconcile` (každou hodinu) — `GET
  /stock/breakdown/paginate` → opraví drift, rozdíl zaloguje jako hlášení
  `low` (16).
- Inventurní webhooky (`inventoryAdjustment.*`, důvody `destroyed`,
  `expired`, `over_delivery`, `return`, `stock_corrections`) → `stock_movements`
  s `reason='wms_adjustment'` + text důvodu; záporné korekce `destroyed`/
  `expired` → hlášení `low` s částkou nákladu (`cost_haleru`, 13 §7).

## 4. Expedice objednávek

- **Outbox:** tabulka `fulfillment_jobs(id, order_id FK UNIQUE, kind
  ENUM('create','update','cancel'), status ENUM('pending','sent','failed'),
  attempts, next_attempt_at, last_error, wms_order_id)`. Zápis při
  `orders → paid` (uvnitř `fn_apply_payment_event` i kreditního checkoutu) —
  **vždy jen záznam do outboxu, nikdy HTTP volání v transakci**.
- EF `fulfillment-dispatch` (cron každou minutu, heartbeat dle 15 §2):
  vezme `pending` s `next_attempt_at <= now()`, zavolá `createOrder`,
  uloží `orders.wms_order_id`, `wms_status='received'`, `wms_sent_at`.
  Retry s exponenciálním odstupem (1, 5, 15, 60 min…), po 5 pokusech
  `failed` + hlášení `high` (16). Před každým retry ověřit existenci přes
  `GET /order/paginate?filter[externalId]=…`, aby nevznikla duplicita.
- **Mapování Create Order:**
  `externalId=orders.id`, `orderNumber=order_number`, `carrierId`/`branchId`
  z objednávky (§5), `price=paid_money_haleru/100`, `priceCurrency='CZK'`,
  `cod=false`, jméno: `firstName/lastName` ze `display_name` (poslední slovo
  = příjmení) nebo `companyName` u Trade, adresa ze `shipping_address`
  (`street→addressLine1`, `city`, `zip`, `country`), `phone` (E.164 z profilu),
  `email`, `printDeliveryNote=true`, `orderTags=[flow, 'pentariva']`,
  `packagingInstructions=[{message:'Dárek: …', type:'before'}]` pro položky
  `is_gift`, `items=[{sku, amount, unitPrice}]` — dárky jsou fyzické položky
  → posílají se jako items s `unitPrice=0`.
- Faktura: je-li `wms_attach_invoice` a existuje `invoice_url` (15 §6),
  `POST /order/{id}/invoice` s base64 PDF; `410` = už nejde, jen hlášení
  `info`.
- **Změny:** úprava adresy adminem → job `update` (`PUT`) — povoleno jen
  dokud `wms_status ∈ {received, preparation}`. Storno/refund před expedicí
  → job `cancel` (`DELETE`); `410` → hlášení `high` „balík už odešel,
  řešit jako vratku".

## 5. Dopravci a výdejní místa v checkoutu

- Tabulka `carriers(wms_carrier_id PK, name, branch_supported,
  branch_required, is_active, price_haleru NULL, sort_order)` — plní cron
  `wms-carriers-sync` (denně, `GET /carrier`); admin aktivuje/řadí a může
  nastavit vlastní cenu dopravy per dopravce (jinak platí `shipping_flat`).
- `orders` + `carrier_id FK carriers`, `branch_id text NULL`,
  `branch_name text NULL`. Checkout: výběr dopravce (povinný), u
  `branch_supported` výběr výdejního místa — EF `carrier-branches` proxy
  na `GET /carrier/{id}/branch` s cache `carrier_branches` (24 h, hledání
  podle města/PSČ, vrací name/street/city/zip/otevírací dobu).
  `fn_validate_order_pricing` doplní: dopravce aktivní; `branch_required` ⇒
  `branch_id` vyplněn.
- Doprava zdarma/paušál dle 13 §5 zůstává; cena per dopravce je volitelný
  override.

## 6. Stavy, tracking, doručení

`fn_apply_wms_event` (SECURITY DEFINER) mapuje webhooky:

| Webhook | Efekt v kanceláři |
|---|---|
| `order.status.update` `received/preparation` | `orders.wms_status` (zobrazit „Připravuje se") |
| `label_printed` (+ `packages[]`) | `order_packages(order_id, print_code, length, width, height, weight_kg, tracking_number, tracking_url, tracking_status)` |
| `order.dispatch` | tracking → `orders.carrier/tracking_number/tracking_url` (první balík), ostatní do `order_packages`; **`orders → shipped`**, `shipped_at`, e-mail #6 |
| `picked_up_carrier` | `wms_status`; pokud ještě není `shipped`, přepnout |
| `package.balikobot.trackingStatus.update` | `order_packages.tracking_status` (zobrazit zákazníkovi) |
| `delivered` | **`orders → completed`**, `completed_at`; lhůta pro odstoupení (14 §3) se počítá od tohoto data místo odhadu |
| `canceled` | hlášení `high` + `wms_status` |
| `returned_carrier` | hlášení `medium` „nedoručeno, vrací se" + automaticky `return_requests(kind='complaint', status='requested', note='Vráceno dopravcem')` |
| `returned_customer` | hlášení `medium`, párování na existující `return_requests` |

Idempotence: Authentica neposílá ID události → `wms_webhook_events(hash
PK = sha256(event+data), received_at)`; duplicitní hash = 200 bez efektu.
Pořadí není garantované → přechody `orders.status` jen vpřed (mašina D8
to už hlídá; zpětný webhook ignorovat, ne chybovat).

## 7. Vratky přes WMS

- Schválení `return_requests` (14 §3) adminem → `POST
  /return-authorization` `{orderId: wms_order_id, externalId:
  return_request.id, invoiceExternalId: invoice_number}`; uložit
  `wms_return_id`, `wms_status='waiting_for_return'`. `410` → hlášení
  (objednávku nelze vrátit přes WMS; řešit ručně).
- `GET /return-authorization/{id}/file` → jsou-li soubory (štítek pro
  zákazníka), nabídnout ke stažení v detailu objednávky + e-mail.
- `returnAuthorization.status.update` → `wms_status`;
  `returnAuthorization.done` → položky s `damaged`:
  - vše `damaged=false` a `partial=false` → automaticky spustit schválenou
    vratku (plnou / částečnou dle položek) existující mechanikou D4;
    sklad doplní WMS sám (`stock.update`);
  - jakákoli položka `damaged=true` nebo `partial=true` → `return_requests.
    status` zůstává, hlášení `medium` s výčtem položek — rozhoduje admin.
- E-maily: „vratka přijata ve skladu" + výsledek (šablony z 14 §3 rozšířit).

## 8. Naskladnění (Receipts)

- Admin `/admin/products` → „Naskladnit": výběr položek + očekávané množství
  (+ šarže, expirace u `tracks_expiration`), dodavatel z `app_settings`
  (`wms_supplier` = údaje PENTARIVA výroby), `incomingDate` →
  `POST /receipt`; uložit do `wms_receipts(id, wms_receipt_id, status,
  items jsonb)`. `receipt.status.update`/`receipt.done` → stav + rozdíl
  očekáváno/přijato → hlášení `low` při neshodě (`itemsDiff`, karanténa).
- Sklad se aktualizuje webhookem `stock.update`; žádný ruční příjem
  (14 §1 tlačítko „příjem na sklad" se v režimu `authentica` skryje).

## 9. Webhook endpoint

EF `authentica-webhook` (`verify_jwt=false` v `config.toml`): syrové tělo,
HMAC-SHA256 s `AUTHENTICA_WEBHOOK_SECRET`, porovnání s hlavičkou
`Authentica-Signature` v konstantním čase; nesouhlas → 401 + hlášení
`medium`. Platný → dedup hash → `rpc fn_apply_wms_event(event, data)` →
200. Výjimka → 500 (Authentica opakuje; potvrdit retry politiku ve smlouvě).

## 10. Hlášení (dle 16) a heartbeaty (dle 15 §2)

| Kód | Závažnost | Dopad |
|---|---|---|
| `WMS-DISPATCH-FAILED` (5 pokusů) | high | zákazník zaplatil, zboží neodchází |
| `WMS-CANCELED` | high | objednávka zrušena skladem |
| `WMS-CANCEL-TOO-LATE` (410) | high | nelze stornovat, řešit vratkou |
| `WMS-RETURNED-CARRIER` | medium | nedoručeno |
| `WMS-RETURN-DAMAGED` | medium | rozhodnutí o refundu |
| `WMS-STOCK-DRIFT` | low | rozdíl zrcadla vs. WMS |
| `WMS-WEBHOOK-SIGNATURE` | medium | možný útok / špatný secret |
| `WMS-AUTH-FAILED` | high | expedice stojí |
Heartbeaty: `fulfillment-dispatch`, `wms-stock-reconcile`, `wms-carriers-sync`.

## 11. Testy a akceptace

- Deno testy adaptéru proti mock serveru (token, create order mapping,
  410/422 mapování, HMAC ověření).
- pgTAP `fn_apply_wms_event`: dispatch → `shipped` + tracking; `delivered` →
  `completed`; duplicitní hash = no-op; `returned_carrier` → return_request;
  `returnAuthorization.done` bez poškození → refund, s poškozením → hlášení;
  dostupnost = orderable − neodeslané rezervace (min. 12 asercí).
- E2E (režim `off` → `authentica` na testovacím shopu Authentica): zaplacená
  objednávka se do 2 min objeví v Authentica se správnou adresou, dopravcem
  a výdejním místem; tracking dorazí do detailu objednávky a e-mailu.

## 12. Otázky k vyjasnění ve smlouvě (implementaci neblokují)

1. Testovací (sandbox) shop a credentials pro vývoj před ostrým provozem.
2. Je `externalId` objednávky unikátní/idempotentní při opakovaném `POST`?
3. Retry politika webhooků a garance pořadí; časové limity odpovědi.
4. Vracejí se soubory (štítek pro zákazníka) u Return Authorization standardně?
5. Uzávěrka příjmu objednávek pro expedici týž den (`processingDate`).
6. Seznam dopravců (Balikobot) a ceník; Zásilkovna výdejní místa.
7. Zacházení s šaržemi/expirací u potravin (FEFO, `minimumExpiration`).
8. Kdo tiskne a platí štítky; formát `OrderShippingLabel` (vlastní vs. WMS).
9. Budoucí zásilky do EU (`termsOfTrade`/Incoterms endpoint).
