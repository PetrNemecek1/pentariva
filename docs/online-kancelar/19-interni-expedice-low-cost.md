# 19 — Interní expedice low-cost: Zásilkovna přímo, vlastní doklady, 0 Kč fixních nákladů

> **Závazné zadání (22. 8. 2026).** Samonosné pro AI implementaci v repu
> `pentariva-office`; platí guardraily `10-implementacni-plan.md` §1 — nic zde
> nemění provizní ani platební logiku (13). Nahrazuje větu „API integrace
> dopravců NENÍ v rozsahu" ze `14-provoz-obchodu.md` §2 a naplňuje živou cestu
> `fulfillment_provider = internal` ze švu dokumentu 17 (Authentica zůstává
> odložená; přepnutí později = konfigurace, ne přestavba).
>
> **Motivace zadavatele:** firma startuje bez vstupního kapitálu. Expedici
> děláme sami z vlastních prostor, bez měsíčních poplatků za agregátory
> (Balíkobot) a fakturační SaaS (Fakturoid). Vše, co stojí měsíčně fixní
> peníze, musí být volitelný adaptér za přepínačem, ne podmínka provozu.

## 0. Rozhodnutí R18 a ekonomika (ověřeno 22. 8. 2026)

| Oblast | Zvoleno | Fixní náklad / měsíc | Alternativa (odmítnuta pro start) |
|---|---|---|---|
| Dopravce | **Zásilkovna (Packeta) přímo přes API** — výdejní místa, Z-BOXy, doručení na adresu (Packeta Home, ID 106) | **0 Kč**; platí se jen za podané zásilky dle smluvního ceníku (orientačně ~62 Kč/zásilka CZ + palivový příplatek 16,5 % + mýtné 1,10 Kč/kg, bez DPH — **ověřit aktuální ceník v client section**) | Balíkobot: 300 / 600 / 800 Kč bez DPH měsíčně (50 / 200 / 500 štítků, 3–5 dopravců), minimálně 3 měsíce; dává smysl až při ≥ 2 dopravcích s vlastními smlouvami |
| Podání zásilek | Odnos na výdejní místo / Z-BOX (zdarma, limit rozměrů a hmotnosti) — svoz kurýrem až od objemu, který ho zaplatí | 0 Kč | Svoz (smluvní cena) |
| Štítky | PDF z API: `A6 on A4` na běžné tiskárně (0 Kč) nebo termotiskárna 100×150 mm (jednorázově ~1 500–2 500 Kč, formát `A6 on A6` / ZPL) | 0 Kč | — |
| Doklady (faktury, dobropisy) | **Vystavuje office sám** (`INVOICING_MODE=internal`): nepřerušená číselná řada, neměnný snapshot, HTML print → PDF v Storage | 0 Kč | Fakturoid: tarif Zdarma jen 5 odběratelů (pro B2C nepoužitelný), Na lehko ~151–182 Kč, Na každý den ~211–256 Kč; adaptér `fakturoid` z 15 §6 **zůstává**, ale není podmínkou go-live |
| Testování dopravce | Packeta **nemá sandbox**; testuje se na ostrém účtu s **testovacím odesílatelem** (`eshop`), zásilka se účtuje až fyzickým vstupem do sítě | 0 Kč | — |

**Součet fixních nákladů expedice a fakturace: 0 Kč/měsíc.** Variabilní: obaly,
výplň, poštovné, čas člověka.

## 1. Co musí zajistit zadavatel (mimo kód, před zapnutím `packeta`)

1. **Účet e-shopu v Zásilkovně** (`client.packeta.com`): registrace firmy
   (IČO, DIČ), smlouva/ceník, **odesílatel** (Client section → Senders;
   label odesílatele = hodnota `eshop`/`PACKETA_SENDER`), **fakturační a
   vratková adresa** (Invoice Addresses — řídí, kam se vrací balíky), povolené
   země a typy míst (**Allowed branch settings**; projeví se ve widgetu do
   90 min). Založit i **testovacího odesílatele** `pentariva-test`.
