import { clientRateKey, createFormToken } from '@/lib/group-transport/security';

/** Issues a short-lived anti-spam token. Never reads customer data. */
export async function GET(request: Request) {
  try {
    return Response.json(
      { token: createFormToken(clientRateKey(request)) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return Response.json(
      { error: 'Ilmoituspalvelu ei ole juuri nyt käytettävissä.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
