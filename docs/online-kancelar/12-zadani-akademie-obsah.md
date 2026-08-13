# Zadání pro tvorbu obsahu Akademie (ChatGPT / Gemini)

> Tento dokument NENÍ technická specifikace — je to zadání pro generování
> OBSAHU (texty lekcí, scénáře videí, kvízové otázky) přes ChatGPT nebo
> Gemini. Technická stránka (tabulky `academy_modules`, `academy_lessons`,
> `academy_quiz_questions`) je hotová v `04-datovy-model.md` a čeká jen na
> naplnění daty — proto jde tvořit postupně, modul po modulu, bez brzdění
> vývoje aplikace.

## Jak s tímto dokumentem pracovat

1. Zkopíruj sekci **"Univerzální brief"** níže na začátek KAŽDÉHO promptu pro
   ChatGPT/Gemini — dává nástroji značku, tón a pravidla.
2. Za ni vlož zadání KONKRÉTNÍHO modulu (sekce 1–8 níže).
3. Výstup zkontroluj proti "Kontrolní seznam" na konci — pak mi ho pošli,
   naimportuju ho do `academy_lessons` / `academy_quiz_questions`.
4. Priorita: **Modul 1 je blokující** pro MVP (podmiňuje povýšení na
   ambasadora, D11/D34) — udělej ho první. Moduly 2–8 lze doplňovat průběžně
   po spuštění, aplikace na ně čeká, ale nic neblokují.

---

## Univerzální brief (vlož do každého promptu)

```
Jsi copywriter značky PENTARIVA — evropský ekosystém přirozené vitality
(bylinné produkty, vzdělávání, partnerská komunita). Tón: teplý, odborný,
důvěryhodný, BEZ agresivního prodejního tlaku. Značka staví na řemeslné
kvalitě, transparentnosti a dlouhodobém vztahu se zákazníkem — ne na
"rychle zbohatni" rétorice MLM.

Cílová skupina obsahu: nový Ambasador PENTARIVA (běžný člověk, ne
profesionální obchodník), který se učí, jak produkty doporučovat lidem,
které zná, aniž by na ně tlačil.

Pravidla:
- Čeština, spisovná, ale přátelská (vykání ve formálním obsahu, tykání
  v motivačních pasážích je OK, drž se jednoho stylu v rámci lekce).
- ŽÁDNÉ nepodložené zdravotní sliby ("vyléčí", "zázračné účinky") — jen
  "podporuje", "přispívá k", "je součástí péče o...".
- ŽÁDNÉ zmínky konkrétních jmen zakladatelů/majitelů — mluv o "týmu
  PENTARIVA" nebo o značce samotné.
- Nepoužívej "MLM", "síť", "verbování" — používej "komunita", "doporučení",
  "sdílení zkušenosti".
- Každá lekce: 1) krátký text na obrazovku (300–600 slov), 2) scénář
  mluveného videa 3–6 minut (odstavce s časovými značkami po ~30 s),
  3) shrnutí ve 3–5 bodech pro rychlé zopakování.
```

---

## Modul 1 — Start v PENTARIVA (BLOKUJÍCÍ pro MVP, D11/D34)

Absolvování + kvíz ≥ 80 % je podmínkou (spolu se souhlasem s podmínkami a
schválením adminem) pro povýšení zákazníka na ambasadora.

### Lekce 1.1 — Co je PENTARIVA
Zadání pro AI nástroj: *"Napiš lekci vysvětlující nového ambasadora, co je
PENTARIVA (evropský ekosystém přirozené vitality — produkty, vzdělávání,
komunita), jaký je její příběh (rodinné kořeny, bylinné tradice — bez
konkrétních jmen), a čím se liší od klasického e-shopu (dlouhodobý vztah,
ne jednorázový prodej)."*

### Lekce 1.2 — Jak funguje Online kancelář
*"Vysvětli jednoduše: co je Online kancelář, k čemu slouží (přehled
zákazníků, objednávek, provizí), co je osobní odkaz a jak přivádí
zákazníky, jak vzniká provize (BEZ konkrétních procent — na ty odkaž do
sekce Provize v aplikaci, ty se mohou měnit)."*

### Lekce 1.3 — Jak používat osobní odkaz
*"Prakticky vysvětli: kde ambasador najde svůj osobní odkaz a QR kód
(sekce Můj odkaz), kdy a jak ho sdílet (osobní zpráva, ne hromadný spam),
proč je důležité, aby se zákazník registroval PŘES odkaz (spravedlivé
přiřazení), příklady vhodných situací k nasdílení."*

### Lekce 1.4 — Jak získat prvního zákazníka
*"Dej 5–7 konkrétních, nenásilných způsobů, jak může úplný začátečník
získat prvního zákazníka: koho z okolí oslovit, jak začít rozhovor bez
tlaku, jak nabídnout osobní zkušenost místo prodejní řeči, co dělat po
prvním 'ne'."*

### Lekce 1.5 — Jak správně mluvit o produktech
*"Nauč základní pravidla etické komunikace o doplňcích stravy: co říkat
(podporuje, přispívá k, je součástí), co NEŘÍKAT (léčí, vyléčí, nahradí
lék), jak reagovat na otázku 'pomůže mi to na...', kdy doporučit
konzultaci s lékařem/lékárníkem."*

