-- =============================================================================
-- FunTunes Supabase Schema — Play Area Entries
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- =============================================================================

-- Entries table (replaces monthly "Funzone - Month Year" sheets)
create table if not exists entries (
  id bigint generated always as identity primary key,
  date date not null default current_date,
  customer_name text not null default '',
  amount integer not null default 0,
  mop text not null default '',
  socks integer not null default 0,
  socks_mop text not null default '',
  num_kids integer not null default 1,
  hours text not null default '1',
  time_in text not null default '',
  time_out text not null default '',
  timing text not null default '',
  phone text not null default '',
  dob text not null default '',
  entry_type text not null default 'funzone',
  created_at timestamptz not null default now()
);

-- Index for fast date lookups (today's entries, monthly queries)
create index if not exists idx_entries_date on entries (date desc);
create index if not exists idx_entries_phone on entries (phone);

-- Enable Row Level Security (allow all via anon key — same as current no-auth setup)
alter table entries enable row level security;
create policy "Allow all on entries" on entries for all using (true) with check (true);
