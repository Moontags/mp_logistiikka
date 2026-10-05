# Yhteiskuljetuksen ennakkoilmoitus

`/yhteiskuljetus` on ennakkoilmoitus, ei sitova tilaus. Toteutuminen, aikataulu ja hinta vahvistetaan erikseen. Sivu, lomakkeen esitäyttö sekä laskurin, Palvelut-sivun ja footerin linkit säilyvät. Tulevien reittien listaa tai julkista asiakastietojen lukua ei toteuteta.

## Lähetys ja asetukset

`POST /api/yhteiskuljetus` validoi tiedot palvelimella ja lähettää viestin nykyisellä SMTP-palvelulla **vain yritykselle** osoitteeseen `info@mp-logistiikka.fi`. `replyTo` on asiakkaan validoitu sähköpostiosoite. Käyttäjän tekstit HTML-escapataan. Asiakkaalle ei lähetetä erillistä vahvistusviestiä.

Toiminto tarvitsee vain nykyiset ympäristömuuttujat:

- `SMTP_HOST`
- `SMTP_PORT` (nykyinen TLS-yhteys, oletus 465)
- `SMTP_USER`
- `SMTP_PASS`

Tuotannon nykyisiä SMTP-arvoja ei muuteta. Avainarvoja ei tulosteta tai versionhallita. Supabasea, `GROUP_TRANSPORT_HASH_SECRET`-muuttujaa tai lomaketunnisteen hakemista ei käytetä. Uusia palveluja, tietokantaa tai palvelumaksuja ei tarvita; nykyisen SMTP-palvelun ja hostingin käyttö jatkuu.

Nykyinen `/api/order` ja tilauslomakkeen yritys- ja asiakasviestien lähetysvirta säilyvät ennallaan. Yhteiskuljetuksen viesti käyttää samaa kuljetusasetusten rakentajaa erillisillä aikakatkaisuilla.

## Onnistuminen ja virheet

Onnistuminen näytetään vasta, kun SMTP-palvelin on hyväksynyt yrityksen vastaanottajan ja viestin. Tämä tarkoittaa sähköpostipalvelun hyväksyntää, ei lupausta viestin saapumisesta postilaatikkoon. Ilmoitusta ei tallenneta tietokantaan.

Lähetyksen aikana painike ja kentät ovat pois käytöstä. Synkroninen lähetyslukko estää saman lomakkeen rinnakkaiset pyynnöt myös nopeilla tuplaklikkauksilla. Virheen jälkeen tiedot säilyvät muokattavina ja lähetyspainike palautuu käyttöön.

- Selvä SMTP-hylkäys tai epäonnistunut valtuutus/DNS-haku: asiakas näkee lähetysvirheen ja voi yrittää uudelleen tai soittaa.
- Katkennut selainyhteys tai epäselvä SMTP-kuittaus: asiakas näkee, ettei onnistumista voitu varmistaa, ja häntä pyydetään soittamaan ennen uudelleenlähetystä. Tarkista SMTP-lokit/postilaatikko ennen uusintaa. Viestissä on oma Message-ID ja ilmoitustunnus.
- Sovellus ei tee automaattisia uusintoja, eikä sillä ole tietokantajonoa tai ylläpitotyökalua jonon lähettämiseen.

Ilman pysyvää tallennusta palvelininstanssien tai sivun uudelleenlatausten välistä täydellistä kaksoissuojausta ei luvata. Yritys käsittelee ennakkoilmoitukset sähköpostista. Julkista luetteloa ei ole.

## Kevyt roskapostisuojaus ja validaatio

API vaatii saman alkuperän, JSON-rungon (enintään 16 KiB) ja tyhjän honeypot-kentän. Palvelin tarkistaa paikkakunnat, pyörätyypin, sähköpostin, puhelimen ja toivotun ajankohdan. Kenttärajat: paikkakunnat/nimi 100, sähköposti 254, puhelin 30 ja lisätiedot 2000 merkkiä. Viikko tai enintään 90 päivän aikaväli valitaan nykyhetkestä seuraavan kahden vuoden ajalta.

Lisäksi palvelininstanssin muistissa sallitaan enintään kahdeksan validoitua lähetysyritystä IP-tunnistetta kohti tunnissa. Muisti sisältää vain prosessikohtaisella satunnaisella suolalla tiivistetyn IP:n ja laskurin, ei lomaketietoja. Vanhat laskurit poistuvat ja muistin koko on rajattu. Vercelissä käytetään sen korvaamaa `x-forwarded-for`-otsaketta; paikallisessa ajossa yhtä yhteistä tunnistetta. Tämä on kevyt suojaus: instanssin uudelleenkäynnistys tai uusi instanssi nollaa rajoituksen. Ulkoista rajoituspalvelua ei hankita.

