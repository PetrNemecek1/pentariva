# 08 — Platby: checkout, brána, webhooky, refundy

> **Závazná specifikace platební vrstvy.** Kanonické DDL žije výhradně
> v `04-datovy-model.md` (D1) — tento dokument **žádnou tabulku nedefinuje**, jen
> odkazuje: `orders` + stavová mašina (§2.7), `payments` a `order_refunds` (§2.8),
> `commission_entries` (§2.9), `credit_transactions` (§2.10). Řídí se kontraktem
> D5–D8, D22–D24 (`02-technicka-rozhodnuti.md`) a rozhodnutími R8, R11, R12, R14
> (`00-zadani-a-rozhodnuti.md`). Peněžní důsledky platby (provize) popisuje
> `05-provizni-engine.md`.

## 0. Souhrn rozhodnutí

1. **Brána MVP = Stripe v test módu** (R8) za tenkým rozhraním `PaymentProvider`
   (D23). Rozhodnutí o produkční bráně (Stripe vs Comgate) padne při go-live podle
   Přílohy A — swap je izolovaný na jeden adaptér.
2. Jediná měna **CZK**; všechny částky **BIGINT v haléřích** (sufix `_haleru`),
   sazby v basis pointech (sufix `_bp`), jediné místo zaokrouhlení `fn_pct_haleru`
   (D5, D19). Minor unit CZK u Stripe = haléř — konvence si přesně odpovídají.
3. **Kredit lze uplatnit jen na zboží, doprava se platí vždy penězi** (D6, R11).
   Plná úhrada zboží kreditem = objednávka **bez platební brány** — tok bez payment
   session, viz §4.3.
4. **Vratka = vždy celá objednávka** (D4). Doprava se při refundu vrací celá.
5. **Žádné PDF doklady v MVP** (D23, D30) — zákazník dostává e-mailovou
   rekapitulaci; Fakturoid se napojuje až při go-live.
6. **Bankovní převod s VS není v MVP** (D23, D30) — specifikován jako go-live
   rozšíření v §8.
7. Do vzniku IČO běží vše v test módu za env flagem `PAYMENTS_MODE=test|live`
   (R8), viz §9.

---

## 1. Stavová mašina objednávky (D8)

Stavy jsou přesně hodnoty ENUM `order_status` z kanonického schématu:
`draft, awaiting_payment, paid, shipped, completed, cancelled, refunded`.
Žádné jiné stavy (žádné `processing`, `delivered`, `partial_refund`) neexistují.

```
draft → awaiting_payment → paid → shipped → completed
draft → cancelled
awaiting_payment → cancelled
paid → refunded
shipped → refunded
completed → refunded
```

Whitelist přechodů je **data** v tabulce `order_status_transitions` a vynucuje ho
trigger `trg_orders_status` (obojí kanonicky v `04-datovy-model.md` §2.7) —
aplikační kód nikdy nezapisuje `orders.status` mimo tuto mašinu.

| Přechod | Trigger | Aktér |
|---|---|---|
| `draft → awaiting_payment` | úspěšná validace košíku (`fn_validate_order_pricing`) při odeslání do platby | systém (EF `checkout`) |
| `draft → cancelled` | opuštěný checkout — cron po 24 h | systém |
| `awaiting_payment → paid` | `payment_succeeded` webhook, resp. kreditní checkout §4.3 | systém |
| `awaiting_payment → cancelled` | storno zákazníkem, nebo cron po 7 dnech nezaplaceno | zákazník / systém |
| `paid → shipped` | expedice | admin |
| `shipped → completed` | cron 14 dní po expedici, nebo ručně | systém / admin |
| `paid \| shipped \| completed → refunded` | dokončená refundace **celé** objednávky (§6) | admin + webhook |

Invarianty (závazné):

- `completed` existuje **výhradně po** `shipped` — objednávka nikdy nepřeskočí
  expedici.
- `cancelled` existuje jen **před zaplacením**; po zaplacení je jediná cesta
  `refunded`, a to vždy pro **celou** objednávku (D4).
- `orders.paid_at` nastavuje **výhradně** privilegovaná platební cesta: webhook
  handler (`fn_apply_payment_event`, §5) nebo kreditní checkout (§4.3). Trigger
  odmítne přechod na `paid` bez `paid_at`.
- Žádný sloupec `orders.payment_status` neexistuje — stav brány žije výhradně
  v tabulce `payments` (D8).
- Storno (`awaiting_payment/draft → cancelled`) **vrací rezervovaný kredit**
  transakcí `adjustment` (§4.4).

