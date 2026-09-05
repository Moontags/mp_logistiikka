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

  /** Kuntoraportti-lisäpalvelu. Sisältyy veloituksetta kun kuljetuksen hinta ylittää rajan. */
  KUNTORAPORTTI_FEE: 49,
  KUNTORAPORTTI_FREE_FROM: 500,

  /**
   * Positiointimaksu: kuljettaja lähtee ja palaa tukikohdasta, joten nouto- tai
   * jättöpaikan etäisyys tukikohdasta ajetaan tyhjänä eikä näy kuljetusreitin
   * kilometreissä.
   *
   * Sama progressiivinen tier-laskenta kuin KM_TIERS:ssä, mutta oma taulukko:
   * marginaalinen km halpenee lähiportaissa ja kallistuu taas kaukoportaissa,
   * koska pitkä tyhjä ajo syö koko päivän. Ensimmäinen porras on 0 €/km, joten
   * se toimii vapaarajana – pidetään BASE_KM_INCLUDED:n tasalla, jotta
   * perusmaksuun mahtuva lähikeikka ei saa positiointilisää.
   *
   * Nouto ja jättö lasketaan tällä taulukolla mutta täysin erikseen:
   * etäisyyksiä ei summata ennen portaiden soveltamista.
   */
  HOME_BASE: 'Riihimäki, Suomi',
  POSITIONING_TIERS: [
    { upToKm: 40, perKm: 0 },       //   0–40 km  ilmainen
    { upToKm: 80, perKm: 0.50 },    //  40–80 km
    { upToKm: 200, perKm: 0.40 },   //  80–200 km
    { upToKm: 400, perKm: 0.30 },   // 200–400 km
    { upToKm: 600, perKm: 0.35 },   // 400–600 km
    { upToKm: null, perKm: 0.50 },  // 600 km +
  ],
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

/** Positiointimaksun toinen pää (nouto tai jättö) erittelyriviksi. */
export interface PositioningLeg {
  /** Etäisyys tukikohdasta tähän päähän, km. */
  distanceKm: number;
  /** Ilmaisen ensimmäisen portaan ylittävät, laskutettavat kilometrit. */
  billableKm: number;
  /** Erittely portaittain, vain maksulliset portaat joissa on kilometrejä. */
  tiers: KmTierBreakdown[];
  fee: number;
}

