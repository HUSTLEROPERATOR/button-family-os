-- =============================================================================
-- 0001 — Accesso negato per impostazione predefinita (deny-by-default)
-- =============================================================================
-- Destinazione: progetto Supabase di STAGING dedicato. Mai la produzione.
--
-- Che cosa fa:
--   A. pretende che lo schema applicativo esista già e sia quello atteso;
--   B. abilita RLS su tutte le tabelle applicative;
--   C. revoca ogni privilegio di tabella a anon, authenticated e PUBLIC;
--   D. elimina le policy permissive legacy, se presenti;
--   E. revoca EXECUTE sulle funzioni legacy, se presenti;
--   F. impedisce che nuovi oggetti concedano automaticamente accesso.
--
-- Che cosa NON fa:
--   * non tocca dati, non invoca funzioni, non modifica corpi di funzione;
--   * non tocca auth, storage, realtime o altri schemi gestiti;
--   * non contiene URL, project ref, chiavi, password o dati.
--
-- PREREQUISITO: lo schema applicativo (le 14 tabelle public.bfos_*) deve essere
-- già presente. Questa migrazione NON crea le tabelle e si ferma esplicitamente
-- se mancano: le crea la migrazione 202607280000_application_schema.sql, che va
-- applicata subito prima. Nessun accesso al database di produzione è necessario.
--
-- TRANSAZIONE: nessun BEGIN/COMMIT esplicito. Il runner delle migrazioni
-- (Supabase CLI, oppure psql con --single-transaction) fornisce già la
-- transazione; aprirne una annidata farebbe terminare quella esterna in
-- anticipo. Vedi il runbook per il comando esatto.
--
-- Idempotente: ogni istruzione è un no-op se già applicata.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. Guardia: lo schema deve essere quello atteso, altrimenti ci si ferma qui.
-- -----------------------------------------------------------------------------
DO $guard$
DECLARE
  expected text[] := ARRAY[
    'bfos_activities', 'bfos_agreements', 'bfos_assets', 'bfos_cash_movements',
    'bfos_deposits', 'bfos_factions', 'bfos_intel', 'bfos_members',
    'bfos_movements', 'bfos_roles', 'bfos_secrets', 'bfos_settings',
    'bfos_users', 'bfos_weapon_tests'
  ];
  missing text[];
  extra   text[];
BEGIN
  SELECT array_agg(t ORDER BY t) INTO missing
  FROM unnest(expected) AS t
  WHERE to_regclass('public.' || quote_ident(t)) IS NULL;

  IF missing IS NOT NULL THEN
    RAISE EXCEPTION
      'Schema applicativo assente o incompleto. Tabelle mancanti: %. '
      'Applicare prima la migrazione 202607280000_application_schema.sql.',
      array_to_string(missing, ', ');
  END IF;

  SELECT array_agg(c.relname ORDER BY c.relname) INTO extra
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r'
    AND c.relname LIKE 'bfos\_%' AND NOT (c.relname = ANY (expected));

  -- Tabelle in più non bloccano, ma vanno viste: potrebbero non essere coperte
  -- da alcuna policy e restare senza protezione.
  IF extra IS NOT NULL THEN
    RAISE WARNING
      'Tabelle bfos_* non previste da questa migrazione: %. '
      'Verificare manualmente che non siano raggiungibili da anon o authenticated.',
      array_to_string(extra, ', ');
  END IF;
END;
$guard$;

-- -----------------------------------------------------------------------------
-- B. Adattamento staging: RLS abilitata su tutte le tabelle applicative.
--    Nel database di origine RLS era già attiva; un progetto ricostruito da
--    zero potrebbe non averla, e senza RLS le policy dello step 0002 non
--    verrebbero nemmeno valutate.
-- -----------------------------------------------------------------------------
DO $rls$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'bfos_activities', 'bfos_agreements', 'bfos_assets', 'bfos_cash_movements',
    'bfos_deposits', 'bfos_factions', 'bfos_intel', 'bfos_members',
    'bfos_movements', 'bfos_roles', 'bfos_secrets', 'bfos_settings',
    'bfos_users', 'bfos_weapon_tests'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END;
