import type { Metadata } from 'next';
import { PRICING, tierSummary, positioningFreeKm, positioningTierSummary, startingPrice, eurShort } from '@/lib/pricing';
import { KUNTORAPORTTI_ENABLED } from '@/lib/features';

export const metadata: Metadata = {
  title: 'Sopimusehdot | MP-Logistiikka',
  description:
    'MP-Logistiikan sopimusehdot moottoripyörä-, skootteri- ja mopokuljetuksille. Voimassa 1.8.2026 alkaen.',
  alternates: { canonical: 'https://mp-logistiikka.fi/sopimusehdot' },
  robots: { index: true, follow: true },
};

type Section = {
  n: number;
  title: string;
  body?: string[];
  list?: { label?: string; text: string }[];
  note?: string;
};

const sections: Section[] = [
  {
    n: 1,
    title: 'Yritys ja yhteystiedot',
    list: [
      { label: 'Yrityksen nimi', text: 'MP-Logistiikka (Mediasata)' },
      { label: 'Y-tunnus', text: '3163260-9' },
      { label: 'Osoite', text: 'Riihimäki' },
      { label: 'Puhelin', text: '050 354 7763' },
      { label: 'Sähköposti', text: 'info@mp-logistiikka.fi' },
    ],
  },
  {
    n: 2,
    title: 'Tuotteet, palvelut ja hinnat',
    body: [
      'Verkkosivuilla esitetään myytävät palvelut ja niiden hinnat ennen tilauksen vahvistamista. Kuljetuksen lopullinen hinta muodostuu pyörätyypistä, kuljetusmatkasta, osoitteista sekä mahdollisista lisäpalveluista. Hinnat ilmoitetaan euroina ja ne sisältävät arvonlisäveron, ellei toisin ilmoiteta.',
    ],
    list: [
      { label: 'Mopo / Skootteri', text: `alkaen ${eurShort(startingPrice('scooter'))} €` },
      {
        label: 'Perus / Vakio',
        text: `(tavallinen moottoripyörä): alkaen ${PRICING.BASE_FEE} €. Perusmaksu sisältää ensimmäiset ${PRICING.BASE_KM_INCLUDED} km, minkä jälkeen kilometrihinta laskutetaan portaittain ja laskee matkan pidentyessä: ${tierSummary()}. Jokainen porras laskutetaan vain siihen osuvilta kilometreiltä. Mikäli nouto- tai jättöpaikka sijaitsee yli ${positioningFreeKm()} km:n päässä Riihimäeltä, veloitetaan lisäksi positiointimaksu ylimenevältä osalta. Positiointi hinnoitellaan samaan tapaan portaittain: ${positioningTierSummary()}. Nouto ja jättö arvioidaan erikseen omista etäisyyksistään.`,
      },
      {
        label: 'Iso / Strike',
        text: `(isot chopper- ja matkapyörät, ≥250 kg tai ≥1000 cm³): alkaen ${eurShort(startingPrice('large'))} €`,
      },
      ...(KUNTORAPORTTI_ENABLED
        ? [
            {
              label: 'Kuntoraportti',
              text: `(lisäpalvelu): ${eurShort(PRICING.KUNTORAPORTTI_FEE)} €, veloituksetta kuljetuksissa joiden hinta ylittää ${eurShort(PRICING.KUNTORAPORTTI_FREE_FROM)} €`,
            },
          ]
        : []),
    ],
    note: 'Tarkka hinta-arvio lasketaan sivuston hintalaskurilla reitin ja pyörätyypin perusteella ja esitetään tilaajalle ennen tilauksen vahvistamista.',
  },
  {
    n: 3,
    title: 'Sovellettavuus',
    body: [
      'Näitä ehtoja sovelletaan yksityiseen tarkoitukseen tilatussa kuljetuspalvelussa. Kuluttajaa kutsutaan näissä määräyksissä tilaajaksi ja palveluntarjoajaa (MP-Logistiikka) kuljetuspalveluyritykseksi.',
      'MP-Logistiikka on vastuussa palvelun suorittamisesta kokonaisuudessaan myös silloin, kun se käyttää alihankkijoita.',
    ],
  },
  {
    n: 4,
    title: 'Sopimuksen syntyminen',
    body: [
      'Sopimus syntyy, kun tilaaja hyväksyy MP-Logistiikan verkkosivuston, tilauslomakkeen tai sähköpostin kautta annetun tarjouksen ja yritys vahvistaa sopimuksen syntymisen tilausvahvistuksella.',
    ],
  },
  {
    n: 5,
    title: 'Toimeksiannon kattavuus',
    body: [
      'Toimeksianto käsittää moottoripyörän, skootterin tai mopon noudon sovitusta lähtöosoitteesta, ammattimaisen sidonnan, kuljetuksen ja luovutuksen sovittuun vastaanotto-osoitteeseen. Mikäli ei ole erikseen sovittu, toimeksianto EI sisällä:',
    ],
    list: [
      { text: 'Ajoneuvon huolto-, korjaus- tai kunnostustöitä.' },
      { text: 'Rekisteröinti-, katsastus- tai vakuutusasioiden hoitamista.' },
      { text: 'Ajoneuvon tankkausta, akun latausta tai käynnistysapua.' },
      { text: 'Avainten kopiointia tai valmistusta.' },
      { text: 'Ajoneuvon säilytystä sovitun kuljetusajankohdan ulkopuolella.' },
      { text: 'Irtaimiston (esim. laukkujen, varusteiden) kuljetusta, ellei erikseen sovittu.' },
    ],
  },
  {
    n: 6,
    title: 'Tilaajan velvollisuudet ja ilmoitusvelvollisuus',
    body: ['Tilaajan on ilmoitettava kaikki merkittävät seikat, kuten:'],
    list: [
      { text: 'Ajoneuvon merkki, malli, paino ja mitat.' },
      { text: 'Ajoneuvon kunto, mahdolliset vauriot, vuodot tai puuttuvat osat ennen kuljetusta.' },
      { text: 'Nouto- ja toimitusosoitteen sisäänajomahdollisuudet (esim. pihatila, kulkuesteet).' },
      { text: 'Avainten, asiakirjojen ja mahdollisten lisävarusteiden toimittaminen noudon yhteydessä.' },
      { text: 'Yhteyshenkilön tavoitettavuus noudon ja toimituksen ajankohtina.' },
    ],
    note: KUNTORAPORTTI_ENABLED
      ? 'Huom: Ajoneuvon kunto dokumentoidaan valokuvin noudon yhteydessä. Tilaaja voi tilata erillisen kuntoraportin, joka dokumentoi ajoneuvon senhetkisen kunnon ennen kuljetusta.'
      : 'Huom: Ajoneuvon kunto dokumentoidaan valokuvin noudon yhteydessä.',
  },
  {
    n: 7,
    title: 'MP-Logistiikan velvollisuudet',
    body: [
      'MP-Logistiikka suorittaa työn ammattitaidolla, sitoo ajoneuvon asianmukaisesti liinoin ja pehmustein sekä noudattaa salassapitovelvollisuutta. Yrityksellä on:',
    ],
    list: [
      { text: 'Tiekuljetussopimuslain (TKSL) mukainen tiekuljetusvakuutus.' },
      {
        text: 'Tavaraliikenteen vastuuvakuutus, joka kattaa kuljetettavalle ajoneuvolle sekä kolmannelle osapuolelle aiheutuneita vahinkoja vakuutusehtojen mukaisesti.',
      },
    ],
  },
  {
    n: 8,
    title: 'Maksua koskevat ehdot',
    body: [
      'Maksut suoritetaan ensisijaisesti MP-Logistiikan verkkosivuston kautta (verkkopankki/korttimaksu, jos saatavilla). Maksu veloitetaan tilauksen yhteydessä tai viimeistään ennen kuljetuksen suorittamista, ellei erikseen kirjallisesti sovita laskutuksesta. Hinnat sisältävät arvonlisäveron ja mahdolliset erikseen ilmoitetut kulut. Yrityksellä on oikeus tarkistaa luottotiedot ja vaatia vakuutta maksuhäiriömerkintätapauksissa. Viivästyskorko peritään korkolain mukaisesti.',
    ],
  },
  {
    n: 9,
    title: 'Toimitusaika',
    body: [
      'Kuljetus toteutetaan asiakkaan kanssa sovittuna ajankohtana tilausvahvistuksen mukaisesti. Arvioitu nouto- ja toimitusaika ilmoitetaan ennen tilauksen vahvistamista. Mahdollisista viivästyksistä ilmoitetaan asiakkaalle viipymättä. Toivottu kuljetuspäivä on alustava, kunnes MP-Logistiikka vahvistaa sen kirjallisesti.',
    ],
  },
  {
    n: 10,
    title: 'Kuluttajan oikeus peruuttaa sopimus',
    body: [
      'Kuluttajalla on etämyynnissä kuluttajansuojalain mukainen oikeus peruuttaa sopimus 14 päivän kuluessa, ellei palvelun luonteesta johdu poikkeusta. Jos palvelun suorittaminen on aloitettu asiakkaan nimenomaisesta pyynnöstä ennen peruutusajan päättymistä, asiakkaalta voidaan periä korvaus jo suoritetusta työstä. Jos palvelu on kokonaan suoritettu asiakkaan etukäteisellä suostumuksella ennen peruutusajan päättymistä, peruuttamisoikeus voi kuluttajansuojalain mukaan poistua.',
    ],
  },
  {
    n: 11,
    title: 'Palautusta koskevat ehdot',
    body: [
      'Kuljetuspalvelu on palvelutuote, johon ei sovelleta tavaran palautusta vastaavaa palautusmenettelyä. Jos tilaus peruutetaan ennen kuljetuksen alkamista tai jos asiakas on oikeutettu hyvitykseen, maksu palautetaan samalle maksutavalle ilman aiheetonta viivytystä.',
    ],
  },
  {
    n: 12,
    title: 'Tilausten muuttaminen ja peruuttaminen',
    list: [
      { label: 'Yli 2 arkipäivää ennen sovittua noutoa', text: 'Peruutus on maksuton.' },
      {
        label: 'Alle 2 arkipäivää ennen sovittua noutoa',
        text: 'Yrityksellä on oikeus veloittaa 30 % sovitusta kokonaishinnasta korvauksena varatusta kapasiteetista.',
      },
      {
        label: 'Ajoneuvo on jo noudettu tai kuljetus on alkanut',
        text: 'Veloitetaan sovittu kokonaishinta täysimääräisenä.',
      },
    ],
    note: 'Korvaus lasketaan aina tilausvahvistuksessa sovitusta kokonaishinnasta.',
  },
  {
    n: 13,
    title: 'Korvausvelvollisuus ja vastuurajat',
    body: [
      'MP-Logistiikan korvausvastuu kuljetuksen aikana ajoneuvolle aiheutuneista vahingoista määräytyy yrityksen tavaraliikenteen vastuuvakuutuksen ehtojen mukaisesti, ja korvaus perustuu ajoneuvon käypään arvoon vahinkohetkellä. Korvaus ei koske tunnearvoa tai välillisiä vahinkoja (esim. sijaisajoneuvon kustannukset, ansionmenetys). Vastuu ei kata vahinkoja, jotka johtuvat:',
    ],
    list: [
      {
        text: 'Ajoneuvon ennalta olemassa olevista vioista tai puutteellisesta kunnosta, joita tilaaja ei ole ilmoittanut.',
      },
      {
        text: 'Irrallisista tai puutteellisesti kiinnitetyistä lisävarusteista, joita ei ole sovittu kuljetettavaksi.',
      },
      { text: 'Ajoneuvon rakenteellisista heikkouksista tai aiemmista korjauksista.' },
    ],
  },
  {
    n: 14,
    title: 'Valitusten käsittely',
    body: [
      'Ajoneuvon kunto valokuvataan noudon ja luovutuksen yhteydessä. Näkyvistä vahingoista on ilmoitettava heti luovutuksen yhteydessä. Muista vahingoista on ilmoitettava kirjallisesti 14 vuorokauden kuluessa. Valitukset käsitellään ilman aiheetonta viivytystä, ja asiakkaalle vastataan viimeistään 14 päivän kuluessa valituksen vastaanottamisesta.',
      'Reklamaatiot ja valitukset: info@mp-logistiikka.fi, puh. 050 354 7763.',
    ],
  },
  {
    n: 15,
    title: 'Riitojen ratkaisu',
    body: [
      'Riidat pyritään ratkaisemaan ensisijaisesti neuvottelemalla. Kuluttaja voi kääntyä kuluttajaneuvonnan puoleen tai viedä asian kuluttajariitalautakuntaan. Oikeuspaikkana on vastaajan tai tilaajan kotipaikan käräjäoikeus.',
    ],
  },
];

