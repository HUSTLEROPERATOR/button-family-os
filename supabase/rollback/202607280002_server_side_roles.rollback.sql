-- =============================================================================
-- ROLLBACK di 0002 — Autorizzazione applicativa lato server
-- =============================================================================
-- Riporta il database allo stato prodotto dalla migrazione 0001: nessun modello
-- di ruoli lato server, nessuna tabella membership, nessun helper, nessun
-- privilegio per authenticated sulle tabelle applicative.
--
-- A differenza del rollback di 0001, questo NON ripristina una configurazione
-- insicura: riporta allo stato di accesso negato per impostazione predefinita.
-- L'effetto pratico è che l'applicazione smette di funzionare per tutti finché
-- 0002 non viene riapplicata — nessuno avrà più un ruolo applicativo.
--
-- DESTINAZIONE: esclusivamente il progetto di STAGING.
-- Non va eseguito automaticamente da un runner: per questo il file vive fuori
-- da supabase/migrations/.
--
-- ATTENZIONE ai dati: la tabella membership viene eliminata, e con essa tutte
-- le associazioni utente/ruolo. Su staging sono sintetiche e ricreabili dal
-- seed; verificarlo prima di procedere.
--
-- Non contiene dati, URL, project ref, chiavi o password.
-- Idempotente: ogni istruzione usa IF EXISTS.
-- =============================================================================

DO $guard$
BEGIN
  IF to_regclass('public.bfos_assets') IS NULL THEN
    RAISE EXCEPTION 'Schema applicativo assente: rollback di 0002 rifiutato.';
  END IF;
END;
$guard$;

-- -----------------------------------------------------------------------------
-- Inverso della SEZIONE 6 — tabelle operative
-- -----------------------------------------------------------------------------
DO $ops$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'bfos_activities', 'bfos_agreements', 'bfos_cash_movements', 'bfos_deposits',
    'bfos_factions', 'bfos_intel', 'bfos_members', 'bfos_movements',
    'bfos_roles', 'bfos_settings', 'bfos_weapon_tests'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_all_roles', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_admin_direzione', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_admin_direzione', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_admin_direzione', t);
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM authenticated', t);
  END LOOP;
END;
$ops$;

-- -----------------------------------------------------------------------------
-- Inverso della SEZIONE 5 — tabella asset
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS assets_select_admin ON public.bfos_assets;
DROP POLICY IF EXISTS assets_insert_admin ON public.bfos_assets;
DROP POLICY IF EXISTS assets_update_admin ON public.bfos_assets;
DROP POLICY IF EXISTS assets_delete_admin ON public.bfos_assets;
REVOKE ALL PRIVILEGES ON TABLE public.bfos_assets FROM authenticated;

-- Nessuna policy anonima viene ricreata: la migrazione 0002 non ne aveva
-- create, perché il frontend statico non legge il proprio codice dal database.

-- -----------------------------------------------------------------------------
-- Inverso della SEZIONE 4 — funzioni legacy
-- -----------------------------------------------------------------------------
-- Nulla da annullare: EXECUTE resta revocato sia nello stato 0001 sia in 0002.

-- -----------------------------------------------------------------------------
-- Inverso delle SEZIONI 3 e 2 — funzioni amministrative e helper
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.bfos_admin_set_asset(text, text);
DROP FUNCTION IF EXISTS public.bfos_admin_list_memberships();
DROP FUNCTION IF EXISTS public.bfos_admin_set_membership(uuid, text, boolean);
DROP FUNCTION IF EXISTS public.bfos_is_admin();
DROP FUNCTION IF EXISTS public.bfos_has_role(text[]);
DROP FUNCTION IF EXISTS public.bfos_current_app_role();

-- -----------------------------------------------------------------------------
-- Inverso della SEZIONE 1 — tabella membership
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS membership_self_select ON public.bfos_access_memberships;
REVOKE ALL PRIVILEGES ON TABLE public.bfos_access_memberships FROM authenticated;
DROP TABLE IF EXISTS public.bfos_access_memberships;

-- -----------------------------------------------------------------------------
-- Verifica finale
-- -----------------------------------------------------------------------------
DO $verify$
DECLARE client_grants int;
BEGIN
  SELECT count(*) INTO client_grants
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public' AND table_name LIKE 'bfos\_%'
    AND grantee IN ('anon', 'authenticated', 'PUBLIC');

  IF client_grants <> 0 THEN
    RAISE EXCEPTION
      'Rollback di 0002 incompleto: restano % privilegi per anon/authenticated/PUBLIC.',
      client_grants;
  END IF;

  RAISE NOTICE 'Rollback di 0002 completato: tornati allo stato 0001 (accesso negato per default).';
END;
$verify$;
