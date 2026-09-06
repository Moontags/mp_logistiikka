import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

/**
 * On-demand ISR for the blog.
 *
 * Configure a GROQ-powered webhook in Sanity Manage:
 *   URL        https://www.mp-logistiikka.fi/api/revalidate
 *   Trigger    Create, Update, Delete
 *   Filter     _type in ["post", "author", "category"]
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

    // The listing and the sitemap change for every content type the webhook watches.
    const revalidated = ['/blogi', '/sitemap.xml'];
    revalidated.forEach((path) => revalidatePath(path));

    if (body._type === 'post' && body.slug && SLUG_PATTERN.test(body.slug)) {
      const path = `/blogi/${body.slug}`;
      revalidatePath(path);
      revalidated.push(path);
    } else {
      // A deleted post (no slug in the projection) or an author/category edit that is
      // rendered on every post page — refresh all of them.
      revalidatePath('/blogi/[slug]', 'page');
      revalidated.push('/blogi/[slug]');
    }

    return NextResponse.json({ revalidated, now: Date.now() });
  } catch (err) {
    return new Response((err as Error).message, { status: 500 });
  }
}