### Kvíz Modulu 1 (10–12 otázek, práh 80 %)
Zadání pro AI nástroj: *"Vytvoř 12 otázek s výběrem ze 4 odpovědí (jen 1
správná) testujících porozumění lekcím 1.1–1.5 výše. Zaměř se hlavně na:
etickou komunikaci o produktech (min. 3 otázky — toto je nejdůležitější),
princip osobního odkazu a přiřazení zákazníka, základní fungování
provizí (bez konkrétních čísel). Formát: číslo otázky, text otázky, 4
možnosti A–D, označení správné odpovědi, jednovětové vysvětlení proč."*

---

## Modul 2 — Produkty

*"Vytvoř lekce: (1) přehled produktových řad PENTARIVA a jejich účelu
(bez vymýšlení konkrétních složení — použij obecné kategorie jako
'bylinné kapky', 'čaje', 'masážní oleje' dokud nedodám reálný katalog),
(2) jak jednoduše vysvětlit přínos produktu laikovi bez odborného
žargonu, (3) jak rozpoznat nejčastější potřeby zákazníka (spánek, stres,
imunita, energie, trávení — viz zájmové okruhy CRM), (4) jak doporučovat
produkt na základě potřeby bez nátlaku, (5) jak sestavit smysluplný
balíček 2–3 produktů k danému tématu."*

Pozn.: tuto lekci finalizuj AŽ BUDE hotový reálný produktový katalog
(Epik 3) — jinak AI nástroj vymyslí neexistující produkty.

## Modul 3 — Prodej a komunikace

*"Vytvoř lekce: (1) jak přirozeně oslovit potenciálního zákazníka (osobně
i online), (2) jak vést první rozhovor — otázky místo prezentace, (3) jak
reagovat na časté námitky ('je to drahé', 'nevěřím doplňkům', 'už něco
beru') empaticky a bez obhajování, (4) jak a kdy udělat follow-up po
objednávce (péče, ne otravování), (5) jak přirozeně požádat spokojeného
zákazníka o doporučení dál."*

## Modul 4 — Sociální sítě

*"Vytvoř lekce: (1) jak sdílet produkt na Instagramu/Facebooku přirozeně
(vlastní zkušenost, ne reklamní text), (2) jak používat Stories a krátká
videa k tématu bez 'salesy' image, (3) jak komunikovat v komentářích a
zprávách bez tlaku, (4) jak používat materiály z Knihovny materiálů
(Fáze 2) — prozatím vynech, knihovna ještě neexistuje."*

## Modul 5 — CRM a péče o zákazníka

*"Vytvoř lekce vysvětlující praktické použití sekce Zákazníci v
aplikaci: (1) jak číst zákaznickou kartu (historie objednávek, zájmové
okruhy), (2) co a jak zapisovat do poznámek (crm_notes) — konkrétní,
užitečné poznámky vs. obecné fráze, (3) jak pracovat s opakovaným
nákupem (kdy připomenout doplnění zásoby), (4) jak poznat zákazníka,
který dlouho neobjednal, a jak se ozvat bez nátlaku, (5) 3 konkrétní
kroky ke zvýšení retence."*

## Modul 6 — Mentor (Fáze 2 — připravit obsah, funkce v appce přijde později)

*"Vytvoř lekce pro budoucí mentory: (1) jak přivítat a zapracovat nového
ambasadora, (2) jak pomoci s jeho první objednávkou/prvním zákazníkem,
(3) jak pravidelně pracovat s malým týmem (rytmus, ne kontrola), (4) jak
číst týmový dashboard a všimnout si, kdo potřebuje pomoc, (5) jak
motivovat bez tlaku a manipulace."*

## Modul 7 — Leader (Fáze 2)

*"Vytvoř lekce: (1) principy vedení větší struktury/regionu, (2) práce s
reporty a KPI (obecně, dashboard bude specifikovaný v Epiku 6), (3) jak
plánovat kvartál s týmem, (4) jak vést a motivovat regionální komunitu na
dálku i osobně."*

## Modul 8 — B2B

*"Vytvoř lekce: (1) jak profesionálně oslovit hotel/wellness centrum/salon
s nabídkou spolupráce (e-mail i osobně), (2) jak připravit jednoduchou
B2B nabídku (rozsah portfolia, podmínky spolupráce — bez konkrétních
cen, ty budou v ceníku), (3) jak pracovat s opakovanou B2B objednávkou a
budovat dlouhodobý vztah s provozovnou."*

---

## Kontrolní seznam před odevzdáním

- [ ] Žádné konkrétní zdravotní sliby ("léčí", "vyléčí", "zaručeně pomůže")
- [ ] Žádná jména konkrétních osob (jen "tým PENTARIVA")
- [ ] Žádná konkrétní čísla provizí/slev v textu lekcí (ta se mohou měnit —
      odkazovat na "aktuální podmínky v sekci Provize")
- [ ] Žádné vymyšlené produkty/složení (u Modulu 2 čekat na reálný katalog)
- [ ] Tón: partnerský, ne "prodejní guru" styl
- [ ] Kvíz Modulu 1: 12 otázek, 4 možnosti, 1 správná, vysvětlení u každé
