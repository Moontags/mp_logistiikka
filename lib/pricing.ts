export const PRICING = {
  BASE_FEE: 119,
  BASE_KM_INCLUDED: 40,
  PER_KM: 1.16,
  TYPE_EXTRA: {
    scooter: -20,
    standard: 0,
    large: 50,
  },
} as const;

/** Siirtymämaksu: tyhjänä ajo kotipaikalta noudolle ja toimituksesta takaisin. */
export const SIIRTYMA_VAPAA_KM = 75;      // vapaa-alue Riihimäen ympärillä (eri kuin BASE_KM_INCLUDED)
export const SIIRTYMA_KM_HINTA = 0.49;    // €/km, tyhjänä ajo
export const KOTIPAIKKA = 'Riihimäki, Suomi'; // lähtö-/paluupiste

export type BikeType = 'scooter' | 'standard' | 'large';

export interface SiirtymaResult {
  siirtymaNoutoKm: number;
  siirtymaToimitusKm: number;
  siirtymamaksu: number;
}

export function laskeSiirtymamaksu(
  distRiihimakiNouto: number,   // km, Riihimäki -> nouto
  distToimitusRiihimaki: number // km, toimitus -> Riihimäki
): SiirtymaResult {
  const siirtymaNoutoKm = Math.max(0, distRiihimakiNouto - SIIRTYMA_VAPAA_KM);
  const siirtymaToimitusKm = Math.max(0, distToimitusRiihimaki - SIIRTYMA_VAPAA_KM);
  const siirtymamaksu =
    Math.round((siirtymaNoutoKm + siirtymaToimitusKm) * SIIRTYMA_KM_HINTA * 100) / 100;

  return { siirtymaNoutoKm, siirtymaToimitusKm, siirtymamaksu };
}

export function calculatePrice(
  km: number,
  bikeType: BikeType,
  /** Tyhjänä ajettavat välit. Jos puuttuu, siirtymämaksu on 0 €. */
  transfer?: { toPickupKm: number; fromDeliveryKm: number },
): {
  baseFee: number;
  kmFee: number;
  typeExtra: number;
  total: number;
  billableKm: number;
  siirtyma: SiirtymaResult;
} {
  const billableKm = Math.max(0, km - PRICING.BASE_KM_INCLUDED);
  const kmFee = Math.round(billableKm * PRICING.PER_KM * 100) / 100;
  const typeExtra = PRICING.TYPE_EXTRA[bikeType];
  const siirtyma = laskeSiirtymamaksu(
    transfer?.toPickupKm ?? 0,
    transfer?.fromDeliveryKm ?? 0,
  );
  const total =
    Math.round((PRICING.BASE_FEE + kmFee + typeExtra + siirtyma.siirtymamaksu) * 100) / 100;

  return {
    baseFee: PRICING.BASE_FEE,
    kmFee,
    typeExtra,
    total,
    billableKm,
    siirtyma,
  };
}
