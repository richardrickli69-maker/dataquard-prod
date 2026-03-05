-- Migration: subscription_tier zur users-Tabelle hinzufügen
-- Ausführen in: Supabase Dashboard → SQL Editor

-- 1. users-Tabelle erstellen falls nicht vorhanden
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  subscription_tier TEXT DEFAULT 'FREE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. subscription_tier Spalte hinzufügen falls users-Tabelle bereits existiert
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'FREE';

-- 3. RLS aktivieren
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Policy: User darf nur eigene Zeile lesen
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- 5. Policy: Service Role darf alles (für Webhook)
DROP POLICY IF EXISTS "users_service_role_all" ON public.users;
CREATE POLICY "users_service_role_all"
  ON public.users FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. scans-Tabelle: rescan-Spalten hinzufügen falls noch nicht vorhanden
ALTER TABLE public.scans
  ADD COLUMN IF NOT EXISTS rescan_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_rescan_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS previous_services TEXT[],
  ADD COLUMN IF NOT EXISTS change_detected BOOLEAN DEFAULT false;
