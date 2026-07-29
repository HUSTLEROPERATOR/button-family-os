/* Controlli statici sul frontend pubblico.
 *
 *   node tests/run-static-checks.mjs
 *
 * Verifica, senza contattare la rete e senza avviare un browser:
 *   - che il JavaScript inline sia sintatticamente valido;
 *   - che la struttura HTML di base sia bilanciata;
 *   - che non siano presenti segreti, chiavi, token o indirizzi di progetto;
 *   - che non siano presenti riferimenti di laboratorio o identità sintetiche;
 *   - che non vengano invocate le RPC legacy revocate;
 *   - che l'avvio non dipenda dal caricamento del codice applicativo dal DB.
 *
 * Esce con codice 1 al primo controllo fallito.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, extname, sep } from 'node:path';
import vm from 'node:vm';

const ROOT = resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));

/* File versionati che compongono il build pubblico.
   Esclusi:
   - tests/, docs/, supabase/, scripts/   non serviti al browser;
   - runtime-config*.js                   artefatti di deploy non versionati
                                          (vedi .gitignore), a parte i template;
   - *.local.js                           file locali non versionati.
   Il pacchetto di staging in supabase/ e scripts/ ha una sezione dedicata più
   in basso, con regole proprie. */
const UNVERSIONED = /^runtime-config(\.local)?\.js$|\.local\.js$/;
const NOT_SHIPPED_DIRS = ['.git', 'node_modules', 'tests', 'docs', 'audit', 'supabase', 'scripts'];
const SHIPPED = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (NOT_SHIPPED_DIRS.includes(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (UNVERSIONED.test(name)) continue;
    else if (['.html', '.js', '.css', '.json'].includes(extname(name))) SHIPPED.push(p);
  }
})(ROOT);

/* Pacchetto di staging: SQL delle migrazioni, rollback, seed, test e script. */
const STAGING = [];
(function walkStaging(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkStaging(p);
    else if (['.sql', '.mjs', '.js'].includes(extname(name))) STAGING.push(p);
  }
})(join(ROOT, 'supabase'));
(function walkScripts(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isFile() && ['.mjs', '.js'].includes(extname(name))) STAGING.push(p);
  }
})(join(ROOT, 'scripts'));

/* La libreria di terze parti è verificata per impronta (vedi vendor/README.md),
   non per contenuto: contiene naturalmente stringhe come "*.supabase.co". */
const APP_FILES = SHIPPED.filter(p => !p.includes(`${'vendor'}${process.platform === 'win32' ? '\\' : '/'}`));

const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const appSources = APP_FILES.map(p => ({ path: p.slice(ROOT.length + 1), text: readFileSync(p, 'utf8') }));

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failed++;
};

/* Cerca un pattern in tutti i file applicativi; restituisce le occorrenze. */
function scan(re) {
  const hits = [];
  for (const { path, text } of appSources) {
    text.split('\n').forEach((line, i) => {
      const m = line.match(re);
      if (m) hits.push(`${path}:${i + 1} ${m[0].slice(0, 60)}`);
    });
  }
  return hits;
}
const expectNone = (name, re) => {
  const hits = scan(re);
  check(name, hits.length === 0, hits.length ? `${hits.length} occorrenza/e: ${hits[0]}` : '0');
};

console.log('--- parser JavaScript ---');
const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)];
check('un solo blocco script inline', inline.length === 1, `trovati ${inline.length}`);
inline.forEach((s, i) => {
  let ok = true, msg = '';
  try { new vm.Script(s[1], { filename: `index.html#inline-${i}.js` }); }
  catch (e) { ok = false; msg = e.message; }
  check(`sintassi script inline #${i}`, ok, msg);
});
for (const { path, text } of appSources.filter(f => f.path.endsWith('.js'))) {
  let ok = true, msg = '';
  try { new vm.Script(text, { filename: path }); } catch (e) { ok = false; msg = e.message; }
  check(`sintassi ${path}`, ok, msg);
}

