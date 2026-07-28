/* Test dell'interfaccia con client Supabase MOCK.
 *
 * Verifica il comportamento reale dell'applicazione in un browser, senza mai
 * contattare Supabase Cloud: il client è sostituito dal mock definito in
 * tests/mock/runtime-config.mock.js, che l'app accetta solo perché l'URL
 * configurato usa il dominio riservato `.invalid`.
 *
 * Prerequisiti (dipendenza di sviluppo, non versionata):
 *   npm install playwright
 *   npx playwright install chromium
 *
 * Esecuzione:
 *   node tests/run-mock-tests.mjs
 *
 * Lo script avvia da sé il server statico e installa la configurazione mock
 * come runtime-config.js (file non versionato), poi ripristina lo stato
 * precedente al termine.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { copyFileSync, existsSync, renameSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const PORT = Number(process.env.BFOS_TEST_PORT || 8123);
const BASE = `http://localhost:${PORT}/?scenario=`;

const CONFIG = join(ROOT, 'runtime-config.js');
const BACKUP = join(ROOT, 'runtime-config.js.testbak');
const MOCK = join(ROOT, 'tests', 'mock', 'runtime-config.mock.js');

/* ---------------------------------------------------------------- setup -- */
const hadConfig = existsSync(CONFIG);
if (hadConfig) renameSync(CONFIG, BACKUP);
copyFileSync(MOCK, CONFIG);

const server = spawn(process.execPath, [join(ROOT, 'tests', 'serve.mjs'), String(PORT)], { stdio: 'ignore' });
const cleanup = () => {
  try { server.kill(); } catch {}
  try { rmSync(CONFIG, { force: true }); } catch {}
  if (hadConfig) { try { renameSync(BACKUP, CONFIG); } catch {} }
};
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(130); });
await new Promise(r => setTimeout(r, 600));

/* ------------------------------------------------------------- risultati -- */
const results = [];
const consoleErrors = [];
const t = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail: String(detail) });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n      ${detail}` : ''}`);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

/* ------------------------------------------------------------- utilità --- */
const snap = () => page.evaluate(() => {
  const vis = id => { const e = document.getElementById(id); return !!e && getComputedStyle(e).display !== 'none'; };
  const txt = id => (document.getElementById(id)?.textContent || '').trim();
  const A = typeof App !== 'undefined' ? App : null;   // `App` è un const globale, non window.App
  return {
    ready: document.getElementById('app').classList.contains('ready'),
    login: vis('loginScreen'), noAccess: vis('noAccessScreen'), config: vis('configScreen'),
    err: txt('loginErr'), configReason: txt('configReason'),
    badge: txt('curUserRole'), user: txt('curUserName'),
    viewer: (document.getElementById('curUserRole')?.className || '').includes('viewer'),
    role: A && A.session ? A.session.appRole : null,
    canWrite: A ? A.canWrite : null, isAdmin: A ? A.isAdmin : null,
    mockUsed: !!(window.__BFOS_SCENARIO__ && window.__BFOS_SCENARIO__.client),
    rpc: (window.__BFOS_SCENARIO__ && window.__BFOS_SCENARIO__.client)
      ? window.__BFOS_SCENARIO__.client.__mockLog.rpc.map(r => r.fn) : [],
    toasts: [...document.querySelectorAll('#toasts .toast')].map(x => x.textContent).join(' | '),
    text: document.body.innerText
  };
});
const view = () => page.evaluate(() => document.getElementById('view').innerText);
const setTab = n => page.evaluate(x => App.setTab(x), n);
const go = async n => { await page.goto(BASE + n); await page.waitForTimeout(350); };
const login = async () => {
  await page.fill('#loginEmail', 'mock@example.invalid');
  await page.fill('#loginPass', 'mock-password');
  await page.click('#loginBtn');
  await page.waitForTimeout(700);
};

let s, v;

/* 1 ---------------------------------------------------------- login ok --- */
await go('login-success');
const pre = await snap();
await login(); s = await snap();
t('login riuscito', !pre.ready && s.ready && s.role === 'ADMIN' && s.mockUsed
  && s.rpc.includes('bfos_current_app_role'),
  `prima ready=${pre.ready} · dopo ready=${s.ready} · ruolo=${s.role} · rpc=[${s.rpc}]`);
t('il ruolo è chiesto al server, non dedotto dal client',
  s.rpc.filter(f => f === 'bfos_current_app_role').length >= 1, `chiamate rpc=[${s.rpc}]`);

/* 2 ------------------------------------------------------ login fallito -- */
await go('login-failure'); await login(); s = await snap();
t('login fallito: messaggio generico, nessun accesso',
  !s.ready && s.login && s.err === 'Credenziali non valide.'
  && !/invalid login|400|email|utente/i.test(s.err), `errore="${s.err}" ready=${s.ready}`);

/* 3 ------------------------------------------------------------- ADMIN --- */
await go('admin'); await login(); s = await snap();
t('ADMIN: ruolo, badge e permessi',
  s.ready && s.role === 'ADMIN' && s.canWrite && s.isAdmin && !s.viewer && s.badge === 'Admin',
  `badge=${s.badge} canWrite=${s.canWrite} isAdmin=${s.isAdmin}`);
await setTab('settings'); v = await view();
t('ADMIN: gestione utenti in migrazione, senza dati né azioni',
  /Gestione utenti in migrazione a Supabase Auth/.test(v) && !/bfos_users|Table Editor/i.test(v),
  v.split('\n').filter(Boolean).slice(0, 2).join(' · '));

/* 4 --------------------------------------------------------- DIREZIONE --- */
await go('direzione'); await login(); s = await snap();
t('DIREZIONE: ruolo, badge e permessi',
  s.ready && s.role === 'DIREZIONE' && s.canWrite && !s.isAdmin && s.badge === 'Direzione' && !s.viewer,
  `badge=${s.badge} canWrite=${s.canWrite} isAdmin=${s.isAdmin}`);
