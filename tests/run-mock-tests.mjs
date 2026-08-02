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
const tab = () => page.evaluate(() => App.tab);

/* Blocchi che la dashboard deve mostrare a chiunque abbia un ruolo. Il
   confronto ignora le maiuscole: le etichette delle statistiche sono rese in
   maiuscolo dal CSS, e innerText restituisce il testo come viene disegnato. */
const DASH_BLOCKS = ['Obiettivi attivi', 'Obiettivi completati', 'Progresso settimana',
  'Missioni in scadenza', 'Checklist aperte', 'Membri in prova',
  'Comunicazioni importanti', 'Attività recenti', 'Regolamenti da leggere'];
const missingBlocks = v => DASH_BLOCKS.filter(b => !v.toLowerCase().includes(b.toLowerCase()));

/* Permessi su regolamenti e checklist letti dall'applicazione, non dedotti dal
   markup: la vista può nascondere un pulsante, ma è il permesso a decidere. */
const opPerms = () => page.evaluate(() => {
  const oper    = Operations.regulations.find(r => r.category === 'Operativo');
  const other   = Operations.regulations.find(r => r.category === 'Disciplinare');
  const dirOnly = Operations.regulations.find(r => !r.audience.includes('STAFF'));
  const open    = Operations.checklists.find(c => c.status === 'Aperta' || c.status === 'In corso');
  /* Nessun regolamento importato dai manuali nasce in bozza o archiviato: per
     verificare la visibilità di quegli stati se ne costruisce uno al volo,
     senza inserirlo nell'elenco. */
  const draft = { ...other, status: 'Bozza' };
  const arch  = { ...other, status: 'Archiviato' };
  return {
    editOperativo: App.canEditRegulation(oper), editDisciplinare: App.canEditRegulation(other),
    publishOperativo: App.canPublishRegulation(oper), archive: App.canArchiveRegulation(),
    mandatory: App.canSetRegulationMandatory(), review: App.canReviewAcknowledgements,
    createRegulation: App.canEditRegulation(null),
    readDraft: App.canReadRegulation(draft), readArchived: App.canReadRegulation(arch),
    readPublished: App.canReadRegulation(other), readOperativo: App.canReadRegulation(oper),
    readDirOnly: App.canReadRegulation(dirOnly),
    ackOperativo: App.canAcknowledgeRegulation(oper),
    visibleRegulations: Operations.regulations.filter(r => App.canReadRegulation(r)).length,
    totalRegulations: Operations.regulations.length,
    manageChecklists: App.canManageChecklists,
    completeOpen: App.canCompleteChecklist(open),
    itemFree: App.canCompleteChecklistItem(open, open.items.find(i => !i.restricted)),
    itemRestricted: App.canCompleteChecklistItem(open, open.items.find(i => i.restricted)),
    /* Una checklist chiusa non deve restare spuntabile da nessuno. */
    itemOnClosed: (() => {
      const was = open.status; open.status = 'Completata';
      const v = App.canCompleteChecklistItem(open, open.items.find(i => !i.restricted));
      open.status = was; return v;
    })()
  };
});

/* Riferimenti reali usati dai controlli, tutti provenienti dai manuali. */
const REG_DISCIPLINA = 'Condotta interna e disciplina';        // Manuale I §12
const REG_RADIO      = 'Comunicazione operativa e radio';      // Manuale II §04
const REG_CARTELLO   = 'Rapporti con il Cartello';             // Manuale II §08, solo Direzione
const CHK_INGRESSO   = 'chk-i-08';                             // Manuale I §8.1
const CHK_CICLO      = 'chk-ii-02';                            // Manuale II §02
const CHK_RAPINA     = 'chk-ii-b';                             // Manuale II allegato B

/* Permessi sugli obiettivi letti dall'applicazione, non dedotti dal markup. */
const objectivePerms = () => page.evaluate(() => {
  const running   = Operations.objectives.find(o => o.status === 'In corso');
  const completed = Operations.objectives.find(o => o.status === 'Completato');
  return {
    manage: App.canManageObjectives,
    complete: App.canCompleteObjective(),
    progressRunning: App.canUpdateObjectiveProgress(running),
    progressCompleted: App.canUpdateObjectiveProgress(completed),
    total: Operations.objectives.length
  };
});
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
v = await view();
t('ADMIN: la dashboard è la prima scheda dopo il login',
  (await tab()) === 'dashboard' && missingBlocks(v).length === 0,
  `scheda=${await tab()} · mancanti=[${missingBlocks(v)}]`);
t('ADMIN: dashboard con azioni rapide di scrittura',
  /Nuovo obiettivo/.test(v) && /Gestisci obiettivi/.test(v) && /Recluta Mock/.test(v),
  v.split('\n').filter(Boolean).slice(0, 3).join(' · '));

await setTab('objectives'); v = await view();
let perms = await objectivePerms();
t('ADMIN: obiettivi con creazione, modifica, progresso e archiviazione',
  perms.manage && perms.complete && perms.progressRunning
  && /Nuovo obiettivo/.test(v) && /Inserimento nuove reclute/.test(v) && /Progresso/.test(v),
  `manage=${perms.manage} complete=${perms.complete} progresso=${perms.progressRunning}`);
const adminCrud = await page.evaluate(() => {
  const before = Operations.objectives.length;
  Modals.editObjective(null);
  const formOpen = !!document.getElementById('o_title');
  document.getElementById('o_title').value = 'Obiettivo di prova';
  document.getElementById('o_target').value = '5';
  document.getElementById('o_unit').value = 'turni';
  document.getElementById('o_due').value = '2026-08-20';
  Actions.saveObjective('');
  const created = Operations.objectives[Operations.objectives.length - 1];
  Actions.completeObjective(created.id);
  const afterComplete = created.status;
  Actions.archiveObjective(created.id);
  return { formOpen, added: Operations.objectives.length - before, created: !!created,
    fields: Object.keys(created), target: created.target, unit: created.unit,
    afterComplete, afterArchive: created.status };
});
t('ADMIN: crea, completa e archivia un obiettivo',
  adminCrud.formOpen && adminCrud.added === 1
  && adminCrud.target === 5 && adminCrud.unit === 'turni'
  && adminCrud.afterComplete === 'Completato' && adminCrud.afterArchive === 'Archiviato',
  `aggiunti=${adminCrud.added} target=${adminCrud.target} ${adminCrud.unit} `
  + `completa=${adminCrud.afterComplete} archivia=${adminCrud.afterArchive}`);
