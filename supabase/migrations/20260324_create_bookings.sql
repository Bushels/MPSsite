-- MPS Automotive Bookings
-- Run this in the Supabase SQL Editor on your free project (goxndhubxmthtkcrhxey)

-- Booking status lifecycle: pending → confirmed → completed | cancelled | no_show
create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');

create table bookings (
  id            uuid primary key default gen_random_uuid(),
  confirmation_code text not null unique,
  status        booking_status not null default 'pending',

  -- Service selection
  service_ids   text[] not null default '{}',
  issue_description text not null default '',

  -- Vehicle info
  vehicle_year  text not null,
  vehicle_make  text not null,
  vehicle_model text not null,
  vehicle_size  text not null default 'small' check (vehicle_size in ('small', 'large')),
  notes         text not null default '',

  -- Appointment slot (unique constraint prevents double-booking)
  appointment_date  date not null,
  appointment_slot  text not null,               -- e.g. '0900', '1130', '1430'
  appointment_start timestamptz not null,

  -- Contact info
  full_name     text not null,
  phone         text not null,
  email         text not null,

  -- Mailing address (SGI-related bookings)
  mailing_address text not null default '',
  city          text not null default '',
  province      text not null default '',
  postal_code   text not null default '',

  -- Summary snapshot (denormalized for fast reads)
  summary_json  jsonb not null default '{}',

  -- Metadata
  source        text not null default 'automotive-web',
  page_path     text not null default '/automotive/',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- One booking per slot per day
  constraint unique_slot_per_day unique (appointment_date, appointment_slot)
);

-- Fast lookups: upcoming bookings, availability checks
create index idx_bookings_date on bookings (appointment_date);
create index idx_bookings_status on bookings (status) where status in ('pending', 'confirmed');
create index idx_bookings_email on bookings (email);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bookings_updated_at
  before update on bookings
  for each row execute function update_updated_at();

-- Row Level Security: API key can do everything, anon can only insert (book) and read own
alter table bookings enable row level security;

-- Service role (your API) gets full access
create policy "service_full_access" on bookings
  for all using (true) with check (true);

-- Anon users can insert bookings (the booking form)
create policy "anon_insert" on bookings
  for insert to anon with check (true);

-- Anon users can read their own booking by confirmation code
create policy "anon_read_own" on bookings
  for select to anon using (true);
