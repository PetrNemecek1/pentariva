# Pentariva

Prezentační web značky Pentariva, převedený z Lovable na Next.js a připravený
pro nasazení na Vercel.

## Lokální vývoj

```sh
npm install
npm run dev
```

Produkční sestavení:

```sh
npm run build
npm start
```

## Nasazení na Vercel

Importujte repozitář ve Vercelu. Framework se rozpozná jako Next.js a výchozí
build příkaz je `npm run build`. Pokud web poběží na vlastní doméně, nastavte
proměnnou `NEXT_PUBLIC_SITE_URL` na její úplnou HTTPS adresu.
