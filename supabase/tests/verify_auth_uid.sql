-- =============================================================================
-- Verifica di auth.uid() con JWT Supabase reali
-- =============================================================================
-- Da eseguire ESCLUSIVAMENTE sul progetto di STAGING, dopo le migrazioni 0001
-- e 0002 e dopo la creazione degli utenti Auth sintetici.
--
-- Perché esiste: il modello di autorizzazione è stato validato in un ambiente
-- locale che richiedeva un adattamento per far risolvere l'identità a partire
-- dai claim del token. Quell'adattamento NON è stato portato qui e non deve
-- esistere in staging. Questo file serve a dimostrare che le policy funzionano
-- con i JWT emessi da Supabase Auth, senza alcun intervento preliminare.
--
-- Che cosa NON fa:
--   * non crea, modifica o elimina utenti;
--   * non scrive nulla in auth.*;
--   * non contiene token, chiavi, password, URL o project ref;
--   * non contiene identificativi reali: gli unici valori sono segnaposto.
--
-- Come si esegue: sostituire i segnaposto :'admin_uid' ecc. con gli UUID reali
-- degli utenti sintetici di staging, letti al momento dall'ambiente. Non
-- scriverli in questo file e non versionarli.
--
--   psql "$STAGING_DB_URL" \
--     -v ON_ERROR_STOP=1 \
--     -v admin_uid="<uuid>" -v direzione_uid="<uuid>" \
--     -v staff_uid="<uuid>" -v norole_uid="<uuid>" \
--     -v disabled_uid="<uuid>" \
--     -f supabase/tests/verify_auth_uid.sql
-- =============================================================================

\set ON_ERROR_STOP on
\timing off

-- -----------------------------------------------------------------------------
-- Se un parametro non è stato passato, gli si assegna una stringa vuota: senza
-- questo, psql fallirebbe con un errore di sintassi poco leggibile invece di
-- dire che cosa manca. Il controllo subito sotto trasforma il valore vuoto in
-- un arresto esplicito.
-- -----------------------------------------------------------------------------
\if :{?admin_uid}
\else
\set admin_uid ''
\endif
\if :{?direzione_uid}
\else
\set direzione_uid ''
\endif
\if :{?staff_uid}
\else
\set staff_uid ''
\endif
\if :{?norole_uid}
\else
\set norole_uid ''
\endif
\if :{?disabled_uid}
\else
\set disabled_uid ''
\endif

-- -----------------------------------------------------------------------------
-- I segnaposto vengono trasferiti in parametri di sessione PRIMA di entrare nei
-- blocchi DO. psql non sostituisce le proprie variabili all'interno delle
-- stringhe dollar-quoted: scrivere :'admin_uid' dentro un DO $$ ... $$ lo
-- lascerebbe letterale e il blocco fallirebbe. Qui la sostituzione avviene in
-- una normale SELECT, e i blocchi leggono i valori con current_setting().
-- -----------------------------------------------------------------------------
-- I risultati vengono raccolti con \gset (che non stampa nulla) invece che con
-- un normale ';', così gli identificativi non finiscono a video.
SELECT
  set_config('bfos_test.admin_uid',     :'admin_uid',     false) IS NOT NULL AS ok_admin,
  set_config('bfos_test.direzione_uid', :'direzione_uid', false) IS NOT NULL AS ok_direzione,
  set_config('bfos_test.staff_uid',     :'staff_uid',     false) IS NOT NULL AS ok_staff,
  set_config('bfos_test.norole_uid',    :'norole_uid',    false) IS NOT NULL AS ok_norole,
  set_config('bfos_test.disabled_uid',  :'disabled_uid',  false) IS NOT NULL AS ok_disabled
\gset cfg_

-- Comodità: restituisce un identificativo di test già convertito.
CREATE OR REPLACE FUNCTION pg_temp.uid(p_name text)
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('bfos_test.' || p_name, true), '')::uuid;
$$;

