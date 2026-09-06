import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**' }],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 768, 1024, 1280, 1920],
    imageSizes: [64, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // `permanent: true` emits 308 — the method-preserving equivalent of a 301, treated the
  // same way by search engines.
  async redirects() {
    return [
      { source: '/blogi', destination: '/kuljetustieto', permanent: true },
      { source: '/blogi/:slug*', destination: '/kuljetustieto/:slug*', permanent: true },
      { source: '/lauttahinnat', destination: '/kuljetustieto/hinnoittelu', permanent: true },
    ];
  },
};

export default nextConfig;
