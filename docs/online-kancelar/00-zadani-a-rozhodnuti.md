# Online kancelář PENTARIVA — zadání a závazná rozhodnutí

> Tento adresář je kompletní podklad pro implementaci systému „Online kancelář".
> Implementující model: začni souborem `README.md` (index), pak postupuj podle
> `10-implementacni-plan.md`. Při jakémkoli rozporu mezi dokumenty platí
> `03-provizni-pravidla-zdroj.md` (peníze) a tento soubor (rozhodnutí).

## Co stavíme

Digitální distribuční kancelář pro komunitní obchod PENTARIVA: registrace a role
(zákazník → ambasador → mentor → leader, B2B větev), doporučovací linky s trvalou
atribucí, e-shop s platební bránou, provizní engine (Community 20 % / 15-6-4 % /
leadership ≤2 %, Trade 10-8-5 %, Club kredit 3 %), kreditní účty a výplaty, CRM
zákazníků, B2B pipeline, základní akademie a reporty.

Není to klasické MLM — je to vztahový systém s třígenerační odměnou. Systém má lidem
říkat CO, JAK a KDY udělat dál, nejen ukazovat data.

## Zdroje pravdy (v pořadí priority)

1. **Finální provizní model** — infografika „PENTARIVA PARTNER PROGRAM" + dokument
   „Vlastní objednávka Ambasadora D" (worked example závazný na halíř). Přepis:
   `03-provizni-pravidla-zdroj.md`.
2. **Rozhodnutí zadavatele** (tento soubor, sekce níže).
3. **Funkční zadání** „Online kancelář — nastavení" (DOCX, 2026-08) — plný extrakt
   v `01-funkcni-zadani.md`. Používá pracovní název ORYNDIA = dnes PENTARIVA.

## Závazná rozhodnutí zadavatele (2026-08-12/13)

