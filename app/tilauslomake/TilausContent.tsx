'use client';

import { useSearchParams } from 'next/navigation';
import OrderForm from '@/components/OrderForm';
import { BikeType } from '@/lib/pricing';

export default function TilausContent() {
  const params = useSearchParams();
  const origin = params.get('origin') || '';
  const destination = params.get('destination') || '';
  const bikeType = (params.get('bikeType') || 'standard') as BikeType;
  const rawPrice = parseFloat(params.get('price') || '0');
  const price = rawPrice > 0 ? rawPrice : undefined;

  // Laskurin "Tilaa tämä kuljetus" tuo mukanaan hinnan ja reitin -> kyseessä on tilaus,
  // ei tarjouspyyntö (headerin "Pyydä tarjous" linkittää ilman parametreja).
  const mode = price !== undefined && origin && destination ? 'order' : 'quote';

  return (
    <OrderForm
      prefillOrigin={origin}
      prefillDestination={destination}
      prefillBikeType={bikeType}
      prefillPrice={price}
      mode={mode}
    />
  );
}
