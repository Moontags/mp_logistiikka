/** Display order and Finnish labels for the ferryRoute schema's vehicleType values. */
export const VEHICLE_ORDER = ['motorcycle', 'car', 'van', 'van_trailer'] as const;

export const VEHICLE_LABELS: Record<string, string> = {
  motorcycle: 'Moottoripyörä',
  car: 'Henkilöauto',
  van: 'Pakettiauto',
  van_trailer: 'Pakettiauto + peräkärry',
};

/** Matches the `direction` option list on the vehiclePrice object. */
export const DIRECTION_LABELS: Record<string, string> = {
  meno: 'Meno',
  paluu: 'Paluu',
  molemmat: 'Molemmat suuntaan',
};

export type PricingEntry = {
  _key: string;
  vehicleType: string | null;
  direction?: string | null;
  priceEur: number | null;
  includesCabin: boolean | null;
  notes: string | null;
};

export type VehicleGroup = {
  type: string;
  label: string;
  entries: PricingEntry[];
};

export function formatEur(value: number) {
  return new Intl.NumberFormat('fi-FI', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function formatDuration(hours: number) {
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  if (minutes === 0) return `${whole} h`;
  return `${whole} h ${minutes} min`;
}

/** Group pricing rows by vehicle type, in display order. */
export function groupByVehicle(pricing: PricingEntry[]): VehicleGroup[] {
  return VEHICLE_ORDER.map((type) => ({
    type,
    label: VEHICLE_LABELS[type],
    entries: pricing.filter((entry) => entry.vehicleType === type),
  })).filter((group) => group.entries.length > 0);
}

/** True when any vehicle type is priced more than once on the same route. */
export function hasSplitPricing(groups: VehicleGroup[]) {
  return groups.some((group) => group.entries.length > 1);
}

/**
 * Label shown next to the vehicle name.
 *
 * Prefers the explicit `direction` field. Rows that predate that field fall back
 * to the old behaviour: when a vehicle type has several rows, `notes` carried the
 * direction, so it is used as the label.
 */
export function entryLabel(entry: PricingEntry, groupSize: number): string | null {
  if (entry.direction) return DIRECTION_LABELS[entry.direction] ?? entry.direction;
  if (groupSize > 1) return entry.notes ?? null;
  return null;
}

/**
 * Note rendered under a row inside a multi-row group. Only applies to rows with an
 * explicit `direction` — in the legacy path `notes` is already the label, and for
 * single-row groups the page lists notes separately.
 */
export function entryNote(entry: PricingEntry, groupSize: number): string | null {
  if (entry.direction && groupSize > 1) return entry.notes ?? null;
  return null;
}
