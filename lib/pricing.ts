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

export type BikeType = 'scooter' | 'standard' | 'large';

export function calculatePrice(km: number, bikeType: BikeType): {
  baseFee: number;
  kmFee: number;
  typeExtra: number;
  total: number;
  billableKm: number;
} {
  const billableKm = Math.max(0, km - PRICING.BASE_KM_INCLUDED);
  const kmFee = Math.round(billableKm * PRICING.PER_KM * 100) / 100;
  const typeExtra = PRICING.TYPE_EXTRA[bikeType];
  const total = Math.round((PRICING.BASE_FEE + kmFee + typeExtra) * 100) / 100;

  return {
    baseFee: PRICING.BASE_FEE,
    kmFee,
    typeExtra,
    total,
    billableKm,
  };
}
