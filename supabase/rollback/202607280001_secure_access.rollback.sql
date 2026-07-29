-- =============================================================================
-- ROLLBACK di 0001 — Accesso negato per impostazione predefinita
-- =============================================================================
--
--   *** ATTENZIONE — QUESTO SCRIPT RIPRISTINA UNA CONFIGURAZIONE INSICURA ***
--
-- Riporta il database allo stato precedente alla migrazione 0001, cioè:
--   * anon con privilegi completi di lettura e scrittura su tutte le tabelle
--     applicative, compresa la tabella dei segreti e quella utenti legacy;
--   * le policy permissive che concedono tutto ad anon senza alcuna condizione;
--   * EXECUTE sulle funzioni legacy riaperto a PUBLIC, anon e authenticated;
--   * privilegi predefiniti che riaprono automaticamente gli oggetti futuri.
--
-- Dopo l'esecuzione, chiunque conosca l'URL del progetto e la chiave pubblica
-- può leggere e modificare ogni dato applicativo senza autenticarsi.
--
-- DESTINAZIONE: esclusivamente il progetto di STAGING, e solo per dimostrare
-- la reversibilità della migrazione. NON va mai applicato alla produzione e
-- NON va mai eseguito automaticamente da un runner di migrazioni: per questo
-- il file vive fuori da supabase/migrations/.
--
-- Prima di eseguirlo, la persona che lo lancia deve poter rispondere sì a:
--   1. sto operando sul progetto di staging e non sulla produzione?
--   2. il progetto contiene solo dati sintetici?
--   3. l'esposizione temporanea dei dati è accettabile e circoscritta?
--
-- Non contiene dati, URL, project ref, chiavi o password.
-- Idempotente: ogni istruzione è un no-op se già applicata.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Blocco di sicurezza. Va rimosso deliberatamente per poter eseguire il file:
-- serve a impedire un'esecuzione per errore, per copia-incolla o per script.
-- -----------------------------------------------------------------------------
DO $stop$
BEGIN
  RAISE EXCEPTION
    'Rollback di 0001 non eseguito: ripristina una configurazione insicura. '
    'Rimuovere questo blocco solo dopo aver confermato di operare su staging '
    'con soli dati sintetici. Vedi docs/STAGING_DEPLOYMENT_RUNBOOK.md.';
END;
$stop$;

-- -----------------------------------------------------------------------------
-- F (inverso). Privilegi predefiniti riaperti ad anon e authenticated.
-- PUBLIC non viene ripristinato: non faceva parte dello stato osservato.
-- -----------------------------------------------------------------------------
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- E (inverso). EXECUTE sulle funzioni legacy, solo se esistono.
-- -----------------------------------------------------------------------------
DO $rpcs$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('bfos_login', 'bfos_list_users', 'bfos_set_asset')
  LOOP
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO PUBLIC, anon, authenticated', r.sig);
  END LOOP;
END;
$rpcs$;

-- -----------------------------------------------------------------------------
-- D (inverso). Policy permissive ricreate esattamente come nello stato
-- osservato: ruolo anon, comando ALL, USING true / WITH CHECK true.
-- -----------------------------------------------------------------------------
DO $policies$
DECLARE
  t text;
  pname text;
  names jsonb := jsonb_build_object(
    'bfos_activities',   'anon_all_activities',
    'bfos_agreements',   'anon_all_agreements',
    'bfos_cash_movements','anon_all_cash',
    'bfos_deposits',     'anon_all_deposits',
    'bfos_factions',     'anon_all_factions',
    'bfos_intel',        'anon_all_intel',
    'bfos_members',      'anon_all_members',
    'bfos_movements',    'anon_all_movements',
    'bfos_roles',        'anon_all_roles',
    'bfos_settings',     'anon_all_settings',
    'bfos_weapon_tests', 'anon_all_weapon_tests'
  );
BEGIN
  FOR t, pname IN SELECT key, value #>> '{}' FROM jsonb_each(names) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pname, t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true)',
      pname, t);
  END LOOP;

  -- Policy di lettura anonima sulla tabella asset, come nello stato osservato.
  DROP POLICY IF EXISTS anon_read_assets ON public.bfos_assets;
  CREATE POLICY anon_read_assets ON public.bfos_assets
    FOR SELECT TO anon USING (true);
END;
$policies$;

-- -----------------------------------------------------------------------------
-- C (inverso). Privilegi di tabella restituiti ad anon e authenticated.
-- PUBLIC non viene ripristinato: non li ha mai avuti nello stato osservato.
-- -----------------------------------------------------------------------------
GRANT ALL PRIVILEGES ON TABLE
  public.bfos_activities,
  public.bfos_agreements,
  public.bfos_assets,
  public.bfos_cash_movements,
  public.bfos_deposits,
  public.bfos_factions,
  public.bfos_intel,
  public.bfos_members,
  public.bfos_movements,
  public.bfos_roles,
  public.bfos_secrets,
  public.bfos_settings,
  public.bfos_users,
  public.bfos_weapon_tests
TO anon, authenticated;

-- Nota: lo stato di RLS non viene toccato. La migrazione 0001 si limitava ad
-- abilitarla, e disabilitarla qui peggiorerebbe ulteriormente la situazione
-- senza corrispondere ad alcuno stato precedente osservato.