const REQUIRED_FIELDS = ['id', 'title', 'description', 'category', 'period', 'responsible',
  'participants', 'target', 'unit', 'progress', 'priority', 'status', 'dueDate', 'notes',
  'evidence', 'missionIds', 'checklistIds', 'createdAt', 'updatedAt'];
const missingFields = REQUIRED_FIELDS.filter(f => !adminCrud.fields.includes(f));
t('obiettivo: struttura dati completa', missingFields.length === 0,
  missingFields.length ? `mancanti=[${missingFields}]` : `${REQUIRED_FIELDS.length} campi`);

/* 3a --------------------------------------------------- MANUALI REALI --- */
await setTab('manuals'); v = await view();
const man = await page.evaluate(() => ({
  count: Manuals.length,
  codes: Manuals.map(m => m.code),
  sections: Manuals.map(m => m.sections.length),
  nums: Object.fromEntries(Manuals.map(m => [m.code, m.sections.map(s => s.num)])),
  versions: [...new Set(Manuals.map(m => m.version))],
  docStates: [...new Set(Manuals.map(m => m.documentStatus))],
  blocks: Manuals.reduce((a, m) => a + m.sections.reduce((b, s) => b + s.blocks.length, 0), 0),
  emptySections: Manuals.flatMap(m => m.sections.filter(s => !s.blocks.length).map(s => m.code + '§' + s.num))
}));
t('Manuali: importati soltanto il I e il II, con avviso sulla collana incompleta',
  man.count === 2 && man.codes.join(',') === 'I,II' && man.versions.join() === '1.0'
  && /non sono ancora stati caricati/.test(v)
  && !man.codes.includes('III') && !man.codes.includes('IV'),
  `manuali=[${man.codes}] versioni=[${man.versions}]`);
t('Manuale I: 26 sezioni nell\'ordine del documento',
  man.sections[0] === 26
  && man.nums.I.join(' ') === '00 00-B 00-A 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 A B C D E R',
  man.nums.I.join(' '));
t('Manuale II: 30 sezioni nell\'ordine del documento',
  man.sections[1] === 30
  && man.nums.II.join(' ') === '00 00-B 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 A B C D E R',
  man.nums.II.join(' '));
t('Manuali: nessuna sezione vuota', man.emptySections.length === 0 && man.blocks > 180,
  `blocchi=${man.blocks} vuote=[${man.emptySections}]`);
t('Manuali: lo stato documentale del volume è conservato',
  man.docStates.length === 1 && man.docStates[0] === 'DA RATIFICARE', `stati=[${man.docStates}]`);

/* Il testo mostrato deve essere quello del documento, non una parafrasi. */
const CITAZIONI = [
  ['man-i', '01', 'L’organizzazione opera con la denominazione Famiglia Button all’interno di Gamma RP.'],
  ['man-i', '09', 'Ogni membro riceve esclusivamente gli accessi necessari per svolgere il proprio ruolo.'],
  ['man-ii', '05', 'Un’attività non registrata non può essere valutata correttamente'],
  ['man-ii', '08', 'Nel cambio ordinario il Cartello trattiene il 60% e la Famiglia riceve il 40%.']
];
const quotes = await page.evaluate(cits => cits.map(([mid, num, frase]) => {
  App.openManual(mid, num);
  return { mid, num, ok: document.querySelector('.manual-body').innerText.includes(frase) };
}), CITAZIONI);
t('Manuali: il testo reso è quello originale, verificato su quattro citazioni',
  quotes.every(q => q.ok), quotes.filter(q => !q.ok).map(q => q.mid + '§' + q.num).join(', ') || '4/4');

const nav = await page.evaluate(() => {
  App.openManual('man-i', '00');
  const idx = document.querySelectorAll('.manual-index button').length;
  App.setManualSection('12');
  const body = document.querySelector('.manual-body h2').innerText.replace(/\s+/g, ' ');
  const active = document.querySelector('.manual-index button.on').innerText.replace(/\s+/g, ' ');
  /* Gli stati documentali nelle tabelle devono restare visibili come tali. */
  App.setManualSection('03');
  const badges = [...document.querySelectorAll('.manual-body .op-tag')].map(e => e.textContent);
  App.closeManual();
  return { idx, active, heading: body.split('\n')[0], badges, backToList: !App.manualId };
});
t('Manuali: indice navigabile e sezione selezionata coerente',
  nav.idx === 26 && /12/.test(nav.active) && /CONDOTTA INTERNA/i.test(nav.active)
  && /12 CONDOTTA INTERNA E DISCIPLINA/i.test(nav.heading) && nav.backToList,
  `voci=${nav.idx} attiva="${nav.active}" titolo="${nav.heading}"`);
t('Manuali: gli stati documentali sono evidenziati nelle tabelle',
  ['APPROVATO', 'CONFIGURABILE', 'DA RATIFICARE'].every(s => nav.badges.includes(s)),
  `badge in I§03: [${[...new Set(nav.badges)]}]`);

