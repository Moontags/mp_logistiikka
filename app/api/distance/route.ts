import { NextRequest, NextResponse } from 'next/server';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h} t ${m} min`;
  if (h > 0) return `${h} t`;
  return `${m} min`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');

  if (!origin || !destination) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const body = {
    origins: [{ waypoint: { address: `${origin}, Finland` } }],
    destinations: [{ waypoint: { address: `${destination}, Finland` } }],
    travelMode: 'DRIVE',
    routingPreference: 'TRAFFIC_UNAWARE',
  };

  const res = await fetch(
    'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey!,
        'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,status',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('Routes API error:', err);
    return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  }

  const data = await res.json();
  const element = Array.isArray(data) ? data[0] : data;

  // status:{} (empty) = OK, non-zero code = error
  const statusCode = element.status?.code;
  if (!element || !element.distanceMeters || (statusCode !== undefined && statusCode !== 0)) {
    return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  }

  const km = Math.round(element.distanceMeters / 1000);
  const durationSec = parseInt(element.duration?.replace('s', '') ?? '0', 10);
  const duration = formatDuration(durationSec);

  return NextResponse.json({ km, duration });
}
