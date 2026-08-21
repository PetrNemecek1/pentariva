# DNS na Forpsi — co zadat (stav 2026-08-13)

Aktuální stav ověřený přímo ve Firebase Console. Zadávej do správy DNS zóny na
Forpsi (stejné rozhraní, kde jsme dřív nastavovali pentariva.cz).

## 1. Zóna `pentariva.com` — nová primární doména (R4)

Doména je už zaregistrovaná a na Forpsi nameserverech, jen chybí záznamy.

**Přidat:**

| Typ | Název (host) | Hodnota | TTL |
|---|---|---|---|
| A | `pentariva.com` (@ / prázdné) | `199.36.158.100` | 1800 |
| TXT | `pentariva.com` (@ / prázdné) | `hosting-site=pentariva-web` | 1800 |
| CNAME | `www` | `pentariva-web.web.app` | 1800 |
| CNAME | `office` | `pentariva-office.web.app` | 1800 |

**Smazat:**

| Typ | Název | Hodnota |
|---|---|---|
| A | `pentariva.com` (@ / prázdné) | `81.2.196.19` (stará Forpsi parking stránka) |

Pozor, ať tam nezůstanou OBĚ A hodnoty najednou (stará parkovací i nová
`199.36.158.100`) — musí zůstat jen `199.36.158.100`.

## 2. Zóna `pentariva.cz` — beze změny (zatím)

**Nic nyní neměň.** `pentariva.cz` a `www.pentariva.cz` dál normálně fungují
(pentariva.cz servíruje web přímo, www.pentariva.cz na něj přesměrovává).
Až se pentariva.com ověří a nasadí se certifikát (řádově hodiny po přidání
záznamů výše), přepnu `pentariva.cz` na přesměrování → `pentariva.com` ve
Firebase Console — to je jen konfigurace na Firebase straně, na Forpsi se
tehdy nemusí sahat vůbec.

MX záznamy emailprofi na `pentariva.cz` zůstávají netknuté — jsou v jiné
zóně, nic z tohoto postupu se jich nedotýká.

## 3. Resend — odesílací e-maily z pentariva.com (D21, D24)

Toto zadání nemůžu udělat za tebe — Resend dashboard blokuje automatizovaný
přístup z bezpečnostních důvodů prohlížeče. Postup:

1. https://resend.com/domains → **Add Domain**
2. Doména: `pentariva.com`, region: **EU (eu-west-1)**
3. Resend vypíše 3–4 záznamy (MX, TXT SPF, TXT DKIM, TXT DMARC) — zkopíruj je
   PŘESNĚ tak, jak je Resend ukáže (DKIM veřejný klíč je pro každý účet jiný,
   nedá se predikovat).
4. Očekávaný tvar (ověř proti tomu, co ti Resend skutečně vypíše):

   | Typ | Název | Hodnota | Priorita |
   |---|---|---|---|
   | MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` | 10 |
   | TXT | `send` | `v=spf1 include:amazonses.com ~all` | — |
   | TXT | `resend._domainkey` | `p=<DKIM klíč z Resend>` | — |
   | TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:admin@pentariva.com` | — |

5. Zadej na Forpsi do zóny `pentariva.com` (nekoliduje s ničím výše — MX jen
   na subdoméně `send`, kořenový MX pentariva.com zůstává volný).
6. Zpět v Resendu klikni **Verify** (do ~1 h po propagaci).

Pošli mi screenshot nebo zkopírované hodnoty z kroku 3, ať to spolu
zkontrolujeme, než to potvrdíš na Forpsi.

## 4. Shrnutí pořadí kroků

1. **Teď:** zadej DNS z bodu 1 (pentariva.com A/TXT/CNAME www/CNAME office) +
   smaž starý parking A záznam.
2. Dej mi vědět, až to zadáš — ověřím propagaci a certifikát ve Firebase.
3. Až bude pentariva.com živá, přepnu pentariva.cz na redirect (já, ne ty).
4. Nezávisle na tom kdykoliv: projdi bod 3 (Resend) a pošli mi hodnoty.