/* 3c-bis ------------------------------ provenienza e rimozione dei mock -- */
const prov = await page.evaluate(() => {
  const regs = Operations.regulations, chks = Operations.checklists;
  const sourced = regs.filter(r => r.sourceManualId && r.sourceSection && r.sourceSectionTitle
    && r.documentStatus && Array.isArray(r.documentStates));
  const orphan = regs.filter(r => !Manuals.some(m => m.id === r.sourceManualId
    && m.sections.some(s => s.num === r.sourceSection)));
  const chkSourced = chks.filter(c => c.sourceManualId && c.sourceProcedure && c.responsibleRole);
  const chkOrphan = chks.filter(c => !Manuals.some(m => m.id === c.sourceManualId
    && m.sections.some(s => s.num === c.sourceSection)));
  return {
    regs: regs.length, sourced: sourced.length, orphan: orphan.map(r => r.id),
    chks: chks.length, chkSourced: chkSourced.length, chkOrphan: chkOrphan.map(c => c.id),
    mandatory: regs.filter(r => r.mandatory).length,
    restricted: chks.reduce((a, c) => a + c.items.filter(i => i.restricted).length, 0),
    items: chks.reduce((a, c) => a + c.items.length, 0),
    /* Gli identificativi sintetici della fase precedente non devono sopravvivere. */
    mockIds: regs.concat(chks).map(x => x.id).filter(id => /^(reg|chk)-\d+$/.test(id)),
    mockTitles: regs.concat(chks).map(x => x.title).filter(t =>
      ['Codice di condotta della Famiglia', 'Procedura di briefing operativo',
       'Sicurezza e accesso ai depositi', 'Rendicontazione cassa (versione superata)',
       'Schede prova da validare', 'Presenze briefing', 'Materiale briefing',
       'Controllo settimanale depositi'].includes(t)),
    dangling: Operations.objectives.flatMap(o => o.checklistIds)
      .filter(id => !chks.some(c => c.id === id))
  };
});
t('Regolamenti: tutti tratti da una sezione reale di un manuale',
  prov.regs === 31 && prov.sourced === prov.regs && prov.orphan.length === 0,
  `${prov.sourced}/${prov.regs} con fonte · obbligatori ${prov.mandatory} · orfani=[${prov.orphan}]`);
t('Checklist: tutte derivate da una procedura reale, con ruolo responsabile',
  prov.chks === 12 && prov.chkSourced === prov.chks && prov.chkOrphan.length === 0,
  `${prov.chkSourced}/${prov.chks} con procedura · ${prov.items} elementi · `
  + `${prov.restricted} riservati · orfane=[${prov.chkOrphan}]`);
t('Record mock sostituiti: nessun identificativo né titolo sintetico residuo',
  prov.mockIds.length === 0 && prov.mockTitles.length === 0 && prov.dangling.length === 0,
  `id=[${prov.mockIds}] titoli=[${prov.mockTitles}] collegamenti rotti=[${prov.dangling}]`);

const detail = await page.evaluate(() => {
  const r = Operations.regulations.find(x => x.sourceManualId === 'man-i' && x.sourceSection === '12');
  Modals.regulationDetail(r.id);
  const txt = document.getElementById('modalRoot').innerText;
  const html = document.getElementById('modalRoot').innerHTML;
  Modals.close();
  const sec = Manuals.find(m => m.id === 'man-i').sections.find(s => s.num === '12');
  const primaRiga = sec.blocks.find(b => b.t === 'table').rows[0].join(' ');
  return {
    manuale: /Manuale sorgente[\s\S]{0,40}Manuale I/.test(txt),
    sezione: txt.includes('12 — CONDOTTA INTERNA E DISCIPLINA'),
    statoDoc: txt.includes('DA RATIFICARE') && /ereditato dal controllo documento/.test(txt),
    destinatari: /Destinatari[\s\S]{0,60}Staff/.test(txt),
    obbligatorio: /Obbligatorio[\s\S]{0,10}Sì/.test(txt),
    /* L'intestazione è resa in maiuscolo dal CSS: il confronto la ignora. */
    testo: /testo originale applicabile/i.test(txt)
      && primaRiga.split(' ').every(w => txt.includes(w)),
    apriManuale: /Apri nel manuale/.test(html)
  };
});
t('Regolamento: indica manuale, sezione, stato documentale, destinatari, obbligatorietà e testo originale',
  Object.values(detail).every(Boolean),
  Object.entries(detail).filter(([, v]) => !v).map(([k]) => k).join(', ') || '7/7 campi presenti');

const jump = await page.evaluate(() => {
  const r = Operations.regulations.find(x => x.sourceManualId === 'man-ii' && x.sourceSection === '04');
  Modals.regulationDetail(r.id);
  App.openManual(r.sourceManualId, r.sourceSection);
  return { tab: App.tab, id: App.manualId, sec: App.manualSection,
    modalChiusa: document.getElementById('modalRoot').innerHTML === '',
    titolo: document.querySelector('.manual-body h2').innerText.replace(/\s+/g, ' ') };
});
t('Regolamento → manuale: si apre la sezione di origine',
  jump.tab === 'manuals' && jump.id === 'man-ii' && jump.sec === '04' && jump.modalChiusa
  && /COMUNICAZIONE OPERATIVA E RADIO/i.test(jump.titolo),
  `${jump.id} §${jump.sec} — "${jump.titolo}"`);

/* 3b -------------------------------------------- ADMIN: regolamenti ------ */
await setTab('regulations'); v = await view();
let ops = await opPerms();
t('ADMIN: regolamenti con creazione, modifica, pubblicazione e archiviazione',
  ops.createRegulation && ops.editDisciplinare && ops.editOperativo
  && ops.archive && ops.mandatory && ops.review
  && /Nuovo regolamento/.test(v) && v.includes(REG_DISCIPLINA),
  `crea=${ops.createRegulation} archivia=${ops.archive} obbligatorio=${ops.mandatory}`);
t('ADMIN: vede tutti i regolamenti, comprese bozze e archiviati',
  ops.readDraft && ops.readArchived && ops.visibleRegulations === ops.totalRegulations,
  `visibili=${ops.visibleRegulations}/${ops.totalRegulations} bozza=${ops.readDraft}`);
