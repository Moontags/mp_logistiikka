import 'server-only';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';

export function hashValue(value: string) {
  const secret = process.env.GROUP_TRANSPORT_HASH_SECRET;
  if (!secret || secret.length < 32) throw new Error('GROUP_TRANSPORT_HASH_SECRET missing');
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function clientRateKey(request: Request) {
  // Vercel overwrites this header. Never trust arbitrary proxy headers off Vercel.
  const ip =
    process.env.VERCEL === '1'
      ? request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      : '127.0.0.1';
  if (!ip || !isIP(ip)) throw new Error('Trusted client IP unavailable');
  return hashValue(`ip:${ip}`);
}

export function sameOrigin(request: Request) {
  return (
    request.headers.get('origin') === new URL(request.url).origin &&
    request.headers.get('sec-fetch-site') !== 'cross-site'
  );
}

export function createFormToken(rateKey: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ time: now, nonce: randomUUID(), rateKey })).toString(
    'base64url',
  );
  return `${payload}.${hashValue(`form:${payload}`)}`;
}

export function verifyFormToken(token: unknown, rateKey: string, now = Date.now()): boolean {
  if (typeof token !== 'string' || token.length > 512) return false;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra || !/^[a-f0-9]{64}$/.test(signature)) return false;
  const expected = hashValue(`form:${payload}`);
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    const age = now - data.time;
    return (
      typeof data.time === 'number' &&
      age >= 2000 &&
      age <= 60 * 60 * 1000 &&
      data.rateKey === rateKey
    );
  } catch {
    return false;
  }
}
