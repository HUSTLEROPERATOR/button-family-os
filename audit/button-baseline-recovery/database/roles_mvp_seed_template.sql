-- ============================================================================
-- STAGING TEMPLATE — DO NOT RUN ON PRODUCTION
-- ============================================================================
-- Ruoli MVP RP Operations Suite: ADMIN / DIREZIONE / STAFF
-- Fonte: docs/rp-operations-suite/32_INITIAL_USERS_AND_PERMISSION_MATRIX.md
--        (DEC-014, DEC-015, DEC-016 in 27_DECISION_LOG.md)
--
-- QUESTO FILE È UN TEMPLATE NON ESEGUITO.
--  * Non è stato eseguito su alcun database durante l'audit Slice 0.
--  * Le tabelle qui definite appartengono alla FUTURA foundation (Slice 1,
--    ambiente staging) e NON sono state osservate nel progetto Supabase di
--    produzione Button (che espone tabelle legacy `bfos_*`).
--  * Nessuna password, nessun account Supabase Auth, nessuna email personale.
--  * Nessun organization_id hardcoded: sostituire i placeholder prima dell'uso.
--
-- PLACEHOLDER DA SOSTITUIRE (obbligatori):
--   {{ORGANIZATION_ID}}   uuid dell'organizzazione di staging
--   {{SEEDED_BY}}         identificativo tecnico di chi esegue il seed (es. 'seed-script')
--
-- IDEMPOTENZA: ogni INSERT usa ON CONFLICT DO NOTHING su chiavi univoche;
-- rieseguire il template non crea duplicati.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- STAGING TEMPLATE — DO NOT RUN ON PRODUCTION
-- 1. Catalogo ruoli, scopato per organizzazione
-- ----------------------------------------------------------------------------
create table if not exists org_roles (
    id              uuid primary key default gen_random_uuid(),
    organization_id uuid        not null,
    code            text        not null,
    name            text        not null,
    description     text,
    is_system       boolean     not null default true,
    created_at      timestamptz not null default now(),
    -- impedisce duplicati dello stesso ruolo nella stessa organizzazione
    constraint org_roles_org_code_key unique (organization_id, code)
);

-- ----------------------------------------------------------------------------
-- 2. Permessi per ruolo (deny-by-default: ciò che non è elencato è negato)
--    scope: 'ALL' | 'OWN' | 'NONE' — 'OWN' = solo record propri o assegnati
-- ----------------------------------------------------------------------------
create table if not exists org_role_permissions (
    id              uuid primary key default gen_random_uuid(),
    organization_id uuid        not null,
    role_code       text        not null,
    permission_key  text        not null,
    allowed         boolean     not null default false,
    scope           text        not null default 'NONE'
                    check (scope in ('ALL','OWN','NONE')),
    requires_second_approver boolean not null default false,
    notes           text,
    created_at      timestamptz not null default now(),
    constraint org_role_permissions_key unique (organization_id, role_code, permission_key)
);

