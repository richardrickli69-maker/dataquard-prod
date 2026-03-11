-- FIX FÜR FEHLER 1: law_alerts
ALTER TABLE public.law_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jeder darf law_alerts lesen" 
ON public.law_alerts FOR SELECT USING (true);

CREATE POLICY "Nur Admins verwalten law_alerts" 
ON public.law_alerts FOR ALL TO authenticated 
USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

-- FIX FÜR FEHLER 2: service_classifications_cache
ALTER TABLE public.service_classifications_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jeder darf cache lesen" 
ON public.service_classifications_cache FOR SELECT USING (true);

CREATE POLICY "Nur Admins verwalten cache" 
ON public.service_classifications_cache FOR ALL TO authenticated 
USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);