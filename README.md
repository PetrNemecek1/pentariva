# Pentariva

Vícestránkový web značky Pentariva převedený z Lovable na Next.js App Router
a připravený pro nasazení na Vercel.

## Lokální vývoj

```sh
npm install
npm run dev
```

## Produkční sestavení

```sh
npm run build
npm start
```

## Nasazení na Vercel

Importujte repozitář ve Vercelu. Framework se rozpozná jako Next.js a použije
se příkaz `npm run build`.

Pro správné absolutní adresy v metadatech nastavte ve Vercelu proměnnou:

```text
NEXT_PUBLIC_SITE_URL=https://vase-domena.cz
```

Pokud zatím vlastní doménu nemáte, může proměnná obsahovat přidělenou
`*.vercel.app` adresu.

## Přenesené části

- hlavní stránka
- produkty a čtyři produktové koncepty
- vzdělávání včetně článku, průvodce, obrazové série, webináře a osmi témat
- komunita
- poradna
- online kancelář a přihlášení
- Svět PENTARIVA včetně kapitol, příběhu, hodnot, vědy a vývoje, kvality,
  budoucnosti a sekce pro média
- připravované informační a právní podstránky
- PDF ke stažení a zvukový obsah
