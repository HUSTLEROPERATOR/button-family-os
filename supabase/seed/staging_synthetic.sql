-- =============================================================================
-- Seed sintetico di STAGING
-- =============================================================================
-- Da eseguire ESCLUSIVAMENTE sul progetto di staging, dopo le migrazioni 0001
-- e 0002 e dopo la creazione degli utenti Auth sintetici.
--
-- Tutto ciò che segue è inventato. Nessun dato proviene dalla produzione,
-- nessuna password, nessun token, nessun indirizzo reale. I domini usati sono
-- riservati alla documentazione (RFC 2606) e non possono ricevere posta.
--
-- Il seed è diviso in tre parti, deliberatamente separate:
--
--   PARTE A — UTENTI AUTH        non creati da qui, solo verificati
--   PARTE B — MEMBERSHIP         schema noto, creato dalla migrazione 0002
--   PARTE C — RECORD APPLICATIVI schema preesistente, inserimenti condizionati
--
-- Idempotente: rieseguirlo non duplica nulla.
-- =============================================================================

\set ON_ERROR_STOP on

-- =============================================================================
-- PARTE A — UTENTI AUTH (non creati da questo file)
-- =============================================================================
-- Gli utenti di Supabase Auth NON vengono inseriti qui. Scrivere direttamente
-- in auth.users non è una procedura supportata: la tabella ha vincoli, trigger
-- e formati di password gestiti dal servizio Auth, e un inserimento manuale
-- produce utenti che non riescono ad autenticarsi o che si rompono agli
-- aggiornamenti del servizio.
--
-- I quattro utenti sintetici vanno creati PRIMA di eseguire questo seed,
-- tramite la dashboard di Supabase (Authentication → Users → Add user) oppure
-- tramite l'API di amministrazione con la chiave di servizio, dal lato server.
-- Vedi docs/STAGING_DEPLOYMENT_RUNBOOK.md, passo 8.
--
--   ETICHETTA            EMAIL SINTETICA                    RUOLO ATTESO
--   ADMIN_STAGING        admin.staging@example.com          ADMIN
--   DIREZIONE_STAGING    direzione.staging@example.com      DIREZIONE
--   STAFF_STAGING        staff.staging@example.com          STAFF
--   NO_ROLE_STAGING      norole.staging@example.com         nessuno
--
-- Le password vanno generate al momento della creazione, tenute fuori dal
-- repository e non riutilizzate da nessun'altra parte.
--
-- Questo blocco verifica soltanto che esistano, e si ferma in modo esplicito
-- se mancano.
DO $check_users$
DECLARE
  attesi text[] := ARRAY[
    'admin.staging@example.com',
    'direzione.staging@example.com',
    'staff.staging@example.com',
    'norole.staging@example.com'
  ];
  mancanti text[];
BEGIN
  SELECT array_agg(e ORDER BY e) INTO mancanti
  FROM unnest(attesi) AS e
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.email = e);

  IF mancanti IS NOT NULL THEN
    RAISE EXCEPTION
      'Utenti Auth sintetici mancanti: %. Crearli dalla dashboard prima di eseguire il seed '
      '(vedi STAGING_DEPLOYMENT_RUNBOOK.md, passo 8).', array_to_string(mancanti, ', ');
  END IF;

  RAISE NOTICE 'Parte A: i 4 utenti Auth sintetici sono presenti.';
END;
$check_users$;

-- =============================================================================
-- PARTE B — MEMBERSHIP
-- =============================================================================
-- Gli identificativi vengono risolti dagli utenti Auth appena verificati: non
-- sono scritti nel file, così il seed non contiene alcun UUID né reale né
-- ereditato da ambienti precedenti.
--
-- NO_ROLE_STAGING non riceve alcuna membership: è il caso "nessun accesso".
-- Viene inoltre creata una quinta associazione disattivata, per verificare che
-- una membership presente ma non attiva equivalga a nessun accesso.
DO $seed_membership$
DECLARE
  uid_admin     uuid;
  uid_direzione uuid;
  uid_staff     uuid;
