-- Add is_demo flag to profiles (for demo/presentation users)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- Mark all existing demo profiles
UPDATE public.profiles SET is_demo = true
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE 'demo.%@saja.app'
);
