import Link from 'next/link';

export default function KuljetushintaBody() {
  return (
    <>
      <p className="blog-p">
        {
          'Kansainvälisen kuljetuksen hinta rakentuu kahdesta osasta: varustamon perimästä lauttamaksusta ja itse kuljetuspalvelusta. Koska Saksassa on useita mahdollisia lähtöpaikkoja, kerromme alla kaksi tapaa, joilla kuljetus voidaan hoitaa — kumpi kannattaa, riippuu siitä, kuinka kaukana noutopaikka on Travemündesta.'
        }
      </p>
      <h2 className="blog-h2">{'1. Suora nouto meiltä'}</h2>
      <p className="blog-p">
        {
          'Haemme pyörän suoraan noutopaikalta ja kuljetamme sen läpi koko matkan. Tämä on edullisin ja nopein vaihtoehto, mitä lähempänä noutopaikka on Travemündea — hinta nousee ajomatkan mukana.'
        }
      </p>
      <div className="blog-table-wrap">
        <table className="blog-table">
          <caption className="blog-table-caption">
            {'Suuntaa-antavia kokonaishintoja Helsinkiin (sis. ALV):'}
          </caption>
          <thead>
            <tr>
              <th scope="col">{'Noutoalue Saksassa'}</th>
              <th scope="col">{'Etäisyys Travemündesta'}</th>
              <th scope="col">{'Arvioitu kokonaishinta'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" data-label={'Noutoalue Saksassa'}>
                {'Lyypekki / Hampuri / Kiel'}
              </th>
              <td data-label={'Etäisyys Travemündesta'}>{'~60 km'}</td>
              <td data-label={'Arvioitu kokonaishinta'}>{'n. 1 600 €'}</td>
            </tr>
            <tr>
              <th scope="row" data-label={'Noutoalue Saksassa'}>
                {'Hannover / Bremen / Berliini'}
              </th>
              <td data-label={'Etäisyys Travemündesta'}>{'~300 km'}</td>
              <td data-label={'Arvioitu kokonaishinta'}>{'n. 2 150 €'}</td>
            </tr>
            <tr>
              <th scope="row" data-label={'Noutoalue Saksassa'}>
                {'Ruhrin alue / Köln / Düsseldorf'}
              </th>
              <td data-label={'Etäisyys Travemündesta'}>{'~450 km'}</td>
              <td data-label={'Arvioitu kokonaishinta'}>{'n. 2 500 €'}</td>
            </tr>
            <tr>
              <th scope="row" data-label={'Noutoalue Saksassa'}>
                {'Frankfurt / Kassel / Leipzig / Dresden'}
              </th>
              <td data-label={'Etäisyys Travemündesta'}>{'~550 km'}</td>
              <td data-label={'Arvioitu kokonaishinta'}>{'n. 2 750 €'}</td>
            </tr>
            <tr>
              <th scope="row" data-label={'Noutoalue Saksassa'}>
                {'Stuttgart / Nürnberg / München'}
              </th>
              <td data-label={'Etäisyys Travemündesta'}>{'~700 km'}</td>
              <td data-label={'Arvioitu kokonaishinta'}>{'n. 3 100 €'}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 className="blog-h2">
        {'2. Kuljetus yhteistyökumppanimme kautta lähimpään terminaaliin'}
      </h2>
      <p className="blog-p">
        {
          'Jos noutopaikka on kauempana Travemündesta — esimerkiksi Etelä- tai Länsi-Saksassa — voi olla edullisempaa tilata pyörän kuljetus ensin yhteistyökumppanimme kautta heidän lähimpään terminaaliinsa Saksassa. Haemme pyörän sitten terminaalilta ja hoidamme loppumatkan Travemünden kautta Suomeen. Mitä kauempana pyörä alun perin on Travemündesta, sitä enemmän tässä vaihtoehdossa yleensä säästää verrattuna suoraan noutoon meiltä.'
        }
      </p>
      <p className="blog-p">
        {
          'Kuljetuksesta peritään 40 % ennakkomaksu tilausvahvistuksen yhteydessä, loppuosa laskutetaan toimituksen yhteydessä.'
        }
      </p>
      <h2 className="blog-h2">{'Esimerkkilaskelma: Helsinki–München, Saksa'}</h2>
      <ul className="blog-list">
        <li>{'Ajo Helsinki–satama (paikallinen) — ~0,5 h'}</li>
        <li>
          {
            'Lauttamaksu Helsinki–Travemünde–Helsinki — ~900–1 500 € (kausivaihtelu; kesäkausi hintahaarukan yläpäässä)'
          }
        </li>
        <li>{'Ajo Travemünde–München (~700 km, molempiin suuntiin ~1 400 km) — ~7,5 h/suunta'}</li>
        <li>
          {
            'Kuljetuspalvelu (nouto, lastaus, sidonta, ajo, kuljettajan työaika, vakuutus) — ~1 400–1 600 €'
          }
        </li>
      </ul>
      <p className="blog-p">{'Kokonaishinta sis. ALV: n. 2 350–3 100 €'}</p>
      <p className="blog-p">{'Arvioitu kesto nouto–toimitus: noin 5–5,5 vuorokautta'}</p>
      <h2 className="blog-h2">{'Esimerkkilaskelma: Helsinki–Fuengirola/Malaga, Espanja'}</h2>
      <ul className="blog-list">
        <li>{'Ajo Helsinki–satama (paikallinen) — ~0,5 h'}</li>
        <li>{'Lauttamaksu Helsinki–Travemünde–Helsinki — ~900–1 500 € (kausivaihtelu)'}</li>
        <li>
          {
            'Ajo Travemünde–kumppanin noutopiste (~300 km, molempiin suuntiin ~600 km) — ~3,5 h/suunta'
          }
        </li>
        <li>{'Luovutus kuljetuskumppanille Saksassa'}</li>
        <li>{'Kuljetus Saksa–Espanja–Saksa (yhteistyökumppanimme kautta)'}</li>
        <li>
          {
            'Kuljetuspalvelu (nouto, lastaus, sidonta, ajo, kuljettajan työaika, vakuutus, koordinointi)'
          }
        </li>
      </ul>
      <p className="blog-p">
        {
          'Kokonaishinta sis. ALV: alkaen n. 2 000 €/moottoripyörä (ryhmäkuljetuksissa, enintään 4 pyörää — hinta per pyörä laskee ryhmäkoon kasvaessa)'
        }
      </p>
      <p className="blog-p">
        {'Arvioitu kesto nouto–toimitus: noin 2–3 viikkoa (riippuu kumppanin lähtöaikataulusta)'}
      </p>
      <h2 className="blog-h2">{'Ryhmäalennus MC-porukoille'}</h2>
      <p className="blog-p">
        {
          'Kuljetamme mielellämme useampaa pyörää samalla reissulla. Enintään 4 pyörän ryhmäkuljetuksessa hinta per moottoripyörä laskee selvästi, koska lauttamaksu ja ajokilometrit jakautuvat useamman pyörän kesken. Kerro montako pyörää olette liikkeellä, niin lasketaan teille ryhmähinta.'
        }
      </p>
      <h2 className="blog-h2">{'Talvisäilytys Espanjassa'}</h2>
      <p className="blog-p">
        {'Kysy myös mahdollisuudesta säilyttää moottoripyörä Espanjassa talvikaudeksi.'}
      </p>
      <p className="blog-p">
        {
          'Lauttamaksut ovat varustamojen ilmoittamia hintoja ja voivat muuttua ilman ennakkoilmoitusta. Vahvistamme voimassa olevan lauttamaksun ja kokonaishinnan aina tarjouksessa. Katso ajoneuvokohtaiset lauttahinnat '
        }
        <Link href={'/ulkomaat/hinnoittelu'} className="blog-link">
          {'Hinnoittelu-sivulta'}
        </Link>
        {'.'}
      </p>
    </>
  );
}
