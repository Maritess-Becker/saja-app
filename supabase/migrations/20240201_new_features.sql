-- ── Feature 1: Emotionale Kapazität ───────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emotional_capacity text
  CHECK (emotional_capacity IN ('open','selective','light','slow'));

-- ── Feature 2: Was mich gerade bewegt ─────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_moment text;

-- ── Feature 3+5: Daily Limit + Revisit ────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_discover_count int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_discover_date  date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS revisit_profiles     uuid[] DEFAULT '{}';

-- ── Feature 11: Pause-Modus ────────────────────────────────────────────────
-- Nutzt bereits vorhandenes profile_paused Feld
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS paused_since timestamptz;

-- ── Feature 10: Emotional Check-ins ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS emotional_checkins (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trigger    text,
  response   text NOT NULL,
  note       text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE emotional_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "checkins_own" ON emotional_checkins
  FOR ALL USING (auth.uid() = user_id);

-- ── Feature 13: Journal ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS journal_entries (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt     text,
  content    text NOT NULL,
  trigger    text DEFAULT 'free',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "journal_own" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);
