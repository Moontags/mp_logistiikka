# Yhteiskuljetuksen ennakkoilmoitus

`/yhteiskuljetus` on ennakkoilmoitus, ei sitova tilaus. Toteutuminen, aikataulu ja hinta vahvistetaan erikseen. Nykyinen `/api/order` ja tilauslomakkeen lähetysvirta säilyvät ennallaan.

## Toteutus ja ylläpito

- Sivun tekstit: `app/yhteiskuljetus/page.tsx` ja `components/GroupTransportForm.tsx`.
- Pyörätyypit: `BIKE_OPTIONS` tiedostossa `lib/pricing.ts`, yhteiset laskurin kanssa. Hintalaskentaa ei muutettu: hinnat sisältävät ALV:n, mopo −20 €, iso +50 €.
- Esitäyttö: `origin`, `destination` ja `bikeType` URL-parametreissa. Paikkakunnat tarkistetaan, katuosoitteesta poimitaan paikkakunta ja asiakkaan annetaan muokata tietoja. Moninkertaiset tai virheelliset parametrit ohitetaan.
- Palvelinvalidaatio ja rajat: `lib/group-transport/validation.ts`. Paikkakunnat/nimi 100, sähköposti 254, puhelin 30 ja lisätiedot 2000 merkkiä. Viikko tai enintään 90 päivän aikaväli nykyhetkestä seuraavan kahden vuoden ajalta.
- `POST /api/yhteiskuljetus` tallentaa ilmoituksen ja lähettää yrityksen ilmoitusviestin. `GET /api/yhteiskuljetus/valtuutus` antaa lyhytikäisen lomakesuojaustunnisteen; se ei lue asiakastietoja. Julkista ilmoitusten luku-API:a tai tulevien reittien listaa ei ole.

## Tietokanta ja käyttöönotto

Vercel Marketplacen kautta luotiin ilmainen Supabase-resurssi `mp-logistiikka-yhteiskuljetus-dev` (Stockholm). Se on liitetty **vain Development-ympäristöön**. Migraatio `supabase/migrations/20261005095634_group_transport_registrations.sql` on ajettu tähän oikeaan kehitystietokantaan ja kirjattu migraatiohistoriaan. Testirivit poistettiin. Tuotantoon ei ole julkaistu mitään.

Migraatio luo:

1. `public.group_transport_registrations`: yksityiset ilmoitukset ja yrityssähköpostin toimitustila.
2. `public.group_transport_rate_limits`: atominen, eri palvelininstanssien yhteinen lähetysrajoitus.
3. Palvelimelle rajatut RPC-funktiot tallennukseen, sähköpostin varaukseen ja toimitustilan päivitykseen.

Molemmissa tauluissa on RLS eikä yhtään julkista lukupolitiikkaa. `anon`- ja `authenticated`-roolien taulu- ja RPC-oikeudet on poistettu. Vain palvelimen `service_role` saa käyttää niitä. Funktiot ovat `security invoker`, eivät ohita käyttöoikeuksia. Suojaus tarkistettiin oikeaa tietokantaa vasten sekä Supabasen security advisors -komennolla (ei havaintoja).

**Ennen tuotantokäyttöä:** liitä valittu Supabase-resurssi Production-ympäristöön ja aja sama migraatio kyseiseen tietokantaan, jos käytät erillistä tuotantotietokantaa. Määritä myös Preview erikseen, jos haluat testata Vercel-esikatseluissa. Tarkista kohdetietokanta ennen `supabase db push` -komentoa. Älä kopioi kehitys- ja tuotantoavaimia ristiin. Tämä toteutus ei tee tuotantoliitosta tai julkaisua automaattisesti.

Palvelimen ympäristömuuttujat:

| Nimi | Käyttö |
| --- | --- |
| `SUPABASE_URL` | Supabase-projektin osoite |
| `SUPABASE_SECRET_KEY` | Supabasen palvelinavain; ei koskaan `NEXT_PUBLIC_`-etuliitettä |
| `GROUP_TRANSPORT_HASH_SECRET` | Pysyvä satunnainen vähintään 32 merkin salaisuus HMAC-tunnisteille ja lomakesuojaukselle; esimerkiksi `openssl rand -hex 32` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Nykyisen sähköpostipalvelun asetukset; käytössä jo tilauslomakkeella |

Supabase-osoite, yksityinen avain ja HMAC-salaisuus on määritetty paikalliseen `.env.local`-tiedostoon ja Development-ympäristöön. Marketplace lisäsi myös muita Supabase/Postgres-muuttujia; tämä sovellus tarvitsee niistä vain kaksi yllä mainittua. Julkista Supabase-asiakasta ei käytetä. Ympäristötiedostoja ei versionhallita.

## Roskapostisuojaus ja kaksoisilmoitukset

API vaatii saman alkuperän, JSON-rungon (enintään 16 KiB), tyhjän piilokentän ja allekirjoitetun, IP-tunnisteeseen sidotun lomaketunnisteen (ikä 2 sekuntia–1 tunti). Palvelimen validaatio ei luota selaimeen. Tietokantarajoitus on 8 yritystä/IP/tunti ja 8 yritystä/sähköpostiosoite/päivä; yritykset sisältävät uusintapyynnöt. IP ja rajoituksen sähköpostitunniste tallentuvat HMAC-tiivisteinä. Vanhat rajoitusjaksot siivotaan tallennuskutsussa. Vercelissä käytetään sen korvaamaa `x-forwarded-for`-otsaketta. Paikallinen ajo käyttää yhtä yhteistä tunnistetta; muu hosting vaatii luotetun välityspalvelimen tunnistuksen määrittämisen.

