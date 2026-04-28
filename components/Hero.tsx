'use client';

export default function Hero() {
  return (
    <section id="top" className="hero-section">
      {/* Directional gradient overlay for text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background:
            'linear-gradient(to right, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.3) 50%, rgba(10,10,10,0.0) 100%)',
        }}
      />

      {/* Content */}
      <div className="hero-content">
        <div style={{ maxWidth: '680px', paddingTop: '4rem' }}>
          {/* ...badge removed... */}

          {/* Heading */}
          <h1
            style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontWeight: 800,
              fontSize: 'clamp(1.8rem, 9vw, 7rem)',
              lineHeight: 1.0,
              letterSpacing: '-0.01em',
              color: 'var(--text)',
              margin: '0 0 1.5rem',
              textTransform: 'uppercase',
              overflowWrap: 'break-word',
            }}
          >
            Turvalliset<br />
            Moottoripyörä
            <span style={{ color: 'var(--orange)' }}>siirrot</span>
          </h1>

          {/* Sub */}
          <p
            style={{
              fontFamily: 'var(--font-barlow)',
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: 'var(--muted)',
              marginBottom: '2.5rem',
              lineHeight: 1.65,
              maxWidth: '520px',
            }}
          >
            Luotettava ja vakuutettu moottoripyöräkuljetus ympäri Suomea. Kuljetuspalvelua 20 v kokemuksella.
            Sidonta ammattilaisen käsissä, ei naarmuja, ei harmeja..
          </p>

          {/* CTA buttons */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '3rem',
            }}
          >
            <a
              href="/hinnasto"
              style={{
                background: 'var(--orange)',
                color: '#fff',
                padding: '0.875rem 2rem',
                borderRadius: '4px',
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 700,
                fontSize: '1.1rem',
                letterSpacing: '0.06em',
                textDecoration: 'none',
                textTransform: 'uppercase',
                transition: 'background 0.2s, transform 0.15s',
                display: 'inline-block',
                minHeight: '44px',
                minWidth: '44px',
              }}
              onMouseOver={(e) => {
                const el = e.currentTarget;
                el.style.background = 'var(--orange-light)';
                el.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                const el = e.currentTarget;
                el.style.background = 'var(--orange)';
                el.style.transform = 'none';
              }}
            >
              Laske hinta ↓
            </a>
            <a
              href="/yhteystiedot"
              style={{
                background: 'transparent',
                color: 'var(--text)',
                padding: '0.875rem 2rem',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.25)',
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 700,
                fontSize: '1.1rem',
                letterSpacing: '0.06em',
                textDecoration: 'none',
                textTransform: 'uppercase',
                transition: 'border-color 0.2s, color 0.2s',
                display: 'inline-block',
                minHeight: '44px',
                minWidth: '44px',
              }}
              onMouseOver={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = 'var(--orange)';
                el.style.color = 'var(--orange)';
              }}
              onMouseOut={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = 'rgba(255,255,255,0.25)';
                el.style.color = 'var(--text)';
              }}
            >
              Ota yhteyttä
            </a>
          </div>

          {/* Trust badges */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            {[
               '✓ Helppo varaus',
              '✓ Nopea toimitus',
              '✓ Varma sidonta',
              '✓ Vakuutettu kuljetus',
            ].map((badge) => (
              <span
                key={badge}
                style={{
                  fontFamily: 'var(--font-barlow)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: 'var(--muted)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '0.35rem 0.75rem',
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