const adminReg = await page.evaluate(() => {
  const before = Operations.regulations.length;
  Modals.editRegulation(null);
  const formOpen = !!document.getElementById('g_title');
  document.getElementById('g_title').value = 'Regolamento di prova';
  document.getElementById('g_category').value = 'Sicurezza';
  document.getElementById('g_version').value = '3.0';
  document.getElementById('g_status').value = 'Bozza';
  document.getElementById('g_mandatory').value = 'no';
  Actions.saveRegulation('');
  const r = Operations.regulations[Operations.regulations.length - 1];
  Actions.publishRegulation(r.id);
  const afterPublish = { status: r.status, published: r.publishedAt };
  Actions.toggleRegulationMandatory(r.id);
  const afterMandatory = r.mandatory;
  Actions.archiveRegulation(r.id);
  return { formOpen, added: Operations.regulations.length - before, fields: Object.keys(r),
    category: r.category, version: r.version, afterPublish, afterMandatory, afterArchive: r.status };
});
t('ADMIN: crea, pubblica, rende obbligatorio e archivia un regolamento',
  adminReg.formOpen && adminReg.added === 1 && adminReg.category === 'Sicurezza'
  && adminReg.afterPublish.status === 'Pubblicato' && adminReg.afterPublish.published.length === 10
  && adminReg.afterMandatory === true && adminReg.afterArchive === 'Archiviato',
  `pubblica=${adminReg.afterPublish.status}/${adminReg.afterPublish.published} `
  + `obbligatorio=${adminReg.afterMandatory} archivia=${adminReg.afterArchive}`);
const REG_FIELDS = ['id', 'title', 'category', 'description', 'version', 'status', 'priority',
  'audience', 'author', 'publishedAt', 'updatedAt', 'mandatory', 'acknowledgements',
  'attachments', 'notes'];
const missingReg = REG_FIELDS.filter(f => !adminReg.fields.includes(f));
t('regolamento: struttura dati completa', missingReg.length === 0,
  missingReg.length ? `mancanti=[${missingReg}]` : `${REG_FIELDS.length} campi`);
const adminAck = await page.evaluate(() => {
  const r = Operations.regulations.find(x => x.title === 'Condotta interna e disciplina');
  const before = r.acknowledgements.length;
  Actions.acknowledgeRegulation(r.id);
  const mine = r.acknowledgements[r.acknowledgements.length - 1];
  const twice = (Actions.acknowledgeRegulation(r.id), r.acknowledgements.length);
  Modals.regulationAcks(r.id);
  const panel = document.getElementById('modalRoot').innerText;
  Modals.close();
  return { added: r.acknowledgements.length - before, twice: twice - before,
    hasWhen: !!(mine && mine.at), reviewPanel: /Conferme di lettura/.test(panel),
    listsAck: panel.includes(mine ? mine.by : ' ') };
});
t('ADMIN: conferma la lettura una sola volta e ne verifica il registro',
  adminAck.added === 1 && adminAck.twice === 1 && adminAck.hasWhen
  && adminAck.reviewPanel && adminAck.listsAck,
  `aggiunte=${adminAck.added} dopoDueClic=${adminAck.twice} registro=${adminAck.reviewPanel}`);

/* 3c ---------------------------------------------- ADMIN: checklist ------ */
await setTab('checklists'); v = await view();
ops = await opPerms();
t('ADMIN: checklist con creazione, completamento e archiviazione',
  ops.manageChecklists && ops.completeOpen && ops.itemFree && ops.itemRestricted
  && /Nuova checklist/.test(v) && /Checklist rapina strutturata/.test(v),
  `gestione=${ops.manageChecklists} completa=${ops.completeOpen} riservato=${ops.itemRestricted}`);
const adminChk = await page.evaluate(() => {
  const before = Operations.checklists.length;
  Modals.editChecklist(null);
  const formOpen = !!document.getElementById('c_title');
  document.getElementById('c_title').value = 'Checklist di prova';
  document.getElementById('c_due').value = '2026-08-15';
  Modals.addChecklistItem(); Modals._editItems[0].text = 'Primo elemento';
  Modals.addChecklistItem(); Modals._editItems[1].text = 'Secondo elemento';
  Modals._editItems[1].restricted = true;
  document.getElementById('c_objective').value = 'obj-2';
  Actions.saveChecklist('');
  const c = Operations.checklists[Operations.checklists.length - 1];
  const obj = Operations.objectives.find(o => o.id === 'obj-2');
  Actions.toggleChecklistItem(c.id, c.items[0].id);
  const afterToggle = { progress: c.progress, status: c.status, by: c.items[0].doneBy };
  Actions.completeChecklist(c.id);
  const afterComplete = { status: c.status, progress: c.progress, all: c.items.every(i => i.done) };
  Actions.archiveChecklist(c.id);
  return { formOpen, added: Operations.checklists.length - before, fields: Object.keys(c),
    items: c.items.length, linked: obj.checklistIds.includes(c.id),
    afterToggle, afterComplete, afterArchive: c.status };
});
t('ADMIN: crea una checklist con elementi e la collega a un obiettivo',
  adminChk.formOpen && adminChk.added === 1 && adminChk.items === 2 && adminChk.linked,
  `aggiunte=${adminChk.added} elementi=${adminChk.items} collegata=${adminChk.linked}`);
t('ADMIN: spunta, completa e archivia una checklist',
  adminChk.afterToggle.progress === 50 && adminChk.afterToggle.status === 'In corso'
  && adminChk.afterToggle.by.length > 0
  && adminChk.afterComplete.status === 'Completata' && adminChk.afterComplete.progress === 100
  && adminChk.afterComplete.all && adminChk.afterArchive === 'Archiviata',
  `spunta=${adminChk.afterToggle.progress}%/${adminChk.afterToggle.status} `
  + `completa=${adminChk.afterComplete.status} archivia=${adminChk.afterArchive}`);
