import Image from 'next/image';
import Link from 'next/link';
import {
  PortableText,
  stegaClean,
  type PortableTextComponents,
  type PortableTextBlock,
} from 'next-sanity';

import { urlFor } from '@/sanity/lib/image';

type ContentImageValue = {
  asset?: { _ref?: string };
  alt?: string;
  caption?: string;
};

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="blog-p">{children}</p>,
    h2: ({ children }) => <h2 className="blog-h2">{children}</h2>,
    h3: ({ children }) => <h3 className="blog-h3">{children}</h3>,
    blockquote: ({ children }) => <blockquote className="blog-quote">{children}</blockquote>,
  },

  list: {
    bullet: ({ children }) => <ul className="blog-list">{children}</ul>,
    number: ({ children }) => <ol className="blog-list">{children}</ol>,
  },

  marks: {
    link: ({ children, value }) => {
      const href = stegaClean(value?.href) ?? '';
      if (href.startsWith('/')) {
        return (
          <Link href={href} className="blog-link">
            {children}
          </Link>
        );
      }
      return (
        <a href={href} className="blog-link" rel="noopener noreferrer" target="_blank">
          {children}
        </a>
      );
    },
  },

  types: {
    contentImage: ({ value }: { value: ContentImageValue }) => {
      if (!value?.asset?._ref) return null;
      return (
        <figure className="blog-figure">
          <Image
            src={urlFor(value).width(1200).url()}
            alt={stegaClean(value.alt) ?? ''}
            width={1200}
            height={800}
            sizes="(max-width: 767px) 100vw, 800px"
            className="blog-figure-img"
          />
          {value.caption && <figcaption className="blog-caption">{value.caption}</figcaption>}
        </figure>
      );
    },
  },
};

export default function PostBody({ value }: { value: PortableTextBlock[] }) {
  if (!Array.isArray(value) || value.length === 0) return null;
  return <PortableText value={value} components={components} />;
}