-- ----------------------------------------------------------------------------
-- 3. Audit del seeding (ogni esecuzione lascia traccia; append-only)
-- ----------------------------------------------------------------------------
create table if not exists org_role_seed_audit (
    id              uuid primary key default gen_random_uuid(),
    organization_id uuid        not null,
    action          text        not null,
    detail          text,
    seeded_by       text        not null,
    seeded_at       timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- STAGING TEMPLATE — DO NOT RUN ON PRODUCTION
-- 4. Seed dei tre ruoli MVP (idempotente, nessun duplicato)
--    ADMIN resta DISTINTO da DIREZIONE (DEC-015): nessuno dei due implica l'altro.
-- ----------------------------------------------------------------------------
insert into org_roles (organization_id, code, name, description)
values
    ('{{ORGANIZATION_ID}}', 'ADMIN',     'Amministrazione tecnica',
     'Configurazione, utenti, ruoli, integrazioni. NON approva payroll o movimenti economici per default.'),
    ('{{ORGANIZATION_ID}}', 'DIREZIONE', 'Direzione',
     'Governo operativo, economico e del personale. Approva le operazioni sensibili. NON modifica RLS, segreti o audit.'),
    ('{{ORGANIZATION_ID}}', 'STAFF',     'Staff operativo',
     'Operatività quotidiana su dati propri o assegnati (scope OWN).')
on conflict (organization_id, code) do nothing;

-- ----------------------------------------------------------------------------
-- 5. Seed permessi chiave (estratto della matrice; la fonte completa resta
--    32_INITIAL_USERS_AND_PERMISSION_MATRIX.md e roles_mvp_permissions.md)
-- ----------------------------------------------------------------------------
insert into org_role_permissions
    (organization_id, role_code, permission_key, allowed, scope, requires_second_approver, notes)
values
    -- ADMIN: tecnica sì, economia no
    ('{{ORGANIZATION_ID}}', 'ADMIN', 'users.manage',            true,  'ALL',  false, 'inviti, sospensioni, assegnazione ruoli'),
    ('{{ORGANIZATION_ID}}', 'ADMIN', 'roles.assign_admin',      true,  'ALL',  true,  'assegnare/rimuovere ADMIN richiede secondo approvatore'),
    ('{{ORGANIZATION_ID}}', 'ADMIN', 'config.organization',     true,  'ALL',  false, 'sedi, stagioni/wipe, moduli, cataloghi, integrazioni'),
    ('{{ORGANIZATION_ID}}', 'ADMIN', 'audit.technical.read',    true,  'ALL',  false, null),
    ('{{ORGANIZATION_ID}}', 'ADMIN', 'audit.delete',            false, 'NONE', false, 'l''audit non si cancella, per nessun ruolo'),
    ('{{ORGANIZATION_ID}}', 'ADMIN', 'payroll.approve',         false, 'NONE', false, 'NEGATO per default (DEC-015): serve ruolo DIREZIONE esplicito'),
    ('{{ORGANIZATION_ID}}', 'ADMIN', 'payments.approve_own',    false, 'NONE', false, 'mai approvare movimenti creati da sé'),
    ('{{ORGANIZATION_ID}}', 'ADMIN', 'hr.notes.read',           false, 'NONE', false, 'note HR riservate non necessarie al supporto tecnico'),
    ('{{ORGANIZATION_ID}}', 'ADMIN', 'export.full',             true,  'ALL',  true,  'export completo solo con approvazione'),

    -- DIREZIONE: economia e personale sì, tecnica no
    ('{{ORGANIZATION_ID}}', 'DIREZIONE', 'dashboard.company.read',  true,  'ALL',  false, null),
    ('{{ORGANIZATION_ID}}', 'DIREZIONE', 'hr.manage',               true,  'ALL',  false, 'assunzioni, promozioni, sospensioni, cessazioni'),
    ('{{ORGANIZATION_ID}}', 'DIREZIONE', 'finance.read',            true,  'ALL',  false, 'vendite, costi, cassa, margini, budget'),
    ('{{ORGANIZATION_ID}}', 'DIREZIONE', 'payroll.approve',         true,  'ALL',  true,  'sopra soglia o su propria operazione: secondo approvatore'),
    ('{{ORGANIZATION_ID}}', 'DIREZIONE', 'payroll.reopen_period',   true,  'ALL',  true,  'riapertura sempre versionata e a doppia approvazione'),
    ('{{ORGANIZATION_ID}}', 'DIREZIONE', 'purchases.approve',       true,  'ALL',  false, 'sopra soglia: secondo approvatore da config'),
    ('{{ORGANIZATION_ID}}', 'DIREZIONE', 'config.security',         false, 'NONE', false, 'RLS, segreti e pannello tecnico restano ad ADMIN'),
    ('{{ORGANIZATION_ID}}', 'DIREZIONE', 'audit.delete',            false, 'NONE', false, null),

    -- STAFF: operatività su dati propri/assegnati (scope OWN)
    ('{{ORGANIZATION_ID}}', 'STAFF', 'procedures.read',          true,  'ALL',  false, 'procedure, formazione, listino attivo'),
    ('{{ORGANIZATION_ID}}', 'STAFF', 'work.manage',              true,  'OWN',  false, 'propri lavori/turni/attività o assegnati'),
    ('{{ORGANIZATION_ID}}', 'STAFF', 'customers.write_limited',  true,  'OWN',  false, 'solo campi consentiti'),
    ('{{ORGANIZATION_ID}}', 'STAFF', 'sales.record',             true,  'OWN',  false, 'entro soglie e workflow'),
    ('{{ORGANIZATION_ID}}', 'STAFF', 'payroll.read',             true,  'OWN',  false, 'solo il proprio prospetto e fatturato personale'),
    ('{{ORGANIZATION_ID}}', 'STAFF', 'payroll.dispute',          true,  'OWN',  false, 'contestazione sul proprio prospetto'),
    ('{{ORGANIZATION_ID}}', 'STAFF', 'finance.read',             false, 'NONE', false, 'nessuna finanza aziendale completa'),
    ('{{ORGANIZATION_ID}}', 'STAFF', 'payroll.read_others',      false, 'NONE', false, 'mai stipendi o performance altrui'),
    ('{{ORGANIZATION_ID}}', 'STAFF', 'roles.manage',             false, 'NONE', false, null),
    ('{{ORGANIZATION_ID}}', 'STAFF', 'audit.delete',             false, 'NONE', false, null)
on conflict (organization_id, role_code, permission_key) do nothing;

-- ----------------------------------------------------------------------------
-- 6. Traccia audit del seed (append-only: una riga per esecuzione)
-- ----------------------------------------------------------------------------
insert into org_role_seed_audit (organization_id, action, detail, seeded_by)
values ('{{ORGANIZATION_ID}}', 'SEED_ROLES_MVP',
        'Seed idempotente ruoli ADMIN/DIREZIONE/STAFF + permessi chiave (staging)',
        '{{SEEDED_BY}}');

commit;

-- ============================================================================
-- VERIFICA POST-SEED (sola lettura, facoltativa)
-- ============================================================================
-- select code, name from org_roles
--   where organization_id = '{{ORGANIZATION_ID}}' order by code;
-- select role_code, permission_key, allowed, scope, requires_second_approver
--   from org_role_permissions
--   where organization_id = '{{ORGANIZATION_ID}}'
--   order by role_code, permission_key;
--
-- ATTESO: 3 ruoli; ADMIN con payroll.approve = false; STAFF senza scope 'ALL'
-- su dati economici; nessun duplicato dopo doppia esecuzione del template.
--
-- ============================================================================
-- PROMEMORIA FINALE — STAGING TEMPLATE — DO NOT RUN ON PRODUCTION
--  * Gli account demo (demo-admin / demo-direzione / demo-staff) si creano SOLO
--    in staging (DEC-016), fuori da questo file, senza credenziali nel repo.
--  * Le policy RLS deny-by-default che applicano questi permessi sono oggetto
--    di AUTH-004 (Slice 1) e NON sono incluse in questo template.
-- ============================================================================
