import { Suspense } from 'react';
import TilausContent from './TilausContent';

export default function TilauslomakePage() {
  return (
    <Suspense>
      <TilausContent />
    </Suspense>
  );
}
