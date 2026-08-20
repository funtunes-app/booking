-- Create cash_expenses table for tracking daily misc expenses
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS cash_expenses (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'misc',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Allow all operations via anon key (same RLS as entries)
ALTER TABLE cash_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon" ON cash_expenses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_cash_expenses_date ON cash_expenses (date);
