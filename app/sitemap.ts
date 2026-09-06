import type { MetadataRoute } from 'next';

import { client } from '@/sanity/lib/client';
import { POSTS_SITEMAP_QUERY } from '@/sanity/lib/queries';

const BASE_URL = 'https://www.mp-logistiikka.fi';

const staticRoutes: MetadataRoute.Sitemap = [
  { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
  { url: `${BASE_URL}/hinnasto`, changeFrequency: 'monthly', priority: 0.9 },
  { url: `${BASE_URL}/tilauslomake`, changeFrequency: 'monthly', priority: 0.9 },
  { url: `${BASE_URL}/palvelut`, changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/blogi`, changeFrequency: 'weekly', priority: 0.7 },
  { url: `${BASE_URL}/kuvat`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/yhteystiedot`, changeFrequency: 'yearly', priority: 0.6 },
  { url: `${BASE_URL}/sopimusehdot`, changeFrequency: 'yearly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await client.fetch(
    POSTS_SITEMAP_QUERY,
    {},
    { perspective: 'published', stega: false }
  );

  const postRoutes: MetadataRoute.Sitemap = posts
    .filter((post) => post.slug)
    .map((post) => ({
      url: `${BASE_URL}/blogi/${post.slug}`,
      lastModified: new Date(post._updatedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  return [...staticRoutes, ...postRoutes];
}
