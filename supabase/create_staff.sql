-- =============================================================================
-- FunTunes Staff & Attendance Tables
-- Run this in the Supabase SQL Editor
-- =============================================================================

-- Staff members
create table if not exists staff (
  id bigint generated always as identity primary key,
  name text not null default '',
  phone text not null default '',
  role text not null default 'Staff',
  monthly_salary integer not null default 0,
  join_date date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table staff enable row level security;
create policy "Allow all on staff" on staff for all using (true) with check (true);

-- Attendance records
create table if not exists staff_attendance (
  id bigint generated always as identity primary key,
  staff_id bigint not null references staff(id) on delete cascade,
  date date not null default current_date,
  status text not null default 'present',
  check_in text not null default '',
  check_out text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  unique(staff_id, date)
);

create index if not exists idx_staff_attendance_date on staff_attendance (date desc);
create index if not exists idx_staff_attendance_staff on staff_attendance (staff_id);

alter table staff_attendance enable row level security;
create policy "Allow all on staff_attendance" on staff_attendance for all using (true) with check (true);
