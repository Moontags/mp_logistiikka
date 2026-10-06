# Hintalaskurin osoitehaun korjaus

## Syy ja toteutus

Lähdekoodissa oli Places API (New) AutocompleteSuggestion ja legacy AutocompleteService -varatoteutus, ei Googlen valmista Autocomplete-widgetiä. Uudessa haussa ei ollut tyyppirajausta, sijaintipainotusta eikä strictBounds-rajausta. Maa oli rajattu Suomeen. Rajoittamaton paikkatyyppi päästi yritykset ja urheilupaikat kilpailemaan kaupunkien kanssa; ilman sijaintipainotusta Google käyttää oletuspainotusta. Kuvan Oulunkylä-painotuksen tarkkaa Googlen ranking-perustetta ei voi todentaa lähdekoodista. Uusi kaupunkihaku nosti Oulun selaintestissä ensimmäiseksi.

Pelkkä kaupunki hyväksyttiin jo hasCity-tarkistuksessa. Kentissä ei ollut place_id-vaatimusta: kirjoitettu arvo välitettiin reittipalvelulle. Enter ilman korostettua ehdotusta ei kuitenkaan tehnyt mitään ja laskenta vaati painikkeen. Hakupoikkeukset peitettiin tyhjäksi listaksi. Reittipalvelu lisäsi aina Finland-päätteen eikä palauttanut tunnistettua paikkaa. Positiointivirhe antoi hiljaisesti 0 km / 0 €.

Korjaukset:

- Rinnakkainen cities-haku ja yleinen osoitehaku, kaupungit ensin; koko Suomen locationBias ilman locationRestriction-rajausta.
- Hakumaat fi, se, no, ee, de. Ruotsin maakoodi on se.
- Palvelin geokoodaa molemmat arvot suomen kielellä ja region=fi-painotuksella, myös ilman listavalintaa. Ulkomaisen paikan nimeen ei lisätä Finland-päätettä. Osittainen epävarma osuma hylätään.
- Routes API käyttää geokoodauksen place_id-arvoja. Tunnistetut osoitteet näytetään asiakkaalle.
- Automaattinen laskenta 800 ms kirjoitustauon jälkeen, Enter käynnistää heti. Myös samantekstinen listavalinta käynnistää laskennan.
- Vanhentuneet vastaukset ohitetaan ja aiempi hinta poistetaan osoitteen muuttuessa. Aikakatkaisuissa ja virheissä näkyy yhteydenottovaihtoehto.
- Positioinnin epäonnistuessa tarjous keskeytetään näkyvällä virheellä. Identtinen place_id tarkoittaa 0 km matkaa ilman Google-pyyntöä (Riihimäki-tukikohta).
- Ehdotuslistan korkeus pysyy näkyvän näkymän sisällä. Hiiren hover ei vaihda Enterillä valittavaa näppäimistöehdotusta.
- Ennakkoilmoituksen painikkeessa oli lähdekoodissa ”Takaisin etusivulle”. Nyt siinä on ”Laske kuljetuksen hinta →” ja linkki /hinnasto. Tumma teksti oranssilla ja vaalea korttiteksti parantavat kontrastia.

Tariffit ja lib/pricing.ts pysyivät muuttumattomina.

## Testitulokset

Kaikki parit testattiin Google Chrome -selaimessa sekä kirjoittamalla kaupungit ilman listavalintaa (Tab ja Enter) että valitsemalla molemmat kaupungit ehdotuslistasta. Molemmat tavat tuottivat saman tuloksen. Hinnat ovat peruspyörälle, sisältävät ALV:n ja nykyisen positioinnin Riihimäeltä.

| Reitti            | Kuljetus km | Tukikohta → nouto km | Jättö → tukikohta km | Perusmaksu € | Km-maksu € | Positiointi € | Yhteensä € |
| ----------------- | ----------: | -------------------: | -------------------: | -----------: | ---------: | ------------: | ---------: |
| Oulu–Helsinki     |         607 |                  569 |                   72 |       119,00 |     520,35 |        203,15 |     842,50 |
| Rovaniemi–Tampere |         718 |                  789 |                  113 |       119,00 |     603,60 |        325,70 |    1048,30 |
| Vaasa–Turku       |         329 |                  355 |                  156 |       119,00 |     297,65 |        164,90 |     581,55 |
| Joensuu–Espoo     |         450 |                  399 |                   74 |       119,00 |     402,60 |        144,70 |     666,30 |
| Kuopio–Riihimäki  |         352 |                  352 |                    0 |       119,00 |     319,50 |        113,60 |     552,10 |
| Hämeenlinna–Lahti |          77 |                   33 |                   62 |       119,00 |      42,92 |         11,00 |     172,92 |
| Pudasjärvi–Vantaa |         680 |                  653 |                   67 |       119,00 |     575,10 |        238,00 |     932,10 |

Oulu–Helsinki-esimerkki: perusmaksu 119 €, kilometrit 110 × 1,16 + 250 × 0,95 + 207 × 0,75 = 520,35 €. Noutopositiointi 187,15 €, jättöpositiointi 16 €, yhteensä 842,50 €.

Routes-etäisyydet pyöristetään kokonaiskilometreiksi kuten ennenkin. Kaupunkikeskipiste on hinta-arvion lähtökohta; katuosoitteet voivat muuttaa matkaa.

Tuntematon paikka qzxqzxqzxqzx näytti virheen sekä ”Soita 050 354 7763” ja ennakkoilmoituslinkin. Vanhentunutta tilaushintaa ei jäänyt näkyviin. Ennakkoilmoituspainikkeen teksti tarkistettiin kuvasta.

Mobiilitarkistus: Chrome responsive 390 × 500 px, Oulu-ehdotus näkyy ja lista vierittyy näkyvän alueen sisällä. Oulu–Helsinki Enterillä antoi 607 km / 842,50 €. Fyysisen iOS-/Android-näppäimistön toimintaa ei voitu testata tällä työasemalla.

Google Geocoding palvelinavaimella palautti Oulu, Suomi / OK; Routes ja selaimen Places toimivat paikallisesti. Selaimen konsolissa ei näkynyt Google API -virheitä testin aikana. Google Cloudin API enablement- ja referrer-asetuslistaa ei ole hallintapaneelista tarkastettu; toimivuustestit todentavat käytetyt palvelut testatussa ympäristössä.

Automaattiset regressiotestit kattavat region-painotuksen, ulkomaisen osoitteen, ZERO_RESULTS- ja partial_match-tilanteet, place_id-reitityksen, tukikohdan 0 km osuuden ja positiointivirheen. Nykyiset tariffitestit läpäisevät edelleen.

Uusittava live-reittitesti: `node --import tsx scripts/check-calculator.mts` (kehityspalvelin käynnissä). Vaihtoehtoinen ympäristö: `CALCULATOR_BASE_URL=https://preview.example node --import tsx scripts/check-calculator.mts`.

Dokumentaation tarkistus: [Google Autocomplete Data API](https://developers.google.com/maps/documentation/javascript/place-autocomplete-data), [Geocoding region bias](https://developers.google.com/maps/documentation/geocoding/guides-v3/requests-geocoding).
