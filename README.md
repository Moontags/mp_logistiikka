# MP-Logistiikka

Next.js-sivusto. Projektin paketinhallinta on npm.

```sh
npm ci
npm run dev
```

Tuotantokoonti ja paikallinen tarkistus:

```sh
npm run lint
npm run build
npm run start
```

## Ulkomaat

Artikkelit, hinnoittelu ja lauttareitit ovat paikallisia sisältöjä. Katso [ylläpito-ohje](content/ulkomaat/README.md). Sisältöjen päivittäminen ei tarvitse Sanityä. Sivukartta muodostuu samasta artikkelirekisteristä.

Muiden toimintojen (kartat, etäisyyslaskenta ja tilausten sähköpostit) ympäristöasetukset säilyvät käytössä.

## Yhteiskuljetus

Ennakkoilmoitus, erillinen Supabase-tallennus ja yrityssähköposti: [toteutus- ja käyttöönotto-ohje](docs/yhteiskuljetus.md). Tarkistukset: `npm test`. Tuotantokäyttö edellyttää ohjeen mukaisia tietokanta- ja ympäristöasetuksia.
