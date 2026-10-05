import { validateRegistration } from '@/lib/group-transport/validation';
import { clientRateKey, sameOrigin, allowSubmission } from '@/lib/group-transport/security';
import { sendGroupTransportEmail } from '@/lib/email';
import { randomUUID } from 'node:crypto';
import { readSubmission } from '@/lib/group-transport/request';

function response(data: object, status: number, headers?: Record<string, string>) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return response({ error: 'Virheellinen lähetyksen alkuperä.' }, 403);
  let body: Record<string, unknown>;
  try {
    const input = await readSubmission(request);
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('json');
    body = input as Record<string, unknown>;
  } catch (error) {
    return response(
      { error: 'Virheellinen lomakepyyntö.' },
      error instanceof RangeError ? 413 : 400,
    );
  }
  if (typeof body.website !== 'string' || body.website !== '')
    return response({ error: 'Lähetys hylättiin.' }, 400);
  const validated = validateRegistration(body);
  if (validated.errors)
    return response({ error: 'Tarkista lomakkeen tiedot.', fields: validated.errors }, 400);
  try {
    const rateKey = clientRateKey(request);
    if (!allowSubmission(rateKey))
      return response(
        { error: 'Liian monta lähetysyritystä. Yritä myöhemmin tai soita 050 354 7763.' },
        429,
        { 'Retry-After': '3600' },
      );
    await sendGroupTransportEmail(validated.data, randomUUID());
    return response({ success: true }, 200);
  } catch (error) {
    const smtp = error as { responseCode?: number; code?: string } | null;
    const rejected = typeof smtp?.responseCode === 'number' && smtp.responseCode >= 400;
    // Nodemailer may label a lost DATA acknowledgement as a CONN error too.
    // Only definite rejection/auth/DNS errors are safe to suggest retrying.
    const beforeMessage = ['EDNS', 'EAUTH'].includes(smtp?.code ?? '');
    console.error('[yhteiskuljetus] SMTP submission failed');
    return response(
      {
        error:
          rejected || beforeMessage
            ? 'Ilmoituksen lähetys epäonnistui. Yritä uudelleen tai soita 050 354 7763.'
            : 'Lähetyksen onnistumista ei voitu varmistaa. Soita 050 354 7763 ennen uudelleenlähetystä.',
      },
      503,
    );
  }
}