BEGIN
  SELECT id INTO uid_admin     FROM auth.users WHERE email = 'admin.staging@example.com';
  SELECT id INTO uid_direzione FROM auth.users WHERE email = 'direzione.staging@example.com';
  SELECT id INTO uid_staff     FROM auth.users WHERE email = 'staff.staging@example.com';

  INSERT INTO public.bfos_access_memberships (auth_user_id, app_role, is_active, updated_at)
  VALUES
    (uid_admin,     'ADMIN',     true, now()),
    (uid_direzione, 'DIREZIONE', true, now()),
    (uid_staff,     'STAFF',     true, now())
  ON CONFLICT (auth_user_id) DO UPDATE
    SET app_role = excluded.app_role,
        is_active = excluded.is_active,
        updated_at = now();

  RAISE NOTICE 'Parte B: 3 membership attive inserite. NO_ROLE_STAGING resta senza membership.';
END;
$seed_membership$;

-- Membership disattivata: usa un identificativo palesemente sintetico e non
-- collegato ad alcun utente Auth, perché serve solo a verificare che
-- is_active = false produca nessun accesso.
INSERT INTO public.bfos_access_memberships (auth_user_id, app_role, is_active, updated_at)
VALUES ('5ada0000-0000-4000-8000-00000000dead', 'DIREZIONE', false, now())
ON CONFLICT (auth_user_id) DO UPDATE
  SET app_role = excluded.app_role, is_active = false, updated_at = now();

-- =============================================================================
-- PARTE C — RECORD APPLICATIVI
-- =============================================================================
-- Lo schema applicativo non è definito da questo pacchetto: esiste già nel
-- progetto di staging. Ogni inserimento è quindi condizionato alla presenza
-- delle colonne attese; se lo schema è diverso, il blocco viene saltato con un
-- avviso invece di far fallire l'intero seed.
--
-- Tutti i record sono marcati TEST nel testo, così sono riconoscibili a colpo
-- d'occhio nella dashboard e non possono essere scambiati per dati veri.

-- Helper: vero se la tabella ha tutte le colonne indicate.
CREATE OR REPLACE FUNCTION pg_temp.has_columns(p_table text, p_cols text[])
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM unnest(p_cols) AS c
    WHERE NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = p_table AND column_name = c
    )
  );
$$;

-- ---- Ruoli organizzativi -----------------------------------------------------
DO $seed_roles$
BEGIN
  IF NOT pg_temp.has_columns('bfos_roles',
      ARRAY['id','name','color','emoji','category','priority','description','active']) THEN
    RAISE WARNING 'Parte C: schema di bfos_roles diverso dall''atteso, inserimento saltato.';
    RETURN;
  END IF;

  INSERT INTO public.bfos_roles (id, name, color, emoji, category, priority, description, active)
  VALUES
    ('stg-role-001', 'TEST Direzione',  '#d4a94e', '👑', 'Direzione', 1, 'Ruolo TEST di staging.', true),
    ('stg-role-002', 'TEST Comando',    '#c8322b', '⚔️', 'Comando',   2, 'Ruolo TEST di staging.', true),
    ('stg-role-003', 'TEST Operativi',  '#8a8a94', '🧰', 'Membri',    3, 'Ruolo TEST di staging.', true)
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Parte C: ruoli TEST inseriti.';
END;
$seed_roles$;

-- ---- Membri ------------------------------------------------------------------
DO $seed_members$
BEGIN
  IF NOT pg_temp.has_columns('bfos_members',
      ARRAY['id','nickDiscord','rpName','status','reliability','roles','mainRoleId','notes']) THEN
    RAISE WARNING 'Parte C: schema di bfos_members diverso dall''atteso, inserimento saltato.';
    RETURN;
  END IF;

  -- `roles` è jsonb, non un array SQL: l'applicazione vi conserva un elenco
  -- JSON di identificativi di ruolo.
  INSERT INTO public.bfos_members
    (id, "nickDiscord", "rpName", status, reliability, roles, "mainRoleId", notes)
  VALUES
    ('stg-mem-001', 'TEST Membro Uno',  'TEST Personaggio Uno',  'Attivo',   'alta',  '["stg-role-001"]'::jsonb, 'stg-role-001', 'Record TEST di staging.'),
    ('stg-mem-002', 'TEST Membro Due',  'TEST Personaggio Due',  'Attivo',   'media', '["stg-role-002"]'::jsonb, 'stg-role-002', 'Record TEST di staging.'),
    ('stg-mem-003', 'TEST Membro Tre',  'TEST Personaggio Tre',  'In prova', 'media', '["stg-role-003"]'::jsonb, 'stg-role-003', 'Record TEST di staging.')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Parte C: membri TEST inseriti.';