const CHK_FIELDS = ['id', 'title', 'description', 'category', 'responsible', 'responsibleRole',
  'participants', 'items', 'progress', 'status', 'priority', 'dueDate', 'recurrence',
  'objectiveId', 'missionId', 'evidence', 'notes', 'createdAt', 'updatedAt'];
const missingChk = CHK_FIELDS.filter(f => !adminChk.fields.includes(f));
t('checklist: struttura dati completa', missingChk.length === 0,
  missingChk.length ? `mancanti=[${missingChk}]` : `${CHK_FIELDS.length} campi`);

/* 3d ----------------------------------- collegamento obiettivo ↔ checklist */
const linkage = await page.evaluate(() => {
  const o1 = Operations.objectives.find(o => o.id === 'obj-1');
  const missionsBefore = [...o1.missionIds], checksBefore = [...o1.checklistIds];
  /* Il salvataggio di un obiettivo non deve azzerare i collegamenti. */
  Modals.editObjective('obj-1');
  document.getElementById('o_title').value = o1.title;
  Actions.saveObjective('obj-1');
  const kept = { missions: JSON.stringify(o1.missionIds) === JSON.stringify(missionsBefore),
    checks: JSON.stringify(o1.checklistIds) === JSON.stringify(checksBefore) };
  /* Spostare una checklist da un obiettivo all'altro aggiorna entrambi. */
  const c = Operations.checklists.find(x => x.id === 'chk-i-08');
  Modals.editChecklist('chk-i-08');
  document.getElementById('c_objective').value = 'obj-3';
  Actions.saveChecklist('chk-i-08');
  const o3 = Operations.objectives.find(o => o.id === 'obj-3');
  const moved = { fromOld: !o1.checklistIds.includes('chk-i-08'), toNew: o3.checklistIds.includes('chk-i-08'),
    onChecklist: c.objectiveId === 'obj-3', o3Kept: o3.checklistIds.includes('chk-ii-18') };
  /* Ripristino, così i controlli successivi partono dallo stato atteso. */
  Modals.editChecklist('chk-i-08');
  document.getElementById('c_objective').value = 'obj-1';
  Actions.saveChecklist('chk-i-08');
  const restored = o1.checklistIds.includes('chk-i-08') && !o3.checklistIds.includes('chk-i-08');
  const view = objectiveChecklists(o1);
  return { kept, moved, restored, linkedToObj1: view.length,
    completedOfObj1: view.filter(x => x.status === 'Completata').length };
});
t('obiettivo: missionIds e checklistIds sopravvivono a un salvataggio',
  linkage.kept.missions && linkage.kept.checks,
  `missioni=${linkage.kept.missions} checklist=${linkage.kept.checks}`);
t('checklist: il cambio di obiettivo aggiorna entrambe le direzioni',
  linkage.moved.fromOld && linkage.moved.toNew && linkage.moved.onChecklist
  && linkage.moved.o3Kept && linkage.restored,
  `staccata=${linkage.moved.fromOld} agganciata=${linkage.moved.toNew} `
  + `altriIntatti=${linkage.moved.o3Kept} ripristino=${linkage.restored}`);
t('obiettivo: il dettaglio conta le checklist collegate e completate',
  linkage.linkedToObj1 === 1 && await page.evaluate(() => {
    Modals.objectiveDetail('obj-1');
    const txt = document.getElementById('modalRoot').innerText;
    Modals.close();
    return /Checklist collegate/.test(txt) && /1 collegate/.test(txt) && /completate/.test(txt);
  }), `collegate=${linkage.linkedToObj1} completate=${linkage.completedOfObj1}`);

await setTab('settings'); v = await view();
t('ADMIN: gestione utenti in migrazione, senza dati né azioni',
  /Gestione utenti in migrazione a Supabase Auth/.test(v) && !/bfos_users|Table Editor/i.test(v),
  v.split('\n').filter(Boolean).slice(0, 2).join(' · '));

/* 4 --------------------------------------------------------- DIREZIONE --- */
await go('direzione'); await login(); s = await snap();
t('DIREZIONE: ruolo, badge e permessi',
  s.ready && s.role === 'DIREZIONE' && s.canWrite && !s.isAdmin && s.badge === 'Direzione' && !s.viewer,
  `badge=${s.badge} canWrite=${s.canWrite} isAdmin=${s.isAdmin}`);
v = await view();
t('DIREZIONE: dashboard completa e operativa',
  (await tab()) === 'dashboard' && missingBlocks(v).length === 0 && /Nuovo obiettivo/.test(v),
  `mancanti=[${missingBlocks(v)}]`);
await setTab('objectives'); v = await view();
perms = await objectivePerms();
t('DIREZIONE: obiettivi con creazione, progresso e completamento',
  perms.manage && perms.complete && perms.progressRunning && /Nuovo obiettivo/.test(v),
  `manage=${perms.manage} complete=${perms.complete}`);
const dirComplete = await page.evaluate(() => {
  const o = Operations.objectives.find(x => x.status === 'In corso');
  o.updatedAt = '';                      // sentinella: il salvataggio deve riscriverlo
  Actions.completeObjective(o.id);
  return { status: o.status, progress: o.progress, touched: o.updatedAt.length > 0 };
});
t('DIREZIONE: può dichiarare completato un obiettivo',
  dirComplete.status === 'Completato' && dirComplete.progress === 100 && dirComplete.touched,
  `stato=${dirComplete.status} progresso=${dirComplete.progress} updatedAt=${dirComplete.touched}`);

/* 4b ---------------------------------------- DIREZIONE: regolamenti ------ */
await setTab('regulations'); v = await view();
ops = await opPerms();
t('DIREZIONE: redige e pubblica solo i regolamenti operativi',
  ops.createRegulation && ops.editOperativo && ops.publishOperativo
  && !ops.editDisciplinare && /Nuovo regolamento/.test(v),
  `operativo=${ops.editOperativo} disciplinare=${ops.editDisciplinare} pubblica=${ops.publishOperativo}`);
