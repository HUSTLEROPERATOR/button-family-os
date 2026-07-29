/* Validazione del progetto Supabase di STAGING.
 * =============================================================================
 * Verifica end-to-end il modello di autorizzazione contro un progetto di
 * staging reale, usando soltanto identità sintetiche.
 *
 *   node scripts/validate-staging.mjs
 *
 * Nessuna dipendenza: usa fetch nativo (Node 18+).
 *
 * SICUREZZA
 *   - Non stampa mai dati, token, chiavi, email o identificativi: solo esito,
 *     codice di stato e conteggi.
 *   - Rifiuta di partire se la configurazione contiene una chiave di servizio.
 *   - Registra ogni host contattato e fallisce se una richiesta esce dall'host
 *     di staging dichiarato, così una configurazione sbagliata non può
 *     raggiungere la produzione senza che il test se ne accorga.
 *   - Non scrive nulla di permanente: l'unica scrittura tentata è una prova di
 *     rifiuto RLS, che deve fallire.
 *
 * CREDENZIALI
 *   Vengono lette da variabili d'ambiente e non devono mai finire nel
 *   repository. Usa un file .env.staging locale (già escluso da .gitignore)
 *   oppure impostale nella sessione della shell.
 *
 *     STAGING_SUPABASE_URL          https://<staging>.supabase.co
 *     STAGING_PUBLISHABLE_KEY       chiave pubblica del progetto di staging
 *     STAGING_ADMIN_EMAIL           admin.staging@example.com
 *     STAGING_ADMIN_PASSWORD        ...
 *     STAGING_DIREZIONE_EMAIL       direzione.staging@example.com
 *     STAGING_DIREZIONE_PASSWORD    ...
 *     STAGING_STAFF_EMAIL           staff.staging@example.com
 *     STAGING_STAFF_PASSWORD        ...
 *     STAGING_NOROLE_EMAIL          norole.staging@example.com
 *     STAGING_NOROLE_PASSWORD       ...
 *
 *   Facoltative:
 *     STAGING_FORBIDDEN_HOSTS       host da bloccare, separati da virgola
 *                                   (es. l'host di produzione)
 *     STAGING_EXPECT_ANON_REVOKED   "true" dopo il passo 15 del runbook
 * =============================================================================
 */

/* -------------------------------------------------------------- utilità --- */
const results = [];
const t = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};
const fatal = msg => { console.error(`\nINTERROTTO: ${msg}`); process.exit(2); };

/* ------------------------------------------------- configurazione runtime -- */
const URL_RAW = (process.env.STAGING_SUPABASE_URL || '').trim();
const KEY = (process.env.STAGING_PUBLISHABLE_KEY || '').trim();

if (!URL_RAW || !KEY) {
  fatal('STAGING_SUPABASE_URL o STAGING_PUBLISHABLE_KEY non impostate. '
      + 'Vedi l\'intestazione di questo file.');
}

let base;
try { base = new global.URL(URL_RAW); } catch { fatal('STAGING_SUPABASE_URL non è un URL valido.'); }
if (base.protocol !== 'https:') fatal('STAGING_SUPABASE_URL deve usare HTTPS.');

/* La chiave di servizio non deve mai essere usata da questo script: avrebbe
   privilegi che aggirano completamente le policy, rendendo il test privo di
   significato oltre che pericoloso. */
function looksLikeServiceRole(key) {
  if (/service[_-]?role/i.test(key)) return true;
  const p = key.split('.');
  if (p.length !== 3) return false;
  try {
    return JSON.parse(Buffer.from(p[1], 'base64url').toString('utf8')).role === 'service_role';
  } catch { return false; }
}
if (looksLikeServiceRole(KEY)) {
  fatal('La chiave fornita sembra una chiave di servizio. Usare la chiave pubblica.');
}

const FORBIDDEN = (process.env.STAGING_FORBIDDEN_HOSTS || '')
  .split(',').map(s => s.trim()).filter(Boolean);
if (FORBIDDEN.includes(base.hostname)) {
  fatal('L\'host configurato è nell\'elenco degli host vietati. Interrotto.');
}

