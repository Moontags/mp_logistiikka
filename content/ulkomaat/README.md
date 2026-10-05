# Ulkomaaosion ylläpito

Ulkomaaosio muodostetaan paikallisista tiedostoista Next.js-koonnissa. Sivut eivät tarvitse sisällönhallintapalvelua tai sen ympäristömuuttujia.

## Sisältöjen päivittäminen

- `articles/kuljetushinta.tsx`: artikkelin varsinainen teksti, listat, linkit ja hintataulukko. Käytä nykyisiä `blog-*`-tyyliluokkia, jotta ulkoasu pysyy yhtenäisenä.
- `articles/kuljetushinta.json`: otsikko, tiivistelmä, julkaisu- ja muokkausaika sekä kuvien polut ja vaihtoehtoinen teksti. Tiivistelmä toimii myös hakukonekuvauksena. Päivitä `updatedAt` todelliseen muokkausaikaan (ISO 8601); sivukartta käyttää sitä. Säilytä `slug`, jotta nykyinen osoite ei muutu.
- `ferry-routes.json`: reitit, varustamot, ylitysajat ja ajoneuvokohtaiset lauttahinnat. `priceEur` on euromääräinen numero, `includesCabin` kertoo hytistä, `direction` on `meno`, `paluu` tai `molemmat`. Anna jokaiselle hintariville yksilöllinen `_key`. Reittien järjestys vastaa tiedoston järjestystä.
- `index.ts`: julkaistujen artikkelien rekisteri ja sisältötyypit. Uusi artikkeli lisätään omana TSX- ja JSON-tiedostonaan ja rekisteröidään täällä. Listaus, artikkeliosoitteet ja sivukartta muodostuvat samasta rekisteristä automaattisesti. Artikkelien slugit ovat yksilöllisiä; `hinnoittelu` on varattu hinnastosivulle.
- `app/ulkomaat/page.tsx` ja `app/ulkomaat/hinnoittelu/page.tsx`: koontisivun esittelytekstit ja hinnoittelusivun kiinteät palvelukuvaukset.
- `public/images/ulkomaat/` projektin juuressa: paikalliset kuvat. Artikkelin `card` on 800 × 450, `hero` 1200 × 675 ja `og` 1200 × 630. Lauttakuvat käyttävät 800 × 450 -rajausta. Korvaa tarvittaessa myös eri rajaukset. `og` toimii jakokuvana.

Tarkista muutosten jälkeen `npm run lint`, `npm run build` sekä sivut puhelimen ja työpöydän leveydellä. Käynnistä tuotantokoonti paikallisesti komennolla `npm run start`. Sisältömuutokset tulevat käyttöön vasta uudessa koonnissa ja myöhemmässä julkaisussa.

## Siirron varmuuskopio

`archive/source.json` sisältää 5.10.2026 Sanityn alkuperäisestä APIsta luetut julkaistut sisältödokumentit ja kuvatiedot: yksi artikkeli, kaksi lauttareittiä ja neljä kuva-assetia. Artikkeli- tai reittiluonnoksia, kirjoittajia, kategorioita tai tiedosto-asseteja ei löytynyt. Esikatselusalaisuuksia ja järjestelmädokumentteja ei kopioitu.

`archive/assets.json` dokumentoi alkuperäiset kuvaosoitteet, paikalliset kuvat, tiedostokoot, mitat ja SHA-256-tarkistussummat. Alkuperäiset kuvat haettiin tunnistautuneella `dlRaw`-latauksella, ja niiden SHA-1-tarkistussummat sekä tiedostokoot vastaavat Sanityn asset-tietoja tavulleen. Kaikki neljä alkuperäistä kuvaa on tallennettu, myös kuva, jota nykyiset sivut eivät käytä. Nykyisten sivujen kuva- ja Open Graph -rajaukset on tallennettu erikseen. Varmuuskopio on historiallinen aineisto; sivut lukevat yllä kuvattuja ylläpitotiedostoja.

Siirrossa käytettiin tuoretta julkaistua sisältöä. CDN:n aiemmassa artikkeliversiossa Espanjan esimerkissä luki ”esim. 4+ pyörää”; alkuperäisen APIn julkaistussa versiossa lukee ”enintään 4 pyörää”. Paikallinen sisältö vastaa jälkimmäistä.

Sanityn sovellusriippuvuudet, kyselyt, kuvanrakentaja, live-päivitykset, esikatselu, paikallinen webhook-vastaanotin ja vanhat Sanityyn kirjoittavat päivitysskriptit on poistettu. Sanity-palvelun sisältöjä, webhook-asetuksia tai projektia ei ole muutettu. Mahdolliset palveluun ja hosting-ympäristöön jäävät asetukset eivät ole paikallisen sivuston käytössä.

## Siirron tarkistukset

- `npm run build` onnistui; `/ulkomaat`, hinnoittelu, artikkeli ja sivukartta muodostuvat staattisesti. Koonti tarvitsee verkkoyhteyden sivuston nykyisiin Google-fontteihin.
- Paikallinen tuotantokoonti testattiin Chromiumilla 390 ja 1440 pikselin leveyksillä. Tekstit (myös jokainen alkuperäinen sisältölohko ja taulukon solu), kuvat, hakukonetiedot, linkit, sivukartta, vanhat 308-uudelleenohjaukset ja tuntemattoman artikkelin 404 tarkistettiin.
- Selain ei tehnyt Sanity-pyyntöjä; myös Sanity-pyyntöjen estäminen oli käytössä. Poistetut esikatselu- ja webhook-osoitteet palauttavat 404.
- Muutettujen tiedostojen ESLint- ja Prettier-tarkistukset sekä `git diff --check` menivät läpi. Koko projektin `npm run lint` löytää ennestään olevan `react-hooks/set-state-in-effect`-virheen tiedostossa `components/Nav.tsx:28` ja käyttämättömän `basename`-tuonnin varoituksen tiedostossa `scripts/compress-images.mjs:3`. Näitä ulkomaaosion ulkopuolisia tiedostoja ei muutettu.
- Sanity- ja Portable Text -paketteja ei jäänyt npm-lukitustiedostoon. Muiden säilyvien pakettien versiot eivät muuttuneet.

Muutoksia ei julkaistu tuotantoon.
