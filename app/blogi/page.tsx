import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { stegaClean } from 'next-sanity';

import { urlFor } from '@/sanity/lib/image';
import { sanityFetch } from '@/sanity/lib/live';
import { POSTS_QUERY } from '@/sanity/lib/queries';

export const metadata: Metadata = {
  title: 'Blogi | MP-Logistiikka',
  description:
    'Vinkkejä ja uutisia moottoripyörien kuljetuksesta, säilytyksestä ja kausihuollosta. MP-Logistiikan blogi.',
  alternates: { canonical: 'https://www.mp-logistiikka.fi/blogi' },
  robots: { index: true, follow: true },
};

function formatDate(value?: string | null) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('fi-FI', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogiPage() {
  const { data: posts } = await sanityFetch({ query: POSTS_QUERY });

  return (
    <div className="blog-scroll">
      <section className="blog-page" aria-labelledby="blog-title">
        <p className="blog-eyebrow">Blogi</p>
        <h1 id="blog-title" className="blog-title">
          Ajankohtaista
        </h1>
        <p className="blog-lead">
          Vinkkejä ja uutisia moottoripyörien kuljetuksesta, säilytyksestä ja kausihuollosta.
        </p>

        {posts.length === 0 ? (
          <p className="blog-empty">
            Ei vielä julkaistuja artikkeleita. Kirjoita ensimmäinen Sanity Studiossa.
          </p>
        ) : (
          <ul className="blog-grid">
            {posts.map((post) => (
              <li key={post._id} className="blog-card">
                <Link href={`/blogi/${post.slug}`} className="blog-card-link">
                  {post.mainImage?.asset?._ref && (
                    <Image
                      src={urlFor(post.mainImage).width(800).height(450).url()}
                      alt={stegaClean(post.mainImage.alt) ?? ''}
                      width={800}
                      height={450}
                      sizes="(max-width: 767px) 100vw, 360px"
                      className="blog-card-img"
                    />
                  )}
                  <div className="blog-card-body">
                    <p className="blog-card-meta">
                      {formatDate(post.publishedAt)}
                      {post.author?.name ? ` · ${post.author.name}` : ''}
                    </p>
                    <h2 className="blog-card-title">{post.title}</h2>
                    {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
