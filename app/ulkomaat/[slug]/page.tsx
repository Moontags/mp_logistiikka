import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPost, posts } from '@/content/ulkomaat';

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: PageProps<'/ulkomaat/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPost(slug);

  if (!post) return {};

  const url = `https://www.mp-logistiikka.fi/ulkomaat/${slug}`;
  const ogImage = post.mainImage?.og;

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

export default async function BlogPostPage(props: PageProps<'/ulkomaat/[slug]'>) {
  const { slug } = await props.params;
  const post = getPost(slug);

  if (!post) notFound();

  return (
    <div className="blog-scroll">
      <article className="blog-article">
        <Link href="/ulkomaat" className="blog-back">
          ← Takaisin Ulkomaat-sivulle
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
              <li key={cat.id} className="blog-tag">
                {cat.title}
              </li>
            ))}
          </ul>
        )}

        {post.mainImage?.hero && (
          <Image
            src={post.mainImage.hero}
            alt={post.mainImage.alt ?? ''}
            width={1200}
            height={675}
            preload
            sizes="(max-width: 767px) 100vw, 860px"
            className="blog-hero-img"
          />
        )}

        <div className="blog-body">
          <post.Body />
        </div>
      </article>
    </div>
  );
}
