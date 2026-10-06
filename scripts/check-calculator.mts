import { calculatePrice } from '../lib/pricing';
const pairs = [
  ['Oulu', 'Helsinki'],
  ['Rovaniemi', 'Tampere'],
  ['Vaasa', 'Turku'],
  ['Joensuu', 'Espoo'],
  ['Kuopio', 'Riihimäki'],
  ['Hämeenlinna', 'Lahti'],
  ['Pudasjärvi', 'Vantaa'],
];
for (const [origin, destination] of pairs) {
  const res = await fetch(
    (process.env.CALCULATOR_BASE_URL || 'http://localhost:3000') +
      '/api/distance?' +
      new URLSearchParams({ origin, destination }),
  );
  const data = await res.json();
  const price = res.ok
    ? calculatePrice(data.km, 'standard', {
        toPickupKm: data.positioningToPickupKm,
        fromDeliveryKm: data.positioningFromDeliveryKm,
      })
    : null;
  console.log(JSON.stringify({ origin, destination, status: res.status, ...data, price }));
}
