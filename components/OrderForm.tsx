'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BikeType } from '@/lib/pricing';

interface FormData {
  name: string;
  email: string;
  phone: string;
  origin: string;
  destination: string;
  date: string;
  bikeType: BikeType;
  notes: string;
}

interface Props {
  prefillOrigin?: string;
  prefillDestination?: string;
  prefillBikeType?: BikeType;
  prefillPrice?: number;
}

const bikeLabels: Record<BikeType, string> = {
  scooter: 'Skootteri',
  standard: 'Vakio',
  large: 'Iso / Strike',
};

export default function OrderForm({ prefillOrigin, prefillDestination, prefillBikeType, prefillPrice }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      bikeType: prefillBikeType || 'standard',
      origin: prefillOrigin || '',
      destination: prefillDestination || '',
    },
  });

  useEffect(() => {
    if (prefillOrigin) setValue('origin', prefillOrigin);
    if (prefillDestination) setValue('destination', prefillDestination);
    if (prefillBikeType) setValue('bikeType', prefillBikeType);
  }, [prefillOrigin, prefillDestination, prefillBikeType, setValue]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setServerError('');
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, estimatedPrice: prefillPrice ?? '' }),
      });
      if (!res.ok) throw new Error('Lähetys epäonnistui');
      setSubmitted(true);
      reset();
    } catch {
      setServerError('Lähetys epäonnistui. Yritä uudelleen tai ota yhteyttä sähköpostitse.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (hasError: boolean) => ({
    width: '100%',
    background: 'var(--surface2)',
    border: `1px solid ${hasError ? 'rgba(220,38,38,0.6)' : 'var(--border)'}`,
    borderRadius: '4px',
    padding: '0.5rem 0.75rem',
    color: 'var(--text)',
    fontFamily: 'var(--font-barlow)',
    fontSize: '0.95rem',
    outline: 'none',
  });

  const labelStyle = {
    display: 'block' as const,
    fontFamily: 'var(--font-barlow)',
    fontWeight: 600,
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'var(--muted)',
    marginBottom: '0.3rem',
  };

  const fieldStyle = { marginBottom: '0.75rem' };

  const errorStyle = {
    fontFamily: 'var(--font-barlow)',
    fontSize: '0.8rem',
    color: '#fca5a5',
    marginTop: '0.3rem',
  };

  if (submitted) {
    return (
      <section id="tilauslomake" style={{ background: 'transparent', padding: '5rem 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '8px',
              padding: '3rem 2rem',
            }}
          >
            <p style={{ fontSize: '3rem', margin: '0 0 1rem' }}>✓</p>
            <h3
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 700,
                fontSize: '1.75rem',
                color: '#86efac',
                margin: '0 0 0.75rem',
              }}
            >
              Tilaus vastaanotettu!
            </h3>
            <p style={{ fontFamily: 'var(--font-barlow)', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
              Kiitos tilauksestasi! Vahvistamme kuljetuksen sähköpostiisi pian.
              Löydät tilausvahvistuksen myös sähköpostistasi.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="tilauslomake"
      style={{
        background: 'transparent',
        padding: '1.75rem 1.5rem',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <p
            style={{
              fontFamily: 'var(--font-barlow)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--orange)',
              marginBottom: '0.25rem',
            }}
          >
            Tilauslomake
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontWeight: 800,
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              margin: 0,
            }}
          >
            Varaa kuljetus
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
              alignItems: 'start',
              marginBottom: '1rem',
            }}
          >
            {/* Left – required fields */}
            <div
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1.25rem',
              }}
            >
              {/* Name + Phone */}
              <div className="form-row-2">
                <div>
                  <label style={labelStyle}>Nimi *</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Nimi on pakollinen' })}
                    placeholder="Etunimi Sukunimi"
                    style={inputStyle(!!errors.name)}
                  />
                  {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Puhelin *</label>
                  <input
                    type="tel"
                    {...register('phone', { required: 'Puhelinnumero on pakollinen' })}
                    placeholder="050 354 7763"
                    style={inputStyle(!!errors.phone)}
                  />
                  {errors.phone && <p style={errorStyle}>{errors.phone.message}</p>}
                </div>
              </div>

              {/* Email + Date */}
              <div className="form-row-2">
                <div>
                  <label style={labelStyle}>Sähköposti *</label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Sähköposti on pakollinen',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Tarkista sähköpostiosoite' },
                    })}
                    placeholder="sinä@esimerkki.fi"
                    style={inputStyle(!!errors.email)}
                  />
                  {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Kuljetuspäivä *</label>
                  <input
                    type="date"
                    {...register('date', { required: 'Päivämäärä on pakollinen' })}
                    min={today}
                    style={{ ...inputStyle(!!errors.date), colorScheme: 'dark' }}
                  />
                  {errors.date && <p style={errorStyle}>{errors.date.message}</p>}
                </div>
              </div>

              {/* Origin + Destination */}
              <div className="form-row-2">
                <div>
                  <label style={labelStyle}>Lähtöosoite *</label>
                  <input
                    type="text"
                    {...register('origin', { required: 'Lähtöosoite on pakollinen' })}
                    placeholder="Kadunnimi, Kaupunki"
                    style={inputStyle(!!errors.origin)}
                  />
                  {errors.origin && <p style={errorStyle}>{errors.origin.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Määränpää *</label>
                  <input
                    type="text"
                    {...register('destination', { required: 'Määränpää on pakollinen' })}
                    placeholder="Kadunnimi, Kaupunki"
                    style={inputStyle(!!errors.destination)}
                  />
                  {errors.destination && <p style={errorStyle}>{errors.destination.message}</p>}
                </div>
              </div>

              {/* Bike type */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Pyörätyyppi *</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(Object.entries(bikeLabels) as [BikeType, string][]).map(([val, label]) => (
                    <label
                      key={val}
                      style={{
                        flex: '1 1 auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 0.625rem',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      <input
                        type="radio"
                        value={val}
                        {...register('bikeType', { required: true })}
                        style={{ accentColor: 'var(--orange)', width: '14px', height: '14px', flexShrink: 0 }}
                      />
                      <span style={{ fontFamily: 'var(--font-barlow)', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Estimated price */}
              {prefillPrice !== undefined && prefillPrice > 0 && (
                <div style={{ ...fieldStyle, marginBottom: 0 }}>
                  <label style={labelStyle}>Arvioitu hinta</label>
                  <input
                    type="text"
                    readOnly
                    value={`${prefillPrice.toFixed(2)} €`}
                    style={{
                      ...inputStyle(false),
                      background: 'transparent',
                      color: 'var(--orange)',
                      fontWeight: 700,
                      fontFamily: 'var(--font-barlow-condensed)',
                      fontSize: '1.1rem',
                      cursor: 'default',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Right – steps + notes + submit */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Miten se toimii? */}
              <div
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-barlow-condensed)',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    margin: '0 0 0.875rem',
                  }}
                >
                  Miten se toimii?
                </h3>
                {[
                  { n: '1', title: 'Täytä lomake', desc: 'Syötä yhteystietosi ja reitin tiedot.' },
                  { n: '2', title: 'Vahvistus', desc: 'Soitamme tai vahvistamme sähköpostitse.' },
                  { n: '3', title: 'Kuljetus', desc: 'Noudamme pyörän ja toimitamme sen turvallisesti.' },
                  { n: '4', title: 'Maksu', desc: 'Laskulla kuljetuksen jälkeen.' },
                ].map((step) => (
                  <div
                    key={step.n}
                    style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.625rem', alignItems: 'flex-start' }}
                  >
                    <div
                      style={{
                        minWidth: '26px',
                        height: '26px',
                        background: 'var(--orange-dim)',
                        border: '1px solid rgba(232,93,26,0.3)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-barlow-condensed)',
                        fontWeight: 700,
                        color: 'var(--orange)',
                        fontSize: '0.8rem',
                        flexShrink: 0,
                      }}
                    >
                      {step.n}
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.1rem', fontSize: '0.875rem' }}>
                        {step.title}
                      </p>
                      <p style={{ fontFamily: 'var(--font-barlow)', color: 'var(--muted)', margin: 0, fontSize: '0.8rem', lineHeight: 1.4 }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes + submit */}
              <div
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                }}
              >
                <div style={fieldStyle}>
                  <label style={labelStyle}>Lisätiedot</label>
                  <textarea
                    {...register('notes')}
                    placeholder="Pyörän merkki/malli, erityisohjeet ja kellonaikatoiveet"
                    rows={3}
                    style={{ ...inputStyle(false), resize: 'vertical', minHeight: '68px' }}
                  />
                </div>

                {serverError && (
                  <p
                    style={{
                      background: 'rgba(220,38,38,0.1)',
                      border: '1px solid rgba(220,38,38,0.3)',
                      borderRadius: '4px',
                      padding: '0.5rem 0.875rem',
                      color: '#fca5a5',
                      fontFamily: 'var(--font-barlow)',
                      fontSize: '0.875rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {serverError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    background: 'var(--orange)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.75rem 1.5rem',
                    fontFamily: 'var(--font-barlow-condensed)',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: submitting ? 'wait' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                    transition: 'background 0.2s',
                    minHeight: '44px',
                  }}
                  onMouseOver={(e) => {
                    if (!submitting)
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--orange-light)';
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--orange)';
                  }}
                >
                  {submitting ? 'Lähetetään...' : 'Lähetä tilauslomake'}
                </button>
              </div>
            </div>
          </div>

          {/* Full-width below grid – contact */}
          <div
            style={{
              background: 'transparent',
              border: '1px solid rgba(232,93,26,0.25)',
              borderRadius: '8px',
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              flexWrap: 'wrap',
            }}
          >
            <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 600, color: 'var(--text)', margin: 0, fontSize: '0.875rem' }}>
              Epäselvää? Soita suoraan.
            </p>
            <a
              href="tel:+358503547763"
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 800,
                fontSize: '1.35rem',
                color: 'var(--orange)',
                textDecoration: 'none',
              }}
            >
              050 354 7763
            </a>
            <a
              href="mailto:info@mplogistiikka.fi"
              style={{
                fontFamily: 'var(--font-barlow)',
                fontWeight: 500,
                fontSize: '0.95rem',
                color: 'var(--muted)',
                textDecoration: 'none',
              }}
            >
              info@mplogistiikka.fi
            </a>
            <p style={{ fontFamily: 'var(--font-barlow)', color: 'var(--muted)', margin: 0, fontSize: '0.8rem' }}>
              Ma–La klo 8–18
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
