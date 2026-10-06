import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import GroupTransportContent from './GroupTransportContent';

export const metadata: Metadata = {
  title: 'Yhteiskuljetuksen ennakkoilmoitus | MP-Logistiikka',
  description:
    'Ilmoita tuleva moottoripyöräkuljetus ennakkoon. Joustava aikataulu helpottaa kuljetusten yhdistämistä. Toteutuminen, aikataulu ja hinta vahvistetaan erikseen.',
  alternates: { canonical: 'https://www.mp-logistiikka.fi/yhteiskuljetus' },
};

export default function GroupTransportPage() {
  return (
    <section className="group-transport-page" aria-labelledby="group-transport-title">
      <div className="group-transport-inner">
        <div className="group-transport-header">
          <p className="group-transport-eyebrow">Yhteiskuljetus</p>
          <h1 id="group-transport-title" className="group-transport-title">
            Ilmoita tuleva kuljetus ennakkoon
          </h1>
          <p className="group-transport-lead">
            Joustava aikataulu helpottaa kuljetusten yhdistämistä. Kerro reitti ja toivottu
            ajankohta, niin voimme huomioida kuljetuksesi suunnittelussa.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="calc-form" role="status">
              Ladataan lomaketta…
            </div>
          }
        >
          <GroupTransportContent>
            <aside className="calc-result group-transport-info" aria-labelledby="group-how-title">
              <h2 id="group-how-title">Näin ennakkoilmoitus toimii</h2>
              <ol>
                <li>Ilmoita reitti ja sinulle sopiva kuljetusviikko tai aikaväli.</li>
                <li>
                  Selvitämme, voidaanko kuljetus yhdistää muihin samalla suunnalla tehtäviin
                  kuljetuksiin.
                </li>
                <li>Vahvistamme toteutumisen, aikataulun ja hinnan kanssasi erikseen.</li>
              </ol>
              <p>
                Yhdistäminen voi pienentää kuljetuskustannuksia. Ennakkoilmoitus ei takaa kuljetusta
                tai tiettyä alennusta.
              </p>
              <p>
                <strong>Kyseessä on ennakkoilmoitus, ei sitova kuljetustilaus.</strong>
              </p>
              <p>
                Kiireellinen kuljetus? <a href="/hinnasto">Laske kuljetuksen hinta</a> tai soita{' '}
                <a href="tel:+358503547763">050 354 7763</a>.
              </p>
              <Link href="/" className="btn-primary group-transport-home">
                Takaisin etusivulle
              </Link>
            </aside>
          </GroupTransportContent>
        </Suspense>
      </div>
    </section>
  );
}
