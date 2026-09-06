import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { stegaClean } from 'next-sanity';

import { urlFor } from '@/sanity/lib/image';
import { sanityFetch } from '@/sanity/lib/live';
import { POSTS_QUERY } from '@/sanity/lib/queries';

export const metadata: Metadata = {
  title: 'Kuljetustieto | MP-Logistiikka',
  description:
    'Kuljetustieto kokoaa yhteen hinnoittelun sekä vinkit ja uutiset moottoripyörien kuljetuksesta, säilytyksestä ja kausihuollosta.',
  alternates: { canonical: 'https://www.mp-logistiikka.fi/kuljetustieto' },
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

export default async function KuljetustietoPage() {
  const { data: posts } = await sanityFetch({ query: POSTS_QUERY });

  return (
    <div className="blog-scroll">
      <section className="blog-page" aria-labelledby="kuljetustieto-title">
        <p className="blog-eyebrow">Kuljetustieto</p>
        <h1 id="kuljetustieto-title" className="blog-title">
          Tietoa kuljetuksista
        </h1>
        <p className="blog-lead">
          Täältä löydät kuljetuksen hinnoittelun sekä vinkit ja uutiset moottoripyörien
          kuljetuksesta, säilytyksestä ja kausihuollosta.
        </p>

        <Link href="/kuljetustieto/hinnoittelu" className="info-card">
          <p className="info-card-eyebrow">Hinnoittelu</p>
          <h2 className="info-card-title">Näin kuljetuksen hinta muodostuu</h2>
          <p className="info-card-text">
            Läpinäkyvä lauttamaksu varustamon hinnaston mukaan sekä itse kuljetuspalvelu. Katso
            ajoneuvokohtaiset lauttahinnat reiteittäin.
          </p>
          <span className="info-card-cta">Katso hinnoittelu →</span>
        </Link>

        <h2 id="articles-title" className="blog-section-title">
          Ajankohtaista
        </h2>

        {posts.length === 0 ? (
          <p className="blog-empty">
            Ei vielä julkaistuja artikkeleita. Kirjoita ensimmäinen Sanity Studiossa.
          </p>
        ) : (
          <ul className="blog-grid" aria-labelledby="articles-title">
            {posts.map((post) => (
              <li key={post._id} className="blog-card">
                <Link href={`/kuljetustieto/${post.slug}`} className="blog-card-link">
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
                    <h3 className="blog-card-title">{post.title}</h3>
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
