# Zadání: Online kancelář — nastavení (extrakt z DOCX, 2026-08-11)

POZNÁMKA: Dokument používá pracovní název ORYNDIA. Finální značka je PENTARIVA (dle
finálního provizního modelu). Kde je rozpor mezi tímto dokumentem a provizním modelem
(viz 03-provizni-pravidla-zdroj.md), platí provizní model.

---

Vytvoříme síť lidí, kteří chtějí být součástí projektu. Online kancelář řeší přihlášení,
registraci, objednávky, historii objednávek, přiřazení objednávek z hlavního firemního
webu/online katalogu do Online kanceláře pod Ambasadora, který registraci zákazníka nebo
doporučení na produkt udělal. Dále plní funkci moderního vzdělávacího a informačního prvku.

Posláním není budovat prodejní síť, ale komunitu lidí, kteří chtějí dlouhodobě pečovat
o své zdraví a sdílet tuto zkušenost s ostatními. Online kancelář je nástrojem pro
vzdělávání, komunikaci, obchod a budování vztahů.

## 1. Základní princip systému

Cílem není vytvořit klasické MLM, ale moderní exkluzivní distribuční systém, který
propojuje: zákazníky, ambasadory, mentory, leadery, B2B partnery, firemní obchod,
vzdělávání, CRM, automatizaci, motivační systém, reporting, AI technologie.

Systém má umožnit růst bez přímé závislosti na jedné osobě. Musí být jednoduchý pro
začátečníka, ale dostatečně silný pro leadery a vedení firmy.

## 2. Role v systému

### 2.1 Zákazník
Nakupuje přes e-shop, ambasadora nebo doporučovací link. Systém eviduje: jméno, e-mail,
telefon, adresa, datum narození, pohlaví, zdroj registrace, kdo ho přivedl, historie
objednávek, oblíbené produkty, datum poslední objednávky, výše objednávek za
měsíc/kvartál/rok/zvolené období (odečítá vratky/reklamace), unikátní doporučovací link
(např. /roman — nebo raději číslo registrace), unikátní link na produkt (cashback/kredit
za doporučení; registrace přes link řadí zákazníka pod Ambasadora, který link odeslal),
možnost poslat link na zprávu/video/informaci.
Smysl: neztratit zákazníka po první objednávce.

### 2.2 Registrovaný zákazník / člen komunity / benefit clubu / VIP Clubu
Mezistupeň mezi zákazníkem a ambasadorem. Má: vlastní účet, přístup k obsahu (online
školení/články/informace), možnost sdílet produkty (unikátní doporučovací link na
produkt, cashback nebo kredit za doporučení), automatický systém slev postavený na
měsíčním součtu všech objednávek po odečtení vratek/reklamací. Úroveň benefitů se
automaticky přenáší do dalšího měsíce (objednávky průběžně, benefit úroveň z předchozího
měsíce zachována; při splnění jiné úrovně čerpá v dalším měsíci benefity splněné úrovně).
Smysl: ne každý chce prodávat; mnoho lidí rádo doporučí produkt, kterému věří.
[POZN. REKONCILIACE: Benefit club 15/20/25 a VIP úrovně NEJSOU ve finálním provizním
modelu MVP — zákazník platí plnou cenu a dostává 3% klubový kredit. Slevové úrovně
navrhnout jako konfigurovatelnou vrstvu pro pozdější fázi.]

### 2.3 Ambasador
Aktivní člověk — doporučuje produkty, buduje komunitu, získává zákazníky. Má: osobní
odkaz, přehled objednávek, přehled provizí, základní CRM, přístup do akademie, produktové
materiály, sdílecí obsah na sociální sítě + vše z předchozí úrovně.
Smysl: důvěryhodný průvodce zákazníka, ne „prodejce katalogu".

### 2.4 Guide/Mentor (nemusí být hned — počítat s update modulem na další level;
druhou generaci nyní neřešit)
Vede menší skupinu ambasadorů. Navíc: přehled týmu, týmový obrat, aktivita ambasadorů,
upozornění na neaktivní členy, zprávy skupinám, vlastní reporty.

### 2.5 Leader
Vede větší strukturu. Má: pokročilý dashboard, generační přehled sítě, reporty podle
úrovní, KPI, export do Excelu, týmové kampaně, doporučené akce, výsledky za období.
Inspirace: filtrovat zástupce podle generací, ukládat reporty, vybírat KPI, exportovat.
Moderní, návodné, jednoduché, přehledné. FIREMNÍ LINIE = ODDĚLENÝ SYSTÉM ŘÍZENÍ.

### 2.6 B2B partner
Např.: hotel, wellness centrum, masér, fyzioterapeut, kosmetický salon, fitness centrum,
lékař, klinika, firma. Má: B2B účet, vlastní ceník, opakované objednávky, historii
nákupů, obchodní podmínky, kontaktní osobu, segment, stav spolupráce.
Smysl: B2B není affiliate — samostatná obchodní větev s jinou logikou.

