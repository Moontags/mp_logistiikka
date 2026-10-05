import type { ComponentType } from 'react';
import type { PricingEntry } from '@/lib/ferryPricing';
import kuljetushinta from './articles/kuljetushinta.json';
import KuljetushintaBody from './articles/kuljetushinta';
import routes from './ferry-routes.json';

export type LocalImage = {
  alt: string;
  card: string;
  hero?: string;
  og?: string;
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  mainImage: LocalImage | null;
  author: { name: string } | null;
  categories: { id: string; title: string }[];
  Body: ComponentType;
};

export const posts: Article[] = [{ ...kuljetushinta, Body: KuljetushintaBody }].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
);

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export const ferryRoutes: {
  id: string;
  routeName: string;
  operator: string;
  crossingDurationHours: number;
  image: LocalImage | null;
  vehiclePricing: PricingEntry[];
}[] = routes;
