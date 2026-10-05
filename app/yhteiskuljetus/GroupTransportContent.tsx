'use client';
import type { ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import GroupTransportForm from '@/components/GroupTransportForm';
import { prefillFromParams } from '@/lib/group-transport/validation';

export default function GroupTransportContent({ children }: { children?: ReactNode }) {
  const params = useSearchParams();
  const prefill = prefillFromParams(params);
  return (
    <GroupTransportForm key={JSON.stringify(prefill)} prefill={prefill}>
      {children}
    </GroupTransportForm>
  );
}