### 2.7 B2B manažer
Odpovědný za firemní síť. Má: pipeline obchodních příležitostí, CRM firem, stav jednání,
obrat podle partnerů, opakované objednávky, úkoly, provize, reporting.

## 3. Hlavní dashboard (per role)
- Ambasador: aktuální měsíční obrat, provize, počet zákazníků, nové objednávky, osobní
  cíl, splnění cíle v %, další krok v kariérním plánu, doporučené úkoly.
  Příklad: „Splněno 73 % měsíčního cíle. Do další úrovně chybí 18 000 Kč obratu a 2 noví
  aktivní zákazníci."
- Guide/Mentor navíc: obrat týmu, aktivní/neaktivní ambasadoři, nováčci, kdo potřebuje
  podporu, kdo je blízko povýšení/sestupu.
- Leader navíc: generační struktura, obrat podle větví, výkon týmů, kampaně, rizikové
  oblasti, vlastní reporty.
- Vedení firmy: celkový obrat, affiliate obrat, B2B obrat, počet aktivních
  ambasadorů/zákazníků, retence, konverze, průměrná objednávka, opakované nákupy,
  náklady na provize, výkon kampaní.

## 4. CRM zákazníků (pro ambasadora)
Eviduje: kontaktní údaje, datum registrace, kdo ho přivedl, celá cesta strukturou,
poslední objednávka/y, produkty v objednávce, celkový obrat, počet objednávek, poznámky,
doporučený další kontakt. Zájmové okruhy: spánek, stres, imunita, pleť, detox, energie,
menopauza, sport, trávení, regenerace, hormonální rovnováha.
Smysl: vztahový systém, ne anonymní e-shop.

## 5. CRM ambasadorů (pro mentora/leadera)
Vidí: kdo je aktivní, kdo neobjednal, kdo nepřivedl zákazníka, kdo má potenciál, kdo je
blízko další úrovně/sestupu, kdo potřebuje školení. Automatické označení (barevný
symbol) + délka členství: nový/aktivní/rizikový/neaktivní ambasador/zákazník, kandidát
na mentora/ambasadora/leadera.

## 6. B2B CRM
Obchodní pipeline. Stavy: nový kontakt → osloven → domluvená schůzka → odeslaná nabídka
→ první objednávka → aktivní partner → opakovaný partner → neaktivní partner.
U partnera: typ provozu, lokalita, kontaktní osoba, velikost provozu, potenciál,
historie komunikace, poslední objednávka, další úkol, přiřazený obchodník.

## 7. Osobní odkaz a doporučovací systém
Každý ambasador má: unikátní link, QR kód, osobní stránku, sdílení konkrétního
produktu/balíčku/pozvánky do komunity. Systém automaticky pozná: kdo zákazníka přivedl,
komu patří objednávka, kdo má nárok na provizi, z jaké kampaně zákazník přišel.

## 8. Provizní a bonusový modul
Přehledný a transparentní. Ambasador vidí: aktuální provizi, očekávanou provizi,
schválenou provizi, vyplacenou provizi/slevu, neuznané položky, důvod neuznání.
Bonusy: osobní prodej, týmový výkon, dosažení úrovně, kvartální cíl, speciální kampaň,
B2B akvizice, retenční bonus.

## 9. Event Manager modul
Uživatel vidí: nadcházející akce, pozvánky, události; přihlášení/rezervace/registrace,
kapacita, záznamy, historie účasti. Vedení vidí: kdo se přihlásil/přišel/nepřišel.
Časem důležité — eventy, školení, setkání, pobyty.

## 10. Dokumentové centrum
Smlouvy, produktové listy, faktury, certifikáty, obchodní podmínky, GDPR dokumenty.

## 11. Měsíční a kvartální cíle 80/100/120 %
Kvartální plán: 80 % = základní bonus, 100 % = plný bonus, 120 % = mimořádný bonus.
Dashboard průběžně ukazuje: plán, aktuální plnění, % plnění, kolik chybí do další
úrovně, předpoklad do konce kvartálu.

