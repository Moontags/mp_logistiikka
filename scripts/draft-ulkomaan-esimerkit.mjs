/**
 * Kirjoittaa "Näin lasketaan moottoripyörän kuljetushinta ulkomaille" -artikkelin
 * LUONNOKSEN (drafts.*) Sanityyn: korjattu lauttahinta + uusi Espanja-esimerkki.
 *
 * Ei julkaise mitään — julkaisu tehdään Sanity Studiosta.
 * Aja: node scripts/draft-ulkomaan-esimerkit.mjs
 */

import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const PROJECT = 'w3tas30e';
const DATASET = 'production';
const API = '2026-09-06';
const DOC_ID = '2869d55f-a875-4b60-9606-dd5e043b9a69';

const TITLE = 'Näin lasketaan moottoripyörän kuljetushinta ulkomaille';

const EXCERPT =
  'Mitä kansainvälisen moottoripyöräkuljetuksen hinta oikeasti sisältää? ' +
  'Kaksi esimerkkilaskelmaa: Helsinki–München ja Helsinki–Fuengirola/Malaga, ' +
  'sekä ryhmäalennus MC-porukoille.';

/** [style, listItem | null, text] */
const BLOCKS = [
  [
    'normal',
    null,
    'Kansainvälisen kuljetuksen hinta rakentuu kahdesta osasta: varustamon perimästä ' +
      'lauttamaksusta ja itse kuljetuspalvelusta. Alla kaksi esimerkkilaskelmaa eri ' +
      'pituisilta reiteiltä.',
  ],
  [
    'normal',
    null,
    'Huomaa, että München-laskelma on kuljetuksen kokonaishinta ja Espanja-laskelman ' +
      'hinta on per moottoripyörä ryhmäkuljetuksessa — luvut eivät siksi ole suoraan ' +
      'vertailukelpoisia.',
  ],

  ['h2', null, 'Esimerkkilaskelma: Helsinki–München, Saksa'],
  ['normal', 'bullet', 'Ajo Helsinki–satama (paikallinen) — ~0,5 h'],
  [
    'normal',
    'bullet',
    'Lauttamaksu Helsinki–Travemünde–Helsinki — ~900–1 500 € ' +
      '(kausivaihtelu; kesäkausi hintahaarukan yläpäässä)',
  ],
  [
    'normal',
    'bullet',
    'Ajo Travemünde–München (~700 km, molempiin suuntiin ~1 400 km) — ~7,5 h/suunta',
  ],
  [
    'normal',
    'bullet',
    'Kuljetuspalvelu (nouto, lastaus, sidonta, ajo, kuljettajan työaika, vakuutus) ' +
      '— ~1 400–1 600 €',
  ],
  ['normal', null, 'Kokonaishinta sis. ALV: n. 2 350–3 100 €'],
  ['normal', null, 'Arvioitu kesto nouto–toimitus: noin 5–5,5 vuorokautta'],

  ['h2', null, 'Esimerkkilaskelma: Helsinki–Fuengirola/Malaga, Espanja'],
  ['normal', 'bullet', 'Ajo Helsinki–satama (paikallinen) — ~0,5 h'],
  ['normal', 'bullet', 'Lauttamaksu Helsinki–Travemünde–Helsinki — ~900–1 500 € (kausivaihtelu)'],
  [
    'normal',
    'bullet',
    'Ajo Travemünde–kumppanin noutopiste (~300 km, molempiin suuntiin ~600 km) ' +
      '— ~3,5 h/suunta',
  ],
  ['normal', 'bullet', 'Luovutus kuljetuskumppanille Saksassa'],
  ['normal', 'bullet', 'Kuljetus Saksa–Espanja–Saksa (yhteistyökumppanimme kautta)'],
  [
    'normal',
    'bullet',
    'Kuljetuspalvelu (nouto, lastaus, sidonta, ajo, kuljettajan työaika, vakuutus, ' +
      'koordinointi)',
  ],
  [
    'normal',
    null,
    'Kokonaishinta sis. ALV: alkaen n. 2 000 €/moottoripyörä (ryhmäkuljetuksissa, ' +
      'esim. 4+ pyörää — hinta per pyörä laskee ryhmäkoon kasvaessa)',
  ],
  [
    'normal',
    null,
    'Arvioitu kesto nouto–toimitus: noin 2–3 viikkoa (riippuu kumppanin lähtöaikataulusta)',
  ],

  ['h2', null, 'Ryhmäalennus MC-porukoille'],
  [
    'normal',
    null,
    'Kuljetamme mielellämme useampaa pyörää samalla reissulla. 4–6 pyörän ' +
      'ryhmäkuljetuksessa hinta per moottoripyörä laskee selvästi, koska lauttamaksu ja ' +
      'ajokilometrit jakautuvat useamman pyörän kesken. Kerro montako pyörää olette ' +
      'liikkeellä, niin lasketaan teille ryhmähinta.',
  ],

  ['h2', null, 'Talvisäilytys Espanjassa'],
  ['normal', null, 'Kysy myös mahdollisuudesta säilyttää moottoripyörä Espanjassa talvikaudeksi.'],
];

