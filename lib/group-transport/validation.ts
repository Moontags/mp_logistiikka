import { isBikeType, type BikeType } from '../pricing';

export const FIELD_LIMITS = { town: 100, name: 100, email: 254, phone: 30, notes: 2000 } as const;

export type Registration = {
  origin: string;
  destination: string;
  bikeType: BikeType;
  timeframeType: 'week' | 'interval';
  week: string;
  startDate: string;
  endDate: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
};
export type RegistrationField = keyof Registration;
export type FieldErrors = Partial<Record<RegistrationField, string>>;

const controls = /[\u0000-\u001f\u007f]/;
const townPattern = /^[\p{L}\p{M}][\p{L}\p{M} .’'()-]*$/u;
export function validTown(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    value.trim().length >= 2 &&
    value.length <= FIELD_LIMITS.town &&
    townPattern.test(value.trim())
  );
}

/** Extract a town from the calculator's usual Finnish formatted address. */
export function townFromAddress(value: unknown): string {
  if (typeof value !== 'string' || value.length > 300 || controls.test(value)) return '';
  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (/^(suomi|finland)$/i.test(parts.at(-1) ?? '')) parts.pop();
  const last = parts.at(-1) ?? '';
  const town = last.replace(/^\d{5}\s+/, '');
  if (validTown(town)) return town;
  const streetTown = town.match(/\d+\s*[a-z]?\s+([\p{L}\p{M} .’'()-]+)$/iu)?.[1] ?? '';
  return validTown(streetTown) ? streetTown.trim() : '';
}

export function prefillFromParams(params: { getAll(name: string): string[] }) {
  const one = (key: string) => {
    const values = params.getAll(key);
    return values.length === 1 ? values[0] : '';
  };
  const bikeType = one('bikeType');
  return {
    origin: townFromAddress(one('origin')),
    destination: townFromAddress(one('destination')),
    bikeType: isBikeType(bikeType) ? bikeType : ('standard' as BikeType),
  };
}

function isoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
}

export function weekDates(value: string): { start: Date; end: Date } | null {
  const match = /^(\d{4})-W(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]),
    week = Number(match[2]);
  if (year < 2000 || year > 2100 || week < 1 || week > 53) return null;
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const start = new Date(
    jan4.getTime() - ((jan4.getUTCDay() + 6) % 7) * 86400000 + (week - 1) * 7 * 86400000,
  );
  const thursday = new Date(start.getTime() + 3 * 86400000);
  if (thursday.getUTCFullYear() !== year) return null;
  return { start, end: new Date(start.getTime() + 6 * 86400000) };
}

export function todayInFinland(now = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Helsinki' }).format(now);
}

export function validateRegistration(
  input: unknown,
  now = new Date(),
): { data: Registration; errors?: never } | { data?: never; errors: FieldErrors } {
  const raw =
    input && typeof input === 'object' && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  const errors: FieldErrors = {};
  const read = (key: RegistrationField, max: number, required = true, multiline = false) => {
    const value = raw[key];
    if (typeof value !== 'string') {
      if (required || value !== undefined) errors[key] = 'Tarkista kentän arvo.';
      return '';
    }
    const cleaned = value.trim().normalize('NFC');
    if (
      (required && !cleaned) ||
      value.length > max ||
      (multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/ : controls).test(value)
    )
      errors[key] = `Täytä kenttä (enintään ${max} merkkiä).`;
    return cleaned;
  };
  const origin = read('origin', FIELD_LIMITS.town),
    destination = read('destination', FIELD_LIMITS.town);
  if (!validTown(origin)) errors.origin = 'Kirjoita lähtöpaikkakunnan nimi.';
  if (!validTown(destination)) errors.destination = 'Kirjoita määränpään paikkakunta.';
  if (origin && origin.toLocaleLowerCase('fi') === destination.toLocaleLowerCase('fi'))
    errors.destination = 'Lähtöpaikka ja määränpää ovat samat.';
  const name = read('name', FIELD_LIMITS.name);
  if (name.length < 2) errors.name = 'Kirjoita nimesi.';
  const email = read('email', FIELD_LIMITS.email).toLowerCase();
  if (!/^[^\s@<>(),:;\\"]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,63}$/i.test(email))
    errors.email = 'Tarkista sähköpostiosoite.';
  const phone = read('phone', FIELD_LIMITS.phone);
  if (
    !/^\+?[\d ()-]+$/.test(phone) ||
    phone.replace(/\D/g, '').length < 6 ||
    phone.replace(/\D/g, '').length > 15
  )
    errors.phone = 'Tarkista puhelinnumero.';
  const notes = read('notes', FIELD_LIMITS.notes, false, true);
  if (!isBikeType(raw.bikeType)) errors.bikeType = 'Valitse pyörätyyppi.';
  const timeframeType = raw.timeframeType === 'interval' ? 'interval' : 'week';
  if (raw.timeframeType !== 'week' && raw.timeframeType !== 'interval')
    errors.timeframeType = 'Valitse viikko tai aikaväli.';
  const week = timeframeType === 'week' ? read('week', 8) : '';
  const startDate = timeframeType === 'interval' ? read('startDate', 10) : '';
  const endDate = timeframeType === 'interval' ? read('endDate', 10) : '';
  const today = isoDate(todayInFinland(now))!;
  const latest = new Date(today);
  latest.setUTCFullYear(latest.getUTCFullYear() + 2);
  if (timeframeType === 'week') {
    const dates = weekDates(week);
    if (!dates || dates.end < today || dates.start > latest)
      errors.week = 'Valitse nykyinen tai tuleva viikko seuraavan kahden vuoden ajalta.';
  } else {
    const start = isoDate(startDate),
      end = isoDate(endDate);
    if (!start || start < today || start > latest)
      errors.startDate = 'Valitse tuleva aloituspäivä seuraavan kahden vuoden ajalta.';
    if (
      !end ||
      !start ||
      end < start ||
      end > latest ||
      end.getTime() - start.getTime() > 90 * 86400000
    )
      errors.endDate = 'Valitse loppupäivä aloituspäivän jälkeen (aikaväli enintään 90 päivää).';
  }
  if (Object.keys(errors).length) return { errors };
  return {
    data: {
      origin,
      destination,
      bikeType: raw.bikeType as BikeType,
      timeframeType,
      week,
      startDate,
      endDate,
      name,
      email,
      phone,
      notes,
    },
  };
}

export function timeframeLabel(data: Registration) {
  return data.timeframeType === 'week'
    ? `Viikko ${data.week.slice(6)}/${data.week.slice(0, 4)}`
    : `${data.startDate.split('-').reverse().join('.')}–${data.endDate.split('-').reverse().join('.')}`;
}