**Částečné vratky v MVP nejsou — pouze refundace celé objednávky (D4).**
Zdůvodnění jednou větou: storno provizí je při plné vratce prostá negace všech
řádků `commission_entries` objednávky, zatímco částečná vratka vyžaduje poměrný
přepočet celého řetězce (20 % osobní / 15-6-4 týmové / Trade provize / 3% klubový
kredit / leadership pool) po položkách včetně haléřové rekonciliace — ve Fázi 2 se
doplní migrací, MVP stav `partial_refund` nezavádí. Dílčí kompenzaci (poškozený
kus z větší objednávky) řeší admin ručním `adjustment` připsáním klubového kreditu
zákazníkovi bez zásahu do provizí.

---

## 2. `PaymentProvider` rozhraní (D23)

Jediné místo, kde aplikace mluví s branou. Výměna brány = nový adaptér + env
proměnné, **nula změn** v objednávkovém a provizním kódu.

```ts
// packages/payments/types.ts — závazný kontrakt
export type ProviderId = 'stripe' | 'comgate' | 'bank_transfer';
// MVP implementuje POUZE StripeProvider; ComgateProvider a BankTransferProvider
// jsou go-live/Fáze 2 adaptéry nad tímtéž rozhraním (§8, Příloha A).

export interface CreateCheckoutInput {
  orderId: string;                  // uuid objednávky
  orderNumber: string;              // orders.order_number (lidské číslo)
  amountHaleru: number;             // = orders.paid_money_haleru (integer haléře)
  currency: 'CZK';
  customerEmail: string;
  successUrl: string;               // absolutní URL
  cancelUrl: string;
}

export interface CheckoutResult {
  kind: 'redirect' | 'instructions';   // brána → redirect; bank. převod (go-live) → instrukce
  providerPaymentId: string;           // stripe: session.id
  redirectUrl?: string;                // jen kind='redirect' (MVP vždy)
  instructions?: { accountDisplay: string; iban: string; vs: string;
                   amountHaleru: number; qrSpd: string };  // jen kind='instructions' (§8)
}

export type NormalizedEventType =
  'payment_succeeded' | 'payment_failed' | 'session_expired' | 'refund_succeeded';

export interface NormalizedPaymentEvent {
  provider: ProviderId;
  eventId: string;                  // unikátní ID události u providera — DEDUP KLÍČ
  type: NormalizedEventType;
  providerPaymentId: string;
  orderId: string;                  // z metadata / client_reference_id
  amountHaleru: number;
  livemode: boolean;
  actorProfileId?: string;          // u refundů: admin z metadata (§6)
  raw: unknown;                     // ukládá se do payments.payload (forenzika)
}

export interface PaymentProvider {
  readonly id: ProviderId;
  createCheckout(i: CreateCheckoutInput): Promise<CheckoutResult>;
  /** Ověří podpis a normalizuje payload; při neplatném podpisu VYHAZUJE výjimku. */
  parseAndVerifyWebhook(rawBody: string, headers: Headers): Promise<NormalizedPaymentEvent>;
  refund(providerPaymentId: string, amountHaleru: number, idempotencyKey: string,
         metadata: Record<string, string>): Promise<{ providerRefundId: string }>;
  getStatus(providerPaymentId: string):
    Promise<'pending' | 'paid' | 'failed' | 'expired' | 'refunded'>;
}
```

Pravidla kontraktu (závazná):

a) Veškerá logika po webhooku pracuje **jen** s `NormalizedPaymentEvent` — nikde
   mimo adaptér se nesahá na surové payloady brány.
b) Každý provider má **vlastní webhook Edge Function**
   (`payments-webhook-stripe`, později `payments-webhook-comgate`) — podpisová
   schémata se liší; obě volají tutéž RPC (§5.4).
c) Checkout u brány nese **jedinou souhrnnou položku** „Objednávka PENTARIVA
   č. {order_number}“ s částkou `paid_money_haleru`. Zdůvodnění jednou větou:
   po per-položkových slevách (D5) a odečtu kreditu (D6) by položkové zrcadlení
   v bráně jen vytvářelo riziko nesouladu — zdrojem pravdy o položkách je DB
   a e-mailová rekapitulace (§7).

**Stripe implementační poznámky (závazné):** Checkout `mode:'payment'`,
`currency:'czk'`, `unit_amount` přímo v haléřích; `client_reference_id = orderId`
a `metadata.order_id` nastavit **i** na `payment_intent_data.metadata` (mapování
refund webhooků); `expires_at` = +1 hodina; idempotence
`{ idempotencyKey: 'checkout:' + payments.id }` (per pokus o platbu, ne per
objednávka — „Zaplatit znovu“ je nový řádek `payments`, §4.4). V Edge Functions
(Deno) `import Stripe from 'https://esm.sh/stripe@17?target=deno'` a
`Stripe.createSubtleCryptoProvider()` s `webhooks.constructEventAsync`
(oficiální Supabase vzor).