DO $$
DECLARE n text;
BEGIN
  FOREACH n IN ARRAY ARRAY['admin_uid','direzione_uid','staff_uid','norole_uid','disabled_uid'] LOOP
    IF pg_temp.uid(n) IS NULL THEN
      RAISE EXCEPTION
        'Parametro % non fornito: questo test richiede gli identificativi degli '
        'utenti Auth sintetici del progetto di staging, e resta bloccato finché '
        'non vengono passati. Usare -v %="<uuid>" (vedi l''intestazione del file).',
        n, n;
    END IF;
  END LOOP;
  RAISE NOTICE 'Parametri di test acquisiti (valori non stampati).';
END;
$$;

-- -----------------------------------------------------------------------------
-- 0. Preflight: le migrazioni devono risultare applicate.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.bfos_access_memberships') IS NULL THEN
    RAISE EXCEPTION 'Migrazione 0002 non applicata: tabella membership assente.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'bfos_current_app_role'
  ) THEN
    RAISE EXCEPTION 'Migrazione 0002 non applicata: helper del ruolo assente.';
  END IF;
  RAISE NOTICE 'Preflight superato.';
END;
$$;

-- -----------------------------------------------------------------------------
-- Helper locale: simula una richiesta autenticata impostando gli stessi
-- parametri che PostgREST imposta a partire da un JWT reale, e nient'altro.
-- Nessun adattamento pre-richiesta: se auth.uid() non legge questi valori
-- da solo, il test fallisce, ed è esattamente ciò che vogliamo scoprire.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION pg_temp.assume_user(p_uid uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', p_uid::text, 'role', 'authenticated', 'aud', 'authenticated')::text,
    true);
  PERFORM set_config('role', 'authenticated', true);
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.release_user()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('role', 'none', true);
  RESET ROLE;
  PERFORM set_config('request.jwt.claims', '', true);
END;
$$;

-- =============================================================================
-- TEST 0 — da quale sorgente auth.uid() ricava l'identità
-- =============================================================================
-- Diagnostico, eseguito per primo perché rende leggibile qualunque fallimento
-- successivo. PostgREST v10 e successivi impostano un unico parametro JSON,
-- `request.jwt.claims`. Alcune immagini contengono ancora una definizione di
-- auth.uid() che legge soltanto il vecchio parametro per-claim
-- `request.jwt.claim.sub`: con quella definizione l'identità non si risolve, e
-- l'unico modo per farla funzionare sarebbe un adattamento pre-richiesta, che
-- questo progetto rifiuta.
DO $$
DECLARE
  def text;
  legge_json boolean;
  legge_legacy boolean;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO def
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'auth' AND p.proname = 'uid';

  IF def IS NULL THEN
    RAISE EXCEPTION 'FALLITO 0: auth.uid() non esiste in questo database.';
  END IF;

  legge_json   := position('request.jwt.claims' in def) > 0;
  legge_legacy := position('request.jwt.claim.sub' in def) > 0;

  RAISE NOTICE 'auth.uid() legge: claims JSON=%, claim.sub legacy=%', legge_json, legge_legacy;

  IF NOT legge_json THEN
    RAISE EXCEPTION
      'FALLITO 0: auth.uid() non legge request.jwt.claims (JSON), che è ciò che '
      'PostgREST v10+ imposta a partire da un JWT reale. Con questa definizione '
      'l''identità si risolverebbe solo con un adattamento pre-richiesta, che non '
      'deve esistere. Verificare la versione del progetto di destinazione prima '
      'di procedere: NON aggiungere un adattamento per far passare questo test.';
  END IF;

  RAISE NOTICE 'OK 0: auth.uid() sa leggere i claim JSON nativi.';
END;
$$;

-- =============================================================================
-- TEST 1 — auth.uid() e request.jwt.claim.sub coincidono
-- =============================================================================
DO $$
DECLARE
  target uuid := pg_temp.uid('admin_uid');
  got_uid uuid;
  got_sub text;
  got_role text;
