import { defineQuery } from 'next-sanity';

const postCard = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  mainImage,
  "author": author->{_id, name},
  "categories": categories[]->{_id, title, "slug": slug.current}
`;

export const POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)]
  | order(publishedAt desc) {
    ${postCard}
  }
`);

export const POST_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0]{
    ${postCard},
    body[]{
      ...,
      _type == "block" => { markDefs[]{ ..., _type == "link" => { href } } },
      _type == "contentImage" => { asset, hotspot, crop, alt, caption }
    }
  }
`);

export const POST_SEO_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0]{
    title,
    excerpt,
    publishedAt,
    mainImage
  }
`);

export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)]{ "slug": slug.current }
`);

/**
 * Ferry routes shown on /lauttahinnat.
 * Deliberately omits validFrom/validUntil and usedByFinishpoint — internal only.
 */
export const MP_FERRY_ROUTES_QUERY = defineQuery(`
  *[_type == "ferryRoute" && usedByMpLogistiikka == true]
  | order(routeName asc) {
    _id,
    routeName,
    operator,
    crossingDurationHours,
    vehiclePricing[]{
      _key,
      vehicleType,
      direction,
      priceEur,
      includesCabin,
      notes
    }
  }
`);

export const POSTS_SITEMAP_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)]
  | order(publishedAt desc) {
    "slug": slug.current,
    _updatedAt
  }
`);
