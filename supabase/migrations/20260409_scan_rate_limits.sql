-- Migration: Persistente Rate-Limit-Tabelle für den Extended Scanner
-- Ersetzt die flüchtige In-Memory-Map (funktioniert nicht auf Vercel Serverless)

CREATE TABLE IF NOT EXISTS public.scan_rate_limits (
  ip       TEXT        PRIMARY KEY,
  count    INTEGER     NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL
);

-- Nur über Service Role zugreifbar (kein Public Access)
ALTER TABLE public.scan_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scan_rate_limits_service_role_all"
  ON public.scan_rate_limits FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Index für schnelles Bereinigen abgelaufener Einträge
CREATE INDEX IF NOT EXISTS idx_scan_rate_limits_reset_at
  ON public.scan_rate_limits (reset_at);
