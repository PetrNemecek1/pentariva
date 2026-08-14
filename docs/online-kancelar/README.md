# Online kancelář PENTARIVA — dokumentace pro implementaci

Kompletní architektura a implementační plán systému „Online kancelář" (office.pentariva.com):
registrace a role, doporučovací linky, e-shop s platební bránou, provizní engine,
kredity a výplaty, CRM, B2B pipeline, akademie, reporty.

**Vzniklo:** 2026-08-12/13, návrh 7 doménových specialistů + 2 nezávislé audity peněžní
logiky + oponentura úplnosti + harmonizační průchod. Určeno k implementaci AI modelem.

## Jak číst (pořadí pro implementátora)

| Soubor | Obsah |
|---|---|
| [00-zadani-a-rozhodnuti.md](00-zadani-a-rozhodnuti.md) | Mise, zdroje pravdy, rozhodnutí zadavatele R1–R15, fáze |
| [01-funkcni-zadani.md](01-funkcni-zadani.md) | Plný extrakt funkčního zadání (cílový stav 2–3 roky, MVP v §21) |
| [02-technicka-rozhodnuti.md](02-technicka-rozhodnuti.md) | Kanonický kontrakt D1–D35 — závazný pro vše ostatní |
| [03-provizni-pravidla-zdroj.md](03-provizni-pravidla-zdroj.md) | **Zdroj pravdy pro peníze** — finální provizní model, závazný worked example |
| [04-datovy-model.md](04-datovy-model.md) | **Kanonické DDL** — jediný zdroj schématu (tabulky, enumy, funkce, views, RLS-ready) |
| [05-provizni-engine.md](05-provizni-engine.md) | Pravidla výpočtu provizí, 6 worked examples (a)–(f), 24 testovacích invariantů |
| [06-bezpecnost-rls.md](06-bezpecnost-rls.md) | Auth, role, RLS politiky, GDPR, audit |
| [07-aplikace.md](07-aplikace.md) | Next.js aplikace: struktura repa, routing, obrazovky MVP, CLAUDE.md pro nový repo |
| [08-platby.md](08-platby.md) | Stripe (test mode) za PaymentProvider rozhraním, webhook flow, refundy, plán go-live |
| [09-provoz-email-naklady.md](09-provoz-email-naklady.md) | Resend + DNS, prostředí, CI/CD, zálohy, monitoring, náklady, runbook |
| [10-implementacni-plan.md](10-implementacni-plan.md) | **Začni tady po přečtení 00–04**: epiky, tickety, milníky M1–M3, guardrails |
| [11-dns-forpsi.md](11-dns-forpsi.md) | Provozní deník DNS změn na Forpsi (pentariva.com, office subdoména, Resend) |
| [12-zadani-akademie-obsah.md](12-zadani-akademie-obsah.md) | Zadání pro ChatGPT/Gemini — generování obsahu lekcí a kvízu Akademie |

## Stav implementace (2026-08-13)

- **Epik 0 hotový**: repo [`pentariva-office`](https://github.com/PetrNemecek1/pentariva-office)
  založeno a nasazeno na `https://pentariva-office.web.app` (custom doména
  `office.pentariva.com` čeká na DNS, viz `11-dns-forpsi.md`). CI/CD, Supabase
  projekt lokálně inicializovaný, brand parity s marketing webem.
- **Epik 1 (schéma + provizní engine + zlaté testy)** — další krok, zatím
  neimplementováno (`supabase/migrations` prázdné).
- Doména `pentariva.com` přidána ve Firebase, čeká na DNS na Forpsi.

## Precedence při rozporu

`03` (peníze) → `00` (R1–R15) → `02` (D1–D35) → `04` (schéma) → `05` (engine) → ostatní.

## Neporušitelná pravidla pro implementaci

1. **Peníze jen přes databázi**: veškeré zápisy do `commission_entries`,
   `credit_transactions` a `payout_requests` výhradně přes SECURITY DEFINER funkce
   volané ze serveru (webhook/Edge Function). Nikdy z klienta.
2. **Zlaté testy**: worked examples (a)–(f) z `05-provizni-engine.md` musí projít
   na halíř přesně v CI před každým nasazením. Změna provizní logiky bez zelených
   zlatých testů se nesmí mergnout.
3. **Ledger se nikdy needituje** — opravy jen kompenzačními záznamy.
4. **Změny provizních sazeb, RLS politik a výplat** vyžadují lidské schválení
   (viz guardrails v `10-implementacni-plan.md`).
