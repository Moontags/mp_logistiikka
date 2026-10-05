import { BIKE_OPTIONS } from '../pricing';
import { timeframeLabel, type Registration } from './validation';

export function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );
}

export function groupTransportEmail(data: Registration, id: string) {
  const rows = [
    ['Asiakas', data.name],
    ['Sähköposti', data.email],
    ['Puhelin', data.phone],
    ['Lähtöpaikkakunta', data.origin],
    ['Määränpää', data.destination],
    ['Pyörätyyppi', BIKE_OPTIONS.find((option) => option.value === data.bikeType)!.label],
    ['Toivottu ajankohta', timeframeLabel(data)],
    ['Lisätiedot', data.notes || '–'],
    ['Ilmoituksen tunnus', id],
  ];
  const notice =
    'Ennakkoilmoitus, ei sitova kuljetustilaus. Toteutuminen, aikataulu ja hinta vahvistetaan erikseen.';
  return {
    from: '"MP-Logistiikka yhteiskuljetukset" <info@mp-logistiikka.fi>',
    to: 'info@mp-logistiikka.fi',
    replyTo: { name: data.name, address: data.email },
    messageId: `<yhteiskuljetus-${id}@mp-logistiikka.fi>`,
    subject: `Yhteiskuljetuksen ennakkoilmoitus: ${data.origin} → ${data.destination}`,
    text: `${notice}\n\n${rows.map(([label, value]) => `${label}: ${value}`).join('\n')}`,
    html: `<div style="font-family:sans-serif;max-width:600px"><h2>Yhteiskuljetuksen ennakkoilmoitus</h2><p>${notice}</p><table>${rows.map(([label, value]) => `<tr><th style="padding:8px;text-align:left;vertical-align:top">${escapeHtml(label)}</th><td style="padding:8px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join('')}</table><p>Vastaa tähän viestiin asiakkaalle.</p></div>`,
  };
}
