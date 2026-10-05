'use client';

import Link from 'next/link';
import { PRICING, startingPrice, eurShort } from '@/lib/pricing';

export default function Features() {
  const features = [
    {
      icon: '🔗',
      title: 'Ammattimainen sidonta',
      desc: 'Liinoilla ja pehmusteilla – ei naarmuja, ei liikkumista.',
    },
    {
      icon: '🛡️',
      title: 'Vakuutettu kuljetus',
      desc: 'Kuljetus on vakuutettu lastauksen ja matkan ajaksi.',
    },
    {
      icon: '🗺️',
      title: 'Suomi & Eurooppa',
      desc: 'Toimipiste Riihimäellä, kuljetuksia kaikkialle Suomeen ja Eurooppaan.',
    },
    {
      icon: '⚡',
      title: 'Nopea aikataulu',
      desc: 'Kuljetus usein jo samana tai seuraavana päivänä.',
    },
    {
      icon: '📦',
      title: 'Ford Transit L3H2',
      desc: 'Mahtuu isommatkin pyörät ja skootterit vaivatta.',
    },
    {
      icon: '🔄',
      title: 'Yhteiskuljetukset – ilmoita ennakkoon, maksa vähemmän',
      desc: 'Joustava aikataulu mahdollistaa kuljetusten yhdistämisen. Toteutuminen ja hinta vahvistetaan erikseen.',
      href: '/yhteiskuljetus',
    },
  ];

  return (
    <section
      id="palvelut"
      style={{
        background: 'transparent',
        padding: '2.5rem 1.5rem 2rem',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p
            style={{
              fontFamily: 'var(--font-barlow)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--orange)',
              marginBottom: '0.35rem',
            }}
          >
            Palvelut
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontWeight: 800,
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              margin: '0 0 0.4rem',
            }}
          >
            Miksi valita MP-Logistiikka?
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-barlow)',
              color: 'var(--muted)',
              fontSize: '0.9rem',
              margin: 0,
            }}
          >
            Sujuva palvelu ammattitaidolla.
          </p>
        </div>

        {/* Feature grid – 3 cols desktop, 2 tablet, 1 mobile */}
        <div className="features-grid">
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1rem 1.25rem',
                transition: 'border-color 0.2s, transform 0.2s',
                position: 'relative',
              }}
              onMouseOver={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = 'rgba(232,93,26,0.3)';
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = 'var(--border)';
                el.style.transform = 'none';
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{f.icon}</div>
              <h3
                style={{
                  fontFamily: 'var(--font-barlow-condensed)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  margin: '0 0 0.3rem',
                  color: 'var(--text)',
                }}
              >
                {f.href ? (
                  <Link href={f.href} className="feature-card-link">
                    {f.title}
                  </Link>
                ) : (
                  f.title
                )}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-barlow)',
                  color: 'var(--muted)',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bike types */}
        <div
          style={{
            padding: '1.5rem',
            background: 'transparent',
            borderRadius: '8px',
            border: '1px solid var(--border)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontWeight: 800,
              fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              margin: '0 0 0.875rem',
            }}
          >
            Pyörätyypit ja hinnat
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {[
              {
                type: 'Mopo / Skootteri',
                price: `alkaen ${eurShort(startingPrice('scooter'))} €`,
                desc: `Mopot ja skootterit · −${eurShort(Math.abs(PRICING.TYPE_EXTRA.scooter))} € peruspyörän hinnasta`,
              },
              {
                type: 'Perus / Vakio',
                price: `alkaen ${eurShort(startingPrice('standard'))} €`,
                desc: 'Tavallinen moottoripyörä',
                highlight: true,
              },
              {
                type: 'Iso / Strike',
                price: `alkaen ${eurShort(startingPrice('large'))} €`,
                desc: `≥ 250 kg tai ≥ 1 000 cm³ · +${eurShort(PRICING.TYPE_EXTRA.large)} € peruspyörän hintaan`,
              },
            ].map((b) => (
              <div
                key={b.type}
                style={{
                  background: 'transparent',
                  border: `1px solid ${b.highlight ? 'rgba(232,93,26,0.3)' : 'var(--border)'}`,
                  borderRadius: '6px',
                  padding: '0.875rem 1rem',
                  position: 'relative',
                }}
              >
                {/* Oranssi viiva poistettu */}
                <p
                  style={{
                    fontFamily: 'var(--font-barlow-condensed)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    color: 'var(--text)',
                    margin: '0 0 0.2rem',
                  }}
                >
                  {b.type}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-barlow)',
                    color: 'var(--muted)',
                    fontSize: '0.78rem',
                    margin: '0 0 0.5rem',
                  }}
                >
                  {b.desc}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-barlow-condensed)',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    color: 'var(--orange)',
                    margin: 0,
                  }}
                >
                  {b.price}
                </p>
              </div>
            ))}
          </div>
          <p
            style={{
              fontFamily: 'var(--font-barlow)',
              color: 'var(--muted)',
              fontSize: '0.75rem',
              margin: '0.75rem 0 0',
            }}
          >
            <Link href="/hinnasto#hinnasto-tarkemmin" style={{ color: 'var(--orange)' }}>
              Tarkka hinnasto ja esimerkkihinnat →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
