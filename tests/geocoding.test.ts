import { test } from 'node:test';
import assert from 'node:assert/strict';
import { geocodeLocation } from '../lib/geocoding';
import { GET } from '../app/api/distance/route';
import { NextRequest } from 'next/server';

test('geocoding biases Finland without excluding explicit foreign places and rejects uncertain matches', async () => {
  const previous = global.fetch;
  try {
    global.fetch = async (input) => {
      const url = new URL(String(input));
      assert.equal(url.searchParams.get('region'), 'fi');
      assert.equal(url.searchParams.get('address'), 'Berlin, Deutschland');
      assert.equal(url.searchParams.has('components'), false);
      return Response.json({
        status: 'OK',
        results: [{ place_id: 'berlin', formatted_address: 'Berliini, Saksa' }],
      });
    };
    assert.deepEqual(await geocodeLocation('test', 'Berlin, Deutschland'), {
      placeId: 'berlin',
      address: 'Berliini, Saksa',
    });
    global.fetch = async () => Response.json({ status: 'ZERO_RESULTS' });
    await assert.rejects(geocodeLocation('test', 'tuntematon'), /ei löydy/);
    global.fetch = async () =>
      Response.json({
        status: 'OK',
        results: [{ place_id: 'guess', formatted_address: 'Guess', partial_match: true }],
      });
    await assert.rejects(geocodeLocation('test', 'tuntematon'), /ei tunnistettu varmasti/);
  } finally {
    global.fetch = previous;
  }
});

test('quote routes resolved place IDs, accepts a zero positioning leg, and rejects missing positioning', async () => {
  const previous = global.fetch;
  const previousKey = process.env.GOOGLE_MAPS_API_KEY;
  process.env.GOOGLE_MAPS_API_KEY = 'test';
  let failPositioning = false;
  try {
    global.fetch = async (input, init) => {
      if (String(input).includes('/geocode/')) {
        const address = new URL(String(input)).searchParams.get('address')!;
        return Response.json({
          status: 'OK',
          results: [
            {
              place_id: address.startsWith('Riihimäki') ? 'base' : 'kuopio',
              formatted_address: address,
            },
          ],
        });
      }
      const body = JSON.parse(String(init?.body));
      const origin = body.origins[0].waypoint.placeId;
      const destination = body.destinations[0].waypoint.placeId;
      assert.notEqual(origin, destination, 'zero leg should not call Routes');
      assert.ok(['base', 'kuopio'].includes(origin));
      if (failPositioning && origin === 'base') return Response.json([{ status: { code: 5 } }]);
      return Response.json([{ distanceMeters: 352000, duration: '13680s', status: {} }]);
    };
    const request = () =>
      new NextRequest('http://localhost/api/distance?origin=Kuopio&destination=Riihim%C3%A4ki');
    const response = await GET(request());
    assert.equal(response.status, 200);
    assert.equal((await response.json()).positioningFromDeliveryKm, 0);
    failPositioning = true;
    const failure = await GET(request());
    assert.equal(failure.status, 503);
    assert.match((await failure.json()).error, /Kaikkia reittiosuuksia/);
  } finally {
    global.fetch = previous;
    if (previousKey === undefined) delete process.env.GOOGLE_MAPS_API_KEY;
    else process.env.GOOGLE_MAPS_API_KEY = previousKey;
  }
});
