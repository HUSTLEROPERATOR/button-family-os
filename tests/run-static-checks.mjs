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
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import vm from 'node:vm';

const ROOT = resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));

/* File versionati che compongono il build pubblico.
   Esclusi:
   - tests/ e docs/          non serviti al browser, contengono per definizione esempi;
   - runtime-config*.js      artefatti di deploy non versionati (vedi .gitignore),
                             a parte il template runtime-config.example.js;
   - *.local.js              file locali non versionati. */
const UNVERSIONED = /^runtime-config(\.local)?\.js$|\.local\.js$/;
const SHIPPED = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (['.git', 'node_modules', 'tests', 'docs', 'audit'].includes(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (UNVERSIONED.test(name)) continue;
    else if (['.html', '.js', '.css', '.json'].includes(extname(name))) SHIPPED.push(p);
  }
})(ROOT);

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
const ALLOWED_HOSTS = ['www.w3.org', 'YOUR-PROJECT.supabase.co', 'mock-project.example.invalid', 'twitch.tv'];
expectNone('project ref Supabase assente', /[a-z]{20}\.supabase\.co/);
expectNone('URL di progetto Supabase assente', /https:\/\/(?!YOUR-PROJECT\.)[a-z0-9-]+\.supabase\.(co|in)/i);
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

console.log('\n--- .gitignore ---');
const ignore = readFileSync(join(ROOT, '.gitignore'), 'utf8');
for (const pat of ['runtime-config.local.js', 'test-tokens.local.js', '*.local.js', '.env']) {
  check(`.gitignore esclude ${pat}`, ignore.includes(pat));
}

console.log(`\n${failed === 0 ? 'TUTTI I CONTROLLI SUPERATI' : `${failed} CONTROLLO/I FALLITO/I`}`);
process.exit(failed === 0 ? 0 : 1);
