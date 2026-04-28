import type { Metadata } from 'next';
import { Barlow_Condensed, Barlow } from 'next/font/google';
import Script from 'next/script';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import './globals.css';

const barlowCondensed = Barlow_Condensed({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

const barlow = Barlow({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-barlow',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Moottoripyöräkuljetukset ja -siirrot koko Suomeen | MP-Logistiikka',
  description:
    'Turvallinen ja vakuutettu moottoripyörän kuljetus ovelta ovelle. Pyydä tarjous tai laske hinta siirrolle heti. Palvelemme alueilla Helsinki, Tampere, Hämeenlinna, Lahti ja koko Suomessa.',
  keywords:
    'moottoripyöräkuljetus, moottoripyörän siirto hinta, mp kuljetus, mp noutopalvelu, ajoneuvokuljetus, Riihimäki, Helsinki, Tampere, Lahti, Mikkeli, moottoripyörän hinauskuljetus',
  authors: [{ name: 'MP-Logistiikka' }],
  metadataBase: new URL('https://mp-logistiikka.fi'),
  openGraph: {
    title: 'MP-Logistiikka – Turvalliset moottoripyöräsiirrot ympäri Suomen',
    description: 'Vakuutettu ja luotettava moottoripyöräkuljetus. Katso hinta ja tilaa siirto!',
    url: 'https://mp-logistiikka.fi',
    siteName: 'MP-Logistiikka',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    locale: 'fi_FI',
    type: 'website',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://mp-logistiikka.fi' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fi"
      className={`${barlowCondensed.variable} ${barlow.variable}`}
    >
      <head>
        <link rel="preload" href="/images/bike.jpg" as="image" type="image/jpeg" />
      </head>
      <body className="page-body">
        <Nav />
        <div className="page-wrapper">
          <main className="page-main">
            {children}
          </main>
          <Footer />
        </div>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=fi&region=FI&loading=async`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