Tallennus käyttää asiakkaan lähetys-UUID:ta ja normalisoidun sisällön HMAC-tiivisteen uniikkiutta. Saman ilmoituksen uusinta ei luo uutta riviä, vaikka sivu ladattaisiin uudelleen tai rinnakkainen pyyntö saapuisi. Selain säilyttää sessionStorageen vain UUID:n ja tiivisteen, ei lomakkeen asiakastietoja.

Ilmoitus tallennetaan **ennen** sähköpostia. Tallennusvirhe palauttaa 503 eikä lähetä sähköpostia. Sähköpostivirheen jälkeen asiakas saa onnistumiskuittauksen, koska ilmoitus on vastaanotettu tietokantaan. Atominen sähköpostivaraus estää rinnakkaiset lähetykset. Viesti menee vain yritykselle, `replyTo` on validoitu asiakkaan osoite ja käyttäjän teksti HTML-escapataan.

## Sähköpostivirheiden käsittely

Seuraa taulun `notification_status`-kenttää Supabasen yksityisestä hallinnasta. Sovellus ei sisällä automaattista ajastettua uusintaa.

- `pending`: tallennettu, lähetys ei ole vielä alkanut.
- `sent`: SMTP-palvelu hyväksyi viestin ja toimitustila tallentui.
- `failed`: palvelu hylkäsi viestin tai yhteys/valtuutus epäonnistui ennen viestiä. Uusinta on mahdollinen minuutin kuluttua, enintään kolmesti.
- `sending`: lähetys varattu. Jos tila jää tähän, kuittaus voi olla epäselvä tai tilapäivitys epäonnistunut. Sitä **ei** lähetetä automaattisesti uudelleen edes varausajan jälkeen.

Paikallinen ylläpitotyökalu lukee yksityistä tietokantaa ja näyttää vain ilmoitus-ID:t, tilat ja yritysten määrät:

```sh
npm run group-transport:retry
```

Se ei lähetä viestejä ilman erillistä valitsinta. Kun SMTP-asetukset on korjattu ja haluat lähettää oikeat odottavat/epäonnistuneet ilmoitukset:

```sh
npm run group-transport:retry -- --send
```

Työkalu käsittelee enintään 100 jonossa olevaa ilmoitusta kerrallaan ja noudattaa samoja varauksia/rajoja. Kolmen epäonnistuneen yrityksen jälkeen tarkista virheen syy ja ilmoitus käsin. Pitkäksi aikaa `sending`-tilaan jääneen ilmoituksen kohdalla tarkista ensin SMTP-lokit ja yrityksen postilaatikko: viesti on voinut saapua. Vain jos vahvistat, ettei viestiä ole hyväksytty, palautetaan kyseinen ilmoitus yksityisestä hallinnasta `pending`-tilaan ja tyhjennetään `notification_claim` sekä `notification_locked_until` (tarvittaessa nollataan yritykset). SMTP ei takaa täsmälleen yhtä toimitusta epäselvässä verkkokatkossa; vakaa Message-ID helpottaa tarkistusta. Asiakkaan ei tarvitse ilmoittaa uudelleen.

Sovi käyttöönottovaiheessa yrityksen sisäinen seurantavastuu sekä asiakastietojen säilytysaika. Tietoja ei julkaista.

## Mahdollinen tuleva julkinen reittilista

Tätä ei toteutettu. Myöhemmin julkiseen listaan voidaan siirtää **vain erikseen hyväksytyn reitin paikkakunnat ja viikko** esimerkiksi erilliseen tauluun, jossa ei ole asiakastietoja tai lisätietoja. Pelkkä SQL-näkymä ei takaa taustataulun RLS-suojausta: näkymän oikeudet ja `security_invoker` on arvioitava erikseen. Nykyisten yksityisten taulujen julkisia oikeuksia ei pidä avata.

## Tarkistukset

```sh
npm test
npm run build
npm run lint
```

Automaattiset testit kattavat validaation, lomaketunnisteen, koko- ja sisältötyyppirajat, tallennus- ja sähköpostivirheet, rinnakkaiset uusinnat, epäselvän SMTP-kuittauksen, HTML-escapauksen ja hinnan laskennan regressiot. Kehitystietokannasta testattiin todellinen tallennus, uniikkius, sähköpostivaraukset, uusinta, lähetysrajoitus ja julkisten roolien esto. Selain tarkistettiin mobiilissa ja työpöydällä tuotantokoonnilla; SMTP ohjattiin vain paikalliseen testivastaanottimeen. Nykyinen laskuri testattiin vakioidulla etäisyysvastauksella ja tilauslomakkeen molemmat viestit paikallisella SMTP:llä. Oikeita testiviestejä ei lähetetty.

Koko projektin lintissä on ennestään `components/Nav.tsx:28`-virhe (setState effectissä) ja `scripts/compress-images.mjs:3`-varoitus. Muutetut yhteiskuljetustiedostot läpäisevät lintin.
