export type ResolvedLocation = { address: string; placeId: string };

/** Finland is a bias, not a restriction: explicit foreign addresses remain usable. */
export async function geocodeLocation(apiKey: string, input: string): Promise<ResolvedLocation> {
  const params = new URLSearchParams({ address: input, region: 'fi', language: 'fi', key: apiKey });
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`, {
    signal: AbortSignal.timeout(10_000),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Paikkahaku ei ole juuri nyt käytettävissä.');
  const data = await response.json();
  if (data.status === 'ZERO_RESULTS')
    throw new Error(`Paikkaa ”${input}” ei löydy. Tarkista nimi.`);
  if (data.status !== 'OK') {
    console.error('Geocoding API status:', data.status);
    throw new Error('Paikkahaku ei ole juuri nyt käytettävissä.');
  }
  const result = data.results?.[0];
  if (!result?.place_id || !result.formatted_address || result.partial_match) {
    throw new Error(`Paikkaa ”${input}” ei tunnistettu varmasti. Tarkista nimi ja paikkakunta.`);
  }
  return { address: result.formatted_address, placeId: result.place_id };
}