## Ylläpito ja tarkistukset

- Sivun tekstit: `app/yhteiskuljetus/page.tsx`, `components/GroupTransportForm.tsx`.
- Esitäyttö ja validaatio: `lib/group-transport/validation.ts`.
- Sähköpostin sisältö: `lib/group-transport/email.ts`; lähetys `lib/email.ts`.
- Roskapostisuojaus: `lib/group-transport/security.ts`.
- Hintamäärittelyt: `lib/pricing.ts`, yhteiset laskurin ja selitystekstien kanssa. Hinnoittelua ei muuteta tässä korjauksessa.

```sh
npm test
npm run lint
npm run build
```

Selaintestit tehdään paikallista tuotantokoontia vasten mobiilissa ja työpöydällä. SMTP-asetukset ohjataan vain paikalliseen testivastaanottimeen; yritykselle tai asiakkaalle ei lähetetä oikeita testiviestejä. Tarkista esitäyttö, validaatio, nopea toistuva lähetys, SMTP-hylkäys, epäselvä kuittaus sekä onnistuminen vasta SMTP-hyväksynnän jälkeen. Nykyinen tilauslomake testataan samalla paikallisella vastaanottimella.

Valmistelussa tuotantokoonti, yhdeksän automaattista testiä ja lint läpäisivät tarkistukset (lintissä yksi aiempi kuvapakkausskriptin varoitus). Mobiili- ja työpöytätestit vahvistivat toiminnan ilman Supabase-/HMAC-asetuksia, yhden pyynnön nopeilla rinnakkaisilla submit-tapahtumilla, onnistumisen vasta viivästetyn SMTP-hyväksynnän jälkeen, hylkäyksen jälkeisen uusinnan, epäselvän kuittauksen ohjeen ja lähetysrajoituksen. Esitäyttö, linkit, nykyinen laskuri ja tilauslomakkeen molemmat viestit tarkistettiin. Kaikki viestit jäivät paikalliseen SMTP-testivastaanottimeen.

## Aiempi Supabase-kokeilu ja julkaisu

Supabase-SDK, sovelluksen tietokantayhteys, RPC-kutsut, tietokantajonon koodi, uusintatyökalu ja `/api/yhteiskuljetus/valtuutus` on poistettu tästä toteutuksesta. Aiempi kehitystietokannan migraatio on säilytetty historiatietona tiedostossa `docs/archive/group-transport-supabase-migration.sql`; sitä **ei ajeta** käyttöönotossa.

Palvelussa olevaa `mp-logistiikka-yhteiskuljetus-dev`-resurssia, tauluja, tietoja tai niiden RLS-suojausta ei muuteta eikä poisteta. Vanhoja paikallisia/Vercelin Supabase- ja HMAC-muuttujia ei tarvita, mutta niitä ei poisteta palvelusta tämän korjauksen yhteydessä. Tuotantotietokantaa tai maksullista resurssia ei luoda.

Korjaus julkaistiin käyttäjän hyväksynnällä 5.10.2026 osoitteeseen https://www.mp-logistiikka.fi/yhteiskuljetus (Vercel-julkaisu `dpl_2vmFbte2AfeNriFDzVRDBidi4C9o`, READY). Julkaisu käyttää olemassa olevia SMTP-asetuksia; tietokantamigraatioita tai uusia ympäristömuuttujia ei tarvita. Julkaisun jälkeen tarkistetaan sivu, linkit, esitäyttö ja virheellisen API-pyynnön hylkäys ilman oikeaa sähköpostilähetystä. Oikeaa kelvollista ilmoitusta ei lähetetä testinä ilman erillistä pyyntöä.

Tuotantojulkaisun jälkeen mobiili- ja työpöytäsivu, muokattava esitäyttö, heti käytettävissä oleva lähetyspainike ja linkit tarkistettiin. Tunniste-API palauttaa nyt 404; virheellinen sähköposti hylätään API:ssa 400:lla ja väärä alkuperä 403:lla ennen SMTP-lähetystä. Kelvollista ilmoitusta tai oikeaa testisähköpostia ei lähetetty.