/* ------------------------------------------- fetch tracciato e vincolato --- */
const contactedHosts = new Set();
async function call(path, { method = 'GET', token, body, prefer } = {}) {
  const target = new global.URL(path, base);
  contactedHosts.add(target.hostname);

  if (target.hostname !== base.hostname) {
    fatal(`Richiesta verso un host non previsto (${target.hostname}). Interrotto.`);
  }
  if (FORBIDDEN.includes(target.hostname)) {
    fatal('Richiesta verso un host vietato. Interrotto.');
  }

  const headers = { apikey: KEY, 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (prefer) headers.Prefer = prefer;

  let res;
  try {
    res = await fetch(target, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch (e) {
    return { status: 0, ok: false, json: null, networkError: true };
  }
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* corpo non JSON */ }
  return { status: res.status, ok: res.ok, json };
}

/* Effettua il login e restituisce solo il token, mai stampato. */
async function signIn(label, emailVar, passVar) {
  const email = process.env[emailVar];
  const password = process.env[passVar];
  if (!email || !password) fatal(`${emailVar} o ${passVar} non impostate.`);
  const r = await call('/auth/v1/token?grant_type=password', {
    method: 'POST', body: { email, password }
  });
  if (!r.ok || !r.json?.access_token) {
    fatal(`Login fallito per ${label} (stato ${r.status}). Verificare le credenziali sintetiche.`);
  }
  return r.json.access_token;
}

const roleOf = async token => {
  const r = await call('/rest/v1/rpc/bfos_current_app_role', { method: 'POST', token, body: {} });
  return { status: r.status, role: typeof r.json === 'string' ? r.json : r.json };
};

/* ============================================================ ESECUZIONE == */
console.log(`Progetto di staging: host ***${base.hostname.slice(-14)} (mascherato)\n`);

/* 1 — configurazione ------------------------------------------------------- */
t('configurazione runtime presente e in HTTPS', true, 'URL e chiave pubblica caricati');
t('nessuna chiave di servizio in uso', !looksLikeServiceRole(KEY));
t('host non presente fra quelli vietati', !FORBIDDEN.includes(base.hostname),
  FORBIDDEN.length ? `${FORBIDDEN.length} host vietati configurati` : 'nessun host vietato configurato');

/* 2 — raggiungibilità ------------------------------------------------------ */
const health = await call('/auth/v1/health');
t('Supabase raggiungibile', health.status > 0 && health.status < 500, `stato ${health.status}`);
if (health.networkError) fatal('Progetto di staging non raggiungibile.');

/* 3 — sessioni Auth -------------------------------------------------------- */
const tokens = {
  ADMIN:     await signIn('ADMIN',     'STAGING_ADMIN_EMAIL',     'STAGING_ADMIN_PASSWORD'),
  DIREZIONE: await signIn('DIREZIONE', 'STAGING_DIREZIONE_EMAIL', 'STAGING_DIREZIONE_PASSWORD'),
  STAFF:     await signIn('STAFF',     'STAGING_STAFF_EMAIL',     'STAGING_STAFF_PASSWORD'),
  NOROLE:    await signIn('NO_ACCESS', 'STAGING_NOROLE_EMAIL',    'STAGING_NOROLE_PASSWORD')
};
t('sessione Auth ottenuta per le 4 identità sintetiche', true, '4/4');

/* 4 — helper del ruolo ----------------------------------------------------- */
for (const [label, expected] of [['ADMIN', 'ADMIN'], ['DIREZIONE', 'DIREZIONE'], ['STAFF', 'STAFF']]) {
  const r = await roleOf(tokens[label]);
  t(`helper ruolo: ${label}`, r.status === 200 && r.role === expected,
    `stato ${r.status}, ruolo ${r.role === expected ? 'atteso' : 'INATTESO'}`);
}
const noRole = await roleOf(tokens.NOROLE);
t('helper ruolo: NO_ACCESS restituisce nessun ruolo',
  noRole.status === 200 && (noRole.role === null || noRole.role === ''),
  `stato ${noRole.status}`);

/* 5 — matrice di lettura --------------------------------------------------- */
for (const label of ['ADMIN', 'DIREZIONE', 'STAFF']) {
  const r = await call('/rest/v1/bfos_members?select=id&limit=1', { token: tokens[label] });
  t(`${label} legge le tabelle operative`, r.status === 200 && Array.isArray(r.json),
    `stato ${r.status}, ${Array.isArray(r.json) ? r.json.length : 0} riga/e`);
}
const noRoleRead = await call('/rest/v1/bfos_members?select=id&limit=1', { token: tokens.NOROLE });
t('NO_ACCESS non legge alcun dato',
  noRoleRead.status === 200 && Array.isArray(noRoleRead.json) && noRoleRead.json.length === 0,
  `stato ${noRoleRead.status}, ${Array.isArray(noRoleRead.json) ? noRoleRead.json.length : '?'} riga/e`);

/* 6 — matrice di scrittura e rifiuto RLS ----------------------------------- */
const probe = { key: '__staging_probe__', value: String(Date.now()) };
const staffWrite = await call('/rest/v1/bfos_settings?on_conflict=key', {
  method: 'POST', token: tokens.STAFF, body: [probe], prefer: 'resolution=merge-duplicates'
});
t('rifiuto RLS: STAFF non può scrivere',
  staffWrite.status === 401 || staffWrite.status === 403,
  `stato ${staffWrite.status}`);

const noRoleWrite = await call('/rest/v1/bfos_settings?on_conflict=key', {
  method: 'POST', token: tokens.NOROLE, body: [probe], prefer: 'resolution=merge-duplicates'
});
t('rifiuto RLS: NO_ACCESS non può scrivere',
  noRoleWrite.status === 401 || noRoleWrite.status === 403,
  `stato ${noRoleWrite.status}`);

/* 7 — funzioni amministrative riservate ------------------------------------ */
const dirAdminFn = await call('/rest/v1/rpc/bfos_admin_list_memberships', {
  method: 'POST', token: tokens.DIREZIONE, body: {}
});
t('DIREZIONE non può elencare le membership',
  dirAdminFn.status >= 400, `stato ${dirAdminFn.status}`);

const adminFn = await call('/rest/v1/rpc/bfos_admin_list_memberships', {
  method: 'POST', token: tokens.ADMIN, body: {}
});
t('ADMIN può elencare le membership',
  adminFn.status === 200 && Array.isArray(adminFn.json),
  `stato ${adminFn.status}, ${Array.isArray(adminFn.json) ? adminFn.json.length : 0} riga/e`);

/* 8 — funzioni legacy non raggiungibili ------------------------------------ */
for (const fn of ['bfos_login', 'bfos_list_users', 'bfos_set_asset']) {
  const anonCall = await call(`/rest/v1/rpc/${fn}`, { method: 'POST', body: {} });
  const authCall = await call(`/rest/v1/rpc/${fn}`, { method: 'POST', token: tokens.ADMIN, body: {} });
  t(`funzione legacy ${fn} non eseguibile`,
    anonCall.status >= 400 && authCall.status >= 400,
    `anon ${anonCall.status}, authenticated ${authCall.status}`);
}

/* 9 — tabelle chiuse ------------------------------------------------------- */
for (const table of ['bfos_secrets', 'bfos_users']) {
  const anonRead = await call(`/rest/v1/${table}?select=*&limit=1`);
  const adminRead = await call(`/rest/v1/${table}?select=*&limit=1`, { token: tokens.ADMIN });
  const closed = anonRead.status >= 400
    && (adminRead.status >= 400
        || (Array.isArray(adminRead.json) && adminRead.json.length === 0));
  t(`tabella ${table} non accessibile da un ruolo client`, closed,
    `anon ${anonRead.status}, ADMIN ${adminRead.status}`);
}

/* 10 — accesso anonimo ----------------------------------------------------- */
const expectRevoked = String(process.env.STAGING_EXPECT_ANON_REVOKED || '').toLowerCase() === 'true';
const anonAssets = await call('/rest/v1/bfos_assets?key=eq.app&select=key');
const anonMembers = await call('/rest/v1/bfos_members?select=id&limit=1');
const anonBlocked = anonAssets.status >= 400
  || (Array.isArray(anonAssets.json) && anonAssets.json.length === 0);

t('anon non legge le tabelle operative',
  anonMembers.status >= 400 || (Array.isArray(anonMembers.json) && anonMembers.json.length === 0),
  `stato ${anonMembers.status}`);

if (expectRevoked) {
  t('lettura anonima della tabella asset revocata', anonBlocked, `stato ${anonAssets.status}`);
} else {
  t('lettura anonima della tabella asset: verifica rinviata', true,
    'impostare STAGING_EXPECT_ANON_REVOKED=true dopo il passo 15 del runbook');
}

/* 11 — nessuna richiesta fuori dallo staging -------------------------------- */
t('nessuna richiesta verso host diversi dallo staging',
  contactedHosts.size === 1 && contactedHosts.has(base.hostname),
  `${contactedHosts.size} host contattato/i`);

/* ============================================================== RIEPILOGO == */
const passed = results.filter(r => r.ok).length;
console.log(`\n${passed}/${results.length} controlli superati`);
if (passed !== results.length) {
  console.log('\nControlli falliti:');
  for (const r of results.filter(x => !x.ok)) console.log(`  - ${r.name}`);
}
console.log('\nNessun dato, token o identificativo è stato stampato.');
process.exit(passed === results.length ? 0 : 1);