t('DIREZIONE: non archivia e non rende obbligatorio, ma verifica le conferme',
  !ops.archive && !ops.mandatory && ops.review,
  `archivia=${ops.archive} obbligatorio=${ops.mandatory} verifica=${ops.review}`);
const dirReg = await page.evaluate(() => {
  /* Il modulo espone solo l'operativo, ma il salvataggio non deve dipendere
     dal modulo: forziamo i campi come farebbe una manomissione. */
  const oper = Operations.regulations.find(r => r.category === 'Operativo' && r.mandatory);
  const wasMandatory = oper.mandatory;
  Modals.editRegulation(oper.id);
  const formOpen = !!document.getElementById('g_title');
  const catOptions = [...document.getElementById('g_category').options].map(o => o.value);
  const stateOptions = [...document.getElementById('g_status').options].map(o => o.value);
  const mandatoryLocked = document.getElementById('g_mandatory').disabled;
  document.getElementById('g_mandatory').disabled = false;
  document.getElementById('g_mandatory').value = wasMandatory ? 'no' : 'si';
  document.getElementById('g_category').innerHTML = '<option>Disciplinare</option>';
  Actions.saveRegulation(oper.id);
  /* Un regolamento non operativo resta fuori portata anche invocando l'azione. */
  const other = Operations.regulations.find(r => r.category === 'Disciplinare' && r.mandatory);
  const otherStatus = other.status;
  Modals.editRegulation(other.id);
  const otherFormOpen = !!document.getElementById('g_title');
  Actions.archiveRegulation(other.id);
  Actions.toggleRegulationMandatory(other.id);
  return { formOpen, catOptions, stateOptions, mandatoryLocked,
    categoryKept: oper.category === 'Operativo', mandatoryKept: oper.mandatory === wasMandatory,
    otherFormOpen, otherUntouched: other.status === otherStatus && other.mandatory === true };
});
t('DIREZIONE: il modulo espone solo ciò che il ruolo può decidere',
  dirReg.formOpen && dirReg.catOptions.join() === 'Operativo'
  && !dirReg.stateOptions.includes('Archiviato') && dirReg.mandatoryLocked,
  `categorie=[${dirReg.catOptions}] stati=[${dirReg.stateOptions}] obbligatorio bloccato=${dirReg.mandatoryLocked}`);
t('DIREZIONE: categoria e obbligatorietà non cambiano nemmeno forzando il modulo',
  dirReg.categoryKept && dirReg.mandatoryKept,
  `categoria=${dirReg.categoryKept} obbligatorio=${dirReg.mandatoryKept}`);
t('DIREZIONE: nessuna azione su un regolamento non operativo',
  !dirReg.otherFormOpen && dirReg.otherUntouched,
  `form=${dirReg.otherFormOpen} intatto=${dirReg.otherUntouched}`);

/* 4c ------------------------------------------ DIREZIONE: checklist ------ */
await setTab('checklists'); v = await view();
ops = await opPerms();
t('DIREZIONE: checklist con creazione, assegnazione e completamento',
  ops.manageChecklists && ops.completeOpen && ops.itemRestricted
  && /Nuova checklist/.test(v), `gestione=${ops.manageChecklists} riservato=${ops.itemRestricted}`);
t('checklist chiusa: nessun elemento resta spuntabile', !ops.itemOnClosed,
  `elementoSuChiusa=${ops.itemOnClosed}`);

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
v = await view();
t('STAFF: dashboard in lettura, senza azioni di creazione',
  (await tab()) === 'dashboard' && missingBlocks(v).length === 0
  && !/Nuovo obiettivo/.test(v) && /Apri obiettivi/.test(v),
  `mancanti=[${missingBlocks(v)}] creazione=${/Nuovo obiettivo/.test(v)}`);

await setTab('objectives'); v = await view();
perms = await objectivePerms();
t('STAFF: legge gli obiettivi senza crearli né modificarli',
  /Inserimento nuove reclute/.test(v) && !/Nuovo obiettivo/.test(v)
  && !perms.manage && !perms.complete,
  `legge=${/Inserimento nuove reclute/.test(v)} manage=${perms.manage} complete=${perms.complete}`);
t('STAFF: progresso consentito solo sugli obiettivi in corso',
  perms.progressRunning && !perms.progressCompleted,
  `inCorso=${perms.progressRunning} completato=${perms.progressCompleted}`);

const staffWrites = await page.evaluate(() => {
  const before = Operations.objectives.length;
  /* Creazione e archiviazione: devono essere inerti anche se invocate a mano. */
  Modals.editObjective(null);
  const formOpen = !!document.getElementById('o_title');
  Actions.saveObjective('');
  const running = Operations.objectives.find(o => o.status === 'In corso');
  Actions.archiveObjective(running.id);
  const statusAfterArchive = running.status;

  /* Progresso: consentito, ma il 100% non deve chiudere l'obiettivo. */
  Modals.updateObjectiveProgress(running.id);
  const progressOpen = !!document.getElementById('o_progress');
  document.getElementById('o_progress').value = '100';
  Actions.saveObjectiveProgress(running.id);

  /* Un obiettivo già completato resta fuori portata. */
  const completed = Operations.objectives.find(o => o.status === 'Completato');
  const completedBefore = completed.progress;
  Actions.saveObjectiveProgress(completed.id);

  return { added: Operations.objectives.length - before, formOpen, statusAfterArchive,
    progressOpen, progress: running.progress, status: running.status,
    completedUnchanged: completed.progress === completedBefore };
});
t('STAFF: nessuna creazione, nessuna archiviazione',
  staffWrites.added === 0 && !staffWrites.formOpen && staffWrites.statusAfterArchive === 'In corso',
  `aggiunti=${staffWrites.added} form=${staffWrites.formOpen} stato=${staffWrites.statusAfterArchive}`);
