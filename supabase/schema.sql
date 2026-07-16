-- Trek Captain — Supabase Schema
-- Run this in the Supabase SQL Editor after creating your project.
-- Field names are adapted to match the existing Next.js app conventions.

-- ============================================================
-- CAPTAINS (public profile, 1:1 with auth.users)
-- ============================================================
create table captains (
  id uuid primary key references auth.users on delete cascade,
  slug text unique not null,
  brand_name text not null,
  full_name text not null,
  tagline text,
  bio text,
  avatar_url text,
  cover_url text,
  accent_color text default '#FF6B2C',
  whatsapp text,
  instagram text,
  email text,
  city text,
  is_public boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- TREKS
-- Keeps 'title' and 'location' from the existing app (not 'name'/'destination').
-- ============================================================
create table treks (
  id uuid primary key default gen_random_uuid(),
  captain_id uuid not null references captains(id) on delete cascade,
  slug text not null,
  title text not null,
  location text not null,
  region text,
  start_date date not null,
  end_date date not null,
  difficulty text not null check (difficulty in ('Easy','Moderate','Hard')),
  price_per_person integer not null,
  max_capacity integer not null,
  cover_color text default '#FF6B2C',
  meeting_point text,
  status text not null default 'Upcoming' check (status in ('Upcoming','Ongoing','Completed','Cancelled')),
  description text,
  itinerary jsonb default '[]'::jsonb,      -- [{day, title, description}]
  packing_list jsonb default '[]'::jsonb,   -- ["Trek shoes", ...]
  inclusions jsonb default '[]'::jsonb,     -- ["Transport", "Breakfast"]
  exclusions jsonb default '[]'::jsonb,
  cover_url text,
  gallery jsonb default '[]'::jsonb,        -- [url, url]
  highlights text,
  notes text,
  is_published boolean default false,
  created_at timestamptz default now(),
  unique (captain_id, slug)
);

-- ============================================================
-- PARTICIPANTS (PRIVATE — never exposed publicly)
-- Payment totals are computed from the payments table, not stored here.
-- ============================================================
create table participants (
  id uuid primary key default gen_random_uuid(),
  trek_id uuid not null references treks(id) on delete cascade,
  captain_id uuid not null references captains(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  age integer,
  gender text,
  blood_group text,
  emergency_contact text,
  emergency_contact_phone text,
  status text default 'Confirmed' check (status in ('Confirmed','Waitlist','Cancelled')),
  checked_in boolean default false,
  medical_notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- PAYMENTS (separate table — preserves advance + balance history)
-- amount_paid per participant is sum(payments.amount)
-- ============================================================
create table payments (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  trek_id uuid not null references treks(id) on delete cascade,
  captain_id uuid not null references captains(id) on delete cascade,
  amount integer not null,
  mode text check (mode in ('UPI','Cash','Bank')),
  note text,
  paid_at timestamptz default now()
);

-- ============================================================
-- EXPENSES
-- ============================================================
create table expenses (
  id uuid primary key default gen_random_uuid(),
  trek_id uuid not null references treks(id) on delete cascade,
  captain_id uuid not null references captains(id) on delete cascade,
  title text not null,
  amount integer not null,
  category text check (category in ('Transport','Food','Stay','Permits','Misc')),
  paid_by text,
  date date default current_date
);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
create table announcements (
  id uuid primary key default gen_random_uuid(),
  trek_id uuid not null references treks(id) on delete cascade,
  captain_id uuid not null references captains(id) on delete cascade,
  message text not null,
  priority text default 'Normal' check (priority in ('Normal','Urgent')),
  is_public boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- PUBLIC VIEW: spots left WITHOUT exposing participant rows
-- Uses definer security (default) — bypasses RLS on participants
-- so anon gets the real count. The view itself is explicitly granted.
-- ============================================================
create view trek_public_stats as
select
  t.id as trek_id,
  count(p.id)::int as booked_count
from treks t
left join participants p on p.trek_id = t.id and p.status != 'Cancelled'
group by t.id;

grant select on trek_public_stats to anon;
grant select on trek_public_stats to authenticated;

-- ============================================================
-- ROW LEVEL SECURITY
-- proxy.ts is a routing layer, NOT a security boundary (CVE-2025-29927).
-- RLS is the real protection. Participant data is owner-only.
-- ============================================================

alter table captains enable row level security;
alter table treks enable row level security;
alter table participants enable row level security;
alter table payments enable row level security;
alter table expenses enable row level security;
alter table announcements enable row level security;

-- CAPTAINS: anyone can read public profiles; only owner can write
create policy "public read captains"
  on captains for select
  using (is_public = true);

create policy "owner manage captain"
  on captains for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- TREKS: anyone can read PUBLISHED treks; owner full access
create policy "public read published treks"
  on treks for select
  using (is_published = true);

create policy "owner manage treks"
  on treks for all
  using (auth.uid() = captain_id)
  with check (auth.uid() = captain_id);

-- PARTICIPANTS: owner only. NO public policy.
create policy "owner manage participants"
  on participants for all
  using (auth.uid() = captain_id)
  with check (auth.uid() = captain_id);

-- PAYMENTS: owner only. NO public policy.
create policy "owner manage payments"
  on payments for all
  using (auth.uid() = captain_id)
  with check (auth.uid() = captain_id);

-- EXPENSES: owner only.
create policy "owner manage expenses"
  on expenses for all
  using (auth.uid() = captain_id)
  with check (auth.uid() = captain_id);

-- ANNOUNCEMENTS: public only if flagged AND trek is published; owner full access
create policy "public read public announcements"
  on announcements for select
  using (
    is_public = true
    and exists (
      select 1 from treks
      where treks.id = announcements.trek_id
      and treks.is_published = true
    )
  );

create policy "owner manage announcements"
  on announcements for all
  using (auth.uid() = captain_id)
  with check (auth.uid() = captain_id);

-- ============================================================
-- STORAGE: create the trek-media bucket (public read)
-- Do this in the Supabase Dashboard → Storage → New Bucket:
--   Name: trek-media
--   Public: ON
--   Allowed MIME types: image/*
--   Max file size: 5 MB
-- Then add this policy in SQL:
-- ============================================================
-- Allow authenticated users to upload to their own folder
-- create policy "captain upload" on storage.objects for insert
--   with check (bucket_id = 'trek-media' and auth.uid()::text = (storage.foldername(name))[1]);
-- Allow public reads
-- create policy "public read media" on storage.objects for select
--   using (bucket_id = 'trek-media');
-- Allow owners to delete their own files
-- create policy "captain delete own" on storage.objects for delete
--   using (bucket_id = 'trek-media' and auth.uid()::text = (storage.foldername(name))[1]);
