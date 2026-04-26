export default function Contact() {
  return (
    <section
      id="yhteystiedot"
      className="page-section"
      style={{
        background: 'transparent',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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

        <div className="contact-grid">
          <div className="contact-card">
            <div className="contact-card-icon">📞</div>
            <p className="contact-card-label">Puhelin</p>
            <a
              href="tel:+358503547763"
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 800,
                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                color: 'var(--orange)',
                textDecoration: 'none',
                display: 'block',
                marginBottom: '0.25rem',
              }}
            >
              050 354 7763
            </a>
            <p className="contact-card-sub">Ma–La klo 8–18</p>
          </div>

          <div className="contact-card">
            <div className="contact-card-icon">✉️</div>
            <p className="contact-card-label">Sähköposti</p>
            <a
              href="mailto:info@mplogistiikka.fi"
              style={{
                fontFamily: 'var(--font-barlow)',
                fontWeight: 600,
                fontSize: '1rem',
                color: 'var(--orange)',
                textDecoration: 'none',
                wordBreak: 'break-all',
                display: 'block',
                marginBottom: '0.25rem',
              }}
            >
              info@mplogistiikka.fi
            </a>
            <p className="contact-card-sub">Vastaamme saman päivän aikana</p>
          </div>

          <div className="contact-card">
            <div className="contact-card-icon">📍</div>
            <p className="contact-card-label">Toimipiste</p>
            <p className="contact-card-value">Riihimäki</p>
            <p className="contact-card-sub">Palvelemme koko Suomea</p>
          </div>

          <div className="contact-card-highlight">
            <div className="contact-card-icon">💳</div>
            <p className="contact-card-label">Maksu</p>
            <p className="contact-card-value">Lasku</p>
            <p className="contact-card-sub">Maksu kuljetuksen jälkeen</p>
          </div>
        </div>
      </div>
    </section>
  );
}
