/**
 * Päivittää "Näin lasketaan moottoripyörän kuljetushinta ulkomaille" -artikkelin:
 *  - uusi johdanto + kaksi noutovaihtoehtoa (suora nouto / kumppanin terminaali)
 *  - hintataulukko noutoalueittain (priceTable-lohko)
 *  - ryhmäalennuksen yläraja 4 pyörää (aiemmin 4–6)
 *
 * Esimerkkilaskelmat (München, Espanja) ja muut osiot säilyvät ennallaan:
 * ne luetaan nykyisestä dokumentista ja kirjoitetaan takaisin sellaisenaan.
 *
 * Kirjoittaa JULKAISTUUN dokumenttiin. Aja: node scripts/update-saksa-noutovaihtoehdot.mjs
 */

import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const PROJECT = 'w3tas30e';
const DATASET = 'production';
const API = '2026-09-06';
const SLUG = 'naein-lasketaan-moottoripyoeraen-kuljetushinta-saksasta-suomeen';

/** Lohkot, joiden väliin uusi sisältö sijoitetaan. Ankkurit haetaan tekstistä, ei _key:stä. */
const INTRO_FIRST = 'Kansainvälisen kuljetuksen hinta rakentuu kahdesta osasta';
const FIRST_EXAMPLE_HEADING = 'Esimerkkilaskelma: Helsinki–München, Saksa';
const GROUP_HEADING = 'Ryhmäalennus MC-porukoille';

const INTRO = [
  [
    'normal',
    'Kansainvälisen kuljetuksen hinta rakentuu kahdesta osasta: varustamon perimästä ' +
      'lauttamaksusta ja itse kuljetuspalvelusta. Koska Saksassa on useita mahdollisia ' +
      'lähtöpaikkoja, kerromme alla kaksi tapaa, joilla kuljetus voidaan hoitaa — kumpi ' +
      'kannattaa, riippuu siitä, kuinka kaukana noutopaikka on Travemündesta.',
  ],
  ['h2', '1. Suora nouto meiltä'],
  [
    'normal',
    'Haemme pyörän suoraan noutopaikalta ja kuljetamme sen läpi koko matkan. Tämä on ' +
      'edullisin ja nopein vaihtoehto, mitä lähempänä noutopaikka on Travemündea — hinta ' +
      'nousee ajomatkan mukana.',
  ],
];

const PRICE_TABLE = {
  _type: 'priceTable',
  _key: 'saksanoutohinnat',
  caption: 'Suuntaa-antavia kokonaishintoja Helsinkiin (sis. ALV):',
  columns: ['Noutoalue Saksassa', 'Etäisyys Travemündesta', 'Arvioitu kokonaishinta'],
  rows: [
    ['Lyypekki / Hampuri / Kiel', '~60 km', 'n. 1 600 €'],
    ['Hannover / Bremen / Berliini', '~300 km', 'n. 2 150 €'],
    ['Ruhrin alue / Köln / Düsseldorf', '~450 km', 'n. 2 500 €'],
    ['Frankfurt / Kassel / Leipzig / Dresden', '~550 km', 'n. 2 750 €'],
    ['Stuttgart / Nürnberg / München', '~700 km', 'n. 3 100 €'],
  ].map((cells, i) => ({ _type: 'row', _key: `r${i}`, cells })),
};

const PARTNER = [
  ['h2', '2. Kuljetus yhteistyökumppanimme kautta lähimpään terminaaliin'],
  [
    'normal',
    'Jos noutopaikka on kauempana Travemündesta — esimerkiksi Etelä- tai Länsi-Saksassa — ' +
      'voi olla edullisempaa tilata pyörän kuljetus ensin yhteistyökumppanimme kautta heidän ' +
      'lähimpään terminaaliinsa Saksassa. Haemme pyörän sitten terminaalilta ja hoidamme ' +
      'loppumatkan Travemünden kautta Suomeen. Mitä kauempana pyörä alun perin on ' +
      'Travemündesta, sitä enemmän tässä vaihtoehdossa yleensä säästää verrattuna suoraan ' +
      'noutoon meiltä.',
  ],
  [
    'normal',
    'Kuljetuksesta peritään 40 % ennakkomaksu tilausvahvistuksen yhteydessä, loppuosa ' +
      'laskutetaan toimituksen yhteydessä.',
  ],
];

