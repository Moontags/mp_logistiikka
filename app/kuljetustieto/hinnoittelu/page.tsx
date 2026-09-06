import type { Metadata } from 'next';
import Link from 'next/link';

import {
  entryLabel,
  entryNote,
  formatDuration,
  formatEur,
  groupByVehicle,
  hasSplitPricing,
} from '@/lib/ferryPricing';
import { sanityFetch } from '@/sanity/lib/live';
import { MP_FERRY_ROUTES_QUERY } from '@/sanity/lib/queries';

export const metadata: Metadata = {
  title: 'Hinnoittelu ja lauttamaksut | MP-Logistiikka',
  description:
    'Näin kuljetuksen hinta ulkomaille muodostuu: läpinäkyvä lauttamaksu varustamon hinnaston mukaan sekä itse kuljetuspalvelu. Katso ajoneuvokohtaiset lauttahinnat.',
  alternates: { canonical: 'https://www.mp-logistiikka.fi/kuljetustieto/hinnoittelu' },
  robots: { index: true, follow: true },
};

const INCLUDED_SERVICES = [
  {
    title: 'Nouto ja toimitus sovittuun osoitteeseen',
    text: 'Haemme ajoneuvon sovitusta osoitteesta ja toimitamme sen perille — et tarvitse omaa peräkärryä etkä erillistä noutoreissua.',
  },
  {
    title: 'Ajoneuvon lastaus ja sidonta',
    text: 'Lastaus ramppia pitkin sekä ammattimainen sidonta liinoilla ja pehmusteilla. Sidonta tarkastetaan matkan aikana.',
  },
  {
    title: 'Suljettu kuljetustila',
    text: 'Ajoneuvo kulkee suljetussa umpikorissa suojassa säältä, tienpölyltä ja katseilta koko matkan ajan.',
  },
  {
    title: 'Kuljetusvakuutus',
    text: 'Kuljetukset hoidetaan voimassa olevan kuljetusvakuutuksen turvin. Vakuutusturva on luokkaa 50 000 € kertavahinkoa kohden, ja kuhunkin kuljetukseen sovellettava kattavuus vahvistetaan tarjouksessa ja sopimusehdoissa.',
  },
  {
    title: 'Kuljettajan työaika koko matkan ajalta',
    text: 'Hintaan sisältyy kuljettajan työaika koko matkan ajalta — myös lauttaosuudet ja ajoaika.',
  },
];

export default async function HinnoitteluPage() {
  const { data: routes } = await sanityFetch({ query: MP_FERRY_ROUTES_QUERY });

  return (
    <div className="legal-scroll">
      <section className="legal-page" aria-labelledby="pricing-title">
        <div className="legal-inner">
          <Link href="/kuljetustieto" className="blog-back">
            ← Takaisin kuljetustietoon
          </Link>

          <p className="legal-eyebrow">Hinnoittelu</p>
          <h1 id="pricing-title" className="legal-title">
            Näin kuljetuksen hinta ulkomaille muodostuu
          </h1>

          <p className="legal-intro">
            Kuljetuksen hinta rakentuu kahdesta osasta: varustamon perimästä lauttamaksusta ja
            itse kuljetuspalvelusta. Lauttamaksu on läpinäkyvä läpikulkuerä — se näkyy alla
            varustamon hinnaston mukaisena, emmekä lisää siihen omaa katetta. Kuljetuspalvelun
            osuus kattaa noudon, lastauksen, sidonnan, suljetun kuljetustilan, vakuutuksen ja
            kuljettajan työajan. Saat aina tarkan kokonaishinnan tarjouksessa ennen tilauksen
            vahvistamista.
          </p>

          {/* ── Ferry costs (from Sanity) ── */}
          <section className="legal-section" aria-labelledby="ferry-title">
            <h2 id="ferry-title" className="legal-section-title">
              Lauttamaksut reiteittäin
            </h2>

            {routes.length === 0 ? (
              <p className="legal-copy">
                Lauttahinnastoa päivitetään parhaillaan. Pyydä ajantasainen hinta tarjouksella.
              </p>
            ) : (
              <div className="ferry-grid">
                {routes.map((route) => {
                  const pricing = route.vehiclePricing ?? [];
                  const groups = groupByVehicle(pricing);
                  const isSplitPriced = hasSplitPricing(groups);

                  return (
                    <article key={route._id} className="ferry-card">
                      <header className="ferry-card-head">
                        <h3 className="ferry-route">{route.routeName}</h3>
                        <p className="ferry-meta">
                          {[
                            route.operator,
                            typeof route.crossingDurationHours === 'number'
                              ? `Ylitys ${formatDuration(route.crossingDurationHours)}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </header>

                      {isSplitPriced && (
                        <p className="ferry-split-note">
                          Tällä reitillä on erilliset hinnat meno- ja paluusuunnalle. Suunta on
                          merkitty kunkin hinnan kohdalle.
                        </p>
                      )}

                      {groups.length === 0 ? (
                        <p className="ferry-empty">Hinnat tarjouksen mukaan.</p>
                      ) : (
                        <ul className="ferry-price-list">
                          {groups.map((group) =>
                            group.entries.map((entry) => {
                              const label = entryLabel(entry, group.entries.length);
                              const note = entryNote(entry, group.entries.length);

                              return (
                                <li key={entry._key} className="ferry-price-row">
                                  <span className="ferry-vehicle">
                                    {group.label}
                                    {label && <span className="ferry-direction">{label}</span>}
                                    {note && <span className="ferry-row-note">{note}</span>}
                                  </span>
                                  <span className="ferry-price">
                                    {typeof entry.priceEur === 'number'
                                      ? formatEur(entry.priceEur)
                                      : 'Tarjouksen mukaan'}
                                    <span className="ferry-cabin">
                                      {entry.includesCabin ? 'sis. hytin' : 'ei hyttiä'}
                                    </span>
                                  </span>
                                </li>
                              );
                            })
                          )}
                        </ul>
                      )}

                      {groups.some(
                        (group) => group.entries.length === 1 && group.entries[0].notes
                      ) && (
                        <ul className="ferry-notes">
                          {groups
                            .filter((group) => group.entries.length === 1 && group.entries[0].notes)
                            .map((group) => (
                              <li key={group.type}>
                                <strong>{group.label}:</strong> {group.entries[0].notes}
                              </li>
                            ))}
                        </ul>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            <p className="legal-note">
              Lauttamaksut ovat varustamojen ilmoittamia hintoja ja voivat muuttua ilman
              ennakkoilmoitusta. Sesonkiaikoina ja tietyillä lähdöillä hinta voi poiketa
              taulukosta. Vahvistamme voimassa olevan lauttamaksun aina tarjouksessa.
            </p>
          </section>

          {/* ── What the transport service includes (static) ── */}
          <section className="legal-section" aria-labelledby="included-title">
            <h2 id="included-title" className="legal-section-title">
              Kuljetuspalveluun sisältyy
            </h2>

            <ul className="legal-list included-list">
              {INCLUDED_SERVICES.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="legal-area">
            <h2 className="legal-area-title">Pyydä tarkka hinta</h2>
            <p>
              Kokonaishinta riippuu reitistä, ajoneuvotyypistä, noutoajankohdasta ja mahdollisesta
              lauttaosuudesta. Kerro lähtö- ja kohdeosoite, niin saat sitovan tarjouksen.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
