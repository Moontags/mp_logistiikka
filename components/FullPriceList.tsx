import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  PRICING,
  BIKE_OPTIONS,
  calculatePrice,
  eur,
  eurShort,
  positioningFreeKm,
} from '@/lib/pricing';
import styles from './FullPriceList.module.css';

function zones(
  tiers: readonly { readonly upToKm: number | null; readonly perKm: number }[],
  startKm: number,
) {
  return tiers.map((tier, index) => {
    const from = index === 0 ? startKm : (tiers[index - 1].upToKm ?? startKm);
    const range = tier.upToKm === null ? `yli ${from} km` : `${from + 1}–${tier.upToKm} km`;
    return (
      <li key={range}>
        {range}: {eur(tier.perKm)} €/km
      </li>
    );
  });
}

export default function FullPriceList({ leadLink, initiallyOpen = false }: { leadLink: ReactNode; initiallyOpen?: boolean }) {
  return (
    <div className={styles.actions}>
      <div className={styles.leadLink}>{leadLink}</div>
      <details id="hinnasto-tarkemmin" className={styles.details} open={initiallyOpen}>
        <summary className={styles.summary}>
          <span className={styles.closed}>Näytä hinnasto</span>
          <span className={styles.open}>Piilota hinnasto →</span>
        </summary>
        <div className={`calc-form ${styles.content}`}>
          <section>
            <h3>Perushinnoittelu</h3>
            <ul>
              <li>
                Perusmaksu {eurShort(PRICING.BASE_FEE)} €, sisältää ensimmäiset{' '}
                {PRICING.BASE_KM_INCLUDED} km
              </li>
              {zones(PRICING.KM_TIERS, PRICING.BASE_KM_INCLUDED)}
            </ul>
          </section>
          <section>
            <h3>Pyörätyyppi</h3>
            <ul>
              {BIKE_OPTIONS.map(({ value, label, description }) => {
                const extra = PRICING.TYPE_EXTRA[value];
                return (
                  <li key={value}>
                    {value === 'scooter' ? 'Mopo / Skootteri' : label}
                    {description ? ` (${description})` : ''} {extra < 0 ? '−' : '+'}
                    {eurShort(Math.abs(extra))} €
                  </li>
                );
              })}
            </ul>
          </section>
          <section>
            <h3>Siirtymä noutoon / jätöstä</h3>
            <p>
              Lähtö on{' '}
              {PRICING.HOME_BASE.split(',')[0] === 'Riihimäki' ? 'Riihimäellä' : PRICING.HOME_BASE}.
              Jos nouto- tai jättöpaikka on yli {positioningFreeKm()} km päässä, siirtymästä
              veloitetaan:
            </p>
            <ul>
              {zones(
                PRICING.POSITIONING_TIERS.filter((tier) => tier.perKm > 0),
                positioningFreeKm(),
              )}
            </ul>
          </section>
          <section>
            <h3>Esimerkkihintoja (Perus / Vakio, ilman siirtymää)</h3>
            <ul>
              {[40, 100, 200, 400, 600].map((km) => (
                <li key={km}>
                  {km} km = {eur(calculatePrice(km, 'standard').total)} €
                </li>
              ))}
            </ul>
          </section>
          <section className={styles.more}>
            <h3>Muuta</h3>
            <ul>
              <li>
                Ajopalvelu: kuljettajamme voi ajaa pyörän perille – usein trailerikuljetusta
                edullisempi.
              </li>
              <li>
                Yhdistetyt kuljetukset: kun reitti ja ajankohta ilmoitetaan etukäteen, voimme
                yhdistää kuljetuksia ja hinta laskee.
              </li>
              <li>Kuljetamme myös mopot, mopoautot, mönkijät ja moottorikelkat.</li>
              <li>
                <Link href="/ulkomaat/hinnoittelu">Ulkomaan kuljetusten hinnoittelu →</Link>
              </li>
              <li>Yritysasiakkaille ja toistuville kuljetuksille voimme sopia B2B-hinnoittelun.</li>
              <li>Hinnat sisältävät alv:n.</li>
              <li>Kaikki kuljetukset ovat vakuutettuja.</li>
            </ul>
          </section>
        </div>
      </details>
    </div>
  );
}