---

## 3. Datová vrstva — odkazy na kanonické schéma

Tento dokument nedefinuje žádné DDL. Platební vrstva používá výhradně:

- **`payments`** (`04-datovy-model.md` §2.8) — platby PENĚZI za objednávku;
  `amount_haleru = orders.paid_money_haleru` (hlídá webhook handler);
  `provider_payment_id` = ID session/intentu; **`provider_event_id`
  s unikátem `(provider, provider_event_id)` = deduplikace webhooků**;
  `livemode` (R8); `method = 'card'` (jediná hodnota ENUM v MVP); surový payload
  události ve sloupci `payload`.
- **`order_refunds`** (§2.8) — `UNIQUE (order_id)`: v MVP existuje nejvýš jedna
  (plná) vratka na objednávku; `amount_haleru = orders.paid_money_haleru`.
- **`fn_generate_commissions`, `fn_refund_order`** (§2.17) — jediní producenti
  peněžních záznamů; platební vrstva je pouze volá.

Sémantika stavů `payment_status` (hodnoty ENUM z kanonického schématu):

| `payments.status` | Význam |
|---|---|
| `initiated` | řádek založen, session u brány ještě nevytvořena |
| `pending` | session vytvořena, čeká se na zákazníka |
| `paid` | potvrzeno webhookem (`paid_at`), objednávka přechází na `paid` |
| `failed` | definitivní selhání platby dle brány (reconcile / `getStatus`) |
| `cancelled` | session expirovala nebo checkout zrušen; nový pokus = **nový řádek** |
| `refunded` | plná vratka potvrzena webhookem (§6) |

Oproti návrhové fázi **záměrně neexistují** tabulky `webhook_events`,
`post_paid_jobs` ani `receipts`: deduplikaci řeší `payments.provider_event_id`,
e-maily se odesílají po commitu transakce (§5.4, §7) a PDF doklady v MVP nejsou.
Čerpání kreditu **není platba** — žije v `credit_transactions`
(`type='spend'`, `spent_on_order_id`), nikdy v `payments`.

Přístupová práva (D22): klient přes RLS peníze **jen čte**; EF `checkout`,
webhook handlery i refund akce běží pod service-role / SECURITY DEFINER.

---

## 4. Checkout s úhradou kreditem (D6, D7, R11, R12)

### 4.1 Výpočet objednávky

1. Ceny se počítají **výhradně ze serverového ceníku** (`v_current_prices`,
   snapshot do `order_items`); klientem poslané částky se ignorují.
2. Sleva dle `business_flow` se počítá `fn_pct_haleru` **per položka** (D5);
   souhrny objednávky = Σ položek.
3. Doprava dle `app_settings`: paušál `shipping_flat_haleru` (99 Kč), zdarma když
   `total_catalog − total_discount ≥ shipping_free_from_haleru` (1 500 Kč) — R14.
4. Kredit: zákazník zvolí `credit_used_haleru`, přičemž platí
   `credit_used ≤ total_catalog − total_discount` (CHECK `chk_credit_only_goods`
   — **kredit nikdy nehradí dopravu**) a `credit_used ≤ dostupný zůstatek`.
   Čerpat lze **jen dostupný** kredit (`available` z `v_credit_overview`);
   kredit `pending` — čekající na aktivaci (R12) — použít nelze.
   Čerpá se **nejprve klubový, pak provizní** kredit (klubový nelze nikdy
   vyplatit na účet — R10 datového modelu, proto se utrácí přednostně); při
   kombinaci vznikají dvě `spend` transakce.
5. Výsledek splňuje kanonický vzorec D7 (CHECK `chk_order_formula`):
   `total_catalog − total_discount + shipping − credit_used = paid_money`.
   Báze provizí = `goods_paid = total_catalog − total_discount − credit_used`
   (generovaný sloupec, D6) — provize i 3% Club kredit se počítají **jen z peněz
   skutečně zaplacených za zboží**, nikdy z dopravy (R11, R14).

### 4.2 Tok s bránou (`paid_money_haleru > 0`)

Jedna transakce EF `checkout` (service-role):

1. `INSERT orders (status='draft')` + `order_items` (snapshoty cen, `is_gift`).
2. Rezervace kreditu: `credit_transactions` `spend` (záporné částky,
   `spent_on_order_id = order.id`) pod `pg_advisory_xact_lock(profile, kind)`
   s kontrolou zůstatku — dva paralelní checkouty nemohou utratit tentýž kredit.