2. Z client section vyzvednout: **API key (16 znaků)** — pro widget, smí být
   veřejný ve frontendu (`NEXT_PUBLIC_PACKETA_API_KEY`); **API password
   (32 znaků)** — tajný, jen secret Edge Functions (`PACKETA_API_PASSWORD`).
3. Rozhodnout podání: odnos na výdejní místo / Z-BOX vs. svoz; od jakého
   denního počtu balíků přejít na svoz.
4. Tiskárna štítků (nebo rozhodnutí „A6 na A4 na kancelářské tiskárně")
   a obaly (krabice 2–3 velikosti, obálky, výplň, lepicí páska).
5. **Firemní údaje pro doklady** do `app_settings`: `company_name`,
   `company_address`, `company_ico` (existuje), `company_dic`,
   `company_vat_payer` (true/false — **mění podobu dokladu**: neplátce
   nevykazuje DPH a uvádí „Nejsme plátci DPH"), `company_bank_account`,
   `company_logo_path`, `invoice_footer_text`, spisová značka.
6. Hmotnost a rozměry každého produktu (pro `weight`/`size` u Packety a
   pro cenu dopravy) — doplnit do katalogu (§3).
7. Co si zadavatel projde v účtech jiné firmy, aby potvrdil předpoklady
   tohoto zadání: viz §10.

## 2. Architektura: adaptér `ShippingProvider`

- `supabase/functions/_shared/shipping/{types,manual,packeta}.ts`, rozhraní:

  ```ts
  interface ShippingProvider {
    validate(input: ShipmentInput): Promise<void>;                 // packetAttributesValid
    create(input: ShipmentInput): Promise<{ providerId: string; barcode: string }>; // createPacket
    labels(ids: string[], format: LabelFormat, offset: number): Promise<Uint8Array>; // packetsLabelsPdf / packetsCourierLabelsPdf
    cancel(id: string): Promise<void>;                              // cancelPacket
    status(id: string): Promise<ProviderStatus>;                    // packetStatus
    tracking(id: string): Promise<ProviderStatusEvent[]>;           // packetTracking
    createReturn(input: ReturnInput): Promise<{ providerId: string; password: string }>; // createPacketClaimWithPassword
  }
  ```
- Konfig `SHIPPING_PROVIDER = manual | packeta` (Edge secret + zrcadlo
  v `app_settings.shipping_provider`, přepínatelné adminem). **Default
  `manual`** = dnešní chování (dopravce a tracking se vyplní ručně). Balíkobot
  nebo jiný dopravce v budoucnu = další adaptér se stejným rozhraním.
- **Packeta = REST/XML**: `POST https://www.zasilkovna.cz/api/rest`, tělo XML
  s kořenovým elementem = název metody, první subelement vždy
  `<apiPassword>`; odpověď ve stejném tvaru (`<response><status>ok|fault</status>
  <result>…</result>` resp. `<fault>…</fault><string>…</string><detail>…`).
  Žádná SOAP knihovna — v Deno ručně skládat XML (escape!) a parsovat
  (`npm:fast-xml-parser`). ID balíků držet jako **string** (64bit).
- Každé volání: timeout 15 s (štítky: 5 s × počet štítků), zápis do
  **outboxu** `shipping_jobs(id, shipment_id, kind ENUM('create','cancel',
  'labels','sync','return'), status, attempts, last_error, payload, created_at,
  done_at)` — retry s exponenciálním odstupem, max 5; po vyčerpání
  `fn_raise_issue('SHIP-JOB-FAILED', …)` (dokument 16). Idempotence: jedna
  objednávka = max jedna aktivní zásilka (UNIQUE partial index).

## 3. Datový model (doplnit do `04` kanonického DDL)

- `products.weight_g integer NOT NULL DEFAULT 0`, `products.size_mm jsonb NULL`
  (`{length,width,height}`); admin katalog editace; varování při 0 g.
  `app_settings.packaging_weight_g` (default 100), `packeta_max_weight_kg`
  (default 5 — limit Packeta Home CZ; výdejní místa 10 kg dle ceníku — **ověřit**).
- `shipping_methods(id, code text UNIQUE, name_cs, name_en, provider text
  ('manual','packeta'), kind ENUM('pudo','box','home','pickup_in_person'),
  packeta_vendor jsonb NULL — `{country:'cz'}` / `{country:'cz',group:'zbox'}`
  / `{carrierId:'106'}`, packeta_address_id integer NULL (pro `home`: 106 = CZ
  Packeta Home), price_haleru, free_from_haleru NULL (NULL = řídí globální
  pravidlo 13: zdarma od 2 000 Kč jen zákazníci), max_weight_g, countries
  text[], requires_phone boolean, enabled boolean, sort_order)`. Seed: Výdejní
  místo Zásilkovna, Z-BOX, Doručení na adresu (Packeta Home), Osobní odběr.
  Existující `shipping_flat_haleru` / `carriers` migrovat do této tabulky
  (stará konfigurace zůstane jen jako fallback `manual`).
- `orders.shipping_method_code text NULL FK shipping_methods(code)`;
  `orders.shipping_address` jsonb rozšířit na `{name, surname, company,
  phone, email, street, house_number, city, zip, country, note,
  pickup_point: {id, name, street, city, zip, country, type:'internal'|'external',
  carrierId, carrierPickupPointId, group}}`. Telefon v **mezinárodním
  formátu** (`+420…`, viz Packeta phone formats) — validace na serveru.
- `shipments(id, order_id FK, provider, provider_packet_id text NULL,
  barcode text NULL — `Z1234567890`, status ENUM('draft','created',
  'label_printed','handed_over','in_transit','ready_for_pickup','delivered',
  'returning','returned','cancelled','error'), label_format text,
  label_printed_at, handed_over_at, delivered_at, stored_until date NULL,
  last_status_code int NULL, last_status_text text NULL, last_synced_at,
  error text NULL, created_by, created_at)`. UNIQUE `(order_id) WHERE status
  NOT IN ('cancelled','error')`. RLS: admin vše; kupující SELECT přes view
  `v_my_shipments` (jen status, barcode, tracking URL, stored_until).
- `shipment_events(id, shipment_id FK, at timestamptz, status_code int,
  code_text text, status_text text, branch_id int NULL, raw jsonb)` —
  append-only, deduplikace `(shipment_id, at, status_code)`.
- `shipping_status_map(provider, status_code int, internal_status,
  notify_customer boolean, raise_issue_code text NULL)` — **editovatelná** mapa,
  seed pro Packetu (kódy z oficiální tabulky):

  | Kódy Packeta | `internal_status` | Poznámka |
  |---|---|---|
  | 1 received data | `created` | balík založen, ještě nepodán |
  | 2 arrived, 12 collected | `handed_over` | fyzicky v síti → objednávka `shipped` (pokud ještě není) |
  | 3 prepared for departure, 4 departed, 6 handed to carrier, 14 customs, 16 delivery attempt, 23/24 zbox delivery attempt, 25 carrier first delivery attempt, 31 courier tracking code added | `in_transit` | 6: uložit `externalTrackingCode` |
  | 5 ready for pickup | `ready_for_pickup` | uložit `storedUntil`, e-mail zákazníkovi volitelně (Packeta posílá SMS sama) |
  | 7 delivered | `delivered` | `delivered_at`; objednávka `completed` dle stávajícího pravidla |
  | 9 posted back, 17/18 rejected by recipient, 19 return no branch, 20 storage time expired, 21 cancelled but consigned, 22 return overlimit | `returning` | `fn_raise_issue('SHIP-RETURNING', medium)` — admin rozhodne (vratka/znovu poslat) |
  | 10 returned, 15 reverse packet arrived | `returned` | vstup pro 14 §3 (vratka zboží → `stock_movements.return`) |
  | 11 cancelled | `cancelled` | |
  | 26/27 investigation, 28–30 redirect, 999 unknown | beze změny | jen event + `low` issue u 26 |

- `invoices` rozšířit: `provider` CHECK přidat `'internal'`; `number text
  UNIQUE`, `issued_at`, `due_at`, `taxable_supply_at` (DUZP = `orders.paid_at`),
  `pdf_path text` (Storage bucket `invoices`, privátní, signed URL),
  `snapshot jsonb NOT NULL` (neměnný obsah: dodavatel, odběratel, položky,
  rozpad DPH per sazba, kredit jako sleva, doprava, součty, forma úhrady,
  variabilní symbol = `order_number`), `credit_note_number text NULL`,
  `credit_note_snapshot jsonb NULL`, `credit_note_pdf_path`. Číselné řady
  v `app_settings.invoice_series = {"invoice":{"prefix":"F","year":2026,
  "next":1,"format":"{prefix}{year}{seq:05}"},"credit_note":{"prefix":"D",…}}`
  — přidělení čísla v SECURITY DEFINER `fn_next_document_number(kind)` pod
  advisory lockem (**nikdy mezera ani duplicita**).

## 4. Checkout (zákazník)

1. Krok **Doprava**: seznam `shipping_methods` (enabled, pro zemi adresy)
   s cenou; doprava zdarma podle 13 (zákazník od 2 000 Kč) se zobrazí jako
   přeškrtnutá cena.
2. Metoda `pudo`/`box` → tlačítko **„Vybrat výdejní místo"** otevře widget v6:
   `<script src="https://widget.packeta.com/v6/www/js/library.js">`,
   `Packeta.Widget.pick(apiKey, callback, { language:'cs', country:'cz',
   vendors:[{country:'cz'}] | [{country:'cz',group:'zbox'}], weight: kg,
   defaultPrice, defaultCurrency:'CZK', expeditionDay })`. Callback `Point`
   (nebo `null` = zrušeno) → uložit `pickup_point` (viz §3), zobrazit název,
   adresu, otevírací dobu (`openingHours.compactShort`), tlačítko „Změnit".
   Stav `error` (`vacation|full|closing|technical`) = nelze vybrat.
3. Metoda `home` → adresa s **povinným telefonem**, `house_number` zvlášť
   (Packeta vyžaduje `street` + `houseNumber` zvlášť; při zadání „Na Pankráci
   969/97" rozdělit serverově na poslední token).
4. Server (`fn_checkout` / EF `checkout`): metoda existuje a je zapnutá,
   cena dopravy se počítá **serverově** (nikdy z klienta), Σ hmotnost ≤
   `max_weight_g` metody (jinak chyba „Objednávka je příliš těžká pro zvolenou
   dopravu"), telefon povinný tam, kde `requires_phone`; pro `pudo`/`box`
   **validace bodu**: `POST https://widget.packeta.com/v6/pps/api/widget/v1/validate`
   `{apiKey, point:{id}|{carrierId,carrierPickupPointId}, options:{vendors,
   weight}}` → `isValid=false` ⇒ chyba „Vybrané výdejní místo není dostupné,
   vyberte jiné". (Klient lze obejít, proto server.)
5. **Dobírka (COD) není v rozsahu** — platí se kartou (Stripe), `cod` se
   neposílá. Zaznamenat jako Fázi 3 (vyžaduje účet pro převody COD v client
   section).
6. Detail objednávky zákazníka: metoda, výdejní místo, stav zásilky
   (`v_my_shipments`), tracking odkaz
   `https://tracking.packeta.com/cs/?id={barcode}` (šablona v
   `carrier_tracking_templates`, **ověřit formát URL**), „uloženo do" u
   `ready_for_pickup`, odkaz na fakturu PDF (§6).

## 5. Expediční tok v adminu (`/admin/orders` → „Expedice")

Fronta = objednávky `paid` se `fulfillment_provider='internal'`; hromadné
akce nad zaškrtnutými řádky; každá akce = `shipping_jobs` + audit.

1. **Vytvořit zásilku** (EF `shipping-create`, admin JWT): sestavit
   `PacketAttributes`: `number` = `order_number`, `name`/`surname` (rozdělit
   `display_name`; `company` je-li), `email`, `phone`, `addressId` =
   `pickup_point.id` (interní místo) / `carrierId` + `carrierPickupPoint` =
   `carrierPickupPointId` (externí místo) / `packeta_address_id` metody (home),
   `currency:'CZK'`, `value` = `goods_paid_haleru/100` (pojištění; strop
   `packeta_max_insured_value_kc`, default 5 000), `weight` = (Σ `weight_g` ×
   ks + `packaging_weight_g`)/1000, min 0,1 kg, `eshop` = `PACKETA_SENDER`,
   `note` = `order_number` (≤ 128 znaků, bez `"` a `;`), u home `street`,
   `houseNumber`, `city`, `zip`; `size` je-li vyžadována. Nejprve
   `packetAttributesValid`, pak `createPacket` → `shipments.created`,
   `barcode`. Chyba (`PacketAttributesFault` s `detail.attributes`) →
   `shipments.error` + srozumitelná hláška u řádku (překlad nejčastějších
   chyb: neplatné znaky ve jménu, chybí telefon, PSČ nedoručitelné, …) +
   `fn_raise_issue('SHIP-CREATE-FAILED', high po 3 pokusech)`. Objednávka
   zůstává `paid`.
2. **Tisk štítků** (EF `shipping-labels`): interní místa a Z-BOX →
   `packetsLabelsPdf(ids, format, offset)`; externí dopravci (home delivery
   a cizí výdejní místa) → pro každý balík `packetCourierNumberV2` a pak
   `packetsCourierLabelsPdf(packetIdsWithCourierNumbers, offset, 'A6 on A4' |
   'A6 on A6')`. Formát = `app_settings.label_format` (default `A6 on A4`,
   4 štítky na stránku; `offset` = kolik pozic na první straně přeskočit —
   UI pole „začít od pozice"). PDF se vrátí ke stažení/tisku, neukládá se
   (regenerovat lze kdykoliv). Zároveň tisk **balicích lístků** (14 §2 print
   view) v témže pořadí → balení = štítek + lístek vedle sebe. Označit
   `label_printed_at`, stav `label_printed`.
3. **Předáno dopravci** (hromadně): `handed_over_at`, stav `handed_over`,
   a volání existující `fn_admin_ship_order(order, 'Zásilkovna', barcode)`
   → objednávka `shipped`, e-mail #6 s tracking odkazem (14 §2). Volitelně
   (Fáze 2 této kapitoly): `createShipment(packetIds)` → dodací list
   `D-…` + `barcodePng` k tisku — kurýr/výdejní místo skenuje jeden kód.
4. **Storno zásilky**: `cancelPacket` povoleno jen ve stavech
   `created`/`label_printed` (Packeta: jen fyzicky nepodané). Po podání
   storno nelze — řešit jako vratku (14 §3). Storno objednávky / plná vratka
   před podáním volá storno zásilky automaticky.
5. **Synchronizace stavů** (pg_cron každé 2 h 6–22 h Europe/Prague → EF
   `shipping-sync`): pro `shipments` v aktivních stavech `packetStatus`
   (a při změně `packetTracking` pro historii) → `shipping_status_map` →
   stav, `stored_until`, `delivered_at`, events. Přechody `delivered` →
   existující logika `shipped → completed`; `returning/returned` → issue +
   admin akce „Vrátit peníze / Poslat znovu" (vazba na `return_requests`).
   Stav nikdy nejde zpět (monotónní, kromě `returning` po `ready_for_pickup`).
6. **Ruční režim (`manual`)** zůstává: stejná fronta, akce „Označit jako
   odesláno" s dopravcem a trackingem ručně (dnešní `fn_admin_ship_order`).
   Přepnutí `packeta → manual` kdykoliv (existující zásilky se dál
   synchronizují).

## 6. Vlastní doklady (`INVOICING_MODE = off | internal | fakturoid`, default `internal`)

- Při `orders → paid` (stejné místo jako e-mail #5, po commitu):
  `fn_issue_internal_invoice(order_id)` SECURITY DEFINER: přidělí číslo
  (`fn_next_document_number('invoice')`), sestaví `snapshot` z `order_items`
  (název, ks, jednotková cena bez/s DPH, sazba `vat_rate_bp`, dárky 0 Kč
  s poznámkou), doprava jako položka, **použitý kredit jako sleva** (řádek
  „Uplatněný kredit −X Kč"), rozpad DPH per sazba (HALF-UP na haléře per
  sazba, `fn_pct_haleru`), způsob úhrady „platební kartou online", datum
  úhrady = DUZP = `paid_at`, variabilní symbol = `order_number`, odběratel
  = `shipping_address` + `payout_profiles`/firemní údaje kupujícího
  (IČO/DIČ u B2B Trade objednávek — povinné na dokladu). Neplátce DPH
  (`company_vat_payer=false`): bez rozpadu DPH, věta „Nejsme plátci DPH",
  ceny konečné. Idempotentní (UNIQUE `order_id`).
- **PDF**: EF `invoice-render` vykreslí HTML šablonu (Deno, stejný
  brand jako e-maily) a převede na PDF (`npm:@react-pdf/renderer` nebo
  `npm:pdf-lib` + vlastní layout — implementátor zvolí knihovnu bez nativních
  závislostí, Puppeteer v Edge Functions není k dispozici) → Storage
  `invoices/{year}/{number}.pdf` (privátní, signed URL 1 h). Příloha do
  e-mailu #5 (Resend attachment) + odkaz v detailu objednávky a v
  `/admin/orders`. Selhání renderu neblokuje platbu: doklad existuje
  v DB (snapshot), PDF se dogeneruje retry jobem (`invoice_failures`
  + widget retry z 15 §6 se znovu použije).
- **Dobropis**: `fn_refund_order` (plný i částečný) → `fn_issue_credit_note
  (order_id, refund_id)` s řadou `credit_note`, odkaz na původní fakturu,
  záporné řádky vrácených položek, důvod; PDF stejně. Nikdy se nemění
  vystavená faktura — jen dobropis (zákonný princip, shodný s ledgerem).
- **Exporty pro účetní** (15 §5 rozšířit): seznam vydaných dokladů za
  období CSV (číslo, datum, DUZP, odběratel, základ/DPH per sazba, celkem,
  VS, stav úhrady) + ZIP PDF za měsíc. To je to, co účetní potřebuje místo
  Fakturoidu; import do účetního SW řeší účetní.
- `fakturoid` adaptér (15 §6) zůstává volitelný — při přepnutí vystavuje
  Fakturoid a `invoices.provider='fakturoid'`; číselné řady se nesmí míchat
  (přepnutí jen na přelomu roku / s novou řadou — validace v nastavení).
- **Právní minimum dokladu** (§ 29 ZDPH / § 435 OZ): označení dodavatele
  (název, sídlo, IČO, DIČ, zápis v OR), odběratel, číslo dokladu, datum
  vystavení, DUZP, rozsah a předmět plnění, základ a sazba DPH, výše DPH,
  celková částka; u neplátce text o neplátcovství. Šablonu odsouhlasí
  účetní zadavatele před go-live (runbook 15 §8 krok 3 → „testovací
  faktura v sandboxu Fakturoidu" nahradit „testovací interní faktura
  odsouhlasená účetní").

## 7. Vratky (zákazník → firma) přes Packetu

- V toku 14 §3 (odstoupení / reklamace) po `approved` admin akce **„Vytvořit
  zpětnou zásilku"** → `createPacketClaimWithPassword({number:'RET'+
  order_number, email, phone, value, currency:'CZK', eshop, consignCountry:'cz',
  sendEmailToCustomer:true})` → Packeta pošle zákazníkovi e-mail s heslem;
  heslo i my uložíme do `return_requests.return_password` a zobrazíme
  v detailu + v našem e-mailu o schválení. Zákazník balík bez štítku odevzdá
  na kterémkoliv výdejním místě / Z-BOXu. Vratka se vrací na adresu
  z Invoice Addresses v client section (nelze zvolit per zásilka).
- Zpětný balík = nový `shipments` řádek s `kind='return'` (přidat sloupec
  `kind ENUM('outbound','return')`), sync stavů stejně; `returned` → admin
  potvrdí příjem zboží → `stock_movements.return` + spuštění vratky peněz
  (existující mechanika) + dobropis (§6).
- Kdo platí zpětné poštovné (odstoupení: zákazník; reklamace: firma) =
  `app_settings.return_shipping_paid_by_customer_kc` informativně v textech;
  Packeta účtuje vratku e-shopu dle ceníku.

## 8. Hlášení (dokument 16) — nové kódy do `issue_catalog`

| Kód | Závažnost | Lidský text (vzor) |
|---|---|---|
| `SHIP-CREATE-FAILED` | `medium`, `high` po 3 pokusech | „Zásilku k objednávce č. {order_number} se nepodařilo založit u Zásilkovny: {reason_cs}. Dopad na zákazníka: zpoždění odeslání. Peníze v ohrožení: ne. Co dělat: opravit adresu/telefon v detailu objednávky a zkusit znovu." |
| `SHIP-RETURNING` | `medium` | „Zásilka k objednávce č. {order_number} se vrací ({reason_cs}). Co dělat: kontaktovat zákazníka; po doručení zpět rozhodnout vratka / nové odeslání." |
| `SHIP-STUCK` | `low` | zásilka `handed_over`/`in_transit` bez změny > 5 pracovních dní |
| `SHIP-SYNC-FAILED` | `medium` | API Zásilkovny nedostupné > 6 h (`cron_heartbeats`) |
| `INVOICE-RENDER-FAILED` | `medium`, `high` po 3 | PDF dokladu se nepodařilo vytvořit; doklad existuje, zákazník zatím nemá PDF |
| `INVOICE-SERIES-GAP` | `critical` | selfcheck (15 §1 bod 7 — doplnit): v řadě chybí číslo nebo je duplicitní |

## 9. Konfigurace a tajemství

| Klíč | Kde | Popis |
|---|---|---|
| `SHIPPING_PROVIDER` | EF secret + `app_settings.shipping_provider` | `manual` / `packeta` |
| `PACKETA_API_PASSWORD` | EF secret | 32 znaků, nikdy do klienta ani do gitu |
| `PACKETA_SENDER` | EF secret / `app_settings.packeta_sender` | label odesílatele (`pentariva` / `pentariva-test`) |
| `NEXT_PUBLIC_PACKETA_API_KEY` | frontend env | 16 znaků, pro widget (veřejný) |
| `INVOICING_MODE` | EF secret + `app_settings` | `off` / `internal` / `fakturoid` |
| `label_format`, `packaging_weight_g`, `packeta_max_insured_value_kc`, `invoice_series`, `company_*` | `app_settings` | editovatelné v `/admin/settings` → sekce „Expedice" a „Doklady" |

## 10. Co si zadavatel ověří v účtech jiné firmy (Zásilkovna, Fakturoid)

Cíl: potvrdit předpoklady, ne kopírovat. Zapsat odpovědi do §12.

**Zásilkovna (client section):**
1. Kde je API key a API password (Uživatelská podpora → přístupy) a zda jsou
   dva různé (16 vs 32 znaků).
2. Jak vypadá **Senders** (label odesílatele, návratová adresa) — jeden účet
   může mít více odesílatelů → potvrzuje testovací odesílatel.
3. Ceník: cena zásilky na výdejní místo / Z-BOX / na adresu, příplatky,
   cena vratky, cena svozu, limit hmotnosti pro výdejní místa (5 vs 10 kg).
4. **Allowed branch settings** — co se omezuje (země, Z-BOX, externí
   dopravci).
5. Sekce Zásilky: jak vypadá ručně založená zásilka, tisk štítků (formáty),
   „Podací list"/shipment, jak se balík **předává** (odnos vs. svoz a jeho
   objednání).
6. Fakturace od Zásilkovny: frekvence, jak se párují zásilky (číslo
   objednávky `number` = náš `order_number` — ano/ne).
7. Zda účet používá dobírku a co to vyžaduje (pro Fázi 3).

**Fakturoid:**
1. Podoba faktury (hlavička, povinné údaje, patička, QR platba) — vzor pro
   naši šablonu §6.
2. Nastavení **číselných řad** a jak řeší dobropis (odkaz na fakturu,
   záporné řádky) — stejná logika u nás.
3. Jak se kredit/sleva zobrazuje na dokladu (řádek slevy vs. snížená cena).
4. Exporty pro účetní (CSV / Pohoda XML / ISDOC) — co účetní reálně chce;
   podle toho formát našeho exportu.
5. Limit 5 odběratelů u tarifu Zdarma — potvrdit, že to vylučuje B2C.

## 11. Akceptace

1. `SHIPPING_PROVIDER=manual`: chování shodné s dnešním (regresní test).
2. `packeta` (testovací odesílatel, ostrý účet): objednávka s výdejním
   místem → zásilka založena, `barcode` ve tvaru `Z…`, štítek PDF
   `A6 on A4` stažen, storno před podáním projde (`cancelPacket`), po
   uměle nastaveném stavu `handed_over` storno odmítnuto. Testovací zásilky
   se nikdy fyzicky nepodají = 0 Kč.
3. Deno testy s mockem REST/XML: mapování `PacketAttributes` (jméno/příjmení,
   house number split, hmotnost, telefon), parsování `fault` odpovědi,
   idempotence `create` (druhé volání nezaloží druhý balík), stavová mapa
   pro všech 25 kódů z tabulky §3.
4. Checkout odmítne bod s `isValid=false` a objednávku nad limit hmotnosti;
   cena dopravy se nepřepíše z klienta (pgTAP na `fn_checkout`).
5. Interní faktura: číselná řada bez mezer (pgTAP: 50 paralelních
   objednávek → 50 po sobě jdoucích čísel), snapshot se po změně produktu
   nemění, dobropis odkazuje na fakturu a Σ = vrácená částka; neplátce vs.
   plátce generuje správnou variantu; PDF existuje v Storage a je v e-mailu #5.
6. Selfcheck hlásí mezeru v řadě jako `critical` s lidským textem (16).
7. Vratka: `createPacketClaimWithPassword` vrátí heslo, zákazník ho vidí
   v e-mailu i detailu; `returned` stav spustí příjem na sklad.
8. `INVOICE-RENDER-FAILED` po 3 pokusech eskaluje; retry z adminu doplní PDF.

## 12. Předpoklady k ověření (doplní zadavatel po průchodu §10)

| # | Předpoklad | Stav |
|---|---|---|
| A1 | REST/XML endpoint `https://www.zasilkovna.cz/api/rest` přijímá všechny metody z API reference (ověřeno v dokumentaci) | ✅ dokumentace |
| A2 | Výdejní místa CZ: limit 10 kg; Packeta Home CZ: 5 kg, 120 cm součet | ⬜ ceník |
| A3 | Tracking URL `https://tracking.packeta.com/cs/?id=Z…` | ⬜ |
| A4 | Testovací odesílatel nezakládá náklady, dokud balík fyzicky nevstoupí do sítě (dokumentace to tvrdí) | ✅ dokumentace |
| A5 | Faktura od Zásilkovny obsahuje náš `number` (order_number) pro párování | ⬜ |
| A6 | Účetní akceptuje interní doklady + CSV/PDF export (bez Fakturoidu) | ⬜ |
| A7 | Svoz vs. odnos: od kolika balíků denně | ⬜ |

## 13. Pořadí implementace

1. §3 datový model + `manual` adaptér + migrace `shipping_methods` (beze
   změny chování) → §6 interní doklady (nezávislé na dopravci, potřebné
   pro go-live nejdřív).
2. §4 checkout s widgetem + serverová validace.
3. §5 `packeta` adaptér: create → labels → handed over → sync.
4. §7 vratky, §8 hlášení, exporty.
5. Dokument 17 (Authentica) zůstává odložený; až bude, `fulfillment_provider`
   přepne tok z §5 na WMS, checkout (§4) a doklady (§6) zůstávají.