## 12. Kariérní úrovně (návrh)
1. Člen komunity/zákazník — nakupuje, doporučuje, základní odkaz, může registrovat nové
   zákazníky. ROZDĚLENÍ: Zákazník bez slevy / Benefit club 15 / Benefit club 20 /
   Benefit club 25 / VIP Silver / VIP Gold / VIP Platinum
   [POZN.: viz rekonciliace u 2.2 — v MVP jen „zákazník s 3% kreditem"]
2. Ambasador — aktivně doporučuje, první zákazníci, základní školení.
3. Aktivní ambasador — pravidelný obrat, opakované objednávky, certifikace firmy,
   minimální počet zákazníků (stanovíme obrat nebo i počet).
4. Guide/Mentor — vede menší skupinu, pomáhá nováčkům, týmový výkon.
5. Senior Guide/Mentor — stabilní tým, opakovaný výkon, retence zákazníků.
6. Leader — větší tým, školí, vede kampaně, buduje region.
7. Regional leader — regionální odpovědnost, více mentorů, práce s výsledky.
8. Strategic partner — dlouhodobě buduje síť, expanze, pokročilý reporting.

## 13. Akademie a školící videa (přímo v systému)
- Modul 1: Start (co je systém, jak funguje, osobní odkaz, první zákazník, jak mluvit
  o produktech) → krátký test a odemčení ambasadorské úrovně.
- Modul 2: Produkty. Modul 3: Prodej a komunikace. Modul 4: Sociální sítě.
- Modul 5: CRM a péče o zákazníka. Modul 6: Mentor. Modul 7: Leader. Modul 8: B2B.

## 14. Reporty
Generování vlastních reportů, uložení, export, tisk, e-mail jednotlivci/skupině.
Přednastavené: osobní výkon, týmový výkon, noví/neaktivní zákazníci, noví/neaktivní
ambasadoři, B2B pipeline, kvartální plnění, provize, retence.
Vlastní: období, typ osoby, úroveň, region, obrat, aktivita, poslední objednávka,
generace, KPI. Report lze uložit, exportovat, poslat e-mailem, vytisknout.

## 15. Denní akční seznam
Aktivní doporučení místo pasivního reportingu. Ráno: komu zavolat, komu napsat, kdo
dlouho neobjednal, kdo je blízko další úrovně, kdo potřebuje školení, který B2B partner
čeká na follow-up. Příklad: „Dnes doporučujeme kontaktovat 5 zákazníků, kteří nakoupili
před 45 dny."

## 16. AI asistent
Navrhne denní priority, připraví text zprávy zákazníkovi, e-mail B2B partnerovi,
doporučí produkt podle zájmu, upozorní na neaktivní členy, pomůže s reportem, navrhne
další krok. Příklad: „Napiš mi zprávu pro zákaznici, která kupovala produkt na spánek
a 60 dní neobjednala."

## 17. Knihovna materiálů
Produktové texty, obrázky, videa, prezentace, B2B nabídky, příběhy zákazníků, FAQ,
námitky a odpovědi, šablony zpráv, šablony e-mailů. Snadné sdílení.

## 18. Kampaně
Typy: měsíční produktová, ambasadorská výzva, B2B akviziční, retenční, narozeninová,
sezónní. Sleduje se: zapojení, obrat, počet objednávek, konverze, výkon ambasadorů.

## 19. Administrace
Admin umí: spravovat uživatele, měnit role, nastavovat provize, nastavovat úrovně,
zakládat kampaně, nahrávat školení, schvalovat B2B partnery, upravovat texty,
exportovat data, sledovat výkon celé sítě.

## 20. Notifikace
Události: nová objednávka, nová registrace, splněný cíl, chybí do bonusu, zákazník
dlouho neobjednal, nový školící modul, schválená provize, B2B follow-up.
Kanály: e-mail, SMS, WhatsApp, push notifikace, interní zpráva v systému.

## 21. MVP — minimální životaschopná verze (PRIORITA)
- registrace uživatelů, zákazníků, ambasadorů, B2B partnerů
- role: zákazník, ambasador, mentor, leader, B2B
- osobní odkaz (např. /roman); každý vidí, kolik zákazníků přivedl a kolik vzniklo
  objednávek/obratu
- unikátní doporučovací link na produkt — cashback nebo kredit za doporučení; registrace
  přes link řadí zákazníka pod Ambasadora, který link odeslal
- Dashboard, př. ROMAN: obrat 120 000 Kč, provize 8 500 Kč, 32 zákazníků, 4 noví
- objednávky a sledování objednávek
- počítat provize, cashback, přiřadit dárek
- CRM zákazníků, B2B CRM
- základní akademie (jak funguje systém, jak získat prvního zákazníka, jak sdílet odkaz)
- základní reporty

## 22. Cíl systému — 5 otázek
1. Kdo přivedl zákazníka? 2. Kdo má nárok na provizi? 3. Kdo je aktivní a kdo ne?
4. Co má každý člověk udělat dnes? 5. Jak se člověk posune na další úroveň?

Nestavíme MLM software. Stavíme digitální distribuční kancelář pro moderní komunitní
obchod: e-shop, CRM, affiliate, ambasadoři, B2B, školení, vzdělávání, reporting,
AI asistent, motivační systém. Systém má lidem říkat CO, JAK a KDY udělat dál — nejen
ukazovat data. Cílový stav za 2–3 roky; stavět ve vrstvách:
- FÁZE 1: MVP (viz §21)
- FÁZE 2: kariérní plán, mentoři, leadeři, bonusy, kampaně, automatické e-maily,
  WhatsApp notifikace
- FÁZE 3: AI asistent, automatická doporučení aktivit, chytré reporty, predikce výkonu,
  návrhy produktů zákazníkům
