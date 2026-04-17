-- Run this in your Supabase SQL Editor (https://supabase.com → SQL Editor)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS my_world text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sexuality_interests text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sexuality_visible boolean DEFAULT false;
