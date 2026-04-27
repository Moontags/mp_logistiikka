'use client';

import { useEffect, useRef, useState } from 'react';
import { calculatePrice, BikeType } from '@/lib/pricing';

declare global {
  interface Window { google: any; }
}

export default function Calculator() {
  const originContainerRef = useRef<HTMLDivElement>(null);
  const destContainerRef = useRef<HTMLDivElement>(null);
  const originValueRef = useRef('');
  const destValueRef = useRef('');
  // Pending fetchFields promises – awaited in handleCalculate so we always get formattedAddress
  const originFetchRef = useRef<Promise<string> | null>(null);
  const destFetchRef = useRef<Promise<string> | null>(null);

  const [bikeType, setBikeType] = useState<BikeType>('standard');
  const [result, setResult] = useState<{
    km: number; duration: string; origin: string; destination: string;
    price: ReturnType<typeof calculatePrice>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function readValue(el: any): string {
      try {
        return el?.shadowRoot?.querySelector('input')?.value || el?.value || '';
      } catch {
        return el?.value || '';
      }
    }

    function init() {
      const Places = window.google?.maps?.places;
      if (!Places) return false;

      const opts = { componentRestrictions: { country: 'fi' } };

      if (Places.PlaceAutocompleteElement) {
        // New API (required for API keys created after March 2025)
        const originEl = new Places.PlaceAutocompleteElement(opts);
        const destEl = new Places.PlaceAutocompleteElement(opts);
        originEl.style.fontSize = '16px';
        destEl.style.fontSize = '16px';

        if (originContainerRef.current) {
          originContainerRef.current.innerHTML = '';
          originContainerRef.current.appendChild(originEl);
        }
        if (destContainerRef.current) {
          destContainerRef.current.innerHTML = '';
          destContainerRef.current.appendChild(destEl);
        }

        originEl.addEventListener('gmp-placeautocomplete-place-changed', (e: any) => {
          originValueRef.current = '';
          const p = (async () => {
            try {
              await e.place.fetchFields({ fields: ['displayName', 'formattedAddress'] });
              return e.place.formattedAddress || e.place.displayName || readValue(originEl);
            } catch {
              return e.place?.displayName || readValue(originEl);
            }
          })();
          originFetchRef.current = p;
          p.then((v) => { originValueRef.current = v; });
        });
        destEl.addEventListener('gmp-placeautocomplete-place-changed', (e: any) => {
          destValueRef.current = '';
          const p = (async () => {
            try {
              await e.place.fetchFields({ fields: ['displayName', 'formattedAddress'] });
              return e.place.formattedAddress || e.place.displayName || readValue(destEl);
            } catch {
              return e.place?.displayName || readValue(destEl);
            }
          })();
          destFetchRef.current = p;
          p.then((v) => { destValueRef.current = v; });
        });
        // No 'input' listeners on PlaceAutocompleteElement – the element updates its own
        // display input programmatically after place selection, which can race with the
        // async fetchFields and overwrite the full formattedAddress with the short displayName.
      } else {
        // Fallback for older API keys
        [
          { container: originContainerRef, valRef: originValueRef, placeholder: 'esim. Riihimäki' },
          { container: destContainerRef, valRef: destValueRef, placeholder: 'esim. Helsinki' },
        ].forEach(({ container, valRef, placeholder }) => {
          const input = document.createElement('input');
          input.type = 'text';
          input.placeholder = placeholder;
          input.autocomplete = 'off';
          input.setAttribute('autocorrect', 'off');
          input.setAttribute('autocapitalize', 'off');
          input.style.fontSize = '16px';
          input.className = 'ac-fallback-input';
          if (container.current) {
            container.current.innerHTML = '';
            container.current.appendChild(input);
          }
          input.addEventListener('input', () => { valRef.current = input.value; });
          if (Places.Autocomplete) {
            const ac = new Places.Autocomplete(input, { ...opts, fields: ['formatted_address', 'name'] });
            ac.addListener('place_changed', () => {
              const p = ac.getPlace();
              if (p?.name) valRef.current = p.name;
            });
          }
        });
      }

      return true;
    }

    if (!init()) {
      const interval = setInterval(() => { if (init()) clearInterval(interval); }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (!result) return;
    const price = calculatePrice(result.km, bikeType);
    setResult((prev) => (prev ? { ...prev, price } : null));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bikeType]);

  async function handleCalculate() {
    function readShadow(container: HTMLDivElement | null): string {
      try {
        const el = container?.firstChild as any;
        return el?.shadowRoot?.querySelector('input')?.value?.trim() ||
               (el as HTMLInputElement)?.value?.trim() || '';
      } catch { return ''; }
    }

    // Await any in-flight fetchFields so we always get the full formattedAddress
    // (includes city + postal code) rather than the short display name.
    const [originResolved, destResolved] = await Promise.all([
      originFetchRef.current ?? Promise.resolve(originValueRef.current || readShadow(originContainerRef.current)),
      destFetchRef.current   ?? Promise.resolve(destValueRef.current   || readShadow(destContainerRef.current)),
    ]);
    const origin      = (originResolved || '').trim();
    const destination = (destResolved   || '').trim();
    if (!origin || !destination) {
      setError('Syötä sekä lähtöpaikka että määränpää.');
      return;
    }
    if (origin.toLowerCase() === destination.toLowerCase()) {
      setError('Lähtöpaikka ja määränpää ovat samat.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/distance?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
      );
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      const price = calculatePrice(data.km, bikeType);
      const newResult = { km: data.km, duration: data.duration, origin, destination, price };
      setResult(newResult);
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
            Perusmaksu 119 € sisältää ensimmäiset 40 km · sen jälkeen 1,16 €/km
          </p>
        </div>

        <div className="calc-grid">
          {/* Vasen puoli */}
          <div className="calc-form">
            <div className="form-group">
              <label>Lähtöpaikka</label>
              <div ref={originContainerRef} className="ac-container" style={{ fontSize: '16px' }} />
            </div>
            <div className="form-group">
              <label>Määränpää</label>
              <div ref={destContainerRef} className="ac-container" style={{ fontSize: '16px' }} />
            </div>

            <div className="form-group">
              <label>Pyörätyyppi</label>
              {(
                [
                  ['scooter', 'Skootteri', '−20 €'],
                  ['standard', 'Vakio', '+0 €'],
                  ['large', 'Iso / Strike', '+50 €'],
                ] as const
              ).map(([val, label, price]) => (
                <label
                  key={val}
                  className={`radio-opt${bikeType === val ? ' active' : ''}`}
                  onClick={() => setBikeType(val)}
                >
                  <input type="radio" name="bikeType" value={val} readOnly checked={bikeType === val} />
                  <span>{label}</span>
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
              {result ? `${result.price.total.toFixed(2).replace('.', ',')} €` : '0,00 €'}
            </div>
            <p className="total-label">Arvioitu kokonaishinta (sis. ALV)</p>

            <div className="breakdown">
              <div className="breakdown-row">
                <span>Perusmaksu (sis. 40 km)</span>
                <span>{result ? '119,00 €' : '0,00 €'}</span>
              </div>
              <div className="breakdown-row">
                <span>
                  {result && result.price.billableKm > 0
                    ? `Lisäkm (${result.price.billableKm} km × 1,16 €)`
                    : 'Lisäkm (0 km × 1,16 €)'}
                </span>
                <span>
                  {result && result.price.billableKm > 0
                    ? `${result.price.kmFee.toFixed(2).replace('.', ',')} €`
                    : '0,00 €'}
                </span>
              </div>
              <div className="breakdown-row">
                <span>Pyörätyyppi</span>
                <span>
                  {result
                    ? `${result.price.typeExtra >= 0 ? '+' : ''}${result.price.typeExtra},00 €`
                    : '+0,00 €'}
                </span>
              </div>
              <div className="breakdown-row total-row">
                <span>Yhteensä (sis. ALV)</span>
                <span>
                  {result
                    ? `${result.price.total.toFixed(2).replace('.', ',')} €`
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
              href={result
                ? `/tilauslomake?origin=${encodeURIComponent(result.origin)}&destination=${encodeURIComponent(result.destination)}&bikeType=${bikeType}&price=${result.price.total.toFixed(2)}`
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