BEGIN
  PERFORM pg_temp.assume_user(target);
  SELECT auth.uid() INTO got_uid;
  SELECT current_setting('request.jwt.claims', true)::json ->> 'sub' INTO got_sub;
  SELECT current_setting('request.jwt.claims', true)::json ->> 'role' INTO got_role;
  PERFORM pg_temp.release_user();

  IF got_uid IS NULL THEN
    RAISE EXCEPTION 'FALLITO 1a: auth.uid() ha restituito NULL. '
      'Le policy non possono funzionare senza un adattamento, che non deve esistere.';
  END IF;
  IF got_uid <> target THEN
    RAISE EXCEPTION 'FALLITO 1b: auth.uid() = %, atteso %.', got_uid, target;
  END IF;
  IF got_sub IS DISTINCT FROM target::text THEN
    RAISE EXCEPTION 'FALLITO 1c: request.jwt.claim.sub = %, atteso %.', got_sub, target;
  END IF;
  IF got_role IS DISTINCT FROM 'authenticated' THEN
    RAISE EXCEPTION 'FALLITO 1d: ruolo del token = %, atteso authenticated.', got_role;
  END IF;

  RAISE NOTICE 'OK 1: auth.uid(), request.jwt.claim.sub e ruolo authenticated coerenti.';
END;
$$;

-- =============================================================================
-- TEST 2 — l'helper restituisce il ruolo atteso per ogni identità
-- =============================================================================
DO $$
DECLARE
  cases jsonb := jsonb_build_array(
    jsonb_build_object('uid', pg_temp.uid('admin_uid')::text,     'atteso', 'ADMIN',     'etichetta', 'membership attiva ADMIN'),
    jsonb_build_object('uid', pg_temp.uid('direzione_uid')::text, 'atteso', 'DIREZIONE', 'etichetta', 'membership attiva DIREZIONE'),
    jsonb_build_object('uid', pg_temp.uid('staff_uid')::text,     'atteso', 'STAFF',     'etichetta', 'membership attiva STAFF'),
    jsonb_build_object('uid', pg_temp.uid('norole_uid')::text,    'atteso', NULL,        'etichetta', 'membership assente'),
    jsonb_build_object('uid', pg_temp.uid('disabled_uid')::text,  'atteso', NULL,        'etichetta', 'membership disattivata')
  );
  c jsonb;
  got text;
  atteso text;
BEGIN
  FOR c IN SELECT * FROM jsonb_array_elements(cases) LOOP
    atteso := c ->> 'atteso';
    PERFORM pg_temp.assume_user((c ->> 'uid')::uuid);
    SELECT public.bfos_current_app_role() INTO got;
    PERFORM pg_temp.release_user();

    IF got IS DISTINCT FROM atteso THEN
      RAISE EXCEPTION 'FALLITO 2 (%): ruolo = %, atteso %.',
        c ->> 'etichetta', coalesce(got, 'NULL'), coalesce(atteso, 'NULL');
    END IF;
    RAISE NOTICE 'OK 2 (%): ruolo = %.', c ->> 'etichetta', coalesce(got, 'NULL');
  END LOOP;
END;
$$;

-- =============================================================================
-- TEST 3 — un ruolo sconosciuto non può nemmeno essere memorizzato
-- =============================================================================
-- Il vincolo sulla tabella è la prima linea di difesa: un valore fuori
-- dall'insieme previsto viene rifiutato dal database, non filtrato dal client.
DO $$
DECLARE rejected boolean := false;
BEGIN
  BEGIN
    INSERT INTO public.bfos_access_memberships (auth_user_id, app_role)
    VALUES ('00000000-0000-4000-8000-000000000000', 'SUPERUSER');
  EXCEPTION WHEN check_violation THEN
    rejected := true;
  END;

  IF NOT rejected THEN
    RAISE EXCEPTION 'FALLITO 3: un ruolo applicativo non previsto è stato accettato.';
  END IF;
  RAISE NOTICE 'OK 3: ruolo applicativo non previsto rifiutato dal vincolo.';
END;
$$;

-- =============================================================================
-- TEST 4 — nessuno vede le membership altrui
-- =============================================================================
DO $$
DECLARE visible int;
BEGIN
  PERFORM pg_temp.assume_user(pg_temp.uid('staff_uid'));
  SELECT count(*) INTO visible FROM public.bfos_access_memberships;
  PERFORM pg_temp.release_user();

  IF visible > 1 THEN
    RAISE EXCEPTION 'FALLITO 4: STAFF vede % righe di membership, atteso al massimo 1 (la propria).', visible;
  END IF;
  RAISE NOTICE 'OK 4: STAFF vede al massimo la propria membership (% riga/e).', visible;