END;
$seed_members$;

-- ---- Depositi e movimenti ----------------------------------------------------
DO $seed_inventory$
BEGIN
  IF pg_temp.has_columns('bfos_deposits', ARRAY['id','name','type','active']) THEN
    INSERT INTO public.bfos_deposits (id, name, type, active)
    VALUES ('stg-dep-001', 'TEST Deposito', 'Deposito', true)
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'Parte C: deposito TEST inserito.';
  ELSE
    RAISE WARNING 'Parte C: schema di bfos_deposits diverso dall''atteso, inserimento saltato.';
  END IF;

  IF pg_temp.has_columns('bfos_movements',
      ARRAY['id','date','kind','item','category','qty','depositId','notes']) THEN
    INSERT INTO public.bfos_movements
      (id, date, kind, item, category, qty, "depositId", notes)
    VALUES
      ('stg-mov-001', '2026-07-20', 'Giacenza iniziale', 'TEST Articolo', 'Altro', 10, 'stg-dep-001', 'Movimento TEST di staging.'),
      ('stg-mov-002', '2026-07-21', 'Vendita',           'TEST Articolo', 'Altro',  3, 'stg-dep-001', 'Movimento TEST di staging.')
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'Parte C: movimenti TEST inseriti.';
  ELSE
    RAISE WARNING 'Parte C: schema di bfos_movements diverso dall''atteso, inserimento saltato.';
  END IF;
END;
$seed_inventory$;

-- ---- Impostazioni ------------------------------------------------------------
DO $seed_settings$
BEGIN
  IF pg_temp.has_columns('bfos_settings', ARRAY['key','value']) THEN
    INSERT INTO public.bfos_settings (key, value)
    VALUES ('session_epoch', '1')
    ON CONFLICT (key) DO NOTHING;
    RAISE NOTICE 'Parte C: impostazioni TEST inserite.';
  ELSE
    RAISE WARNING 'Parte C: schema di bfos_settings diverso dall''atteso, inserimento saltato.';
  END IF;
END;
$seed_settings$;

-- =============================================================================
-- VERIFICA FINALE
-- =============================================================================
-- Le due tabelle che non devono mai contenere nulla in staging restano vuote.
DO $verify$
DECLARE
  n_users   int;
  n_secrets int;
  n_members int;
BEGIN
  SELECT count(*) INTO n_users   FROM public.bfos_users;
  SELECT count(*) INTO n_secrets FROM public.bfos_secrets;
  SELECT count(*) INTO n_members FROM public.bfos_access_memberships;

  IF n_users <> 0 THEN
    RAISE EXCEPTION
      'La tabella utenti legacy contiene % righe. In staging deve restare vuota: '
      'conteneva password confrontate lato applicazione ed è sostituita da Supabase Auth.', n_users;
  END IF;

  IF n_secrets <> 0 THEN
    RAISE EXCEPTION
      'La tabella dei segreti contiene % righe. In staging deve restare vuota.', n_secrets;
  END IF;

  IF n_members < 4 THEN
    RAISE EXCEPTION 'Attese almeno 4 membership (3 attive + 1 disattivata), trovate %.', n_members;
  END IF;

  RAISE NOTICE '---';
  RAISE NOTICE 'Seed completato: % membership, tabella utenti legacy e tabella segreti vuote.', n_members;
  RAISE NOTICE 'Nessun dato reale, nessuna password, nessun token.';
END;
$verify$;