console.log('\n--- struttura HTML ---');
check('doctype presente', /^<!DOCTYPE html>/i.test(html.trim()));
for (const tag of ['html', 'head', 'body', 'script', 'style']) {
  const open = (html.match(new RegExp(`<${tag}[\\s>]`, 'gi')) || []).length;
  const close = (html.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
  check(`tag <${tag}> bilanciati`, open === close, `${open} aperti / ${close} chiusi`);
}
check('meta viewport presente', /<meta[^>]+name=["']viewport["']/i.test(html));
check('title presente', /<title>[^<]+<\/title>/i.test(html));

console.log('\n--- segreti e credenziali ---');
/* Cerchiamo una chiave di servizio, non la parola: il codice la nomina
   deliberatamente per rifiutarla all'avvio (guardia in readRuntimeConfig). */
expectNone('nessuna chiave service_role',     /service[_-]?role[^\n]{0,40}['"][A-Za-z0-9._-]{20,}['"]/i);
expectNone('chiave segreta sb_secret assente', /sb_secret_[A-Za-z0-9_-]+/);
expectNone('JWT assente',                     /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\./);
expectNone('publishable key reale assente',   /sb_publishable_[A-Za-z0-9_-]{10,}/);
expectNone('bearer token assente',            /Bearer\s+[A-Za-z0-9._-]{20,}/);
expectNone('password letterale assente',      /(password|passwd|pwd)\s*[:=]\s*["'][^"']{3,}["']/i);
expectNone('apikey letterale assente',        /apikey\s*[:=]\s*["'][^"']{8,}["']/i);

console.log('\n--- indirizzi e project ref ---');
/* Unici host ammessi nel codice pubblico, tutti inerti a runtime:
   - www.w3.org        namespace degli SVG inline, non viene contattato;
   - YOUR-PROJECT...   segnaposto del template, esplicitamente rifiutato dall'app;
   - mock-project...   dominio .invalid del client mock (riservato da RFC 2606);
   - twitch.tv         suggerimento di formato in un campo del modulo membri. */
const ALLOWED_HOSTS = ['www.w3.org', 'YOUR-PROJECT.supabase.co', 'STAGING-PROJECT.supabase.co',
                       'mock-project.example.invalid', 'twitch.tv'];
expectNone('project ref Supabase assente', /[a-z]{20}\.supabase\.co/);
expectNone('URL di progetto Supabase assente',
  /https:\/\/(?!YOUR-PROJECT\.|STAGING-PROJECT\.)[a-z0-9-]+\.supabase\.(co|in)/i);
const remoteUrls = scan(/https?:\/\/[A-Za-z0-9.-]+/).filter(
  h => !ALLOWED_HOSTS.some(a => h.includes(a)));
check('nessun URL remoto non previsto', remoteUrls.length === 0,
  remoteUrls.length ? remoteUrls.join(' | ') : `0 (ammessi: ${ALLOWED_HOSTS.join(', ')})`);

console.log('\n--- riferimenti di laboratorio ---');
expectNone('marcatore LOCAL TEST ONLY assente', /LOCAL TEST ONLY/i);
expectNone('identità sintetiche assenti',       /(ADMIN|DIREZIONE|STAFF|NO_ROLE)_TEST/);
expectNone('file test-tokens assente',          /test-tokens/i);
expectNone('endpoint di laboratorio assente',   /https?:\/\/(127\.0\.0\.1|localhost)|127\.0\.0\.1:\d+|localhost:\d+|:3001\b|:4173\b/);
expectNone('UUID sintetici assenti',            /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
expectNone('indirizzi email assenti',           /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
check('nessun file test-tokens.local.js nel repository',
  !SHIPPED.some(p => p.includes('test-tokens')));

console.log('\n--- RPC legacy e tabelle vietate ---');
for (const fn of ['bfos_login', 'bfos_list_users', 'bfos_set_asset']) {
  expectNone(`nessuna invocazione di ${fn}`, new RegExp(fn));
}
expectNone('nessuna lettura di bfos_users',   /bfos_users/);
expectNone('nessuna lettura di bfos_secrets', /bfos_secrets/);

console.log('\n--- bootstrap ---');
expectNone("nessun caricamento dell'app da bfos_assets", /bfos_assets/);
check('nessun fetch() diretto nel percorso di avvio', !/\bfetch\s*\(/.test(html),
  /\bfetch\s*\(/.test(html) ? 'trovato fetch() in index.html' : '0');
check('libreria Supabase servita localmente',
  /<script src="vendor\/supabase-js-[\d.]+\.umd\.js"><\/script>/.test(html));
check('configurazione runtime caricata da file esterno non versionato',
  /<script src="runtime-config\.js"/.test(html));
check('nessun valore di configurazione incorporato in index.html',
  !/SUPABASE_URL\s*[:=]\s*["']http/.test(html) && !/SUPABASE_PUBLISHABLE_KEY\s*[:=]\s*["'][^"']{8,}/.test(html));

console.log('\n--- autorizzazione ---');
check('il ruolo arriva dall\'helper server-side M2', /bfos_current_app_role/.test(html));
check('nessun ruolo scritto in localStorage/sessionStorage',
  !/(local|session)Storage\.setItem/.test(html));
check('nessun selettore di ruolo lato client', !/setRole|chooseRole|roleSelect/i.test(html));
check('canWrite copre ADMIN e DIREZIONE',
  /get canWrite\(\)\{ return this\.session\?\.appRole === 'ADMIN' \|\| this\.session\?\.appRole === 'DIREZIONE'; \}/.test(html));

console.log('\n--- pacchetto staging (supabase/, scripts/) ---');
if (STAGING.length === 0) {
  check('pacchetto staging presente', false, 'nessun file trovato');
} else {
  check('pacchetto staging presente', true, `${STAGING.length} file`);

  const stagingSources = STAGING.map(p => ({ path: p.slice(ROOT.length + 1), text: readFileSync(p, 'utf8') }));
  const scanStaging = re => {
    const hits = [];
    for (const { path, text } of stagingSources) {
      text.split('\n').forEach((line, i) => {
        const m = line.match(re);
        if (m) hits.push(`${path}:${i + 1} ${m[0].slice(0, 60)}`);
      });
    }
    return hits;
  };
  const expectNoneStaging = (name, re) => {
    const hits = scanStaging(re);
    check(name, hits.length === 0, hits.length ? `${hits.length}: ${hits[0]}` : '0');
  };

  /* Struttura SQL. Non è un parser Postgres completo — senza un server non è
     possibile — ma un tokenizzatore che riconosce stringhe, identificativi
     quotati, commenti e dollar-quoting, e verifica che tutto sia bilanciato.
     Intercetta gli errori di scrittura più probabili: un $tag$ non chiuso, una
     stringa aperta, parentesi sbilanciate, un'istruzione senza punto e virgola. */
  function sqlStructure(text) {
    let i = 0, depth = 0, lastSignificant = '';
    const openTags = [];
    while (i < text.length) {
      const c = text[i];
      if (c === '-' && text[i + 1] === '-') { i = text.indexOf('\n', i); if (i < 0) break; continue; }
      if (c === '/' && text[i + 1] === '*') {
        const end = text.indexOf('*/', i + 2);
        if (end < 0) return { ok: false, error: 'commento a blocco non chiuso' };
        i = end + 2; continue;
      }
      if (c === "'" || c === '"') {
        const quote = c; i++;
        while (i < text.length) {
          if (text[i] === quote) { if (text[i + 1] === quote) i += 2; else { i++; break; } }
          else i++;
        }
        if (i > text.length) return { ok: false, error: `stringa ${quote} non chiusa` };
        lastSignificant = quote; continue;
      }
      if (c === '$') {
        const m = /^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/.exec(text.slice(i));
        if (m) {
          const tag = m[0];
          if (openTags.length && openTags[openTags.length - 1] === tag) openTags.pop();
          else openTags.push(tag);
          i += tag.length; lastSignificant = '$'; continue;
        }
      }
      if (openTags.length === 0) {
        if (c === '(') depth++;
        else if (c === ')') { depth--; if (depth < 0) return { ok: false, error: 'parentesi chiusa in eccesso' }; }
      }
      if (!/\s/.test(c)) lastSignificant = c;
      i++;
    }
    if (openTags.length) return { ok: false, error: `dollar-quote non chiuso: ${openTags.join(', ')}` };
    if (depth !== 0) return { ok: false, error: `${depth} parentesi non chiuse` };
    if (lastSignificant && lastSignificant !== ';') {
      return { ok: false, error: `il file non termina con ';' (ultimo carattere: '${lastSignificant}')` };
    }
    return { ok: true };
  }

  for (const { path, text } of STAGING.filter(p => p.endsWith('.sql'))
      .map(p => ({ path: p.slice(ROOT.length + 1), text: readFileSync(p, 'utf8') }))) {
    const r = sqlStructure(text);
    check(`struttura SQL ${path.split(sep).pop()}`, r.ok, r.ok ? 'bilanciata' : r.error);
  }

  /* Solo i segnaposto documentati sono ammessi come host. */
  expectNoneStaging('nessun project ref',
    /[a-z]{20}\.supabase\.co/);
  expectNoneStaging('nessun URL di progetto reale',
    /https:\/\/(?!STAGING-PROJECT\.|<)[a-z0-9-]+\.supabase\.(co|in)/i);
  expectNoneStaging('nessuna chiave service_role',
    /service[_-]?role[^\n]{0,40}["'][A-Za-z0-9._-]{20,}["']/i);
  expectNoneStaging('nessun JWT',
    /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\./);
  expectNoneStaging('nessuna publishable key reale',
    /sb_publishable_[A-Za-z0-9_-]{10,}/);
  expectNoneStaging('nessuna password letterale',
    /(password|passwd|pwd)\s*[:=]\s*["'][^"'$<{]{4,}["']/i);
  expectNoneStaging('nessun endpoint di laboratorio',
    /https?:\/\/(127\.0\.0\.1|localhost)|:3001\b|:4173\b|:8099\b/);
  expectNoneStaging('nessun adattamento pre-richiesta introdotto',
    /CREATE\s+(OR\s+REPLACE\s+)?FUNCTION[^\n]*pre_request|SET\s+pgrst\.db_pre_request/i);
  expectNoneStaging('nessun percorso Windows o nome di container',
    /[A-Za-z]:\\\\|[A-Za-z]:\/Users\/|docker\s+(run|exec)|container_name/i);

  /* Le identità sintetiche devono usare domini riservati (RFC 2606), mai reali. */
  const emails = scanStaging(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  const badEmails = emails.filter(e => !/@(example\.(com|org|net)|example\.invalid|.*\.invalid)/i.test(e));
  check('solo indirizzi email su domini riservati', badEmails.length === 0,
    badEmails.length ? badEmails.join(' | ') : `${emails.length} indirizzo/i, tutti riservati`);

  /* Gli UUID ammessi sono solo quelli palesemente sintetici del pacchetto. */
  const uuids = scanStaging(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
  const badUuids = uuids.filter(u => !/(5ada0000-0000-4000-8000-|00000000-0000-4000-8000-)/.test(u));
  check('nessun UUID non sintetico', badUuids.length === 0,
    badUuids.length ? badUuids.join(' | ') : `${uuids.length} UUID, tutti sintetici`);

  /* La catena è esattamente tre migrazioni, in quest'ordine: schema, sicurezza,
     ruoli. I rollback non devono essere raccolti dal runner. */
  const EXPECTED_MIGRATIONS = [
    '202607280000_application_schema.sql',
    '202607280001_secure_access.sql',
    '202607280002_server_side_roles.sql'
  ];
  const inMigrations = STAGING.filter(p => p.includes(`supabase${sep}migrations${sep}`));
  const names = inMigrations.map(p => p.split(sep).pop()).sort();
  check('solo le tre migrazioni previste in supabase/migrations/',
    names.length === 3 && names.every((n, i) => n === EXPECTED_MIGRATIONS[i]),
    names.join(', '));
  check('la migrazione dello schema precede quelle di sicurezza',
    names[0] === EXPECTED_MIGRATIONS[0]);
  check('nessun rollback dentro supabase/migrations/',
    !inMigrations.some(p => /rollback/i.test(p)));

  /* Le migrazioni non devono aprire una transazione annidata. */
  for (const f of inMigrations) {
    const txt = readFileSync(f, 'utf8');
    check(`${f.split(sep).pop()}: nessun BEGIN/COMMIT esplicito`,
      !/^\s*(BEGIN|COMMIT)\s*;/im.test(txt));
  }

  /* Il rollback che ripristina uno stato insicuro deve avere un blocco. */
  const m1rb = STAGING.find(p => /202607280001.*rollback/.test(p));
  check('il rollback insicuro ha un blocco di sicurezza', !!m1rb
    && /RAISE EXCEPTION/.test(readFileSync(m1rb, 'utf8')));

  /* Nessuna scrittura diretta in auth.users. */
  expectNoneStaging('nessun INSERT/UPDATE/DELETE su auth.users',
    /(INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+auth\.users/i);
  expectNoneStaging('nessuna modifica a storage o realtime',
    /(INSERT|UPDATE|DELETE|ALTER|DROP)[^\n]{0,40}\b(storage|realtime)\./i);

  /* Nessuna concessione ad anon nelle migrazioni e nel seed. I rollback sono
     esclusi di proposito: il rollback di 0001 ripristina lo stato insicuro
     precedente, e reintrodurre quei GRANT è esattamente il suo scopo. */
  const grantRe = /GRANT[^\n;]{0,120}\bTO\b[^\n;]{0,60}\banon\b/i;
  const forwardOnly = stagingSources.filter(
    s => !s.path.includes(`supabase${sep}rollback${sep}`));
  const anonGrants = [];
  for (const { path, text } of forwardOnly) {
    text.split('\n').forEach((line, i) => { if (grantRe.test(line)) anonGrants.push(`${path}:${i + 1}`); });
  }
  check('nessun GRANT ad anon in migrazioni e seed', anonGrants.length === 0,
    anonGrants.length ? anonGrants.join(' | ') : `0 su ${forwardOnly.length} file`);

  /* I GRANT ad anon possono comparire solo nel rollback che dichiara di
     ripristinare una configurazione insicura, e solo se lo dichiara. */
  const rollbackFiles = stagingSources.filter(s => s.path.includes(`supabase${sep}rollback${sep}`));
  for (const { path, text } of rollbackFiles) {
    if (!grantRe.test(text)) continue;
    check(`${path.split(sep).pop()}: i GRANT ad anon sono dichiarati come insicuri`,
      /RIPRISTINA UNA CONFIGURAZIONE INSICURA/i.test(text) && /RAISE EXCEPTION/.test(text));
  }
}

console.log('\n--- .gitignore ---');
const ignore = readFileSync(join(ROOT, '.gitignore'), 'utf8');
for (const pat of ['runtime-config.local.js', 'test-tokens.local.js', '*.local.js', '.env']) {
  check(`.gitignore esclude ${pat}`, ignore.includes(pat));
}

console.log(`\n${failed === 0 ? 'TUTTI I CONTROLLI SUPERATI' : `${failed} CONTROLLO/I FALLITO/I`}`);
process.exit(failed === 0 ? 0 : 1);