export interface PositioningResult {
  pickup: PositioningLeg;
  delivery: PositioningLeg;
  /** Molemmat päät yhteensä. */
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
  /** Nouto-/jättöpaikan etäisyys tukikohdasta – 0 € paikallisilla keikoilla. */
  positioning: PositioningResult;
  total: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

type Tier = { readonly upToKm: number | null; readonly perKm: number };

/**
 * Progressiivinen/marginaalinen tier-laskenta – yhteinen kuljetusreitille ja
 * positioinnille. Kursori kulkee matkaa pitkin ja jokainen porras laskuttaa
 * VAIN oman väliinsä osuvat kilometrit omalla hinnallaan.
 *
 * @param startKm Ensimmäinen laskutettava km − 1 (esim. perusmaksun kattamat km).
 */
function laskePortaat(distance: number, tiers: readonly Tier[], startKm = 0): KmTierBreakdown[] {
  const rows: KmTierBreakdown[] = [];
  let cursor = startKm;

  for (const tier of tiers) {
    if (cursor >= distance) break;
    const end = Math.min(distance, tier.upToKm ?? distance);
    const tierKm = end - cursor;
    if (tierKm > 0) {
      rows.push({
        fromKm: cursor + 1,
        toKm: end,
        km: tierKm,
        perKm: tier.perKm,
        fee: round2(tierKm * tier.perKm),
      });
    }
    cursor = end;
  }

  return rows;
}

function positioningLeg(distanceKm: number): PositioningLeg {
  const distance = Math.max(0, distanceKm);
  // Ilmainen ensimmäinen porras karsitaan erittelystä – 0 €:n rivi ei kerro mitään.
  const tiers = laskePortaat(distance, PRICING.POSITIONING_TIERS).filter((t) => t.perKm > 0);

  return {
    distanceKm: distance,
    billableKm: tiers.reduce((sum, t) => sum + t.km, 0),
    tiers,
    fee: round2(tiers.reduce((sum, t) => sum + t.fee, 0)),
  };
}

/**
 * Positiointimaksu: kumpikin pää portaitetaan erikseen omasta etäisyydestään
 * tukikohtaan. Ei ristikkäislaskentaa – etäisyyksiä ei summata ennen portaita,
 * koska kaksi 100 km:n päätä ei ole sama asia kuin yksi 200 km:n pää.
 */
export function laskePositiointimaksu(
  etaisyysNoutoon: number,  // km, tukikohta -> noutopaikka
  etaisyysJatosta: number,  // km, jättöpaikka -> tukikohta
): PositioningResult {
  const pickup = positioningLeg(etaisyysNoutoon);
  const delivery = positioningLeg(etaisyysJatosta);
  return { pickup, delivery, fee: round2(pickup.fee + delivery.fee) };
}

export function calculatePrice(
  km: number,
  bikeType: BikeType,
  /** Etäisyydet tukikohdasta. Jos puuttuu, positiointimaksu on 0 €. */
  positioningKm?: { toPickupKm: number; fromDeliveryKm: number },
): PriceResult {
  const distance = Math.max(0, km);
  // Perusmaksun kattamat kilometrit ohitetaan – portaat alkavat vasta niiden jälkeen.
  const tiers = laskePortaat(distance, PRICING.KM_TIERS, PRICING.BASE_KM_INCLUDED);

  const kmFee = round2(tiers.reduce((sum, t) => sum + t.fee, 0));
  const billableKm = Math.max(0, distance - PRICING.BASE_KM_INCLUDED);
  const typeExtra = PRICING.TYPE_EXTRA[bikeType];
  const positioning = laskePositiointimaksu(
    positioningKm?.toPickupKm ?? 0,
    positioningKm?.fromDeliveryKm ?? 0,
  );
  const total = round2(PRICING.BASE_FEE + kmFee + typeExtra + positioning.fee);

  return { baseFee: PRICING.BASE_FEE, kmFee, billableKm, tiers, typeExtra, positioning, total };
}

/** Muotoilee luvun suomalaiseen muotoon, esim. 1.16 -> "1,16". */
export function eur(n: number): string {
  return n.toFixed(2).replace('.', ',');
}

/** Kuten eur(), mutta tasaeurot ilman desimaaleja: 119 -> "119", 99.5 -> "99,50". */
export function eurShort(n: number): string {
  return Number.isInteger(n) ? String(n) : eur(n);
}

/**
 * Pyörätyypin halvin mahdollinen hinta = perusmaksu + tyyppilisä. Tämä on se luku
 * jonka laskuri antaa lyhyellä paikallisella keikalla, joten hinnaston "alkaen"-hinnat
 * johdetaan tästä eikä kirjoiteta erikseen – muuten ne jäävät jälkeen kun hinnat muuttuvat.
 */
export function startingPrice(bikeType: BikeType): number {
  return round2(PRICING.BASE_FEE + PRICING.TYPE_EXTRA[bikeType]);
}

/** Hinnastokuvaus portaista, esim. "41–150 km 1,16 €/km · 151–400 km 0,95 €/km · yli 400 km 0,75 €/km" */
function tiersToText(tiers: readonly Tier[], startKm: number): string {
  let cursor = startKm;
  return tiers.map((tier) => {
    const range = tier.upToKm === null
      ? `yli ${cursor} km`
      : `${cursor + 1}–${tier.upToKm} km`;
    cursor = tier.upToKm ?? cursor;
    return `${range} ${eur(tier.perKm)} €/km`;
  }).join(' · ');
}

export function tierSummary(): string {
  return tiersToText(PRICING.KM_TIERS, PRICING.BASE_KM_INCLUDED);
}

/** Ensimmäinen porras, jossa positiointia aletaan laskuttaa (= ilmaisen portaan yläraja). */
export function positioningFreeKm(): number {
  let free = 0;
  for (const tier of PRICING.POSITIONING_TIERS) {
    if (tier.perKm > 0) break;
    free = tier.upToKm ?? free;
  }
  return free;
}

/** Positioinnin maksulliset portaat, esim. "41–80 km 0,50 €/km · 81–200 km 0,40 €/km · …" */
export function positioningTierSummary(): string {
  return tiersToText(
    PRICING.POSITIONING_TIERS.filter((t) => t.perKm > 0),
    positioningFreeKm(),
  );
}

/** Tiivis hinnastorivi, esim. "positiointi yli 40 km Riihimäeltä: 41–80 km 0,50 €/km · …" */
export function positioningSummary(): string {
  return `positiointi yli ${positioningFreeKm()} km Riihimäeltä: ${positioningTierSummary()}`;
}
