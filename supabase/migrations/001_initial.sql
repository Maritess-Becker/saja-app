-- ============================================
-- HT Connect — Initial Database Migration
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS table (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'membership', 'premium')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PROFILES table
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  age INTEGER,
  location TEXT,
  origin TEXT,
  gender TEXT,
  orientation TEXT,
  seeking TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  has_children TEXT,
  bio TEXT,
  not_compatible_with TEXT,
  occupation TEXT,
  interests TEXT[] DEFAULT '{}',
  bindungstyp TEXT,
  love_language TEXT,
  werte TEXT[] DEFAULT '{}',
  introvert_extrovert INTEGER DEFAULT 50,
  spontan_strukturiert INTEGER DEFAULT 50,
  rational_emotional INTEGER DEFAULT 50,
  intention TEXT,
  relationship_model TEXT,
  intention_text TEXT,
  sexual_interests TEXT[],
  hide_age BOOLEAN DEFAULT false,
  hide_location BOOLEAN DEFAULT false,
  profile_paused BOOLEAN DEFAULT false,
  photos TEXT[] DEFAULT '{}',
  profile_quote TEXT,
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- LIKES table
-- ============================================
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

-- ============================================
-- MATCHES table
-- ============================================
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'requested', 'active', 'ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- ============================================
-- CONNECTIONS table (Kennlernphase)
-- ============================================
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'active', 'ended')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- 48h auto-expire
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- MESSAGES table
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- PURCHASES table
-- ============================================
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Users: only own row
CREATE POLICY "Users can view own record" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own record" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Profiles: own profile full access, others can read complete profiles
CREATE POLICY "Profiles: own full access" ON public.profiles
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Profiles: others can read complete" ON public.profiles
  FOR SELECT USING (is_complete = true AND profile_paused = false AND auth.uid() != user_id);

-- Likes: own likes
CREATE POLICY "Likes: own full access" ON public.likes
  FOR ALL USING (auth.uid() = from_user_id);
CREATE POLICY "Likes: can see if liked back" ON public.likes
  FOR SELECT USING (auth.uid() = to_user_id);

-- Matches: involved users
CREATE POLICY "Matches: involved users" ON public.matches
  FOR ALL USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Connections: via match involvement
CREATE POLICY "Connections: via match" ON public.connections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

-- Messages: via connection
CREATE POLICY "Messages: via connection" ON public.messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.connections c
      JOIN public.matches m ON m.id = c.match_id
      WHERE c.id = connection_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

-- Purchases: own purchases
CREATE POLICY "Purchases: own access" ON public.purchases
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_complete ON public.profiles(is_complete, profile_paused);
CREATE INDEX IF NOT EXISTS idx_likes_from ON public.likes(from_user_id);
CREATE INDEX IF NOT EXISTS idx_likes_to ON public.likes(to_user_id);
CREATE INDEX IF NOT EXISTS idx_matches_users ON public.matches(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_connections_match ON public.connections(match_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);
CREATE INDEX IF NOT EXISTS idx_messages_connection ON public.messages(connection_id, created_at);

-- ============================================
-- Enable Realtime for messages
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
