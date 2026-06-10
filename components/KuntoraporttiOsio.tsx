'use client';

const vaiheet = [
  {
    numero: '01',
    otsikko: 'Tarkastus',
    kuvaus: 'Dokumentoimme pyörän kunnon ennen kuljetusta — runko, renkaat ja maalipinta.',
  },
  {
    numero: '02',
    otsikko: 'Kuljetus',
    kuvaus: 'Pyörä kulkee kiinnitettynä. Valokuvat todistavat kunnon lähtöhetkellä.',
  },
  {
    numero: '03',
    otsikko: 'Raportti',
    kuvaus: 'Perillä tehdään luovutustarkastus. Saat PDF-raportin sähköpostiisi.',
  },
];

export default function KuntoraporttiOsio() {
  return (
    <section className="kr-card" aria-labelledby="kr-title">
      <div className="kr-head">
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontFamily: 'var(--font-barlow)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--orange)',
              margin: '0 0 0.35rem',
            }}
          >
            Lisäpalvelu
          </p>
          <h2
            id="kr-title"
            style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontWeight: 800,
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              margin: '0 0 0.4rem',
              color: 'var(--text)',
            }}
          >
            Dokumentoitu kuljetus
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-barlow)',
              color: 'var(--muted)',
              fontSize: '0.9rem',
              lineHeight: 1.55,
              margin: 0,
              maxWidth: '560px',
            }}
          >
            Tarkastamme ja valokuvaamme pyöräsi kunnon ennen kuljetusta ja perillä.
            Saat henkilökohtaisen kuntoraportin — mielenrauha molemmille osapuolille.
          </p>
        </div>

        <a
          className="btn-primary"
          href="https://kuntoraportti.mp-logistiikka.fi/esimerkki"
          target="_blank"
          rel="noopener noreferrer"
        >
          Katso esimerkkiraportti →
        </a>
      </div>

      <div className="kr-steps">
        {vaiheet.map((vaihe) => (
          <div
            key={vaihe.numero}
            style={{
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '0.75rem 0.9rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '0.04em',
                color: 'var(--orange)',
              }}
            >
              {vaihe.numero}
            </span>
            <h3
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                margin: '0.1rem 0 0.25rem',
                color: 'var(--text)',
              }}
            >
              {vaihe.otsikko}
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-barlow)',
                color: 'var(--muted)',
                fontSize: '0.8rem',
                lineHeight: 1.45,
                margin: 0,
              }}
            >
              {vaihe.kuvaus}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
