/**
 * HINNOITTELUN KONFIGURAATIO
 *
 * Nämä luvut ovat alustavia ja säädetään myöhemmin todellisten kulujen perusteella.
 * Portaiden määrää voi muuttaa vapaasti – laskenta käy taulukon läpi järjestyksessä.
 */
export const PRICING = {
  /** Perusmaksu, sisältää BASE_KM_INCLUDED ensimmäistä kilometriä. */
  BASE_FEE: 119,
  BASE_KM_INCLUDED: 40,

  /**
   * Porrastettu, laskeva km-hinta. Progressiivinen/marginaalinen laskenta:
   * jokainen porras laskuttaa VAIN oman väliinsä osuvat kilometrit omalla hinnallaan.
   * `upToKm` = portaan yläraja kokonaismatkasta (null = ei ylärajaa).
   * Portaiden on oltava nousevassa järjestyksessä.
   */
  KM_TIERS: [
    { upToKm: 150, perKm: 1.16 },   //  41–150 km
    { upToKm: 400, perKm: 0.95 },   // 151–400 km
    { upToKm: null, perKm: 0.75 },  // 401 km +
  ],

  TYPE_EXTRA: {
    scooter: -20,
    standard: 0,
    large: 50,
  },
} as const;

export type BikeType = 'scooter' | 'standard' | 'large';

/** Yhden portaan osuus tästä matkasta – käytetään hintaerittelyn riveinä. */
export interface KmTierBreakdown {
  /** Ensimmäinen tälle portaalle laskutettu km (esim. 41). */
  fromKm: number;
  /** Viimeinen tälle portaalle laskutettu km (esim. 150). */
  toKm: number;
  /** Kilometrit tässä portaassa. */
  km: number;
  perKm: number;
  fee: number;
}

export interface PriceResult {
  baseFee: number;
  /** Kaikkien portaiden km-maksut yhteensä. */
  kmFee: number;
  /** Perusmaksun ulkopuoliset kilometrit yhteensä. */
  billableKm: number;
  /** Erittely portaittain, vain portaat joissa on kilometrejä. */
  tiers: KmTierBreakdown[];
  typeExtra: number;
  total: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calculatePrice(km: number, bikeType: BikeType): PriceResult {
  const distance = Math.max(0, km);
  const tiers: KmTierBreakdown[] = [];

  // Kursori kulkee matkaa pitkin: perusmaksun rajan jälkeiset kilometrit
  // laskutetaan sen portaan hinnalla, jonka väliin ne osuvat.
  let cursor: number = PRICING.BASE_KM_INCLUDED;

  for (const tier of PRICING.KM_TIERS) {
    if (cursor >= distance) break;
    const end = Math.min(distance, tier.upToKm ?? distance);
    const tierKm = end - cursor;
    if (tierKm > 0) {
      tiers.push({
        fromKm: cursor + 1,
        toKm: end,
        km: tierKm,
        perKm: tier.perKm,
        fee: round2(tierKm * tier.perKm),
      });
    }
    cursor = end;
  }

  const kmFee = round2(tiers.reduce((sum, t) => sum + t.fee, 0));
  const billableKm = Math.max(0, distance - PRICING.BASE_KM_INCLUDED);
  const typeExtra = PRICING.TYPE_EXTRA[bikeType];
  const total = round2(PRICING.BASE_FEE + kmFee + typeExtra);

  return { baseFee: PRICING.BASE_FEE, kmFee, billableKm, tiers, typeExtra, total };
}

/** Muotoilee luvun suomalaiseen muotoon, esim. 1.16 -> "1,16". */
export function eur(n: number): string {
  return n.toFixed(2).replace('.', ',');
}

/** Hinnastokuvaus portaista, esim. "41–150 km 1,16 €/km · 151–400 km 0,95 €/km · yli 400 km 0,75 €/km" */
export function tierSummary(): string {
  let cursor: number = PRICING.BASE_KM_INCLUDED;
  return PRICING.KM_TIERS.map((tier) => {
    const range = tier.upToKm === null
      ? `yli ${cursor} km`
      : `${cursor + 1}–${tier.upToKm} km`;
    cursor = tier.upToKm ?? cursor;
    return `${range} ${eur(tier.perKm)} €/km`;
  }).join(' · ');
}
