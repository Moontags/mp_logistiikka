import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { stegaClean, type PortableTextBlock } from 'next-sanity';

import PostBody from '@/components/PostBody';
import { urlFor } from '@/sanity/lib/image';
import { sanityFetch } from '@/sanity/lib/live';
import { POST_QUERY, POST_SEO_QUERY, POST_SLUGS_QUERY } from '@/sanity/lib/queries';

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: POST_SLUGS_QUERY,
    perspective: 'published',
    stega: false,
  });

  return data.filter((entry) => entry.slug).map((entry) => ({ slug: entry.slug! }));
}

export async function generateMetadata(props: PageProps<'/blogi/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const { data: post } = await sanityFetch({
    query: POST_SEO_QUERY,
    params: { slug },
    stega: false,
  });

  if (!post) return {};

  const url = `https://mp-logistiikka.fi/blogi/${slug}`;
  const ogImage = post.mainImage?.asset?._ref
    ? urlFor(post.mainImage).width(1200).height(630).url()
    : undefined;

  return {
    title: `${post.title} | MP-Logistiikka`,
    description: post.excerpt ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      title: post.title ?? undefined,
      description: post.excerpt ?? undefined,
      url,
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
  };
}

function formatDate(value?: string | null) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('fi-FI', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPostPage(props: PageProps<'/blogi/[slug]'>) {
  const { slug } = await props.params;
  const { data: post } = await sanityFetch({ query: POST_QUERY, params: { slug } });

  if (!post) notFound();

  return (
    <div className="blog-scroll">
      <article className="blog-article">
        <Link href="/blogi" className="blog-back">
          ← Takaisin blogiin
        </Link>

        <p className="blog-card-meta">
          {formatDate(post.publishedAt)}
          {post.author?.name ? ` · ${post.author.name}` : ''}
        </p>
        <h1 className="blog-title">{post.title}</h1>
        {post.excerpt && <p className="blog-lead">{post.excerpt}</p>}

        {post.categories && post.categories.length > 0 && (
          <ul className="blog-tags">
            {post.categories.map((cat) => (
              <li key={cat._id} className="blog-tag">
                {cat.title}
              </li>
            ))}
          </ul>
        )}

        {post.mainImage?.asset?._ref && (
          <Image
            src={urlFor(post.mainImage).width(1200).height(675).url()}
            alt={stegaClean(post.mainImage.alt) ?? ''}
            width={1200}
            height={675}
            priority
            sizes="(max-width: 767px) 100vw, 860px"
            className="blog-hero-img"
          />
        )}

        <div className="blog-body">
          <PostBody value={(post.body ?? []) as PortableTextBlock[]} />
        </div>
      </article>
    </div>
  );
}
