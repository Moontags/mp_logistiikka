'use client';

import { useState } from 'react';
import { calculatePrice, BikeType, PRICING, eur } from '@/lib/pricing';
import { hasCity } from '@/lib/address';
import AddressAutocomplete from '@/components/AddressAutocomplete';

export default function Calculator() {
  // AddressAutocomplete keeps these in sync with the full formatted address
  // (street, postal code, city) of the picked suggestion.
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const [bikeType, setBikeType] = useState<BikeType>('standard');
  const [result, setResult] = useState<{
    km: number; duration: string; origin: string; destination: string;
    positioningToPickupKm: number; positioningFromDeliveryKm: number;
  } | null>(null);
  const price = result
    ? calculatePrice(result.km, bikeType, {
        toPickupKm: result.positioningToPickupKm,
        fromDeliveryKm: result.positioningFromDeliveryKm,
      })
    : null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kokonaishinta = price ? price.total : 0;

  async function handleCalculate() {
    const originValue = origin.trim();
    const destinationValue = destination.trim();
    if (!originValue || !destinationValue) {
      setError('Syötä sekä lähtöpaikka että määränpää.');
      return;
    }
    if (originValue.toLowerCase() === destinationValue.toLowerCase()) {
      setError('Lähtöpaikka ja määränpää ovat samat.');
      return;
    }
    if (!hasCity(originValue) || !hasCity(destinationValue)) {
      setError('Lisää myös kaupunki osoitteen perään (esim. Kadunnimi 5, Helsinki).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/distance?origin=${encodeURIComponent(originValue)}&destination=${encodeURIComponent(destinationValue)}`
      );
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      setResult({
        km: data.km,
        duration: data.duration,
        origin: originValue,
        destination: destinationValue,
        positioningToPickupKm: data.positioningToPickupKm ?? 0,
        positioningFromDeliveryKm: data.positioningFromDeliveryKm ?? 0,
      });
    } catch {
      setError('Reitti ei löydy – tarkista kaupunkien nimet tai ota yhteyttä.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="hinnasto"
      style={{ background: 'transparent', paddingBottom: '2.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', borderTop: '1px solid var(--border)' }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: 'clamp(1.5rem, 4vw, 3rem)' }}>
          <p style={{ fontFamily: 'var(--font-barlow)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '0.5rem' }}>
            Hinnasto
          </p>
          <h2 style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', textTransform: 'uppercase', letterSpacing: '-0.01em', margin: 0 }}>
            Laske kuljetuksen hinta
          </h2>
          <p style={{ color: 'var(--muted)', marginTop: '0.75rem', fontFamily: 'var(--font-barlow)', fontSize: '1rem' }}>
            {`Hinta määräytyy matkan pituuden ja nouto-/jättöpaikan sijainnin mukaan. Alkaen ${PRICING.BASE_FEE} €.`}
          </p>
        </div>

        <div className="calc-grid">
          {/* Vasen puoli */}
          <div className="calc-form">
            <AddressAutocomplete
              label="Lähtöpaikka"
              value={origin}
              onChange={setOrigin}
              placeholder="esim. Riihimäki"
            />
            <AddressAutocomplete
              label="Määränpää"
              value={destination}
              onChange={setDestination}
              placeholder="esim. Helsinki"
            />

            <div className="form-group">
              <label>Pyörätyyppi</label>
              {(
                [
                  ['scooter', 'Mopo/Skootteri', '−20 €', null],
                  ['standard', 'Perus / Vakio', '+0 €', null],
                  ['large', 'Iso / Strike', '+50 €', '≥ 250 kg tai ≥ 1 000 cm³'],
                ] as const
              ).map(([val, label, price, description]) => (
                <label
                  key={val}
                  className={`radio-opt${bikeType === val ? ' active' : ''}`}
                  onClick={() => setBikeType(val)}
                >
                  <input type="radio" name="bikeType" value={val} readOnly checked={bikeType === val} />
                  <span>
                    {label}
                    {description && (
                      <span className="bike-type-description" style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 400 }}>
                        {description}
                      </span>
                    )}
                  </span>
                  <span className="price-tag-small">{price}</span>
                </label>
              ))}
            </div>

            <button onClick={handleCalculate} disabled={loading} className="btn-primary">
              {loading ? 'Lasketaan...' : 'Laske hinta'}
            </button>
          </div>

          {/* Oikea puoli – näyttää aina saman rakenteen */}
          <div className="calc-result">
            <div className="km-block">
              <span className="km-number">
                {result ? `${result.km} km` : '0 km'}
              </span>
              <span className="km-meta">
                {result
                  ? `${result.origin} → ${result.destination} · ${result.duration}`
                  : 'Syötä reitti laskeaksesi etäisyyden'}
              </span>
            </div>

            <div className="total-price">
              {price ? `${kokonaishinta.toFixed(2).replace('.', ',')} €` : '0,00 €'}
            </div>
            <p className="total-label">Arvioitu kokonaishinta (sis. ALV)</p>

            <div className="breakdown">
              {/* Yksi rivi = yksi luku. Portaiden erittely on tarkoituksella piilossa –
                  se on hinnastossa ja sopimusehdoissa, ei asiakkaan tarjousnäkymässä. */}
              <div className="breakdown-row">
                <span>{`Perusmaksu (sis. ${PRICING.BASE_KM_INCLUDED} km)`}</span>
                <span>{price ? `${eur(price.baseFee)} €` : '0,00 €'}</span>
              </div>
              <div className="breakdown-row">
                <span>{`Lisäkilometrit (${price ? price.billableKm : 0} km)`}</span>
                <span>{price ? `${eur(price.kmFee)} €` : '0,00 €'}</span>
              </div>
              {/* Positiointi vain kun sitä laskutetaan – ei turhaa 0 €-riviä lähikeikoille. */}
              {price && price.positioning.fee > 0 && (
                <div className="breakdown-row">
                  <span>Positiointi (noutoon ja jätöstä)</span>
                  <span>{`${eur(price.positioning.fee)} €`}</span>
                </div>
              )}
              <div className="breakdown-row">
                <span>Pyörätyyppi</span>
                <span>
                  {price
                    ? `${price.typeExtra >= 0 ? '+' : ''}${price.typeExtra},00 €`
                    : '+0,00 €'}
                </span>
              </div>
              <div className="breakdown-row total-row">
                <span>Yhteensä (sis. ALV)</span>
                <span>
                  {price
                    ? `${kokonaishinta.toFixed(2).replace('.', ',')} €`
                    : '0,00 €'}
                </span>
              </div>
            </div>

            {loading && (
              <div className="loading-overlay">
                <div className="spinner" />
                <span>Haetaan reittiä...</span>
              </div>
            )}

            {error && !loading && (
              <p className="error-text">{error}</p>
            )}

            <a
              href={result && price
                ? `/tilauslomake?origin=${encodeURIComponent(result.origin)}&destination=${encodeURIComponent(result.destination)}&bikeType=${bikeType}&price=${kokonaishinta.toFixed(2)}`
                : undefined}
              className={`btn-primary btn-order${!result ? ' btn-disabled' : ''}`}
              onClick={!result ? (e) => e.preventDefault() : undefined}
              aria-disabled={!result}
            >
              Tilaa tämä kuljetus →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
