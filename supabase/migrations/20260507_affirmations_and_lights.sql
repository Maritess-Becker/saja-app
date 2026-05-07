-- ── Feature: Tägliche Affirmationen & Licht schicken ────────────────────────

-- ── 1. Affirmations table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS affirmations (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  content     text        NOT NULL,
  category    text        NOT NULL CHECK (category IN ('selbstliebe', 'praesenz', 'verbindung', 'mut')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE affirmations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read affirmations"
  ON affirmations FOR SELECT USING (true);

-- Seed affirmation pool
INSERT INTO affirmations (content, category) VALUES
  ('Du bist genau richtig so wie du bist — auch im Dating.', 'selbstliebe'),
  ('Du musst dich nicht verbiegen um gesehen zu werden.', 'selbstliebe'),
  ('Deine Einzigartigkeit ist keine Schwäche — sie ist dein Geschenk.', 'selbstliebe'),
  ('Du verdienst eine Liebe die sich leicht anfühlt.', 'selbstliebe'),
  ('Dein Tempo ist das richtige Tempo.', 'selbstliebe'),
  ('Echte Verbindung beginnt mit dir selbst.', 'praesenz'),
  ('Der heutige Moment ist der einzige in dem echte Begegnung möglich ist.', 'praesenz'),
  ('Du musst nicht alles wissen — du musst nur da sein.', 'praesenz'),
  ('Präsenz ist das größte Geschenk das du geben kannst.', 'praesenz'),
  ('Was wäre wenn du heute einfach du selbst wärst?', 'praesenz'),
  ('Echte Verbindung braucht Zeit — und das ist gut so.', 'verbindung'),
  ('Jede Begegnung trägt etwas in sich auch wenn sie kurz ist.', 'verbindung'),
  ('Du musst nicht jeden Menschen für dich gewinnen.', 'verbindung'),
  ('Die richtige Verbindung fühlt sich an wie nach Hause kommen.', 'verbindung'),
  ('Bewusstes Dating ist kein Sprint — es ist ein Weg.', 'verbindung'),
  ('Es ist mutig sich wirklich zu zeigen.', 'mut'),
  ('Verletzlichkeit ist keine Schwäche — sie ist der Anfang von Nähe.', 'mut'),
  ('Du darfst wollen was du wirklich willst.', 'mut'),
  ('Jede neue Begegnung ist ein neuer Anfang — unabhängig vom letzten.', 'mut'),
  ('Es braucht Mut präsent zu sein. Du hast diesen Mut.', 'mut')
ON CONFLICT DO NOTHING;

-- ── 2. Affirmation fields on profiles ────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS affirmations_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS affirmation_time     time    NOT NULL DEFAULT '09:00';

-- ── 3. Lights table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lights (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  returned      boolean     NOT NULL DEFAULT false,
  dismissed     boolean     NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

ALTER TABLE lights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can send lights"
  ON lights FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can read lights they sent or received"
  ON lights FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Receiver or sender can update light"
  ON lights FOR UPDATE
  USING (auth.uid() = receiver_id OR auth.uid() = sender_id);