3. `orders → awaiting_payment` (trigger spustí `fn_validate_order_pricing`:
   role kupujícího, sleva per položka, souhrny, doprava).
4. `INSERT payments (provider='stripe', status='initiated',
   amount_haleru = paid_money_haleru, livemode dle PAYMENTS_MODE)`.

Po commitu: `provider.createCheckout(...)` → `UPDATE payments SET
provider_payment_id = session.id, status='pending'` → klientovi `redirectUrl`.
Selhání vytvoření session: `payments` zůstává `initiated`, klient dostane chybu
a tlačítko „Zkusit znovu“ (nový pokus přepíše `provider_payment_id` téhož
`initiated` řádku; `idempotencyKey` je vázán na `payments.id`).

Návrat ze Stripe na `success_url` zobrazí „Ověřujeme platbu…“ a polluje stav
objednávky. **Redirect NENÍ důkaz zaplacení — pravdu určuje výhradně webhook.**

### 4.3 Plná úhrada kreditem (`paid_money_haleru = 0`) — tok bez payment session

Z D7 plyne: `paid_money = 0` je možné **jen když `shipping = 0`** (doprava se
platí vždy penězi — tj. objednávka má dopravu zdarma dle R14) a kredit pokrývá
celou cenu zboží po slevě. Tok je jedna transakce EF `checkout`, **bez brány**:

1. `INSERT orders (draft)` + `order_items`; `spend` transakce kreditu
   (advisory lock + kontrola zůstatku) — jako §4.2.
2. `orders → awaiting_payment` (validace cen) → **ihned** `awaiting_payment →
   paid` s `paid_at = now()`. Kreditní checkout je vedle webhooku druhá a
   poslední privilegovaná cesta, která smí nastavit `paid_at` (D8 — webhook zde
   neexistuje, protože neexistuje platba).
3. **Žádný řádek `payments` nevzniká** (CHECK `amount_haleru > 0` — nulová
   platba není platba).
4. `fn_generate_commissions(order_id)` se zavolá pro uniformitu, ale skončí
   early-exitem: `goods_paid = 0` → **žádné nové provize, žádný 3% kredit,
   žádný margin** — nulové záznamy se nikdy nezapisují (D6, R11).
5. `INSERT audit_log ('order.paid', note 'credit_only')`.
6. Po commitu: e-mailová rekapitulace (§7).

### 4.4 Zrušení, expirace, „Zaplatit znovu“

- Webhook `checkout.session.expired` → `payments.status='cancelled'`; objednávka
  **zůstává** `awaiting_payment`. Tlačítko „Zaplatit znovu“ vytvoří **nový**
  řádek `payments` (`initiated`) + novou session; historie pokusů se drží.
- Storno zákazníkem nebo cron: `awaiting_payment` starší **7 dní** →
  `cancelled` + e-mail; `draft` starší **24 h** → `cancelled`. Každý přechod na
  `cancelled` **vrátí rezervovaný kredit**: ke každé `spend` transakci objednávky
  vznikne `adjustment` s opačnou částkou a poznámkou
  „Vrácení kreditu po stornu objednávky {order_number}“ (stejný mechanismus jako
  u vratky, `fn_refund_order` v `04-datovy-model.md` §2.17).
- Otevřené `payments` řádky (`initiated`/`pending`) stornované objednávky se
  označí `cancelled`.

---

## 5. Webhooky a idempotence

### 5.1 Sekvenční diagram (závazný)

