/** Suomalainen postinumero: viisi numeroa omana sanana. Yksilöi kunnan. */
const POSTAL_CODE = /(?:^|\s)\d{5}(?=\s|$)/;

/**
 * Tarkistaa, että osoite yksilöi paikkakunnan – eli ettei se ole pelkkä
 * katuosoite, joka osuu kymmeniin eri kuntiin ("Kirkkokatu 5"). Sellaisen
 * Google geokoodaa arvaamalla, jolloin asiakas saisi hinnan väärästä reitistä.
 *
 * Pelkkä paikkakunta riittää: "Tampere" kelpaa, koska hinta-arviossa kunnan
 * keskipiste on tarpeeksi tarkka (Tampere–Rovaniemi 709 km vs. 710 km
 * tarkoilla katuosoitteilla). Tarkkaa osoitetta ei siis vaadita.
 *
 * Kelpaa kun arvossa on
 * - pilkulla eroteltu osa: "Kadunnimi 5, Helsinki"
 * - tai ei talonnumeroa lainkaan: "Tampere"
 * - tai postinumero: "33100 Tampere", "Tampere 33100"
 * - tai talonnumeron jälkeen vielä paikkakunnan nimi: "Hämeenkatu 1 Tampere"
 */
export function hasCity(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (v.includes(',')) return true;
  if (!/\d/.test(v)) return true;
  if (POSTAL_CODE.test(v)) return true;
  // Talonnumero (+ mahdollinen jakokirjain) ja sen jälkeen sana = paikkakunta.
  return /\d+\s*[a-z]?\s+\p{L}{2,}/iu.test(v);
}
