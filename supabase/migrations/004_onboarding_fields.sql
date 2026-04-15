-- Migration 004: Add extended onboarding fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS smoking text,
  ADD COLUMN IF NOT EXISTS alcohol text,
  ADD COLUMN IF NOT EXISTS prompts jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS dealbreakers text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS audio_prompt_url text;