END;
$$;

-- =============================================================================
-- TEST 5 — matrice lettura/scrittura sulle tabelle operative
-- =============================================================================
DO $$
DECLARE
  can_read boolean;
  denied boolean;
BEGIN
  -- STAFF legge
  PERFORM pg_temp.assume_user(pg_temp.uid('staff_uid'));
  BEGIN
    PERFORM 1 FROM public.bfos_members LIMIT 1;
    can_read := true;
  EXCEPTION WHEN insufficient_privilege THEN
    can_read := false;
  END;
  PERFORM pg_temp.release_user();
  IF NOT can_read THEN
    RAISE EXCEPTION 'FALLITO 5a: STAFF non riesce a leggere le tabelle operative.';
  END IF;
  RAISE NOTICE 'OK 5a: STAFF legge.';

  -- STAFF non scrive
  PERFORM pg_temp.assume_user(pg_temp.uid('staff_uid'));
  denied := false;
  BEGIN
    INSERT INTO public.bfos_settings (key, value) VALUES ('__staging_probe__', 'x');
  EXCEPTION
    WHEN insufficient_privilege THEN denied := true;
    WHEN OTHERS THEN denied := true;
  END;
  PERFORM pg_temp.release_user();
  IF NOT denied THEN
    RAISE EXCEPTION 'FALLITO 5b: STAFF è riuscito a scrivere. Le policy non sono corrette.';
  END IF;
  RAISE NOTICE 'OK 5b: scrittura di STAFF rifiutata.';

  -- Chi non ha membership non legge nulla
  PERFORM pg_temp.assume_user(pg_temp.uid('norole_uid'));
  SELECT count(*) = 0 INTO can_read FROM public.bfos_members;
  PERFORM pg_temp.release_user();
  IF NOT can_read THEN
    RAISE EXCEPTION 'FALLITO 5c: un utente senza membership ha letto delle righe.';
  END IF;
  RAISE NOTICE 'OK 5c: utente senza membership non legge nulla.';
END;
$$;

-- =============================================================================
-- TEST 6 — tabella dei segreti irraggiungibile da un ruolo client
-- =============================================================================
DO $$
DECLARE denied boolean := false;
BEGIN
  PERFORM pg_temp.assume_user(pg_temp.uid('admin_uid'));
  BEGIN
    PERFORM 1 FROM public.bfos_secrets LIMIT 1;
  EXCEPTION WHEN insufficient_privilege THEN
    denied := true;
  END;
  PERFORM pg_temp.release_user();

  IF NOT denied THEN
    RAISE EXCEPTION 'FALLITO 6: la tabella dei segreti è leggibile da un ruolo client.';
  END IF;
  RAISE NOTICE 'OK 6: tabella dei segreti irraggiungibile anche per ADMIN.';
END;
$$;

-- =============================================================================
-- TEST 7 — nessun accesso anonimo residuo
-- =============================================================================
DO $$
DECLARE anon_grants int; anon_policies int;
BEGIN
  SELECT count(*) INTO anon_grants
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public' AND table_name LIKE 'bfos\_%' AND grantee = 'anon';

  SELECT count(*) INTO anon_policies
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename LIKE 'bfos\_%' AND 'anon' = ANY (roles);

  IF anon_grants <> 0 THEN
    RAISE EXCEPTION 'FALLITO 7a: anon ha ancora % privilegi di tabella.', anon_grants;
  END IF;
  IF anon_policies <> 0 THEN
    RAISE EXCEPTION 'FALLITO 7b: esistono ancora % policy per anon.', anon_policies;
  END IF;
  RAISE NOTICE 'OK 7: nessun privilegio e nessuna policy per anon.';
END;
$$;

-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '---';
  RAISE NOTICE 'TUTTI I TEST SUPERATI.';
  RAISE NOTICE 'auth.uid() funziona con i claim nativi: nessun adattamento pre-richiesta necessario.';
END;
$$;
