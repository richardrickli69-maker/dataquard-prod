-- Migration: RLS-Policies für Agency-Tabellen
-- Alle API-Routes nutzen Service Role (bypassed RLS), aber diese Policies
-- schützen bei direktem DB-Zugriff und als Defense-in-Depth.

-- ── agency_accounts ────────────────────────────────────────────────────────
ALTER TABLE public.agency_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agency_accounts_select_own"
  ON public.agency_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "agency_accounts_insert_own"
  ON public.agency_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agency_accounts_update_own"
  ON public.agency_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "agency_accounts_service_role_all"
  ON public.agency_accounts FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── agency_domains ─────────────────────────────────────────────────────────
ALTER TABLE public.agency_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agency_domains_select_own"
  ON public.agency_domains FOR SELECT
  USING (
    agency_id IN (
      SELECT id FROM public.agency_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "agency_domains_insert_own"
  ON public.agency_domains FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT id FROM public.agency_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "agency_domains_update_own"
  ON public.agency_domains FOR UPDATE
  USING (
    agency_id IN (
      SELECT id FROM public.agency_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "agency_domains_delete_own"
  ON public.agency_domains FOR DELETE
  USING (
    agency_id IN (
      SELECT id FROM public.agency_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "agency_domains_service_role_all"
  ON public.agency_domains FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── agency_scan_results ────────────────────────────────────────────────────
ALTER TABLE public.agency_scan_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agency_scan_results_select_own"
  ON public.agency_scan_results FOR SELECT
  USING (
    domain_id IN (
      SELECT d.id FROM public.agency_domains d
      JOIN public.agency_accounts a ON a.id = d.agency_id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "agency_scan_results_insert_own"
  ON public.agency_scan_results FOR INSERT
  WITH CHECK (
    domain_id IN (
      SELECT d.id FROM public.agency_domains d
      JOIN public.agency_accounts a ON a.id = d.agency_id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "agency_scan_results_service_role_all"
  ON public.agency_scan_results FOR ALL TO service_role
  USING (true) WITH CHECK (true);