t('STAFF: aggiorna solo il progresso, senza completare',
  staffWrites.progressOpen && staffWrites.progress === 100
  && staffWrites.status === 'In corso' && staffWrites.completedUnchanged,
  `progresso=${staffWrites.progress} stato=${staffWrites.status} `
  + `completatoIntatto=${staffWrites.completedUnchanged}`);

/* 5b ------------------------------------------- STAFF: regolamenti ------- */
await setTab('regulations'); v = await view();
ops = await opPerms();
t('STAFF: legge solo i regolamenti pubblicati che lo riguardano',
  ops.readOperativo && !ops.readDraft && !ops.readArchived && !ops.readDirOnly
  && ops.visibleRegulations > 0 && ops.visibleRegulations < ops.totalRegulations
  && v.includes(REG_DISCIPLINA) && !v.includes(REG_CARTELLO),
  `visibili=${ops.visibleRegulations}/${ops.totalRegulations} bozza=${ops.readDraft} `
  + `archiviato=${ops.readArchived} soloDirezione=${ops.readDirOnly}`);
t('STAFF: nessuna creazione, modifica, pubblicazione o archiviazione',
  !ops.createRegulation && !ops.editOperativo && !ops.publishOperativo
  && !ops.archive && !ops.mandatory && !ops.review
  && !/Nuovo regolamento/.test(v),
  `crea=${ops.createRegulation} modifica=${ops.editOperativo} verifica=${ops.review}`);
const staffReg = await page.evaluate(() => {
  const before = Operations.regulations.length;
  const oper = Operations.regulations.find(r => r.title === 'Comunicazione operativa e radio');
  const snapshot = JSON.stringify(oper);
  /* Le azioni di scrittura devono essere inerti anche invocate a mano. */
  Modals.editRegulation(null);
  const createForm = !!document.getElementById('g_title');
  Modals.editRegulation(oper.id);
  const editForm = !!document.getElementById('g_title');
  Actions.saveRegulation(oper.id);
  Actions.publishRegulation(oper.id);
  Actions.archiveRegulation(oper.id);
  Actions.toggleRegulationMandatory(oper.id);
  Modals.regulationAcks(oper.id);
  const acksPanel = document.getElementById('modalRoot').innerHTML.length;
  Modals.close();
  /* La conferma di lettura, invece, è proprio ciò che lo STAFF deve poter fare. */
  const acksBefore = oper.acknowledgements.length;
  const canAck = App.canAcknowledgeRegulation(oper);
  Actions.acknowledgeRegulation(oper.id);
  const entry = oper.acknowledgements[oper.acknowledgements.length - 1];
  const stillAck = App.canAcknowledgeRegulation(oper);
  return { added: Operations.regulations.length - before, createForm, editForm,
    unchanged: JSON.stringify({ ...oper, acknowledgements: [] })
      === JSON.stringify({ ...JSON.parse(snapshot), acknowledgements: [] }),
    acksPanel, canAck, ackAdded: oper.acknowledgements.length - acksBefore,
    ackHasWhen: !!(entry && entry.at), stillAck };
});
t('STAFF: le scritture sui regolamenti sono inerti anche se forzate',
  staffReg.added === 0 && !staffReg.createForm && !staffReg.editForm
  && staffReg.unchanged && staffReg.acksPanel === 0,
  `aggiunti=${staffReg.added} form=${staffReg.createForm}/${staffReg.editForm} `
  + `intatto=${staffReg.unchanged} registro=${staffReg.acksPanel}`);
t('STAFF: conferma la lettura, una volta sola e con data',
  staffReg.canAck && staffReg.ackAdded === 1 && staffReg.ackHasWhen && !staffReg.stillAck,
  `conferme=${staffReg.ackAdded} data=${staffReg.ackHasWhen} ripetibile=${staffReg.stillAck}`);
v = await view();
/* Le etichette sono rese in maiuscolo dal CSS: innerText restituisce il testo
   come viene disegnato, quindi il confronto ignora le maiuscole. */
t('STAFF: la conferma si riflette nella vista e nella dashboard',
  /lettura confermata/i.test(v) && await page.evaluate(() => {
    App.setTab('dashboard');
    /* Il riquadro dei non letti, non l'intera pagina: il titolo compare anche
       nel registro delle attività recenti, ed è corretto che lo faccia. */
    const panel = [...document.querySelectorAll('#view .panel')]
      .find(p => /Regolamenti obbligatori da leggere/i.test(p.querySelector('.panel-head').innerText));
    if (!panel) return false;
    const count = Number(panel.querySelector('.count').textContent);
    /* Confermata la lettura, quel regolamento non è più fra i non letti. */
    return count === Operations.regulations.filter(r => r.mandatory && App.canAcknowledgeRegulation(r)).length
      && !Operations.regulations.some(r => r.title === 'Comunicazione operativa e radio'
           && App.canAcknowledgeRegulation(r));
  }), `etichetta=${/lettura confermata/i.test(v)}`);

/* 5c --------------------------------------------- STAFF: checklist ------- */
await setTab('checklists'); v = await view();
ops = await opPerms();
t('STAFF: legge le checklist senza crearle né gestirle',
  !ops.manageChecklists && !ops.completeOpen && !/Nuova checklist/.test(v)
  && /Checklist rapina strutturata/.test(v),
  `gestione=${ops.manageChecklists} completa=${ops.completeOpen}`);
t('STAFF: spunta solo gli elementi consentiti',
  ops.itemFree && !ops.itemRestricted && !ops.itemOnClosed,
  `libero=${ops.itemFree} riservato=${ops.itemRestricted} suChiusa=${ops.itemOnClosed}`);
