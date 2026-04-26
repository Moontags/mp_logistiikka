export default function Contact() {
  return (
    <section
      id="yhteystiedot"
      className="page-section"
      style={{
        background: 'transparent',
        padding: '0 1.5rem',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 'clamp(1.5rem, 4vw, 3rem)' }}>
          <p
            style={{
              fontFamily: 'var(--font-barlow)',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--orange)',
              marginBottom: '0.5rem',
            }}
          >
            Yhteystiedot
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontWeight: 800,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              margin: 0,
            }}
          >
            Ota yhteyttä
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {/* Phone */}
          <div
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '2rem',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📞</div>
            <h3
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--muted)',
                margin: '0 0 0.5rem',
              }}
            >
              Puhelin
            </h3>
            <a
              href="tel:+358503547763"
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 800,
                fontSize: '1.75rem',
                color: 'var(--orange)',
                textDecoration: 'none',
                display: 'block',
                marginBottom: '0.25rem',
              }}
            >
              050 354 7763
            </a>
            <p style={{ fontFamily: 'var(--font-barlow)', color: 'var(--muted)', fontSize: '0.875rem', margin: 0 }}>
              Ma–La klo 8–18
            </p>
          </div>

          {/* Email */}
          <div
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '2rem',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✉️</div>
            <h3
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--muted)',
                margin: '0 0 0.5rem',
              }}
            >
              Sähköposti
            </h3>
            <a
              href="mailto:info@mplogistiikka.fi"
              style={{
                fontFamily: 'var(--font-barlow)',
                fontWeight: 600,
                fontSize: '1.05rem',
                color: 'var(--orange)',
                textDecoration: 'none',
                wordBreak: 'break-all',
              }}
            >
              info@mplogistiikka.fi
            </a>
            <p style={{ fontFamily: 'var(--font-barlow)', color: 'var(--muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
              Vastaamme  saman päivän aikana
            </p>
          </div>

          {/* Location */}
          <div
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '2rem',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📍</div>
            <h3
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--muted)',
                margin: '0 0 0.5rem',
              }}
            >
              Toimipiste
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 700,
                fontSize: '1.4rem',
                color: 'var(--text)',
                margin: '0 0 0.25rem',
              }}
            >
              Riihimäki
            </p>
            <p style={{ fontFamily: 'var(--font-barlow)', color: 'var(--muted)', fontSize: '0.875rem', margin: 0 }}>
              Palvelemme koko Suomen alueella
            </p>
          </div>

          {/* Payment */}
          <div
            style={{
              background: 'transparent',
              border: '1px solid rgba(232,93,26,0.25)',
              borderRadius: '8px',
              padding: '2rem',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💳</div>
            <h3
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--muted)',
                margin: '0 0 0.5rem',
              }}
            >
              Maksu
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 700,
                fontSize: '1.4rem',
                color: 'var(--text)',
                margin: '0 0 0.25rem',
              }}
            >
              Lasku
            </p>
            <p style={{ fontFamily: 'var(--font-barlow)', color: 'var(--muted)', fontSize: '0.875rem', margin: 0 }}>
              Maksu kuljetuksen jälkeen, ei ennakkomaksua
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
