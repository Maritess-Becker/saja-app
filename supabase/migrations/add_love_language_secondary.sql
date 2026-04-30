ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS love_language_secondary text DEFAULT NULL;