```
Klient (office.pentariva.com)  EF checkout            Stripe        EF payments-webhook-stripe   Postgres
        |                          |                     |                     |                    |
 (1) POST /checkout {cart, credit_used} -->|             |                     |                    |
        |  (2) přepočet cen VÝHRADNĚ ze serveru (v_current_prices, app_settings)                    |
        |  (3) TX: INSERT orders(draft)+order_items; spend kreditu (advisory lock);                 |
        |      orders→awaiting_payment (fn_validate_order_pricing);                                 |
        |      INSERT payments(status='initiated', amount=paid_money_haleru) --------------------->|
        |      [paid_money=0 ⇒ větev §4.3: rovnou paid, ŽÁDNÁ session, konec]                       |
        |  (4) stripe.checkout.sessions.create(1 položka = paid_money_haleru,                       |
        |      client_reference_id=order_id, metadata.order_id                                      |
        |      (+ payment_intent_data.metadata), expires_at=+1h,                                    |
        |      {idempotencyKey:'checkout:'+payments.id}) -->|                    |                  |
        |  (5) UPDATE payments SET provider_payment_id=session.id, status='pending' -------------->|
 (6) <-- 200 {redirectUrl} --------|                     |                     |                    |
 (7) redirect na Stripe Checkout (karta / Apple Pay / Google Pay)              |                    |
 (8) <-- redirect na success_url /objednavky/{id}/dekujeme                     |                    |
        |  stránka ukazuje „Ověřujeme platbu…" a polluje stav objednávky       |                    |
        |  !! redirect NENÍ důkaz zaplacení — pravdu určuje výhradně webhook !!|                    |
        |                          |  (9) POST checkout.session.completed ---->|                    |
        |                          |     (10) constructEventAsync(rawBody, sig, WHSEC, tolerance 300 s)
        |                          |          neplatný podpis NEBO event.livemode ≠ PAYMENTS_MODE   |
        |                          |          → HTTP 400, konec                |                    |
        |                          |     (11) RPC fn_apply_payment_event — JEDNA transakce: ------->|
        |                          |          a) UPDATE payments SET status='paid', paid_at,        |
        |                          |             provider_event_id=evt.id, payload=evt.raw          |
        |                          |             WHERE provider='stripe'                            |
        |                          |               AND provider_payment_id=session.id               |
        |                          |               AND status IN ('initiated','pending')            |
        |                          |             — 0 řádků a evt.id už uložen ⇒ duplikát → no-op    |
        |                          |             — unikát (provider, provider_event_id) = pojistka  |
        |                          |          b) kontrola amount = payments.amount_haleru           |
        |                          |             = orders.paid_money_haleru (nesedí ⇒ výjimka,      |
        |                          |             platba se NEoznačí, alert adminovi)                |
        |                          |          c) UPDATE orders SET status='paid', paid_at           |
        |                          |             WHERE id=$ AND status='awaiting_payment'           |
        |                          |          d) fn_generate_commissions(order_id)  (idempotentní)  |
        |                          |          e) INSERT audit_log('order.paid')                     |
        |                          |     (12) po COMMITu: e-mail rekapitulace přes Resend (§7)      |
        |                          |     (13) HTTP 200 do 10 s; výjimka → HTTP 500 → Stripe retry   |
        |                          |          (exponenciálně, až 3 dny)        |                    |
```

### 5.2 Mapování událostí Stripe → normalizovaný event → efekt

| Stripe událost | `NormalizedEventType` | Efekt |
|---|---|---|
| `checkout.session.completed` | `payment_succeeded` | `payments → paid`, `orders → paid`, provize (§5.4) |
| `checkout.session.expired` | `session_expired` | `payments → cancelled`; objednávka zůstává `awaiting_payment` (§4.4) |
| `charge.refunded` (plná částka) | `refund_succeeded` | `payments → refunded`, `fn_refund_order` (§6) |
| `payment_intent.payment_failed` | `payment_failed` | `payments → failed` (informativní; zákazník může platit znovu) |

Jiné události handler potvrdí HTTP 200 a ignoruje.

### 5.3 Tři vrstvy idempotence (všechny povinné)

1. **Dedup události:** unikát `(provider, provider_event_id)` na `payments` —
   opakované doručení téže události skončí na konfliktu / stavovém no-opu a nic
   nepřepíše (kanonický komentář `payments.provider_event_id`). Syntetické
   události mají deterministická ID (`poll:{provider_payment_id}:paid`), takže
   dedup platí i pro ně.
2. **Stavové guardy:** každý UPDATE nese `WHERE status = …` — přechod proběhne
   nejvýš jednou (`payments` i `orders`, jejichž mašinu navíc jistí
   `trg_orders_status`).
3. **Peněžní vrstva:** `fn_generate_commissions` má early-exit přes kalkulační
   typy + unikát `uq_commission_once`; vratky jistí `UNIQUE (order_id)` na
   `order_refunds` a unikátní `reverses_entry_id` (D2, D4). Ani přímé druhé
   volání peněžních funkcí nezdvojí žádný záznam.

### 5.4 RPC `fn_apply_payment_event` (chování, SECURITY DEFINER)

Jediná cesta, kterou platební událost mění DB — volají ji webhook handler
i záchranný cron. Jedna transakce, kroky a)–e) dle diagramu §5.1. Po úspěšném
COMMITu (nikdy uvnitř transakce) handler odešle e-mail rekapitulaci přes Resend;
selhání odeslání se jen zaloguje do Sentry a e-mail lze poslat znovu z admin
detailu objednávky — platba na SMTP nikdy nečeká.

### 5.5 Záchranné crony (pg_cron / Scheduled Edge Functions)

