-- ============================================================
-- Supabase Migration: Call Insights Table
-- Provides real-time and post-call AI analysis outputs
-- Run this in the Supabase SQL Editor (Dashboard -> SQL)
-- ============================================================

CREATE TABLE IF NOT EXISTS call_insights (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id          UUID REFERENCES calls(id) ON DELETE CASCADE NOT NULL UNIQUE,
  reply_text       TEXT,
  lead_score       INTEGER CHECK (lead_score BETWEEN 0 AND 100),
  emotion          TEXT,
  intent           TEXT,
  next_best_action TEXT,
  summary          TEXT,
  is_final         BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_insights_call_id ON call_insights(call_id);

-- Auto-update updated_at on call_insights
CREATE TRIGGER call_insights_updated_at
  BEFORE UPDATE ON call_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
