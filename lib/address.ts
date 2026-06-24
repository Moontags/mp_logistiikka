/**
 * Tarkistaa, että osoite sisältää kaupungin.
 *
 * Sääntö: kaupunki on mukana jos arvossa on pilkulla eroteltu osa
 * (esim. "Kadunnimi 5, Helsinki") TAI arvo ei sisällä katuosoitetta
 * (numeroa) lainkaan (esim. pelkkä kaupunki "Helsinki").
 * Pelkkä katuosoite ilman kaupunkia (esim. "Kadunnimi 5") ei kelpaa.
 */
export function hasCity(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  const hasComma = v.includes(',');
  const hasStreetNumber = /\d/.test(v);
  return hasComma || !hasStreetNumber;
}
