'use client';

import { useEffect, useRef, useState } from 'react';
import { calculatePrice, BikeType, PRICING, eur, eurShort, BIKE_OPTIONS } from '@/lib/pricing';
import { hasCity } from '@/lib/address';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import FullPriceList from '@/components/FullPriceList';
import { townFromAddress } from '@/lib/group-transport/validation';

export default function Calculator() {
  // AddressAutocomplete keeps these in sync with the full formatted address
  // (street, postal code, city) of the picked suggestion.
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [addressRevision, setAddressRevision] = useState(0);

  const [bikeType, setBikeType] = useState<BikeType>('standard');
  const [result, setResult] = useState<{
    km: number;
    duration: string;
    origin: string;
    destination: string;
    positioningToPickupKm: number;
    positioningFromDeliveryKm: number;
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

  const requestRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  // Typing and selecting both lead to a quote; no selection is required.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (origin.trim() && destination.trim()) void handleCalculate();
    }, 800);
    return () => clearTimeout(timer);
    // Calculation uses the current field values; bike type only changes pricing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, destination, addressRevision]);

  function updateAddress(setter: (value: string) => void, value: string) {
    requestRef.current++;
    controllerRef.current?.abort();
    setLoading(false);
    setResult(null);
    setError(null);
    setter(value);
    setAddressRevision((revision) => revision + 1);
  }

  async function handleCalculate() {
    controllerRef.current?.abort();
    const requestId = ++requestRef.current;
    const controller = new AbortController();
    controllerRef.current = controller;
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
    // Hinta-arvioon riittää paikkakunta – tarkkaa osoitetta kysytään vasta
    // tilauslomakkeella. Tämä torjuu vain katuosoitteen ilman paikkakuntaa,
    // jonka Google geokoodaisi arvaamalla väärään kuntaan.
    if (!hasCity(originValue) || !hasCity(destinationValue)) {
      setError('Kerro myös paikkakunta – pelkkä kaupunki riittää (esim. Tampere).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/distance?origin=${encodeURIComponent(originValue)}&destination=${encodeURIComponent(destinationValue)}`,
        { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30_000)]) },
      );
      const data = await res.json();
      if (requestId !== requestRef.current) return;
      if (!res.ok) throw new Error(data.error || 'Reittiä ei löytynyt.');
      setResult({
        km: data.km,
        duration: data.duration,
        origin: data.origin,
        destination: data.destination,
        positioningToPickupKm: data.positioningToPickupKm ?? 0,
        positioningFromDeliveryKm: data.positioningFromDeliveryKm ?? 0,
      });
    } catch (error) {
      if (requestId !== requestRef.current || controller.signal.aborted) return;
      setResult(null);
      setError(
        error instanceof Error && error.name !== 'TimeoutError' && error.name !== 'TypeError'
          ? error.message
          : 'Reittipalvelu ei vastaa juuri nyt. Yritä uudelleen.',
      );
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }

  return (
    <section
      id="hinnasto"
      style={{
        background: 'transparent',
        paddingBottom: '2.5rem',
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
            Hinnasto
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
            Laske kuljetuksen hinta
          </h2>
          <p
            style={{
              color: 'var(--muted)',
              marginTop: '0.75rem',
              fontFamily: 'var(--font-barlow)',
              fontSize: '1rem',
            }}
          >
            {`Hinta määräytyy matkan pituuden, nouto-/jättöpaikan sijainnin ja pyörätyypin mukaan. Peruspyörän hinta alkaen ${PRICING.BASE_FEE} € (sis. ALV).`}
          </p>
          <FullPriceList
            leadLink={
              <a
                href={
                  result
                    ? `/yhteiskuljetus?${new URLSearchParams({ origin: townFromAddress(result.origin), destination: townFromAddress(result.destination), bikeType }).toString()}`
                    : '/yhteiskuljetus'
                }
                className="group-transport-link"
              >
                Ei kiire? Ilmoita ennakkoon – yhdistetty kuljetus on edullisempi →
              </a>
            }
          />
        </div>

        <div className="calc-grid">
          {/* Vasen puoli */}
          <div className="calc-form">
            <AddressAutocomplete
              label="Lähtöpaikka"
              value={origin}
              onChange={(value) => updateAddress(setOrigin, value)}
              onSubmit={() => void handleCalculate()}
              placeholder="esim. Riihimäki"
            />
            <AddressAutocomplete
              label="Määränpää"
              value={destination}
              onChange={(value) => updateAddress(setDestination, value)}
              onSubmit={() => void handleCalculate()}
              placeholder="esim. Helsinki"
            />

            <div className="form-group">
              <label>Pyörätyyppi</label>
              {BIKE_OPTIONS.map(({ value: val, label, description }) => {
                const adjustment = PRICING.TYPE_EXTRA[val];
                const price = `${adjustment < 0 ? '−' : '+'}${eurShort(Math.abs(adjustment))} €`;
                return (
                  <label
                    key={val}
                    className={`radio-opt${bikeType === val ? ' active' : ''}`}
                    onClick={() => setBikeType(val)}
                  >
                    <input
                      type="radio"
                      name="bikeType"
                      value={val}
                      readOnly
                      checked={bikeType === val}
                    />
                    <span>
                      {label}
                      {description && (
                        <span
                          className="bike-type-description"
                          style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 400 }}
                        >
                          {description}
                        </span>
                      )}
                    </span>
                    <span className="price-tag-small">{price}</span>
                  </label>
                );
              })}
            </div>

            <button onClick={handleCalculate} disabled={loading} className="btn-primary">
              {loading ? 'Lasketaan...' : 'Laske hinta'}
            </button>
          </div>

          {/* Oikea puoli – näyttää aina saman rakenteen */}
          <div className="calc-result" aria-live="polite" aria-busy={loading}>
            <div className="km-block">
              <span className="km-number">{result ? `${result.km} km` : '0 km'}</span>
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
                  {price ? `${price.typeExtra >= 0 ? '+' : ''}${price.typeExtra},00 €` : '+0,00 €'}
                </span>
              </div>
              <div className="breakdown-row total-row">
                <span>Yhteensä (sis. ALV)</span>
                <span>{price ? `${kokonaishinta.toFixed(2).replace('.', ',')} €` : '0,00 €'}</span>
              </div>
            </div>

            {loading && (
              <div className="loading-overlay">
                <div className="spinner" />
                <span>Haetaan reittiä...</span>
              </div>
            )}

            {result && (
              <p style={{ color: 'var(--text)' }}>
                Lähtö: {result.origin}
                <br />
                Määränpää: {result.destination}
              </p>
            )}
            {error && !loading && (
              <p className="error-text" role="alert">
                {error}
                <br />
                <a href="tel:+358503547763">Soita 050 354 7763</a> tai{' '}
                <a href="/yhteiskuljetus">tee ennakkoilmoitus</a>.
              </p>
            )}

            <a
              href={
                result && price
                  ? `/tilauslomake?origin=${encodeURIComponent(result.origin)}&destination=${encodeURIComponent(result.destination)}&bikeType=${bikeType}&price=${kokonaishinta.toFixed(2)}`
                  : undefined
              }
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
