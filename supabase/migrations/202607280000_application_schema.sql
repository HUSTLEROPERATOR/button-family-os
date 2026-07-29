-- =============================================================================
-- 0000 — Schema applicativo canonico
-- =============================================================================
-- Crea le 14 tabelle applicative su un database vuoto. È il primo anello della
-- catena: 0000 costruisce la struttura, 0001 la mette in sicurezza, 0002 vi
-- applica il modello di ruoli.
--
-- PROVENIENZA
--   Trascritta da uno snapshot offline dello stato precedente alla migrazione
--   di sicurezza, montato in isolamento (nessuna rete, nessuna porta) e
--   verificato prima dell'estrazione. La firma dello snapshot corrisponde allo
--   stato atteso: 14 tabelle, 14 primary key, 1 check constraint, 0 foreign
--   key, 0 unique aggiuntivi, 12 policy legacy, 3 funzioni legacy, nessuna
--   tabella del modello di ruoli.
--
--   Nessun accesso al database di produzione è stato necessario, e nessuno
--   sarà necessario per applicarla. Vedi docs/SCHEMA_BOOTSTRAP_VERIFICATION.md.
--
-- CHE COSA CONTIENE
--   Colonne, tipi, nullability, default, primary key e l'unico check
--   constraint presenti nello schema di origine.
--
-- CHE COSA NON CONTIENE
--   Nessun dato, nessuna riga, nessun INSERT, nessun COPY. Nessuna policy,
--   nessun GRANT o REVOKE, nessun privilegio predefinito, nessuna ownership.
--   Nessuna funzione, nessuna RPC legacy, nessun SECURITY DEFINER, nessun
--   trigger. Nessun oggetto auth, storage o realtime. Nessun URL, project ref,
--   chiave, password o identificativo.
--
--   Lo schema qui è deliberatamente neutro: la sicurezza arriva tutta da 0001
--   e 0002. Applicare solo questa migrazione lascia un database senza policy,
--   quindi 0001 va applicata subito dopo.
--
-- IDEMPOTENZA
--   Rieseguirla è sicuro solo se le tabelle già presenti coincidono esattamente
--   con la definizione attesa. Se una tabella esiste con struttura diversa la
--   migrazione si ferma: non altera e non elimina nulla di preesistente.
--
-- TRANSAZIONE
--   Nessun BEGIN/COMMIT esplicito: la transazione la fornisce il runner.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Guardia di compatibilità.
-- Per ogni tabella già presente confronta la firma delle colonne (nome, tipo,
-- nullability, default) con quella attesa. Coincide -> la creazione sarà un
-- no-op. Diverge -> la migrazione si ferma, senza toccare nulla.
-- -----------------------------------------------------------------------------
DO $guard$
DECLARE
  atteso   text;
  trovato  text;
  r        record;
  divergenti text[] := ARRAY[]::text[];
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
    ('bfos_activities', 'id:text:NN:-,date:text:NN:''''::text,type:text:NULL:''Rapina''::text,subtype:text:NULL:''''::text,title:text:NULL:''''::text,civico:text:NULL:''''::text,outcome:text:NULL:''''::text,loot:text:NULL:''''::text,engaged:boolean:NULL:false,engagementNotes:text:NULL:''''::text,problems:text:NULL:''''::text,participants:jsonb:NULL:''[]''::jsonb,notes:text:NULL:''''::text,createdBy:text:NULL:''''::text,engagementType:text:NULL:''''::text,lootItems:jsonb:NULL:''[]''::jsonb,enemyGroup:text:NULL:''''::text'),
    ('bfos_agreements', 'id:text:NN:-,counterparty:text:NN:-,type:text:NULL:''Fornitura armi''::text,terms:text:NULL:''''::text,commission:text:NULL:''''::text,validFrom:text:NULL:''''::text,validTo:text:NULL:''''::text,status:text:NULL:''Attivo''::text,notes:text:NULL:''''::text'),
    ('bfos_assets', 'key:text:NN:-,content:text:NN:-,updated_at:timestamp with time zone:NULL:now()'),
    ('bfos_cash_movements', 'id:text:NN:-,date:text:NN:''''::text,kind:text:NULL:''Entrata''::text,moneyType:text:NULL:''sporco''::text,amount:numeric:NULL:0,pct:numeric:NULL:0,netAmount:numeric:NULL:0,source:text:NULL:''''::text,counterparty:text:NULL:''''::text,depositId:text:NULL:''''::text,depositToId:text:NULL:''''::text,memberId:text:NULL:''''::text,notes:text:NULL:''''::text,createdBy:text:NULL:''''::text,activityId:text:NULL:''''::text,movementId:text:NULL:''''::text,holderId:text:NULL:''''::text,holderToId:text:NULL:''''::text'),
    ('bfos_deposits', 'id:text:NN:-,name:text:NN:-,civico:text:NULL:''''::text,type:text:NULL:''Casa''::text,refMemberId:text:NULL:''''::text,notes:text:NULL:''''::text,active:boolean:NULL:true'),
    ('bfos_factions', 'id:text:NN:-,name:text:NN:-,type:text:NULL:''Fazione''::text,relation:text:NULL:''Neutrale''::text,referente:text:NULL:''''::text,territorio:text:NULL:''''::text,notes:text:NULL:''''::text,active:boolean:NULL:true'),
    ('bfos_intel', 'id:text:NN:-,date:text:NN:''''::text,kind:text:NULL:''Nota''::text,title:text:NN:''''::text,content:text:NULL:''''::text,direction:text:NULL:''''::text,faction:text:NULL:''''::text,createdBy:text:NULL:''''::text'),
    ('bfos_members', 'id:text:NN:-,nickDiscord:text:NN:-,rpName:text:NULL:''''::text,username:text:NULL:''''::text,discordId:text:NULL:''''::text,phone:text:NULL:''''::text,status:text:NULL:''Attivo''::text,reliability:text:NULL:''media''::text,specialization:text:NULL:''''::text,roles:jsonb:NULL:''[]''::jsonb,mainRoleId:text:NULL:-,notes:text:NULL:''''::text,joinDate:text:NULL:''''::text,lastActivity:text:NULL:''''::text,twitchLink:text:NULL:''''::text,isLive:boolean:NULL:false,channel:text:NULL:''''::text,avatar:text:NULL:''''::text'),
    ('bfos_movements', 'id:text:NN:-,date:text:NN:''''::text,kind:text:NULL:''Acquisto''::text,item:text:NN:-,category:text:NULL:''Armi''::text,qty:numeric:NULL:0,unitPrice:numeric:NULL:0,total:numeric:NULL:0,counterparty:text:NULL:''''::text,depositId:text:NULL:''''::text,depositToId:text:NULL:''''::text,memberId:text:NULL:''''::text,notes:text:NULL:''''::text,createdBy:text:NULL:''''::text,activityId:text:NULL:''''::text'),
    ('bfos_roles', 'id:text:NN:-,name:text:NN:-,color:text:NULL:''#c8322b''::text,emoji:text:NULL:''''::text,category:text:NULL:''''::text,priority:integer:NULL:999,description:text:NULL:''''::text,active:boolean:NULL:true'),
    ('bfos_secrets', 'key:text:NN:-,value:text:NN:-'),
    ('bfos_settings', 'key:text:NN:-,value:text:NULL:''''::text'),
    ('bfos_users', 'username:text:NN:-,password:text:NN:-,level:text:NN:-'),
    ('bfos_weapon_tests', 'id:text:NN:-,weapon:text:NN:-,memberId:text:NULL:''''::text,date:text:NULL:''''::text,recoil:integer:NULL:3,accuracy:integer:NULL:3,handling:integer:NULL:3,damage:integer:NULL:3,notes:text:NULL:''''::text')
    ) AS v(tabella, firma)
  LOOP
    IF to_regclass('public.' || quote_ident(r.tabella)) IS NULL THEN
      CONTINUE;   -- non esiste: verrà creata
    END IF;

    SELECT string_agg(
             a.attname || ':' || format_type(a.atttypid, a.atttypmod) || ':' ||
             CASE WHEN a.attnotnull THEN 'NN' ELSE 'NULL' END || ':' ||
             coalesce(pg_get_expr(d.adbin, d.adrelid), '-'), ',' ORDER BY a.attnum)
      INTO trovato
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
    LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
    WHERE n.nspname = 'public' AND c.relname = r.tabella
    GROUP BY c.relname;

    atteso := r.firma;
    IF trovato IS DISTINCT FROM atteso THEN
      divergenti := divergenti || r.tabella;
    END IF;
  END LOOP;

  IF array_length(divergenti, 1) > 0 THEN
    RAISE EXCEPTION
      'Tabelle già presenti con struttura incompatibile: %. '
      'La migrazione 0000 non altera né elimina oggetti esistenti: '
      'usare un database vuoto, oppure allineare manualmente lo schema.',
      array_to_string(divergenti, ', ');
  END IF;
END;
$guard$;


-- -----------------------------------------------------------------------------
-- Tabelle applicative
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.bfos_activities (
    id text NOT NULL,
    date text DEFAULT ''::text NOT NULL,
    type text DEFAULT 'Rapina'::text,
    subtype text DEFAULT ''::text,
    title text DEFAULT ''::text,
    civico text DEFAULT ''::text,
    outcome text DEFAULT ''::text,
    loot text DEFAULT ''::text,
    engaged boolean DEFAULT false,
    "engagementNotes" text DEFAULT ''::text,
    problems text DEFAULT ''::text,
    participants jsonb DEFAULT '[]'::jsonb,
    notes text DEFAULT ''::text,
    "createdBy" text DEFAULT ''::text,
    "engagementType" text DEFAULT ''::text,
    "lootItems" jsonb DEFAULT '[]'::jsonb,
    "enemyGroup" text DEFAULT ''::text
);

CREATE TABLE IF NOT EXISTS public.bfos_agreements (
    id text NOT NULL,
    counterparty text NOT NULL,
    type text DEFAULT 'Fornitura armi'::text,
    terms text DEFAULT ''::text,
    commission text DEFAULT ''::text,
    "validFrom" text DEFAULT ''::text,
    "validTo" text DEFAULT ''::text,
    status text DEFAULT 'Attivo'::text,
    notes text DEFAULT ''::text
);

CREATE TABLE IF NOT EXISTS public.bfos_assets (
    key text NOT NULL,
    content text NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bfos_cash_movements (
    id text NOT NULL,
    date text DEFAULT ''::text NOT NULL,
    kind text DEFAULT 'Entrata'::text,
    "moneyType" text DEFAULT 'sporco'::text,
    amount numeric DEFAULT 0,
    pct numeric DEFAULT 0,
    "netAmount" numeric DEFAULT 0,
    source text DEFAULT ''::text,
    counterparty text DEFAULT ''::text,
    "depositId" text DEFAULT ''::text,
    "depositToId" text DEFAULT ''::text,
    "memberId" text DEFAULT ''::text,
    notes text DEFAULT ''::text,
    "createdBy" text DEFAULT ''::text,
    "activityId" text DEFAULT ''::text,
    "movementId" text DEFAULT ''::text,
    "holderId" text DEFAULT ''::text,
    "holderToId" text DEFAULT ''::text
);

CREATE TABLE IF NOT EXISTS public.bfos_deposits (
    id text NOT NULL,
    name text NOT NULL,
    civico text DEFAULT ''::text,
    type text DEFAULT 'Casa'::text,
    "refMemberId" text DEFAULT ''::text,
    notes text DEFAULT ''::text,
    active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.bfos_factions (
    id text NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'Fazione'::text,
    relation text DEFAULT 'Neutrale'::text,
    referente text DEFAULT ''::text,
    territorio text DEFAULT ''::text,
    notes text DEFAULT ''::text,
    active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.bfos_intel (
    id text NOT NULL,
    date text DEFAULT ''::text NOT NULL,
    kind text DEFAULT 'Nota'::text,
    title text DEFAULT ''::text NOT NULL,
    content text DEFAULT ''::text,
    direction text DEFAULT ''::text,
    faction text DEFAULT ''::text,
    "createdBy" text DEFAULT ''::text
);

CREATE TABLE IF NOT EXISTS public.bfos_members (
    id text NOT NULL,
    "nickDiscord" text NOT NULL,
    "rpName" text DEFAULT ''::text,
    username text DEFAULT ''::text,
    "discordId" text DEFAULT ''::text,
    phone text DEFAULT ''::text,
    status text DEFAULT 'Attivo'::text,
    reliability text DEFAULT 'media'::text,
    specialization text DEFAULT ''::text,
    roles jsonb DEFAULT '[]'::jsonb,
    "mainRoleId" text,
    notes text DEFAULT ''::text,
    "joinDate" text DEFAULT ''::text,
    "lastActivity" text DEFAULT ''::text,
    "twitchLink" text DEFAULT ''::text,
    "isLive" boolean DEFAULT false,
    channel text DEFAULT ''::text,
    avatar text DEFAULT ''::text
);

CREATE TABLE IF NOT EXISTS public.bfos_movements (
    id text NOT NULL,
    date text DEFAULT ''::text NOT NULL,
    kind text DEFAULT 'Acquisto'::text,
    item text NOT NULL,
    category text DEFAULT 'Armi'::text,
    qty numeric DEFAULT 0,
    "unitPrice" numeric DEFAULT 0,
    total numeric DEFAULT 0,
    counterparty text DEFAULT ''::text,
    "depositId" text DEFAULT ''::text,
    "depositToId" text DEFAULT ''::text,
    "memberId" text DEFAULT ''::text,
    notes text DEFAULT ''::text,
    "createdBy" text DEFAULT ''::text,
    "activityId" text DEFAULT ''::text
);

CREATE TABLE IF NOT EXISTS public.bfos_roles (
    id text NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#c8322b'::text,
    emoji text DEFAULT ''::text,
    category text DEFAULT ''::text,
    priority integer DEFAULT 999,
    description text DEFAULT ''::text,
    active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.bfos_secrets (
    key text NOT NULL,
    value text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bfos_settings (
    key text NOT NULL,
    value text DEFAULT ''::text
);

CREATE TABLE IF NOT EXISTS public.bfos_users (
    username text NOT NULL,
    password text NOT NULL,
    level text NOT NULL,
    CONSTRAINT bfos_users_level_check CHECK ((level = ANY (ARRAY['admin'::text, 'viewer'::text])))
);

CREATE TABLE IF NOT EXISTS public.bfos_weapon_tests (
    id text NOT NULL,
    weapon text NOT NULL,
    "memberId" text DEFAULT ''::text,
    date text DEFAULT ''::text,
    recoil integer DEFAULT 3,
    accuracy integer DEFAULT 3,
    handling integer DEFAULT 3,
    damage integer DEFAULT 3,
    notes text DEFAULT ''::text
);

-- -----------------------------------------------------------------------------
-- Primary key
-- -----------------------------------------------------------------------------
DO $pk$
DECLARE r record;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('bfos_activities', 'bfos_activities_pkey', 'id'),
    ('bfos_agreements', 'bfos_agreements_pkey', 'id'),
    ('bfos_assets', 'bfos_assets_pkey', 'key'),
    ('bfos_cash_movements', 'bfos_cash_movements_pkey', 'id'),
    ('bfos_deposits', 'bfos_deposits_pkey', 'id'),
    ('bfos_factions', 'bfos_factions_pkey', 'id'),
    ('bfos_intel', 'bfos_intel_pkey', 'id'),
    ('bfos_members', 'bfos_members_pkey', 'id'),
    ('bfos_movements', 'bfos_movements_pkey', 'id'),
    ('bfos_roles', 'bfos_roles_pkey', 'id'),
    ('bfos_secrets', 'bfos_secrets_pkey', 'key'),
    ('bfos_settings', 'bfos_settings_pkey', 'key'),
    ('bfos_users', 'bfos_users_pkey', 'username'),
    ('bfos_weapon_tests', 'bfos_weapon_tests_pkey', 'id')
  ) AS v(tabella, vincolo, colonne)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public' AND t.relname = r.tabella AND c.contype = 'p'
    ) THEN
      EXECUTE format('ALTER TABLE ONLY public.%I ADD CONSTRAINT %I PRIMARY KEY (%s)',
                     r.tabella, r.vincolo, r.colonne);
    END IF;
  END LOOP;
END;
$pk$;

-- -----------------------------------------------------------------------------
-- Verifica finale: uno stato parziale non deve essere dichiarato riuscito.
--
-- I conteggi sono circoscritti alle 14 tabelle di questa migrazione, non a
-- tutto ciò che inizia per bfos_. Le migrazioni successive introducono altre
-- tabelle con lo stesso prefisso: contarle qui farebbe fallire 0000 quando
-- viene rieseguita su un database dove la catena è già completa.
-- -----------------------------------------------------------------------------
DO $verify$
DECLARE
  canoniche text[] := ARRAY['bfos_activities', 'bfos_agreements', 'bfos_assets', 'bfos_cash_movements', 'bfos_deposits', 'bfos_factions', 'bfos_intel', 'bfos_members', 'bfos_movements', 'bfos_roles', 'bfos_secrets', 'bfos_settings', 'bfos_users', 'bfos_weapon_tests'];
  n_tab int; n_pk int; n_chk int; n_fk int; n_uni int; n_rows bigint := 0; n bigint; t text;
BEGIN
  SELECT count(*) INTO n_tab FROM pg_class c JOIN pg_namespace n2 ON n2.oid = c.relnamespace
    WHERE n2.nspname = 'public' AND c.relkind = 'r' AND c.relname = ANY (canoniche);
  SELECT count(*) INTO n_pk FROM pg_constraint c JOIN pg_class t2 ON t2.oid = c.conrelid
    JOIN pg_namespace n2 ON n2.oid = t2.relnamespace
    WHERE n2.nspname = 'public' AND t2.relname = ANY (canoniche) AND c.contype = 'p';
  SELECT count(*) INTO n_chk FROM pg_constraint c JOIN pg_class t2 ON t2.oid = c.conrelid
    JOIN pg_namespace n2 ON n2.oid = t2.relnamespace
    WHERE n2.nspname = 'public' AND t2.relname = ANY (canoniche) AND c.contype = 'c';
  SELECT count(*) INTO n_fk FROM pg_constraint c JOIN pg_class t2 ON t2.oid = c.conrelid
    JOIN pg_namespace n2 ON n2.oid = t2.relnamespace
    WHERE n2.nspname = 'public' AND t2.relname = ANY (canoniche) AND c.contype = 'f';
  SELECT count(*) INTO n_uni FROM pg_constraint c JOIN pg_class t2 ON t2.oid = c.conrelid
    JOIN pg_namespace n2 ON n2.oid = t2.relnamespace
    WHERE n2.nspname = 'public' AND t2.relname = ANY (canoniche) AND c.contype = 'u';

  IF n_tab <> 14 THEN RAISE EXCEPTION '0000 incompleta: % tabelle canoniche presenti, attese 14.', n_tab; END IF;
  IF n_pk  <> 14 THEN RAISE EXCEPTION '0000 incompleta: % primary key, attese 14.', n_pk; END IF;
  IF n_chk <> 1  THEN RAISE EXCEPTION '0000 anomala: % check constraint, atteso 1.', n_chk; END IF;
  IF n_fk  <> 0  THEN RAISE EXCEPTION '0000 anomala: % foreign key, attese 0.', n_fk; END IF;
  IF n_uni <> 0  THEN RAISE EXCEPTION '0000 anomala: % unique constraint, attesi 0.', n_uni; END IF;

  FOREACH t IN ARRAY canoniche LOOP
    EXECUTE format('SELECT count(*) FROM public.%I', t) INTO n;
    n_rows := n_rows + n;
  END LOOP;

  RAISE NOTICE '0000 applicata: 14 tabelle, 14 primary key, 1 check, 0 foreign key, % righe.', n_rows;
END;
$verify$;