export default function SopimusehdotPage() {
  return (
    <div className="legal-scroll">
      <section className="legal-page" aria-labelledby="legal-title">
        <div className="legal-inner">
          <p className="legal-eyebrow">Sopimusehdot</p>
          <h1 id="legal-title" className="legal-title">
            Sopimusehdot
          </h1>
          <p className="legal-meta">
            Voimassa 1.8.2026 alkaen · MP-Logistiikka · www.mp-logistiikka.fi
          </p>

          <p className="legal-intro">
            Nämä sopimusehdot kuvaavat myynnin, maksamisen ja palvelun ehdot MP-Logistiikan
            kuljetuspalveluissa. Sisältö ei ole oikeudellista neuvontaa eikä tyhjentävä kuvaus
            kaikista osapuolia koskevista velvoitteista.
          </p>

          <div className="legal-area">
            <h2 className="legal-area-title">Kuljetusalue</h2>
            <p>
              Teemme moottoripyörä-, skootteri- ja mopokuljetuksia koko Suomessa sekä{' '}
              <strong>EU-alueella</strong>. EU-kuljetukset hinnoitellaan aina erikseen reitin ja
              aikataulun perusteella – pyydä tarjous puhelimitse tai sähköpostilla.
            </p>
          </div>

          <a
            className="legal-pdf"
            href="/images/mp_logistiikka_sopimusehdot.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            Lataa sopimusehdot PDF-muodossa
          </a>

          {sections.map((s) => (
            <article key={s.n} className="legal-section">
              <h2 className="legal-section-title">
                <span className="legal-num">{s.n}.</span> {s.title}
              </h2>

              {s.body?.map((p) => (
                <p key={p}>{p}</p>
              ))}

              {s.list && (
                <ul className="legal-list">
                  {s.list.map((item) => (
                    <li key={(item.label ?? '') + item.text}>
                      {item.label && <strong>{item.label}:</strong>} {item.text}
                    </li>
                  ))}
                </ul>
              )}

              {s.note && <p className="legal-note">{s.note}</p>}
            </article>
          ))}

          <p className="legal-copy">
            © 2026 MP-Logistiikka (Mediasata) · Kaikki oikeudet pidätetään.
          </p>
        </div>
      </section>
    </div>
  );
}
