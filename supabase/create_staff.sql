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
  shift text not null default 'morning',
  fixed_pay integer not null default 0,
  pro_rata_base integer not null default 0,
  hours_per_shift integer not null default 4,
  paid_holidays integer not null default 4,
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

-- ═══════════════════════════════════════════════════════════════
-- Seed staff members
-- ═══════════════════════════════════════════════════════════════

INSERT INTO staff (name, phone, role, shift, fixed_pay, pro_rata_base, hours_per_shift, paid_holidays, active)
VALUES
  ('Genesis',   '', 'Staff', 'evening', 0,     7000, 6, 4, true),
  ('Malini',    '', 'Staff', 'evening', 12000, 7000, 6, 4, true),
  ('Divya',     '', 'Staff', 'morning', 5000,  5000, 4, 4, true),
  ('Dhavamani', '', 'Staff', 'weekend', 2000,  0,    8, 0, true);