- **payments-reconcile** (à 30 min): pro `payments.status IN
  ('initiated','pending')` starší 1 h zavolá `provider.getStatus()`; je-li
  `paid`, aplikuje `fn_apply_payment_event` se syntetickým
  `provider_event_id = 'poll:{provider_payment_id}:paid'` — ztracený webhook se
  dožene toutéž idempotentní cestou; je-li `expired`/`failed`, označí
  `cancelled`/`failed`.
- **orders-expire** (denně): `awaiting_payment` > 7 dní → `cancelled` + vrácení
  kreditu + e-mail; `draft` > 24 h → `cancelled` (§4.4).

---

## 6. Refundy (D4)

MVP zná **jedinou** vratkovou operaci: refundace celé objednávky ze stavů
`paid`, `shipped` nebo `completed`. Vrací se **celá zaplacená částka
`orders.paid_money_haleru` — tedy včetně celé dopravy** — na kartu, a **celý
použitý kredit** zpět na kreditní účty (kredit se nikdy nevrací na kartu).

Proces (závazný):

1. **Admin akce:** v detailu objednávky klikne „Refundovat objednávku (celá
   částka)“ + potvrzovací dialog s výčtem dopadů na provize. Zapíše se
   `audit_log ('order.refund_requested', actor=admin)`. Stav objednávky se
   **nemění**, dokud refund nepotvrdí brána.
2. **Gateway refund:** `provider.refund(providerPaymentId,
   orders.paid_money_haleru, 'refund:' + order_id,
   { order_id, actor_profile_id })` — u Stripe
   `stripe.refunds.create({ payment_intent, reason:'requested_by_customer',
   metadata }, { idempotencyKey })`.
3. **Webhook** `charge.refunded` (plná částka) → tatáž pipeline jako platba:
   podpis → livemode guard → jedna transakce RPC `fn_apply_refund_event`:
   - `UPDATE payments SET status='refunded', payload WHERE … AND status='paid'`
     (stavový guard = idempotence; opakované doručení je no-op);
   - `fn_refund_order(order_id, reason, actor_profile_id z metadata)`
     (kanonická funkce, `04-datovy-model.md` §2.17), která:
     `INSERT order_refunds` (UNIQUE order_id — druhé volání selže neškodně),
     `orders → refunded` (projde mašinou D8), ke **každému nestornovanému**
     entry vloží **záporný reversal** s `reverses_entry_id` a originál označí
     `reversed`; už připsané akruály **clawbackne** (`credit_transactions`
     `clawback` — zůstatek smí jít do minusu a netuje se budoucími akruály,
     D3); kredit použitý na úhradu zboží vrátí `adjustment` transakcí.
     Invariant D4: po plném stornu Σ (kalkulační entries + reversaly)
     objednávky = 0;
   - `INSERT audit_log ('order.refunded')`.
4. Po COMMITu: e-mail o vratce (§7).
5. **Ztracený refund webhook:** nepřijde-li potvrzení do 24 h od kroku 2, admin
   použije akci „Ověřit stav u brány“ (`getStatus` → `refunded` → aplikace téže
   RPC se syntetickým event ID `poll:{provider_payment_id}:refunded`).

Důsledky pro příjemce provizí: `pending` entry se stornuje dřív, než dozraje
(nikdy se nevyplatí); `available` entry už připsané na kredit se clawbackne;
už **vyplacené** peníze na účet (možné jen po 15denní ochranné lhůtě R2/R12,
tedy vzácné) vytvoří záporný zůstatek provizního kreditu, který se strhává
z budoucích akruálů.

---

## 7. E-mailová rekapitulace místo PDF dokladů

**PDF doklady v MVP neexistují** (D23, D30 — žádné `receipts`, žádná číselná
řada, žádný generátor PDF). Náhrada:

- **E-mail „Potvrzení objednávky a platby“** — odesílá se po přechodu na `paid`
  (§5.4, §4.3). Obsah: číslo objednávky (`order_number`), datum zaplacení,
  položky se snapshot cenami, slevy, použitý kredit, doprava, **zaplaceno
  penězi** (`paid_money_haleru`), způsob platby. Není to daňový doklad.
- **E-mail „Potvrzení vratky“** — po `refunded`: vrácená částka na kartu
  (včetně dopravy), vrácený kredit, storno provizí proběhlo automaticky.
- Odesílatel `office@pentariva.com` přes Resend (D24); šablony a přesné texty
  definuje dokument transakčních e-mailů; odeslání vždy až **po commitu**
  peněžní transakce, selhání jen loguje Sentry (platba na e-mail nečeká).
