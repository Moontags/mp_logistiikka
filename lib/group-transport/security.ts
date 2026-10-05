import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { isIP } from 'node:net';

export function sameOrigin(request: Request) {
  return (
    request.headers.get('origin') === new URL(request.url).origin &&
    request.headers.get('sec-fetch-site') !== 'cross-site'
  );
}

// Lightweight per-instance protection, not a persistent or global rate limit.
// Keep only salted IP digests and counters, never form/contact data.
const salt = randomBytes(32);
export function clientRateKey(request: Request) {
  const ip =
    process.env.VERCEL === '1'
      ? request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      : '127.0.0.1';
  if (!ip || !isIP(ip)) throw new Error('Trusted client IP unavailable');
  return createHash('sha256').update(salt).update(ip).digest('hex');
}

export function createRateLimiter() {
  const attempts = new Map<string, { count: number; expires: number }>();
  return (key: string, now = Date.now()) => {
    for (const [id, entry] of attempts) if (entry.expires <= now) attempts.delete(id);
    const entry = attempts.get(key);
    if (entry) {
      if (entry.count >= 8) return false;
      entry.count += 1;
    } else {
      if (attempts.size >= 10000) return false;
      attempts.set(key, { count: 1, expires: now + 3600000 });
    }
    return true;
  };
}
export const allowSubmission = createRateLimiter();
