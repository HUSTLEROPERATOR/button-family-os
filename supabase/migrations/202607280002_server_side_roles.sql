-- =============================================================================
-- 0002 — Autorizzazione applicativa lato server (ADMIN / DIREZIONE / STAFF)
-- =============================================================================
-- Destinazione: progetto Supabase di STAGING dedicato. Mai la produzione.
-- Prerequisito: 0001 già applicata.
--
-- Che cosa fa:
--   1. crea la tabella membership, unica fonte di verità del ruolo applicativo;
--   2. crea gli helper di autorizzazione risolti su auth.uid();
--   3. crea le funzioni amministrative che sostituiscono le RPC legacy;
--   4. riafferma che le RPC legacy restano non eseguibili;
--   5. applica le policy RLS differenziate per operazione;
--   6. lascia le tabelle utenti e segreti chiuse a ogni ruolo client.
--
-- Che cosa NON fa:
--   * non inserisce alcuna membership (lo fa il seed sintetico, separatamente);
--   * non concede NULLA ad anon, in nessun punto;
--   * non tocca auth.users, storage o realtime;
--   * non contiene URL, project ref, chiavi, password o dati.
--
-- DIVERGENZA VOLUTA rispetto al percorso locale: il modello locale concedeva ad
-- anon una SELECT limitata alla sola riga di bootstrap della tabella asset,
-- perché il vecchio loader doveva scaricare il codice dell'applicazione prima
-- di qualunque login. Il frontend statico ha eliminato quel vincolo, quindi qui
-- anon non riceve alcun accesso: è già lo stato finale descritto in
-- docs/SECURE_AUTH_FRONTEND_MIGRATION.md §13.
--
-- TRANSAZIONE: nessun BEGIN/COMMIT esplicito (vedi nota in 0001).
-- Idempotente: tabella e funzioni usano IF NOT EXISTS / CREATE OR REPLACE,
-- ogni policy è preceduta dal proprio DROP POLICY IF EXISTS.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Guardia: 0001 deve risultare applicata.
-- -----------------------------------------------------------------------------
DO $guard$
DECLARE
  client_grants int;
  legacy_exec   int;
BEGIN
  IF to_regclass('public.bfos_assets') IS NULL THEN
    RAISE EXCEPTION 'Schema applicativo assente. Applicare prima lo schema e la migrazione 0001.';
  END IF;

  SELECT count(*) INTO client_grants
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public' AND table_name LIKE 'bfos\_%'
    AND grantee IN ('anon', 'authenticated', 'PUBLIC');

  IF client_grants <> 0 THEN
    RAISE EXCEPTION
      '0001 non risulta applicata: anon/authenticated/PUBLIC hanno ancora % privilegi di tabella.',
      client_grants;
  END IF;

  SELECT count(*) INTO legacy_exec
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN ('bfos_login', 'bfos_list_users', 'bfos_set_asset')
    AND (has_function_privilege('anon', p.oid, 'EXECUTE')
      OR has_function_privilege('authenticated', p.oid, 'EXECUTE'));

  IF legacy_exec <> 0 THEN
    RAISE EXCEPTION
      '0001 non risulta applicata: % funzioni legacy sono ancora eseguibili da anon o authenticated.',
      legacy_exec;
  END IF;
END;
$guard$;

-- =============================================================================
-- SEZIONE 1 — Tabella membership
-- =============================================================================
-- Perché una tabella nuova invece di riusare quelle esistenti:
--   * la tabella utenti legacy conserva password confrontate lato applicazione
--     e non ha alcun legame con auth.uid(): resta congelata;
--   * la tabella dei ruoli esistente descrive gradi organizzativi di gioco, non
--     un concetto di autorizzazione: resta operativa e invariata.
CREATE TABLE IF NOT EXISTS public.bfos_access_memberships (
  auth_user_id uuid PRIMARY KEY,
  app_role     text NOT NULL,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bfos_access_memberships_role_check
    CHECK (app_role IN ('ADMIN', 'DIREZIONE', 'STAFF'))
);

COMMENT ON TABLE public.bfos_access_memberships IS
  'Ruolo applicativo lato server, indicizzato su auth.uid(). Un solo ruolo attivo per utente. Nessuna riga inserita da questa migrazione.';

ALTER TABLE public.bfos_access_memberships ENABLE ROW LEVEL SECURITY;

-- authenticated può leggere soltanto la propria riga, così il client scopre il
-- proprio ruolo senza vedere l'elenco delle membership. Nessun privilegio di
-- scrittura: le modifiche passano solo dalla funzione amministrativa.
GRANT SELECT ON TABLE public.bfos_access_memberships TO authenticated;

DROP POLICY IF EXISTS membership_self_select ON public.bfos_access_memberships;
CREATE POLICY membership_self_select ON public.bfos_access_memberships
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

