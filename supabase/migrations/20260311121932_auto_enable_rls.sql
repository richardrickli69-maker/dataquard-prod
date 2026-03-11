-- 1. Funktion erstellen, die RLS aktiviert
CREATE OR REPLACE FUNCTION public.force_rls_on_new_table()
RETURNS event_trigger
LANGUAGE plpgsql
AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands() WHERE command_tag = 'CREATE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', obj.object_identity);
  END LOOP;
END;
$$;

-- 2. Event-Trigger an das "CREATE TABLE" Ereignis binden
CREATE EVENT TRIGGER ensure_rls_on_create
ON ddl_command_end
WHEN TAG IN ('CREATE TABLE')
EXECUTE FUNCTION public.force_rls_on_new_table();