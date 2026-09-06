import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

/**
 * On-demand ISR for Sanity-driven pages (blog + ferry pricing).
 *
 * Configure a GROQ-powered webhook in Sanity Manage:
 *   URL        https://www.mp-logistiikka.fi/api/revalidate
 *   Trigger    Create, Update, Delete
 *   Filter     _type in ["post", "author", "category", "ferryRoute"]
 *   Projection {"_type": _type, "slug": slug.current}
 *   Secret     same value as SANITY_REVALIDATE_SECRET
 */
type WebhookPayload = {
  _type?: string;
  slug?: string;
};

/** Matches the slug validation in the Studio schema. */
const SLUG_PATTERN = /^[a-z0-9-]+$/;

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    return new Response('Missing SANITY_REVALIDATE_SECRET', { status: 500 });
  }

  try {
    // `true` waits for Content Lake eventual consistency, so the refetch is not stale.
    const { isValidSignature, body } = await parseBody<WebhookPayload>(req, secret, true);

    if (!isValidSignature) {
      return new Response('Invalid signature', { status: 401 });
    }

    if (!body?._type) {
      return new Response('Missing _type in webhook projection', { status: 400 });
    }

    const revalidated: string[] = [];
    const touch = (path: string, type?: 'page' | 'layout') => {
      revalidatePath(path, type);
      revalidated.push(path);
    };

    if (body._type === 'ferryRoute') {
      // Ferry routes only feed the pricing page; they have no per-route URL.
      touch('/kuljetustieto/hinnoittelu');
    } else {
      // The listing and the sitemap change for every blog-related type.
      touch('/kuljetustieto');
      touch('/sitemap.xml');

      if (body._type === 'post' && body.slug && SLUG_PATTERN.test(body.slug)) {
        touch(`/kuljetustieto/${body.slug}`);
      } else {
        // A deleted post (no slug in the projection) or an author/category edit that is
        // rendered on every post page — refresh all of them.
        touch('/kuljetustieto/[slug]', 'page');
      }
    }

    return NextResponse.json({ revalidated, now: Date.now() });
  } catch (err) {
    return new Response((err as Error).message, { status: 500 });
  }
}