-- =============================================================================
-- SEZIONE 2 — Helper di autorizzazione
-- =============================================================================
-- SECURITY DEFINER è deliberato: questi helper vengono valutati dentro le
-- policy RLS di altre tabelle, con il ruolo authenticated. Eseguirli come
-- proprietario permette di restituire NULL/false invece di un errore di
-- permesso, e tiene al minimo i privilegi sulla tabella membership.
-- L'unico ingresso è auth.uid(), risolto lato server: nessun ruolo o segreto
-- fornito dal client viene mai preso in considerazione.

CREATE OR REPLACE FUNCTION public.bfos_current_app_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT app_role
  FROM public.bfos_access_memberships
  WHERE auth_user_id = auth.uid() AND is_active = true;
$$;

COMMENT ON FUNCTION public.bfos_current_app_role() IS
  'Restituisce il ruolo applicativo attivo di chi chiama (ADMIN/DIREZIONE/STAFF) a partire da auth.uid(), oppure NULL se assente o disattivato.';

CREATE OR REPLACE FUNCTION public.bfos_has_role(p_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(public.bfos_current_app_role() = ANY (p_roles), false);
$$;

COMMENT ON FUNCTION public.bfos_has_role(text[]) IS
  'Vero se il ruolo applicativo corrente è fra quelli indicati. Usata nelle clausole USING/WITH CHECK.';

CREATE OR REPLACE FUNCTION public.bfos_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.bfos_has_role(ARRAY['ADMIN']);
$$;

COMMENT ON FUNCTION public.bfos_is_admin() IS
  'Scorciatoia per bfos_has_role(ARRAY[''ADMIN'']).';

REVOKE ALL ON FUNCTION public.bfos_current_app_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bfos_has_role(text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bfos_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bfos_current_app_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.bfos_has_role(text[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.bfos_is_admin() TO authenticated, service_role;
-- anon deliberatamente escluso: anon non ha mai un ruolo applicativo.

-- =============================================================================
-- SEZIONE 3 — Funzioni amministrative
-- =============================================================================
-- Ognuna verifica il ruolo internamente, lato server. EXECUTE è concesso a
-- authenticated proprio perché il controllo vero è quello interno: così
-- l'autorizzazione non dipende mai da un parametro passato dal client.

CREATE OR REPLACE FUNCTION public.bfos_admin_set_membership(
  p_auth_user_id uuid,
  p_app_role text,
  p_is_active boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.bfos_is_admin() THEN
    RAISE EXCEPTION 'non autorizzato: richiesto ruolo ADMIN';
  END IF;
  IF p_app_role NOT IN ('ADMIN', 'DIREZIONE', 'STAFF') THEN
    RAISE EXCEPTION 'ruolo applicativo non valido: %', p_app_role;
  END IF;

  INSERT INTO public.bfos_access_memberships (auth_user_id, app_role, is_active, updated_at)
  VALUES (p_auth_user_id, p_app_role, p_is_active, now())
  ON CONFLICT (auth_user_id) DO UPDATE
    SET app_role = excluded.app_role,
        is_active = excluded.is_active,
        updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.bfos_admin_list_memberships()
RETURNS TABLE (
  auth_user_id uuid,
  app_role text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.bfos_is_admin() THEN
    RAISE EXCEPTION 'non autorizzato: richiesto ruolo ADMIN';
  END IF;

  RETURN QUERY
    SELECT m.auth_user_id, m.app_role, m.is_active, m.created_at, m.updated_at
    FROM public.bfos_access_memberships m;
END;
$$;

CREATE OR REPLACE FUNCTION public.bfos_admin_set_asset(p_key text, p_content text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.bfos_is_admin() THEN
    RAISE EXCEPTION 'non autorizzato: richiesto ruolo ADMIN';
  END IF;

  INSERT INTO public.bfos_assets (key, content, updated_at)
  VALUES (p_key, p_content, now())
  ON CONFLICT (key) DO UPDATE
    SET content = excluded.content, updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.bfos_admin_set_membership(uuid, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bfos_admin_list_memberships() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bfos_admin_set_asset(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bfos_admin_set_membership(uuid, text, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.bfos_admin_list_memberships() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.bfos_admin_set_asset(text, text) TO authenticated, service_role;

-- =============================================================================
-- SEZIONE 4 — Le funzioni legacy restano non eseguibili
-- =============================================================================
-- Ripetuto qui per essere espliciti: nessun corpo viene modificato, nessuna
-- funzione viene invocata, nessuna viene eliminata.
DO $legacy$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('bfos_login', 'bfos_list_users', 'bfos_set_asset')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
  END LOOP;
END;
$legacy$;

-- =============================================================================
-- SEZIONE 5 — Tabella asset: solo ADMIN, nessun accesso anonimo
-- =============================================================================
-- Il frontend statico non legge più il proprio codice dal database, quindi qui
-- non esiste alcun bootstrap anonimo da concedere.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.bfos_assets TO authenticated;

DROP POLICY IF EXISTS assets_select_admin ON public.bfos_assets;
CREATE POLICY assets_select_admin ON public.bfos_assets
  FOR SELECT TO authenticated USING (public.bfos_is_admin());
DROP POLICY IF EXISTS assets_insert_admin ON public.bfos_assets;
CREATE POLICY assets_insert_admin ON public.bfos_assets
  FOR INSERT TO authenticated WITH CHECK (public.bfos_is_admin());
DROP POLICY IF EXISTS assets_update_admin ON public.bfos_assets;
CREATE POLICY assets_update_admin ON public.bfos_assets
  FOR UPDATE TO authenticated USING (public.bfos_is_admin()) WITH CHECK (public.bfos_is_admin());
DROP POLICY IF EXISTS assets_delete_admin ON public.bfos_assets;
CREATE POLICY assets_delete_admin ON public.bfos_assets
  FOR DELETE TO authenticated USING (public.bfos_is_admin());

-- =============================================================================
-- SEZIONE 6 — Tabelle operative: policy differenziate per operazione
-- =============================================================================
-- 11 tabelle. SELECT: ADMIN, DIREZIONE, STAFF.
-- INSERT/UPDATE/DELETE: solo ADMIN e DIREZIONE.
-- Corrisponde esattamente a `canWrite` nell'interfaccia; `isAdmin` non è usato
-- come controllo generale delle scritture.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.bfos_activities,
  public.bfos_agreements,
  public.bfos_cash_movements,
  public.bfos_deposits,
  public.bfos_factions,
  public.bfos_intel,
  public.bfos_members,
  public.bfos_movements,
  public.bfos_roles,
  public.bfos_settings,
  public.bfos_weapon_tests
TO authenticated;
-- TRUNCATE, TRIGGER e REFERENCES non sono concessi: nessuna necessità dimostrata.

DO $ops$
DECLARE
  t text;
  read_roles  text := 'public.bfos_has_role(ARRAY[''ADMIN'',''DIREZIONE'',''STAFF''])';
  write_roles text := 'public.bfos_has_role(ARRAY[''ADMIN'',''DIREZIONE''])';
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'bfos_activities', 'bfos_agreements', 'bfos_cash_movements', 'bfos_deposits',
    'bfos_factions', 'bfos_intel', 'bfos_members', 'bfos_movements',
    'bfos_roles', 'bfos_settings', 'bfos_weapon_tests'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_all_roles', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (%s)',
      t || '_select_all_roles', t, read_roles);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_admin_direzione', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (%s)',
      t || '_insert_admin_direzione', t, write_roles);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_admin_direzione', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (%s) WITH CHECK (%s)',
      t || '_update_admin_direzione', t, write_roles, write_roles);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_admin_direzione', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (%s)',
      t || '_delete_admin_direzione', t, write_roles);
  END LOOP;
END;
$ops$;

-- =============================================================================
-- SEZIONE 7 — Tabelle utenti legacy e segreti: chiuse, invariate
-- =============================================================================
-- Nessun privilegio e nessuna policy per alcun ruolo client, ADMIN compreso.
-- La tabella dei segreti non deve mai essere raggiungibile da un browser; la
-- tabella utenti legacy resta congelata e la sua colonna password non deve mai
-- essere esposta attraverso questo modello.
REVOKE ALL PRIVILEGES ON TABLE public.bfos_users   FROM anon, authenticated, PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE public.bfos_secrets FROM anon, authenticated, PUBLIC;

-- =============================================================================
-- Verifica finale
-- =============================================================================
DO $verify$
DECLARE
  anon_grants int;
  missing_fn  int;
BEGIN
  SELECT count(*) INTO anon_grants
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public' AND table_name LIKE 'bfos\_%' AND grantee = 'anon';

  IF anon_grants <> 0 THEN
    RAISE EXCEPTION '0002 incompleta: anon ha ancora % privilegi di tabella.', anon_grants;
  END IF;

  SELECT count(*) INTO missing_fn
  FROM unnest(ARRAY['bfos_current_app_role', 'bfos_has_role', 'bfos_is_admin',
                    'bfos_admin_set_membership', 'bfos_admin_list_memberships',
                    'bfos_admin_set_asset']) AS f
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = f
  );

  IF missing_fn <> 0 THEN
    RAISE EXCEPTION '0002 incompleta: % funzioni attese non risultano create.', missing_fn;
  END IF;

  RAISE NOTICE '0002 applicata: ruoli lato server attivi, nessun accesso anonimo.';
END;
$verify$;