const staffChk = await page.evaluate(() => {
  const c = Operations.checklists.find(x => x.id === 'chk-i-08');
  const before = Operations.checklists.length;
  const struct = JSON.stringify({ r: c.responsible, d: c.dueDate, n: c.items.length, t: c.title });
  /* Creazione e modifica: inerti. */
  Modals.editChecklist(null);
  const createForm = !!document.getElementById('c_title');
  Modals.editChecklist(c.id);
  const editForm = !!document.getElementById('c_title');
  Actions.saveChecklist(c.id);
  Actions.archiveChecklist(c.id);
  Actions.completeChecklist(c.id);
  const statusAfter = c.status;
  /* L'elemento consentito si spunta; quello riservato no. */
  const free = c.items.find(i => !i.restricted);
  const locked = c.items.find(i => i.restricted);
  Actions.toggleChecklistItem(c.id, free.id);
  Actions.toggleChecklistItem(c.id, locked.id);
  return { added: Operations.checklists.length - before, createForm, editForm, statusAfter,
    structUntouched: struct === JSON.stringify({ r: c.responsible, d: c.dueDate, n: c.items.length, t: c.title }),
    freeDone: free.done, freeBy: free.doneBy, lockedDone: locked.done,
    progress: c.progress, expected: Math.round(1 / c.items.length * 100),
    items: c.items.length, title: c.title, status: c.status };
});
t('STAFF: nessuna creazione, modifica di struttura, completamento o archiviazione',
  staffChk.added === 0 && !staffChk.createForm && !staffChk.editForm
  && staffChk.structUntouched && staffChk.statusAfter === 'Aperta',
  `aggiunte=${staffChk.added} form=${staffChk.createForm}/${staffChk.editForm} `
  + `struttura=${staffChk.structUntouched} stato=${staffChk.statusAfter}`);
t('STAFF: completa gli elementi consentiti e non quelli riservati',
  staffChk.freeDone && !staffChk.lockedDone && staffChk.freeBy.length > 0
  && staffChk.progress === staffChk.expected && staffChk.status === 'In corso',
  `libero=${staffChk.freeDone} riservato=${staffChk.lockedDone} `
  + `progresso=${staffChk.progress}% (atteso ${staffChk.expected}%) stato=${staffChk.status}`);
await setTab('dashboard'); v = await view();
t('STAFF: la dashboard riflette la checklist appena avanzata',
  await page.evaluate(id => {
    const c = Operations.checklists.find(x => x.id === id);
    const panel = [...document.querySelectorAll('#view .panel')]
      .find(p => /Checklist aperte/i.test(p.querySelector('.panel-head').innerText));
    return !!panel && panel.innerText.includes(c.title)
      && panel.innerText.includes(`1/${c.items.length} elementi`);
  }, CHK_INGRESSO),
  `${staffChk.title}: 1/${staffChk.items} elementi`);

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
t('NO_ACCESS: né dashboard né obiettivi, nemmeno forzando la scheda',
  !/Dashboard operativa|Inserimento nuove reclute|Membri in prova/.test(s.text)
  && (await page.evaluate(() => {
        App.setTab('objectives');   // forzatura: la vista non deve comparire
        return !document.getElementById('app').classList.contains('ready')
          && !/Inserimento nuove reclute/.test(document.body.innerText);
      })),
  `schermataInvariata=${/ACCESSO NON AUTORIZZATO/.test(s.text)}`);
t('NO_ACCESS: né manuali, né regolamenti, né checklist, nemmeno forzando la scheda',
  !new RegExp(`${REG_DISCIPLINA}|Checklist rapina|Statuto, Struttura`).test(s.text)
  && (await page.evaluate(() => {
        App.setTab('manuals'); App.setTab('regulations'); App.setTab('checklists');
        App.openManual('man-i', '12');
        const perms = { read: Operations.regulations.some(r => App.canReadRegulation(r)),
          manage: App.canManageChecklists, edit: App.canEditRegulation(null),
          ack: Operations.regulations.some(r => App.canAcknowledgeRegulation(r)),
          item: App.canCompleteChecklistItem(Operations.checklists[0], Operations.checklists[0].items[0]) };
        return !document.getElementById('app').classList.contains('ready')
          && !/Condotta interna|Checklist rapina|Denominazione e identità/.test(document.body.innerText)
          && !perms.read && !perms.manage && !perms.edit && !perms.ack && !perms.item;
      })),
  `datiEsposti=${new RegExp(REG_DISCIPLINA).test(s.text)}`);
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

/* ------------------------------------------- sezioni preesistenti ------- */
await go('admin'); await login();
const OLD_TABS = ['members', 'activity', 'inventory', 'cash', 'intel', 'roles', 'io', 'settings'];
const reachable = [];
for (const name of OLD_TABS) {
  await setTab(name);
  const body = await view();
  reachable.push({ name, ok: (await tab()) === name && body.trim().length > 0 });
}
t('le sezioni preesistenti restano raggiungibili e non vuote',
  reachable.every(r => r.ok), reachable.filter(r => !r.ok).map(r => r.name).join(', ') || OLD_TABS.join(', '));
await setTab('dashboard');
t('si torna alla dashboard dopo aver visitato le altre sezioni',
  (await tab()) === 'dashboard' && missingBlocks(await view()).length === 0);

/* --------------------------------------------------------------- mobile --- */
await page.setViewportSize({ width: 390, height: 844 });
await go('direzione'); await login();
/* La dashboard e gli obiettivi vanno verificati sulla larghezza reale del
   telefono: nessuna delle due deve produrre scorrimento orizzontale. */
for (const name of ['dashboard', 'objectives', 'checklists', 'regulations', 'manuals']) {
  await setTab(name);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const body = await view();
  t(`mobile 390px: ${name} leggibile senza scorrimento orizzontale`,
    !overflow && body.trim().length > 0, `overflowX=${overflow}`);
}
/* Il passaggio tabella → schede riguarda le sezioni preesistenti. */
await setTab('members'); s = await snap();
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
