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

  return (
    <OrderForm
      prefillOrigin={origin}
      prefillDestination={destination}
      prefillBikeType={bikeType}
      prefillPrice={price}
    />
  );
}