await setTab('settings'); v = await view();
t('DIREZIONE: nessuna gestione membership ADMIN',
  !/Gestione utenti in migrazione/.test(v), `sezione ADMIN presente=${/Gestione utenti/.test(v)}`);
await setTab('members'); v = await view();
t('DIREZIONE: scritture operative disponibili', /Nuovo membro/.test(v));

/* 5 ------------------------------------------------------------- STAFF --- */
await go('staff'); await login(); s = await snap();
t('STAFF: ruolo, badge in sola lettura',
  s.ready && s.role === 'STAFF' && !s.canWrite && !s.isAdmin && s.viewer && s.badge === 'Staff',
  `badge=${s.badge} viewer=${s.viewer} canWrite=${s.canWrite}`);
await setTab('members'); v = await view();
t('STAFF: legge i dati ma non ha pulsanti di scrittura',
  /Membro Mock/.test(v) && !/Nuovo membro/.test(v),
  `legge=${/Membro Mock/.test(v)} scrive=${/Nuovo membro/.test(v)}`);

/* 6 --------------------------------------------------------- NO_ACCESS --- */
await go('no-access'); await login(); s = await snap();
t('NO_ACCESS: schermata dedicata, nessun dato esposto',
  !s.ready && s.noAccess && s.role === null && !s.canWrite
  && /ACCESSO NON AUTORIZZATO/.test(s.text) && !/Membro Mock/.test(s.text),
  `noAccess=${s.noAccess} ruolo=${s.role} datiEsposti=${/Membro Mock/.test(s.text)}`);
t('NO_ACCESS: logout disponibile', /Esci/.test(s.text));

/* 7 ------------------------------------------------------------ logout --- */
await go('logout'); await login(); await page.waitForTimeout(900); s = await snap();
t('logout: ritorno alla schermata di accesso',
  !s.ready && s.login && s.role === null, `login=${s.login} ready=${s.ready} ruolo=${s.role}`);

/* 8 --------------------------------------------------- ripristino sessione */
await go('session-restore'); await page.waitForTimeout(900); s = await snap();
t('ripristino sessione senza interazione',
  s.ready && s.role === 'DIREZIONE', `ready=${s.ready} ruolo=${s.role} utente=${s.user}`);

/* 9 ------------------------------------------- helper ruolo irraggiungibile */
await go('role-helper-unreachable'); await login(); s = await snap();
t('helper ruolo non raggiungibile: nessun accesso, messaggio non tecnico',
  !s.ready && s.login && /non raggiungibile/i.test(s.err)
  && !/42501|policy|fetch|SELECT|row-level/i.test(s.err), `errore="${s.err}"`);

/* 10 ------------------------------------------------------- rifiuto RLS --- */
await go('rls-denial'); await login();
await page.evaluate(() => { Store.data.members[0].nickDiscord = 'Modifica Test'; Store.save(); });
await page.waitForTimeout(900); s = await snap();
t('rifiuto RLS gestito senza rivelare dettagli SQL',
  s.ready && /non consentita/i.test(s.toasts)
  && !/42501|row-level|policy|bfos_|violates/i.test(s.toasts), `toast="${s.toasts}"`);

/* 11 ------------------------------------------ configurazione runtime KO --- */
await go('missing-config'); s = await snap();
t('configurazione runtime mancante: errore esplicito, app ferma',
  !s.ready && s.config && !s.login && /CONFIGURAZIONE MANCANTE/.test(s.text) && s.configReason.length > 0,
  `motivo="${s.configReason}"`);

/* ----------------------------------------------- assenze da verificare ---- */
await go('admin'); await login(); s = await snap();
t('nessun pannello TEST ONLY, nessuna identità sintetica',
  !/TEST ONLY/i.test(s.text) && !/ADMIN_TEST|DIREZIONE_TEST|STAFF_TEST|NO_ROLE_TEST/.test(s.text));
const storage = await page.evaluate(() => ({
  local: Object.keys(localStorage).filter(k => /role|ruolo|admin|direzione|staff/i.test(k)
    || /"?(ADMIN|DIREZIONE|STAFF)"?/.test(localStorage.getItem(k) || '')),
  session: Object.keys(sessionStorage)
}));
t('nessun ruolo applicativo conservato in localStorage/sessionStorage',
  storage.local.length === 0 && storage.session.length === 0,
  `local=[${storage.local}] session=[${storage.session}]`);

/* --------------------------------------------------------------- mobile --- */
await page.setViewportSize({ width: 390, height: 844 });
await go('direzione'); await login(); s = await snap();
const mobile = await page.evaluate(() => {
  const t = document.querySelector('.table-wrap'), c = document.querySelector('.cards');
  return {
    tableHidden: !t || getComputedStyle(t).display === 'none',
    cardsShown: !!c && getComputedStyle(c).display !== 'none',
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1
  };
});
t('mobile 390px: layout a schede, nessuno scorrimento orizzontale',
  s.ready && mobile.tableHidden && mobile.cardsShown && !mobile.overflow,
  `tabellaNascosta=${mobile.tableHidden} schede=${mobile.cardsShown} overflowX=${mobile.overflow}`);

/* -------------------------------------------------------------- console --- */
const critical = consoleErrors.filter(e => !/favicon|404 \(Not Found\)/i.test(e));
t('console senza errori critici', critical.length === 0, critical.slice(0, 3).join(' | ') || 'nessuno');

await browser.close();
cleanup();

const passed = results.filter(r => r.ok).length;
console.log(`\n${passed}/${results.length} controlli superati`);
process.exit(passed === results.length ? 0 : 1);