- Účetní podklad do go-live = CSV exporty objednávek z `/reporty` (D31).
- **Go-live:** napojení na **Fakturoid** (API v3) — vystavování dokladů
  a jejich sync; do té doby je zdrojem pravdy DB. Per-transakční evidence
  poplatků brány se v MVP nevede — `payments.amount_haleru` je brutto
  a poplatky se párují měsíčně z reportu brány (Fáze 2: balance transactions).

---

## 8. Go-live rozšíření: bankovní převod s VS (mimo MVP)

Bankovní převod **není v MVP** (D23, D30) — firma nemá účet ani IČO a ruční
párování by bez reálného provozu nemělo co párovat. Specifikace je připravena,
zapíná se až při go-live rozhodnutím zadavatele:

- **Migrace:** `ALTER TYPE payment_method ADD VALUE 'bank_transfer'` — kanonické
  schéma s tímto rozšířením počítá (komentář u ENUM `payment_method`).
  Žádná nová tabulka: převod je řádek `payments (provider='bank_transfer',
  method='bank_transfer')`.
- **Adaptér `BankTransferProvider`** (tentýž `PaymentProvider` kontrakt):
  `createCheckout` vrací `kind:'instructions'` — číslo účtu, částku
  `paid_money_haleru`, **VS = `orders.order_number`** (BIGINT identity,
  bezpečně pod limitem 10 číslic VS, unikátní, řaditelné) a QR platbu ve
  formátu SPD generovanou klientem (npm `qrcode`, žádná brána):
  `SPD*1.0*ACC:{IBAN}*AM:{částka}*CC:CZK*X-VS:{order_number}*MSG:PENTARIVA {order_number}`.
  Instrukce jsou na stránce „Děkujeme“ i v potvrzovacím e-mailu.
- **Ruční párování:** admin obrazovka „Platby čekající na spárování“ (VS,
  částka, stáří); po ověření ve výpisu admin klikne „Potvrdit přijetí platby“ →
  `fn_apply_payment_event` s `provider_event_id = 'manual:{order_id}:paid'` —
  **identická idempotentní cesta jako webhook**, tedy identické provize,
  e-maily i auditní stopa. Admin potvrzuje pouze přesnou částku; přeplatky
  a nedoplatky se řeší vrácením rozdílu převodem mimo systém.
- Refund převodem: admin vrátí peníze ručně z banky a klikne „Označit jako
  refundováno“ → `fn_apply_refund_event` s `provider_event_id =
  'manual:{order_id}:refund'`.
- Expirace nezaplaceného převodu: 7 dní → `cancelled` (shodně s kartou, §4.4).
- Feature flag `BANK_TRANSFER_ENABLED=false` až do go-live rozhodnutí.
- Fáze 2: automatické párování přes API banky (např. Fio Bank API) — díky
  provider kontraktu nahradí jen ruční klik, nic jiného.

---

## 9. Plán do vzniku IČO (R8): test mód → produkce

Feature flagy jsou **env proměnné** (Supabase secrets + env hostingu), ne DB
konfigurace — přepnutí režimu je deploy-time rozhodnutí:

```
PAYMENTS_MODE=test|live
STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
PAYOUTS_ENABLED=false            # výplaty na účet až po vzniku firmy (R8)
BANK_TRANSFER_ENABLED=false      # go-live rozhodnutí (§8)
RESEND_API_KEY
```

Bezpečnostní guardy (závazné):

- Při `PAYMENTS_MODE=test` odmítne Edge Function start s klíčem `sk_live_`
  (a naopak) — režimy nelze omylem smíchat.
- `payments.livemode` se plní podle `PAYMENTS_MODE`; webhook handler zahodí
  (HTTP 400) událost, jejíž `livemode` neodpovídá aktuálnímu režimu.

| Oblast | Teď (test, bez IČO) | Produkce (po vzniku IČO) |
|---|---|---|
| Stripe účet | registrace na e-mail, bez aktivace, plnohodnotný test mode okamžitě | live aktivace: IČO, sídlo, jednatel, firemní účet; business popsat jako „e-shop s wellness produkty + affiliate program“ |
| Klíče a webhook | `sk_test_`/`pk_test_`, test webhook endpoint + `whsec` | `sk_live_`/`pk_live_`, NOVÝ live webhook endpoint na stejné URL ⇒ nový `whsec` |
| Platby | testovací karty (4242 4242 4242 4242), lokálně Stripe CLI `listen` | reálné karty; smoke test: live platba 10 Kč + její plný refund |
| `payments.livemode` | `false` | `true` |
| Výplaty provizí na účet | `PAYOUTS_ENABLED=false` (kredit se normálně akruuje a čeká) | `true` po prvním úspěšném testovacím payoutu |
| Bankovní převod | `BANK_TRANSFER_ENABLED=false` (účet neexistuje) | dle go-live rozhodnutí §8 |
| Doklady | jen e-mail rekapitulace s příznakem „TESTOVACÍ OBJEDNÁVKA“ v předmětu | e-mail rekapitulace + Fakturoid (§7) |
| Data | testovací objednávky v produkčním Supabase projektu | před go-live TRUNCATE transakčních tabulek: `orders`, `order_items`, `payments`, `order_refunds`, `commission_entries`, `credit_transactions`, `payout_requests` — testovací data nemají účetní hodnotu; uživatelské účty a `audit_log` se zachovávají |

