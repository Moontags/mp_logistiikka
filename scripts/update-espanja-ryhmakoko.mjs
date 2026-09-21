/**
 * Yhtenäistää Espanja-esimerkkilaskelman ryhmäkoon "enintään 4 pyörää" -rajaan,
 * joka asetettiin Ryhmäalennus-osioon skriptissä update-saksa-noutovaihtoehdot.mjs.
 *
 * Muuttaa täsmälleen yhden kappaleen. Lohko paikannetaan tekstin perusteella,
 * ei _key:n, ja kirjoitus lukitaan ifRevisionID:llä.
 *
 * Aja: node scripts/update-espanja-ryhmakoko.mjs
 */

import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const PROJECT = 'w3tas30e';
const DATASET = 'production';
const API = '2026-09-06';
const SLUG = 'naein-lasketaan-moottoripyoeraen-kuljetushinta-saksasta-suomeen';

const OLD_TEXT =
  'Kokonaishinta sis. ALV: alkaen n. 2 000 €/moottoripyörä (ryhmäkuljetuksissa, ' +
  'esim. 4+ pyörää — hinta per pyörä laskee ryhmäkoon kasvaessa)';

const NEW_TEXT =
  'Kokonaishinta sis. ALV: alkaen n. 2 000 €/moottoripyörä (ryhmäkuljetuksissa, ' +
  'enintään 4 pyörää — hinta per pyörä laskee ryhmäkoon kasvaessa)';

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

const matches = body.filter((block) => blockText(block) === OLD_TEXT);
if (matches.length === 0) {
  const alreadyDone = body.some((block) => blockText(block) === NEW_TEXT);
  throw new Error(
    alreadyDone
      ? 'Kappale on jo päivitetty — ei tehtävää.'
      : 'Korvattavaa kappaletta ei löytynyt. Teksti on muuttunut; tarkista body.',
  );
}
if (matches.length > 1) {
  throw new Error(`Teksti löytyi ${matches.length} kertaa — odotettiin tasan yhtä.`);
}

const [target] = matches;

// Vain span-lapsen teksti vaihtuu. Tyyli, markDefs, _key ja muut lapset säilyvät,
// jottei kappaleesta katoa mahdollisia merkintöjä.
const spans = (target.children ?? []).filter((child) => child._type === 'span');
if (spans.length !== 1) {
  throw new Error(`Kappaleessa on ${spans.length} span-lasta — odotettiin tasan yhtä.`);
}

const nextBody = body.map((block) =>
  block === target
    ? {
        ...block,
        children: block.children.map((child) =>
          child === spans[0] ? { ...child, text: NEW_TEXT } : child,
        ),
      }
    : block,
);

console.log(`Lohko _key=${target._key} (indeksi ${body.indexOf(target)})`);
console.log(`  - ${OLD_TEXT}`);
console.log(`  + ${NEW_TEXT}`);
console.log(`\nBodyn pituus ennallaan: ${nextBody.length}`);

await sanity(`mutate/${DATASET}`, token, {
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
