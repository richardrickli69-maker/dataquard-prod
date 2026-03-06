-- Migration: Verified Badges Tabelle
-- Ausführen in: Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS public.verified_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  website_url TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year'),
  is_active BOOLEAN DEFAULT true
);

-- RLS aktivieren
ALTER TABLE public.verified_badges ENABLE ROW LEVEL SECURITY;

-- User darf eigene Badges lesen
DROP POLICY IF EXISTS "badges_select_own" ON public.verified_badges;
CREATE POLICY "badges_select_own"
  ON public.verified_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Öffentlich: Badge per ID lesen (für Verifikationsseite)
DROP POLICY IF EXISTS "badges_select_public" ON public.verified_badges;
CREATE POLICY "badges_select_public"
  ON public.verified_badges FOR SELECT
  USING (true);

-- Service Role: alles
DROP POLICY IF EXISTS "badges_service_role_all" ON public.verified_badges;
CREATE POLICY "badges_service_role_all"
  ON public.verified_badges FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index für schnelle Lookups
CREATE INDEX IF NOT EXISTS verified_badges_user_id_idx ON public.verified_badges(user_id);
CREATE INDEX IF NOT EXISTS verified_badges_website_url_idx ON public.verified_badges(website_url);
