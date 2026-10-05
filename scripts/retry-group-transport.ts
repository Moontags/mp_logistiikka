import { getGroupTransportDatabase } from '../lib/group-transport/database';
import { notifyRegistration } from '../lib/group-transport/service';
import type { Registration } from '../lib/group-transport/validation';

async function main() {
  // Run locally with private environment variables; never expose this as a public API.
  const send = process.argv.includes('--send');
  const db = getGroupTransportDatabase();
  const { data, error } = await db
    .from('group_transport_registrations')
    .select('*')
    .in('notification_status', ['pending', 'failed'])
    .lt('notification_attempts', 3)
    .order('created_at')
    .limit(100);
  if (error) throw new Error('Notification queue unavailable');
  for (const row of data ?? []) {
    console.log(row.id, row.notification_status, `attempts=${row.notification_attempts}`);
    if (!send) continue;
    const registration: Registration = {
      origin: row.origin,
      destination: row.destination,
      bikeType: row.bike_type,
      timeframeType: row.timeframe_type,
      week: row.requested_week ?? '',
      startDate: row.start_date ?? '',
      endDate: row.end_date ?? '',
      name: row.customer_name,
      email: row.email,
      phone: row.phone,
      notes: row.notes,
    };
    await notifyRegistration(row.id, registration);
  }
  if (!send) console.log('Inspection only. Add --send to send real business notifications.');
}
void main().catch(() => {
  console.error('Notification queue unavailable');
  process.exitCode = 1;
});
