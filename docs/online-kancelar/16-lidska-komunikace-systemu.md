# 16 — Lidská komunikace systému: hlášení problémů, závažnost, technický detail pro programátora

> **Závazné zadání (22. 8. 2026).** Samonosné pro AI implementaci v repu
> `pentariva-office`. Motivace zadavatele: noční sebekontrola ledgeru poslala
> adminovi surový JSON (`[{"sum":300000,"base":247935,"check":"P-INV1",…}]`) a
> dashboard ukázal „Ledger má nesrovnalost" bez závažnosti, vysvětlení, dopadu
> a prokliku. Admin nedokázal rozhodnout, co se děje a jak naléhavé to je,
> přestože AI programátor z téhož JSONu problém opravil okamžitě. **Cíl: každé
> hlášení systému má dvě vrstvy — lidskou (pro rozhodování) a technickou (pro
> programátora) — a nikdy se nezobrazí jen ta technická.**
>
> Platí guardraily `10` §1; nic zde nemění peněžní logiku (13) ani rozsah 14/15.

## 1. Princip: hlášení = lidská vrstva + technická vrstva

Každá událost, kterou systém sděluje člověku (selfcheck, heartbeat, selhání
e-mailu/faktury/webhooku, anomálie plateb, anti-abuse nález, chyba cronu),
prochází **jedním katalogem** a má vždy tuto strukturu:

| Pole | Obsah | Pro koho |
|---|---|---|
| `title` | Jedna věta česky, co se stalo (bez kódů a ID) | člověk |
| `severity` | `critical` / `high` / `medium` / `low` / `info` | člověk |
| `meaning` | 2–4 věty: co to znamená v provozu, koho se to týká | člověk |
| `impact` | Výslovně: **Dopad na zákazníka: …** / **Peníze v ohrožení: …** (ano/ne + částka, je-li) | člověk |
| `action` | Co má admin udělat teď (nebo „nic, informace") + **kdo**: admin / programátor / účetní | člověk |
| `entity_links` | Prokliky na dotčené objekty (`/admin/orders?id=…`, profil, výplata) | člověk |
| `tech` | Kód kontroly, definice invariantu, ID, hodnoty, surová data, kontext (verze modelu, čas), návrh opravy | programátor |

Technická vrstva se nikdy nezobrazuje bez lidské; lidská se nikdy neukazuje
bez možnosti rozbalit technickou.

## 2. Datový model

- `system_issues(id, code text, severity ENUM('critical','high','medium','low',
  'info'), status ENUM('open','acknowledged','resolved','ignored'), title,
  meaning, impact, action, owner_role ENUM('admin','developer','accountant'),
  entity_type text NULL, entity_id text NULL, tech jsonb, first_seen_at,
  last_seen_at, occurrences int DEFAULT 1, acknowledged_by/at, resolved_by/at,
  note text)`. RLS: admin SELECT/UPDATE (jen status+note), zápis jen definer
  funkce. UNIQUE `(code, entity_type, entity_id) WHERE status IN
  ('open','acknowledged')` → opakovaný nález **nezakládá duplicitu**, jen zvýší
  `occurrences` a `last_seen_at`.
- Katalog kódů `issue_catalog(code PK, default_severity, title_template,
  meaning_template, impact_template, action_template, owner_role, doc_url)`
  s šablonami `{order_number}`, `{amount_kc}`, `{diff_kc}` apod. **Editovatelný
  adminem** (`/admin/settings` → „Slovník hlášení") — texty nejsou v kódu.
- Funkce `fn_raise_issue(code, entity_type, entity_id, tech jsonb, vars jsonb)`
  — jediný vstup pro všechny producenty (selfcheck, crony, EF přes
  service_role). Dosadí šablony, rozhodne závažnost (viz §4), provede dedup.

## 3. Kanály

1. **Dashboard `/admin`** — sekce **„Kontrola peněz"** (nahrazuje „Jistota")
   a **„Obrat podle typu objednávky"** (nahrazuje „Toky", s legendou 4 typů
   ve 4 větách). Semafor: zelená = vše OK / oranžová = otevřené `low`/`medium`
   / červená = `high`/`critical`. Pod ním seznam otevřených hlášení: title,
   závažnost (barevný štítek), impact řádek, tlačítko „Zobrazit".
2. **`/admin/issues`** (nová obrazovka, v menu „Hlášení") — tabulka s filtry
   (závažnost, stav, kód, kdo řeší), detail = lidská vrstva nahoře, proklik
   na entitu, pod tím sbalený panel **„Pro programátora"** s formátovaným
   technickým reportem a tlačítkem **„Kopírovat report"** (text připravený
   k vložení AI asistentovi: kód, definice invariantu, ID, hodnoty, verze
   modelu v čase, SQL pro reprodukci, návrh opravy). Akce: Vzít na vědomí,
   Vyřešeno (+ poznámka), Ignorovat (jen `info`/`low`, s poznámkou). Audit.