/** Loppuhuomio omana blokkinaan, koska siinä on linkkiannotaatio. */
const FOOTNOTE = {
  _type: 'block',
  _key: 'notefinal',
  style: 'normal',
  markDefs: [{ _type: 'link', _key: 'lnkpricing', href: '/ulkomaat/hinnoittelu' }],
  children: [
    {
      _type: 'span',
      _key: 'notefinals0',
      marks: [],
      text:
        'Lauttamaksut ovat varustamojen ilmoittamia hintoja ja voivat muuttua ilman ' +
        'ennakkoilmoitusta. Vahvistamme voimassa olevan lauttamaksun ja kokonaishinnan ' +
        'aina tarjouksessa. Katso ajoneuvokohtaiset lauttahinnat ',
    },
    {
      _type: 'span',
      _key: 'notefinals1',
      marks: ['lnkpricing'],
      text: 'Hinnoittelu-sivulta',
    },
    { _type: 'span', _key: 'notefinals2', marks: [], text: '.' },
  ],
};

function buildBody() {
  const body = BLOCKS.map(([style, listItem, text], i) => {
    const key = `b${String(i).padStart(2, '0')}`;
    const block = {
      _type: 'block',
      _key: key,
      style,
      markDefs: [],
      children: [{ _type: 'span', _key: `${key}s0`, marks: [], text }],
    };
    if (listItem) {
      block.listItem = listItem;
      block.level = 1;
    }
    return block;
  });
  return [...body, FOOTNOTE];
}

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
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`Sanity ${res.status}: ${await res.text()}`);
  return res.json();
}

const token = await getToken();

const query = encodeURIComponent(`*[_id=="${DOC_ID}"][0]`);
const { result: published } = await sanity(`query/${DATASET}?query=${query}`, token);
if (!published) throw new Error(`Dokumenttia ${DOC_ID} ei löytynyt datasetista ${DATASET}.`);

const draft = {
  _id: `drafts.${DOC_ID}`,
  _type: 'post',
  title: TITLE,
  slug: published.slug, // slug ennallaan, ettei olemassa olevat linkit katkea
  excerpt: EXCERPT,
  publishedAt: published.publishedAt,
  body: buildBody(),
};

for (const field of ['mainImage', 'author', 'categories']) {
  if (published[field] !== undefined) draft[field] = published[field];
}

const out = await sanity(`mutate/${DATASET}`, token, {
  method: 'POST',
  body: JSON.stringify({ mutations: [{ createOrReplace: draft }] }),
});

console.log(JSON.stringify(out, null, 2));
console.log(`\nLuonnos kirjoitettu: drafts.${DOC_ID}`);
console.log('Julkaistu versio ei muuttunut. Julkaisu tehdään Sanity Studiosta.');
