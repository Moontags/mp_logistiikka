import { validateRegistration } from '@/lib/group-transport/validation';
import { clientRateKey, sameOrigin, verifyFormToken } from '@/lib/group-transport/security';
import { acceptRegistration, RegistrationError } from '@/lib/group-transport/service';
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
  if (
    typeof body.submissionId !== 'string' ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
      body.submissionId,
    )
  )
    return response({ error: 'Virheellinen lähetyksen tunniste.' }, 400);
  const validated = validateRegistration(body);
  if (validated.errors)
    return response({ error: 'Tarkista lomakkeen tiedot.', fields: validated.errors }, 400);
  try {
    const rateKey = clientRateKey(request);
    if (!verifyFormToken(body.formToken, rateKey))
      return response(
        {
          error: 'Lomakkeen suojaus vanheni. Odota hetki ja lähetä uudelleen.',
          refreshToken: true,
        },
        403,
      );
    const saved = await acceptRegistration(body.submissionId, validated.data, rateKey);
    return response({ success: true }, saved.created ? 201 : 200);
  } catch (error) {
    const status = error instanceof RegistrationError ? error.status : 503;
    if (status === 429)
      return response(
        { error: 'Liian monta lähetysyritystä. Yritä myöhemmin tai ota yhteyttä puhelimitse.' },
        429,
        { 'Retry-After': '3600' },
      );
    if (status === 409)
      return response(
        { error: 'Lähetyksen tunniste on jo käytetty. Päivitä sivu ja yritä uudelleen.' },
        409,
      );
    console.error('[yhteiskuljetus] Storage unavailable');
    return response(
      {
        error: 'Ilmoituksen tallennus ei onnistunut. Yritä uudelleen tai ota yhteyttä puhelimitse.',
      },
      503,
    );
  }
}