3. **E-mail** (`selfcheck_failed` a další existující alerty přepsat):
   předmět `[PENTARIVA] {počet} hlášení · nejvyšší závažnost: {severity_cs}`;
   tělo = jen lidská vrstva per hlášení (title, meaning, impact, action,
   odkaz do `/admin/issues`); technický blok **až na konci** pod nadpisem
   „Pro programátora" nebo jako příloha `.txt`. `info` hlášení e-mail
   neposílá (jen dashboard); `high`/`critical` posílá okamžitě, ostatní
   v jedné denní dávce.
4. **Notifikační centrum** (existuje) — totéž hlášení jako notifikace adminovi
   s odkazem; žádný další text.

## 4. Závažnost — pravidla (musí být deterministická a zdůvodněná v `tech`)

| Kód | Výchozí | Eskalace / zmírnění |
|---|---|---|
| `P-INV1` (Σ provizí ≠ báze) | `high` | **`info`, pokud objednávka byla zaplacena před nasazením modelu v2** (`orders.paid_at < commission_model_v2_since` v `app_settings`) → title „Historická objednávka ve starém modelu", action „nic; legacy" |
| `P-INV2` (storno Σ ≠ 0) | `critical` | — (peníze v ohrožení: ano, částka rozdílu) |
| accrual bez entry / duplicitní accrual | `critical` | — |
| záporný kredit bez clawbacku | `high` | `medium`, je-li |částka| < 100 Kč |
| payments `paid` bez `orders.paid_at` (a naopak) | `high` | `critical`, pokud starší než 2 h (zákazník zaplatil a nemá objednávku) |
| `stock_qty < 0` | `medium` | `low`, je-li `allow_backorder=true` |
| heartbeat cronu zastaralý | `high` (settle/reconcile) / `medium` (stats) | — |
| selhání transakčního e-mailu / faktury / webhooku | `medium` | `high` po 3 opakováních téže entity |
| anti-abuse skupina uvítacích výhod | `low` | `medium` při ≥ 3 účtech |

Ke každému hlášení systém dopočte a uloží do `tech.reason`, proč zvolil
danou závažnost (člověk i programátor vidí zdůvodnění).

## 5. Oprava příčiny dnešního nálezu (součást tohoto zadání)

- `app_settings.commission_model_v2_since` (timestamptz) se nastaví v migraci
  na čas nasazení modelu v2; `fn_ledger_selfcheck` P-INV1 pro starší
  objednávky očekává **starou bázi** (vč. DPH) — tedy kontrola rozlišuje
  verzi modelu platnou v době zaplacení, místo aby historická data hlásila
  jako chybu. Volitelně: `orders.commission_model smallint` (1/2) nastavený
  při generování provizí — robustnější než časová hranice; preferovat.
- Existující otevřené nálezy se po nasazení přehodnotí (rerun selfchecku).

## 6. Texty — závazné příklady (do `issue_catalog`, česky i anglicky)

**P-INV1 legacy (`info`):** „Objednávka č. {order_number} má provize spočítané
podle původního modelu (z ceny vč. DPH). Od {v2_date} platí model v2 (bez DPH).
Jde o historická data — nová objednávka by prošla. Dopad na zákazníka: žádný.
Peníze v ohrožení: ne. Co dělat: nic."

**P-INV1 nový model (`high`):** „U objednávky č. {order_number} nesedí součet
provizí ({sum_kc} Kč) s provizním základem ({base_kc} Kč), rozdíl {diff_kc} Kč.
Provize mohly být připsány špatně. Dopad na zákazníka: žádný. Peníze
v ohrožení: ano, {diff_kc} Kč. Co dělat: předat programátorovi (report níže);
výplaty dotčených partnerů do vyřešení neschvalovat."

**P-INV2 (`critical`):** „Storno objednávky č. {order_number} nevynulovalo
provize (zůstatek {diff_kc} Kč). Partneři mohou mít připsané peníze za vrácenou
objednávku. Co dělat: okamžitě programátorovi; zastavit výplaty."

## 7. Akceptace

1. Selfcheck na legacy objednávce vytvoří hlášení `info` s lidským textem,
   bez e-mailu; na uměle rozbité nové objednávce `high` s e-mailem, jehož
   první řádky neobsahují žádný JSON ani UUID.
2. Opakovaný běh nezaloží duplicitu (occurrences++).
3. `/admin/issues` zobrazí závažnost, dopad, akci, proklik na objednávku a
   tlačítko „Kopírovat report", jehož výstup obsahuje vše z dnešního JSONu
   plus definici invariantu a verzi modelu.
4. Texty lze změnit v adminu bez nasazení.
5. Dashboard sekce přejmenované a s legendou; žádný technický termín
   (`flow`, `ledger`, `P-INV1`) v lidské vrstvě.