$rls$;

-- -----------------------------------------------------------------------------
-- C. Nessun privilegio di tabella per anon, authenticated e PUBLIC.
--    authenticated non riceve nulla qui: il modello di ruoli lato server
--    (ADMIN / DIREZIONE / STAFF) arriva con la migrazione 0002.
--    postgres e service_role non vengono toccati.
-- -----------------------------------------------------------------------------
DO $revoke$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'bfos_activities', 'bfos_agreements', 'bfos_assets', 'bfos_cash_movements',
    'bfos_deposits', 'bfos_factions', 'bfos_intel', 'bfos_members',
    'bfos_movements', 'bfos_roles', 'bfos_secrets', 'bfos_settings',
    'bfos_users', 'bfos_weapon_tests'
  ] LOOP
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM anon, authenticated, PUBLIC', t);
  END LOOP;
END;
$revoke$;

-- -----------------------------------------------------------------------------
-- D. Rimozione delle policy permissive legacy.
--    Su un progetto di staging ricostruito da zero queste policy non esistono
--    e ogni DROP è un no-op: è voluto, così la stessa migrazione vale sia per
--    uno staging vergine sia per una copia dello schema di origine.
--
--    Nota: qui viene rimossa anche `anon_read_assets`. Nel percorso locale era
--    stata lasciata in piedi perché il vecchio loader doveva leggere il codice
--    dell'applicazione prima di qualunque login. Il frontend statico non ha
--    più quel vincolo, quindi lo staging parte SENZA alcun accesso anonimo.
--    È la divergenza voluta rispetto al percorso locale.
-- -----------------------------------------------------------------------------
DO $policies$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename LIKE 'bfos\_%'
      AND (policyname LIKE 'anon\_all\_%' OR policyname = 'anon_read_assets')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    RAISE NOTICE 'Rimossa policy legacy %.%', r.tablename, r.policyname;
  END LOOP;
END;
$policies$;

-- -----------------------------------------------------------------------------
-- E. Revoca di EXECUTE sulle funzioni legacy, solo se presenti.
--    Su uno staging vergine non esistono affatto, il che è lo stato migliore.
--    I corpi non vengono letti, modificati o invocati.
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
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
    RAISE NOTICE 'Revocato EXECUTE su funzione legacy %', r.sig;
  END LOOP;
END;
$rpcs$;

-- -----------------------------------------------------------------------------
-- F. Privilegi predefiniti: un oggetto creato in futuro nello schema public non
--    deve concedere automaticamente accesso ad anon o authenticated.
-- -----------------------------------------------------------------------------
DO $defaults$
DECLARE owner_role text := 'postgres';
BEGIN
  IF NOT pg_has_role(current_user, owner_role, 'MEMBER') THEN
    RAISE EXCEPTION
      'Questa migrazione va applicata come %, o da un ruolo che ne è membro. Ruolo corrente: %.',
      owner_role, current_user;
  END IF;

  EXECUTE format(
    'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated, PUBLIC',
    owner_role);
  EXECUTE format(
    'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated, PUBLIC',
    owner_role);
END;
$defaults$;

-- -----------------------------------------------------------------------------
-- Verifica finale: se qualcosa è rimasto accessibile, la migrazione fallisce
-- invece di dichiarare un successo parziale.
-- -----------------------------------------------------------------------------
DO $verify$
DECLARE leftover int;
BEGIN
  SELECT count(*) INTO leftover
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public'
    AND table_name LIKE 'bfos\_%'
    AND grantee IN ('anon', 'authenticated', 'PUBLIC');

  IF leftover <> 0 THEN
    RAISE EXCEPTION
      '0001 incompleta: restano % privilegi di tabella per anon/authenticated/PUBLIC.', leftover;
  END IF;

  RAISE NOTICE '0001 applicata: nessun accesso di tabella per anon, authenticated o PUBLIC.';
END;
$verify$;
