-- ============================================================
-- Vapi Webhook Backend - Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard -> SQL)
-- ============================================================

-- Table 1: calls - one row per Vapi call
CREATE TABLE IF NOT EXISTS calls (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_call_id TEXT UNIQUE NOT NULL,
  assistant_id     TEXT,
  customer_number  TEXT,
  status           TEXT NOT NULL DEFAULT 'queued',
  outcome          TEXT,
  lead_score       INTEGER,
  started_at       TIMESTAMPTZ,
  ended_at         TIMESTAMPTZ,
  summary          TEXT,
  cost             NUMERIC(10,4),
  duration_seconds INTEGER,
  raw_end_report   JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calls_provider_call_id ON calls(provider_call_id);

-- Table 2: transcripts - one row per final transcript segment
CREATE TABLE IF NOT EXISTS transcripts (
  id      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL,
  text    TEXT NOT NULL,
  ts      TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transcripts_call_id ON transcripts(call_id);

-- Table 3: callback_queue - rows created when agent triggers callback
CREATE TABLE IF NOT EXISTS callback_queue (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id         UUID REFERENCES calls(id) ON DELETE SET NULL,
  customer_number TEXT,
  reason          TEXT,
  priority        TEXT DEFAULT 'normal',
  status          TEXT DEFAULT 'pending',
  requested_at    TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_callback_queue_status ON callback_queue(status);

-- Auto-update updated_at on calls
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calls_updated_at
  BEFORE UPDATE ON calls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
