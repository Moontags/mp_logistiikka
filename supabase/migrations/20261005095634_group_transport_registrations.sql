begin;

create table public.group_transport_registrations (
  id uuid primary key,
  dedupe_key text not null unique check (dedupe_key ~ '^[a-f0-9]{64}$'),
  origin text not null check (char_length(origin) between 2 and 100),
  destination text not null check (char_length(destination) between 2 and 100),
  bike_type text not null check (bike_type in ('scooter', 'standard', 'large')),
  timeframe_type text not null check (timeframe_type in ('week', 'interval')),
  requested_week text,
  start_date date,
  end_date date,
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  email text not null check (char_length(email) between 3 and 254),
  phone text not null check (char_length(phone) between 6 and 30),
  notes text not null default '' check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  notification_status text not null default 'pending' check (notification_status in ('pending', 'sending', 'sent', 'failed')),
  notification_attempts integer not null default 0,
  notification_claim uuid,
  notification_locked_until timestamptz,
  notification_sent_at timestamptz,
  notification_error text,
  check (
    (timeframe_type = 'week' and requested_week is not null and requested_week ~ '^\d{4}-W\d{2}$' and start_date is null and end_date is null)
    or (timeframe_type = 'interval' and requested_week is null and start_date is not null and end_date is not null and end_date >= start_date and end_date - start_date <= 90)
  )
);

create table public.group_transport_rate_limits (
  rate_key text not null check (rate_key ~ '^[a-f0-9]{64}$'),
  bucket timestamptz not null,
  attempts integer not null default 1,
  primary key (rate_key, bucket)
);

alter table public.group_transport_registrations enable row level security;
alter table public.group_transport_rate_limits enable row level security;
-- No public policies: both anonymous AND authenticated visitors are denied.
revoke all on public.group_transport_registrations, public.group_transport_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.group_transport_registrations, public.group_transport_rate_limits to service_role;
create index group_transport_notification_queue on public.group_transport_registrations (created_at) where notification_status in ('pending', 'failed', 'sending');

create function public.register_group_transport(p_id uuid, p_dedupe_key text, p_rate_key text, p_contact_key text, p_data jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  existing public.group_transport_registrations%rowtype;
  ip_attempts integer;
  contact_attempts integer;
begin
  -- Persistent, atomic rate limits across all Next.js function instances.
  insert into public.group_transport_rate_limits(rate_key, bucket)
  values (p_rate_key, date_trunc('hour', now()))
  on conflict (rate_key, bucket) do update set attempts = public.group_transport_rate_limits.attempts + 1
  returning attempts into ip_attempts;
  insert into public.group_transport_rate_limits(rate_key, bucket)
  values (p_contact_key, date_trunc('day', now()))
  on conflict (rate_key, bucket) do update set attempts = public.group_transport_rate_limits.attempts + 1
  returning attempts into contact_attempts;
  if ip_attempts > 8 or contact_attempts > 8 then
    raise sqlstate 'PT429' using message = 'Too many submissions';
  end if;
  delete from public.group_transport_rate_limits where bucket < now() - interval '2 days';

  perform pg_advisory_xact_lock(hashtextextended('group-transport:' || p_dedupe_key, 0));
  select * into existing from public.group_transport_registrations where id = p_id;
  if found and existing.dedupe_key <> p_dedupe_key then
    raise sqlstate 'PT409' using message = 'Idempotency key already used';
  end if;
  select * into existing from public.group_transport_registrations where dedupe_key = p_dedupe_key;
  if found then
    return jsonb_build_object('id', existing.id, 'created', false);
  end if;

  insert into public.group_transport_registrations (
    id, dedupe_key, origin, destination, bike_type, timeframe_type, requested_week,
    start_date, end_date, customer_name, email, phone, notes
  ) values (
    p_id, p_dedupe_key, p_data->>'origin', p_data->>'destination', p_data->>'bikeType',
    p_data->>'timeframeType', nullif(p_data->>'week', ''),
    nullif(p_data->>'startDate', '')::date, nullif(p_data->>'endDate', '')::date,
    p_data->>'name', p_data->>'email', p_data->>'phone', coalesce(p_data->>'notes', '')
  );
  return jsonb_build_object('id', p_id, 'created', true);
end;
$$;

create function public.claim_group_transport_email(p_id uuid, p_claim uuid)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare claimed uuid;
begin
  update public.group_transport_registrations
  set notification_status = 'sending', notification_claim = p_claim,
      notification_attempts = notification_attempts + 1, notification_locked_until = now() + interval '5 minutes'
  where id = p_id and notification_status in ('pending', 'failed')
    and notification_attempts < 3
    and (notification_locked_until is null or notification_locked_until <= now())
  returning id into claimed;
  -- Never automatically reclaim 'sending': the SMTP server may have accepted it.
  return claimed is not null;
end;
$$;

create function public.finish_group_transport_email(p_id uuid, p_claim uuid, p_sent boolean)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare completed uuid;
begin
  update public.group_transport_registrations
  set notification_status = case when p_sent then 'sent' else 'failed' end,
      notification_sent_at = case when p_sent then now() else null end,
      notification_error = case when p_sent then null else 'smtp_failed' end,
      notification_locked_until = case when p_sent then null else now() + interval '1 minute' end,
      notification_claim = null
  where id = p_id and notification_claim = p_claim and notification_status = 'sending'
  returning id into completed;
  return completed is not null;
end;
$$;

revoke all on function public.register_group_transport(uuid, text, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.claim_group_transport_email(uuid, uuid) from public, anon, authenticated;
revoke all on function public.finish_group_transport_email(uuid, uuid, boolean) from public, anon, authenticated;
grant execute on function public.register_group_transport(uuid, text, text, text, jsonb) to service_role;
grant execute on function public.claim_group_transport_email(uuid, uuid) to service_role;
grant execute on function public.finish_group_transport_email(uuid, uuid, boolean) to service_role;

comment on table public.group_transport_registrations is 'Private advance notices. Not bookings. No public customer-data access.';
notify pgrst, 'reload schema';
commit;
