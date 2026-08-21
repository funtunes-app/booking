-- Create monthly_expenses table for tracking recurring monthly costs
-- (rent, EB, salary, maintenance, marketing, misc)
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS monthly_expenses (
  id BIGSERIAL PRIMARY KEY,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year BETWEEN 2024 AND 2100),
  category TEXT NOT NULL DEFAULT 'misc',
  amount INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Allow all operations via anon key (same RLS as entries)
ALTER TABLE monthly_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon" ON monthly_expenses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for month+year queries
CREATE INDEX IF NOT EXISTS idx_monthly_expenses_month_year
  ON monthly_expenses (year, month);