| # | Rozhodnutí |
|---|-----------|
| R1 | MVP obsahuje plné objednávky **včetně platební brány** (online platba kartou). |
| R2 | Provize: primárně **kredit na nákupy**; volitelně **výplata na účet nejdříve 15 dní od prodeje** (ochranná lhůta na vratky). Vratka provizi stornuje kompenzačním záznamem. |
| R3 | Stack: **Supabase** (Postgres + Auth + Storage + Edge Functions) + **Next.js** aplikace. |
| R4 | Aplikace poběží na **office.pentariva.com**; pentariva.com se stane primární doménou, pentariva.cz na ni povede. Referral linky `pentariva.com/r/{code}`. |
| R5 | Transakční e-maily přes **Resend.com** (účet existuje). |
| R6 | Benefit club 15/20/25 a VIP úrovně **nejsou v MVP** — zákazník platí plnou cenu a dostává 3% Club kredit. Slevové úrovně = konfigurovatelná vrstva ve Fázi 2. |
| R7 | Leadership bonus „až 2 %" se v MVP **účtuje do firemního poolu** s ruční alokací adminem. |
| R8 | Firma se teprve zakládá (bez IČO) — brána a výplaty běží v **test módu**; produkční onboarding až po vzniku firmy. |
| R9 | Vše **low-cost**: cílový provozní náklad na startu 0 Kč/měsíc (free tiery), škálovat až podle růstu. |
| R10 | Kód a struktura optimalizované pro **AI-asistovaný vývoj** (jasné konvence, testy na peněžní logiku, guardrails). |
| R11 | Provizní báze při částečné úhradě kreditem: provize i 3% kredit se počítají **z částky skutečně zaplacené penězi** (goods po odečtení kreditu). Plně kreditem hrazená objednávka negeneruje nové provize. |
| R12 | 15denní ochranná lhůta platí **pro všechno** — provizní i klubový kredit se aktivuje až 15 dní od zaplacení. UI musí zobrazovat dvě čísla: **dostupný kredit** a **kredit čekající na aktivaci** (s datem aktivace). |
| R13 | „Přiřadit dárek" = **obojí**: (a) položka zdarma k objednávce (fyzický dárek v balíčku), (b) evidence milníkových dárků (komu, za co, kdy). |
| R14 | Doprava v MVP: paušál **99 Kč, zdarma od 1 500 Kč** — obě hodnoty konfigurovatelné v administraci. Provize se počítají **vždy jen ze zboží**, nikdy z dopravy. |
| R15 | **Programová vrstva anglicky** (doména je .com): URL routy, query parametry, identifikátory a kód výhradně anglicky (`/login`, `/shop`, `/checkout/result`, `?code=`, `?type=b2b`). UI texty zatím česky; celý systém i web budou **multilanguage** (viz D35 — extrakce textů do locale slovníků, Fáze 2). Do URL, kódu ani identifikátorů nikdy nepatří čeština. |
| R16 | **Provizní model v2 (20. 8. 2026):** jednotné linie **20/8/4 %** ze všech objednávek (báze bez DPH, po slevách a kreditech), **Benefit Club 3/6/10 %** dle měsíčního obratu s pravidlem „vyšší bere“, **uvítací výhoda** (konfigurovatelně sleva 20 % nebo dárek ~200 Kč, od 500 Kč) + pevný kredit 3 %, doprava zdarma od 2 000 Kč jen pro zákazníky, pool 2 % konfigurovatelně, pozice Ambasador/Komunitní/Regionální partner. Vše editovatelné v administraci — model se bude dál vyvíjet. Závazné zadání: `13-provizni-model-v2.md`. |
| R17 | **Slevy a komunitní model (22. 8. 2026):** slevy určuje výhradně firma, stejné pro všechny; partner nemá slevový rozpočet a nesmí nabízet rabat z provize. Organičtí zákazníci slevy dostat mohou (konfigurovatelně per akce, výchozí vypnuto), ale **organická cena nikdy nesmí být lepší než cena zákazníka s ambasadorem**. Nová mechanika **adopce**: nepřiřazený zákazník se může jednou sám připojit k ambasadorovi kódem (jen organický → přiřazený, nikdy přetahování); organická sleva jako vstupenka do komunity. Způsobilost produktů řídí příznaky se třemi stavy (Shoptet). Závazné zadání: `18-eshop-prezentace-a-promoakce.md`. |
| R18 | **Interní expedice low-cost (22. 8. 2026):** start bez vstupního kapitálu → expedici děláme sami z vlastních prostor, **0 Kč fixních měsíčních nákladů**. Dopravce Zásilkovna přímo přes API (bez Balíkobotu), doklady vystavuje systém sám (`INVOICING_MODE=internal`, Fakturoid jen volitelný adaptér). Vše za přepínatelnými adaptéry (`SHIPPING_PROVIDER`, `INVOICING_MODE`, `fulfillment_provider`), aby přechod na Authentica (17) nebo agregátor byl konfigurace. Dobírka mimo rozsah. Tisk štítků na Zebra (ZPL přes Browser Print) přímo z balicí stanice; podání odnosem na sběrné místo, při růstu svoz (přepínač). Produkty fyzické i digitální (poukazy), hmotnost evidována per produkt. Firemní údaje (IČO zatím není) jako editovatelné placeholdery v administraci. Závazné zadání: `19-interni-expedice-low-cost.md`. |
| R19 | **Správa objednávek a výjimek (22. 8. 2026):** administrace musí zvládnout ruční řešení nesrovnalostí (označit zaplaceno při testování i převodu, storno, rozdělení zásilky při částečném skladu, doposlání, částečná vratka) s úplnou historií kdo-co-kdy. Stavy objednávek: **systémové stavy pevné** (visí na nich peníze), **provozní stavy konfigurovatelné** v administraci (název, barva, e-mail, viditelnost). Ruční peněžní zásahy jdou vždy přes stejné funkce jako automatika — nikdy přímý zápis stavu. Účetní si stahuje doklady sama: období × typ → ZIP PDF + ISDOC + přehled CSV/XLSX. Závazné zadání: `20-sprava-objednavek.md`. |

## Fáze

- **FÁZE 1 (MVP)** — rozsah viz `10-implementacni-plan.md`. Odpovídá §21 funkčního zadání.
- **FÁZE 2** — kariérní plán a automatika úrovní, mentor/leader dashboardy, bonusy,
  kampaně, automatické e-maily, WhatsApp notifikace, benefit úrovně, Event Manager,
  dokumentové centrum.
- **FÁZE 3** — AI asistent, denní akční doporučení, chytré reporty, predikce,
  produktová doporučení.

## Manuál k používání (doplněno 2026-08-20)

V původním DOCX zadání manuál / nápověda **nebyly**. Závazné znění je
`01-funkcni-zadani.md` §23: průběžně textová kapitola na každou obrazovku;
později in-app Help se screenshoty (CZ+EN). Živý text:
repo `pentariva-office`, `docs/manual/`.

## Pět otázek, na které systém musí vždy umět odpovědět

1. Kdo přivedl zákazníka?
2. Kdo má nárok na provizi?
3. Kdo je aktivní a kdo ne?
4. Co má každý člověk udělat dnes?
5. Jak se člověk posune na další úroveň?