const GROUP_TEXT =
  'Kuljetamme mielellämme useampaa pyörää samalla reissulla. Enintään 4 pyörän ' +
  'ryhmäkuljetuksessa hinta per moottoripyörä laskee selvästi, koska lauttamaksu ja ' +
  'ajokilometrit jakautuvat useamman pyörän kesken. Kerro montako pyörää olette ' +
  'liikkeellä, niin lasketaan teille ryhmähinta.';

/** Tekstilohko ilman merkintöjä. Avaimet ovat vakioita, jotta ajo on idempotentti. */
function textBlock(key, style, text) {
  return {
    _type: 'block',
    _key: key,
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: `${key}s0`, marks: [], text }],
  };
}

const blockText = (block) => (block.children ?? []).map((child) => child.text ?? '').join('');

async function getToken() {
  const path = join(homedir(), '.config/sanity/config.json');
  const { authToken } = JSON.parse(await readFile(path, 'utf8'));
  if (!authToken) throw new Error('Sanity CLI -tokenia ei löytynyt. Aja: npx sanity login');
  return authToken;
}

async function sanity(path, token, init = {}) {
  const res = await fetch(`https://${PROJECT}.api.sanity.io/v${API}/data/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (!res.ok) throw new Error(`Sanity ${res.status}: ${await res.text()}`);
  return res.json();
}

const token = await getToken();

const query = encodeURIComponent(
  `*[_type == "post" && slug.current == "${SLUG}"][0]{_id,_rev,body}`,
);
const { result: doc } = await sanity(`query/${DATASET}?query=${query}`, token);
if (!doc) throw new Error(`Artikkelia slugilla "${SLUG}" ei löytynyt datasetista ${DATASET}.`);

const body = doc.body ?? [];

const introStart = body.findIndex((b) => blockText(b).startsWith(INTRO_FIRST));
const examplesStart = body.findIndex((b) => blockText(b) === FIRST_EXAMPLE_HEADING);
const groupHeading = body.findIndex((b) => blockText(b) === GROUP_HEADING);

if (introStart !== 0) throw new Error('Johdantokappaletta ei löytynyt bodyn alusta.');
if (examplesStart === -1) throw new Error(`Otsikkoa "${FIRST_EXAMPLE_HEADING}" ei löytynyt.`);
if (groupHeading === -1) throw new Error(`Otsikkoa "${GROUP_HEADING}" ei löytynyt.`);

// Ryhmäkappale on otsikon jälkeinen normaali lohko.
const groupParagraph = groupHeading + 1;
if (body[groupParagraph]?.style !== 'normal') {
  throw new Error(`Otsikon "${GROUP_HEADING}" jälkeen ei ole tekstikappaletta.`);
}

const newIntro = [
  ...INTRO.map(([style, text], i) => textBlock(`intro${i}`, style, text)),
  PRICE_TABLE,
  ...PARTNER.map(([style, text], i) => textBlock(`partner${i}`, style, text)),
];

const nextBody = [
  ...newIntro,
  // Esimerkkilaskelmat ja niitä seuraavat osiot ennallaan, ryhmäkappale vaihdettuna.
  ...body.slice(examplesStart).map((block, i) => {
    const index = examplesStart + i;
    return index === groupParagraph ? textBlock(block._key, 'normal', GROUP_TEXT) : block;
  }),
];

const dropped = body.slice(0, examplesStart).map((b) => `  - ${blockText(b).slice(0, 70)}…`);
console.log(`Poistetaan ${examplesStart} johdantolohkoa:\n${dropped.join('\n')}`);
console.log(
  `\nSäilytetään ${body.length - examplesStart} lohkoa alkaen: "${FIRST_EXAMPLE_HEADING}"`,
);
console.log(`Ryhmäkappale korvataan (lohko ${groupParagraph}, _key=${body[groupParagraph]._key})`);
console.log(`\nBodyn pituus: ${body.length} → ${nextBody.length}`);

await sanity(`mutate/${DATASET}?returnIds=true`, token, {
  method: 'POST',
  body: JSON.stringify({
    mutations: [
      {
        patch: {
          id: doc._id,
          // Estää kirjoituksen, jos dokumentti on muuttunut haun jälkeen.
          ifRevisionID: doc._rev,
          set: { body: nextBody },
        },
      },
    ],
  }),
});

console.log(`\n✔ Julkaistu dokumentti ${doc._id} päivitetty.`);
