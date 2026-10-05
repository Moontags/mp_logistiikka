'use client';
import { useSearchParams } from 'next/navigation';
import GroupTransportForm from '@/components/GroupTransportForm';
import { prefillFromParams } from '@/lib/group-transport/validation';

export default function GroupTransportContent() {
  const params = useSearchParams();
  const prefill = prefillFromParams(params);
  return <GroupTransportForm key={JSON.stringify(prefill)} prefill={prefill} />;
}