**Go-live checklist (v tomto pořadí):**

1. Rozhodnutí o produkční bráně dle Přílohy A (Stripe live vs Comgate adaptér).
2. Live aktivace brány; nový webhook endpoint + secrets.
3. Fakturoid onboarding (§7).
4. TRUNCATE testovacích transakčních dat (tabulka výše).
5. `PAYMENTS_MODE=live`.
6. Smoke test: live platba 10 Kč → webhook → provize → plný refund → clawback.
7. `PAYOUTS_ENABLED=true` (po testovacím payoutu).
8. Rozhodnutí `BANK_TRANSFER_ENABLED` (§8).

---

## Příloha A — Srovnání bran pro go-live rozhodnutí

Sazby k 08/2026 dle veřejných ceníků; u Comgate/GoPay jsou obratově odstupňované
resp. individuální — při podpisu smlouvy se pouze ověří, na architektuře nic
nemění (D23: swap je izolovaný v adaptéru).

| Kritérium | Comgate | GoPay | Stripe |
|---|---|---|---|
| Karta — vstupní sazba | ~1,19 % + 1 Kč (s obratem klesá k 0,79 %) | individuální, typicky 1,4–2,2 % + ~3 Kč | 1,5 % + 6,50 Kč (EEA karty); 3,25 % + 6,50 Kč mimo EEA |
| **Poplatek z objednávky 1 000 Kč (karta)** | **~12,90 Kč** | **~22,00 Kč** (při 1,9 % + 3 Kč) | **21,50 Kč** |
| Měsíční poplatek | min. poplatek ~149 Kč/měs (transakční poplatky se započítávají) | 0 Kč (vstupní balíček) | 0 Kč |
| Bankovní tlačítka (CZ banky) | ano (~0,29 % + 3 Kč ⇒ ~5,90 Kč z 1 000 Kč) | ano | **ne** |
| QR platba | ano | ano | ne (kryje vlastní SPD QR u bankovního převodu, §8) |
| Apple Pay / Google Pay | ano | ano | ano (v Checkout automaticky, bez extra smlouvy) |
| Onboarding | smlouva, **IČO nutné**, schválení ~2–5 prac. dní | **IČO nutné**, verifikace ~3–7 dní | účet ihned na e-mail; live aktivace po dodání IČO obvykle 1–2 dny |
| Test mode bez IČO | ne | ne | **ano, plnohodnotný, okamžitě** |
| API kvalita pro AI implementaci | REST v2, slušná dokumentace, bez oficiálního TS SDK | REST, starší dokumentace, SDK hlavně PHP | **nejlepší na trhu**: typované TS SDK, podepsané webhooky, oficiální Supabase vzory |
| Riziko klasifikace obchodního modelu | nízké (CZ brány běžně obsluhují síťový prodej) | nízké | reálné: restricted list zahrnuje MLM/nutraceuticals — hrozí zamítnutí live aktivace |

**Proč Stripe v MVP (D23):** je to jediná brána, na které lze vývoj včetně
webhooků a refundů spustit dnes bez existujícího IČO (R8), a její API je pro
AI implementátora nejrychlejší a nejméně chybová cesta; poplatková přirážka
~8,60 Kč na tisícikorunové objednávce je při MVP objemech zanedbatelná.

**Rozhodovací pravidlo pro go-live:** na Comgate se přechází, pokud
(a) Stripe zamítne live aktivaci kvůli klasifikaci obchodního modelu, **nebo**
(b) očekávaný měsíční objem × úspora poplatků (~0,9 % z karetního obratu +
bankovní tlačítka) převýší náklad swapu. Adaptér `ComgateProvider` je nad
rozhraním §2 implementovatelný během čekání na IČO (~1 den práce, stabilní
REST API); Comgate se každopádně zvažuje ve Fázi 2 kvůli bankovním tlačítkům
a nižším poplatkům.
