-- ── Phased Onboarding + Trial + Pattern Feedback ──────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_phase   integer     NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS trial_started_at   timestamptz,
  ADD COLUMN IF NOT EXISTS trial_active        boolean     NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS checkin_pattern     jsonb       NOT NULL DEFAULT '{}';

-- Set existing complete profiles to phase 3 (they've done everything)
UPDATE profiles
  SET onboarding_phase = 3
  WHERE is_complete = true;

-- Set trial_started_at for existing users (use created_at as baseline)
UPDATE profiles
  SET trial_started_at = created_at
  WHERE trial_started_at IS NULL;
