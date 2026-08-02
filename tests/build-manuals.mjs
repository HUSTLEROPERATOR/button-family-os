/* Genera content/manuali.js dai DOCX ufficiali della collana.
 *
 *   node tests/build-manuals.mjs "<cartella 01_Famiglia_Button_Gamma_RP>" content/manuali.js
 *
 * Nessun contenuto viene riscritto o riassunto: i blocchi prodotti contengono
 * le stesse stringhe presenti nel documento di origine. Il PDF non viene letto:
 * serve solo alla verifica manuale di titoli, ordine e struttura.
 *
 * Sono importati soltanto i Manuali I e II. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { inflateRawSync } from 'node:zlib';

/* Legge word/document.xml da un DOCX senza dipendenze esterne: scorre le
   intestazioni locali dell'archivio ZIP e decomprime la voce richiesta. */
function docxDocument(file) {
  const buf = readFileSync(file);
  for (let i = 0; i + 30 < buf.length; i++) {
    if (buf.readUInt32LE(i) !== 0x04034b50) continue;
    const method = buf.readUInt16LE(i + 8);
    const compSize = buf.readUInt32LE(i + 18);
    const nameLen = buf.readUInt16LE(i + 26);
    const extraLen = buf.readUInt16LE(i + 28);
    const name = buf.toString('utf8', i + 30, i + 30 + nameLen);
    if (name !== 'word/document.xml') continue;
    const start = i + 30 + nameLen + extraLen;
    if (!compSize) throw new Error(`${file}: dimensione non nell'intestazione locale`);
    const data = buf.subarray(start, start + compSize);
    return (method === 8 ? inflateRawSync(data) : data).toString('utf8');
  }
  throw new Error(`${file}: word/document.xml non trovato`);
}

/* word/document.xml -> righe di testo. Conserva paragrafi, elenchi e tabelle;
   le tabelle diventano righe "| cella | cella |" delimitate da [TABELLA]. */
function docxToLines(xml) {
  const unescape = s => s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&amp;/g, '&');
  const paraText = p => {
    let out = '';
    for (const m of p.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br\/>/g)) {
      if (m[1] !== undefined) out += unescape(m[1]);
      else out += m[0] === '<w:tab/>' ? '\t' : '\n';
    }
    return out;
  };
  const body = (xml.match(/<w:body>([\s\S]*)<\/w:body>/) || [, xml])[1];
  const lines = [];
  for (const m of body.matchAll(/<w:tbl>[\s\S]*?<\/w:tbl>|<w:p\b[^>]*\/>|<w:p\b[^>]*>[\s\S]*?<\/w:p>/g)) {
    const chunk = m[0];
    if (chunk.startsWith('<w:tbl>')) {
      lines.push('[TABELLA]');
      for (const row of chunk.matchAll(/<w:tr\b[^>]*>([\s\S]*?)<\/w:tr>/g)) {
        const cells = [...row[1].matchAll(/<w:tc>([\s\S]*?)<\/w:tc>/g)].map(c =>
          [...c[1].matchAll(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g)]
            .map(x => paraText(x[0]).trim()).filter(Boolean).join(' / '));
        lines.push('| ' + cells.join(' | ') + ' |');
      }
      lines.push('[/TABELLA]');
      continue;
    }
    lines.push(paraText(chunk).trim());
  }
  return lines;
}

const STATES = ['APPROVATO', 'DA RATIFICARE', 'CONFIGURABILE', 'SPERIMENTALE',
  'VERIFICA STAFF', 'TEMPORANEO', 'RISERVATO', 'OPERATIVO'];
const BANNER = /^(\d{2}(?:-[AB])?|[A-ER])$/;

function parseManual(docxPath) {
  const lines = docxToLines(docxDocument(docxPath));
  const sections = [];
  let cur = null;
  const push = b => { if (cur) cur.blocks.push(b); };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    /* ---- tabella ---- */
    if (line === '[TABELLA]') {
      const rows = [];
      while (++i < lines.length && lines[i] !== '[/TABELLA]') {
        const cells = lines[i].replace(/^\|\s?/, '').replace(/\s?\|$/, '').split(' | ');
        rows.push(cells.map(c => c.trim()));
      }
      /* L'indice generale è ricostruito dall'applicazione dalle sezioni reali:
         la sua tabella nel documento non viene importata come contenuto. */
      if (rows.length === 1 && rows[0][0] === 'INDICE') { i++; continue; }

      /* banner di sezione: due celle, la prima è l'identificativo */
      if (rows.length === 1 && rows[0].length === 2 && BANNER.test(rows[0][0])) {
        const [title, ...rest] = rows[0][1].split(' / ');
        cur = { num: rows[0][0], title: title.trim(), subtitle: rest.join(' / ').trim(), blocks: [] };
        sections.push(cur);
        continue;
      }
      /* riquadro di principio: una cella, etichetta in maiuscolo + testo */
      if (rows.length === 1 && rows[0].length === 1) {
        const idx = rows[0][0].indexOf(' / ');
        if (idx > 0) {
          push({ t: 'note', label: rows[0][0].slice(0, idx).trim(), v: rows[0][0].slice(idx + 3).trim() });
        } else push({ t: 'p', v: rows[0][0] });
        continue;
      }
      /* riga unica a più colonne di elenchi: "Titolo / • voce / • voce" */
      if (rows.length === 1 && rows[0].every(c => c.includes(' / '))) {
        push({ t: 'cols', cols: rows[0].map(c => {
          const parts = c.split(' / ').map(x => x.trim());
          return { title: parts[0], items: parts.slice(1).map(x => x.replace(/^•\s*/, '')) };
        }) });
        continue;
      }
      /* tabella vera e propria: la prima riga è intestazione se tutta maiuscola */
      const head = rows[0];
      const isHead = head.length > 1 && head.every(c => c && c === c.toUpperCase());
      const body = (isHead ? rows.slice(1) : rows).filter(r => r.some(c => c));
      if (!body.length && !isHead) continue;
      push({ t: 'table', head: isHead ? head : null, rows: body });
      continue;
    }

    const txt = line.trim();
    if (!txt) continue;
    if (!cur) continue;                      // testo prima del primo banner: assente per costruzione

    /* ---- sotto-titolo numerato: "1.1" seguito dal titolo ---- */
    if (/^[A-Z]?\d*\.\d+$/.test(txt) && lines[i + 1] && lines[i + 1].trim() && !lines[i + 1].startsWith('[')) {
      push({ t: 'h', n: txt, v: lines[++i].trim() });
      continue;
    }

    /* ---- elenco puntato ---- */
    if (txt.startsWith('• ')) {
      const items = [];
      while (i < lines.length && lines[i].trim().startsWith('• ')) items.push(lines[i++].trim().slice(2));
      i--;
      push({ t: 'ul', v: items });
      continue;
    }

    /* ---- elenco numerato ---- */
    if (/^\d+\.\s/.test(txt)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) items.push(lines[i++].trim().replace(/^\d+\.\s+/, ''));
      i--;
      push({ t: 'ol', v: items });
      continue;
    }

    push({ t: 'p', v: txt });
  }

  /* Stati documentali citati nella sezione: si conservano così come scritti.
     SPERIMENTALE viene riconosciuto anche in forma non maiuscola, perché nei
     manuali compare sia come stato sia come "natura" di un volume. */
  for (const s of sections) {
    const flat = JSON.stringify(s.blocks);
    s.states = STATES.filter(st => new RegExp(`(^|[^A-Z])${st}([^A-Z]|$)`).test(flat));
    if (!s.states.includes('SPERIMENTALE') && /\bsperimentale\b/i.test(flat)) s.states.push('SPERIMENTALE');
  }
  return sections;
}

const SRC = process.argv[2];
const OUT = process.argv[3];

const manuals = [
  {
    id: 'man-i', code: 'I',
    title: 'Statuto, Struttura e Governance',
    org: 'Famiglia Button', server: 'Gamma RP', version: '1.0',
    documentStatus: 'DA RATIFICARE',
    nature: 'Stabile',
    effective: 'Dopo approvazione della Direzione',
    revision: 'Prima revisione dopo 30 giorni dal wipe; successivamente ogni 90 giorni o quando necessario.',
    sourceFile: 'Manuale_I_Famiglia_Button_Gamma_RP_v1_0.docx',
    pages: 33,
    sections: parseManual(join(SRC, 'Manuale_I', 'Manuale_I_Famiglia_Button_Gamma_RP_v1_0.docx'))
  },
  {
    id: 'man-ii', code: 'II',
    title: 'Procedure Operative e Risorse',
    org: 'Famiglia Button', server: 'Gamma RP', version: '1.0',
    documentStatus: 'DA RATIFICARE',
    nature: 'Operativo',
    effective: 'Dopo approvazione della Direzione',
    revision: 'Dopo ogni wipe, modifica del server o variazione degli accordi',
    sourceFile: 'Manuale_II_Famiglia_Button_Gamma_RP_v1_0.docx',
    pages: 32,
    sections: parseManual(join(SRC, 'Manuale_II', 'Manuale_II_Famiglia_Button_Gamma_RP_v1_0.docx'))
  }
];

/* =======================================================================
   REGOLAMENTI DERIVATI
   Ogni regolamento corrisponde a una sezione reale di un manuale. Il testo
   applicabile non viene copiato qui: si rinvia alla sezione di origine, così
   ciò che l'utente legge è sempre il testo originale.
   La scelta di quali sezioni siano regolamenti, la categoria e i destinatari
   sono decisioni di configurazione; titoli, numeri e stati vengono dal
   documento.
   ===================================================================== */
const ALL = ['ADMIN', 'DIREZIONE', 'STAFF'];
const DIR = ['ADMIN', 'DIREZIONE'];

const REG_SPEC = [
  ['man-i', '02', 'Operativo',      ALL, true],
  ['man-i', '05', 'Amministrativo', ALL, true],
  ['man-i', '06', 'Operativo',      ALL, true],
  ['man-i', '08', 'Amministrativo', ALL, true],
  ['man-i', '09', 'Sicurezza',      ALL, true],
  ['man-i', '10', 'Operativo',      ALL, true],
  ['man-i', '11', 'Operativo',      ALL, true],
  ['man-i', '12', 'Disciplinare',   ALL, true],
  ['man-i', '13', 'Disciplinare',   ALL, true],
  ['man-i', '14', 'Sicurezza',      ALL, true],
  ['man-i', '15', 'Operativo',      ALL, false],
  ['man-i', '16', 'Amministrativo', DIR, false],
  ['man-i', '17', 'Amministrativo', DIR, false],
  ['man-ii', '01', 'Operativo',      ALL, true],
  ['man-ii', '03', 'Operativo',      ALL, false],
  ['man-ii', '04', 'Operativo',      ALL, true],
  ['man-ii', '05', 'Operativo',      ALL, true],
  ['man-ii', '06', 'Sicurezza',      ALL, true],
  ['man-ii', '07', 'Amministrativo', DIR, false],
  ['man-ii', '08', 'Amministrativo', DIR, true],
  ['man-ii', '09', 'Amministrativo', DIR, false],
  ['man-ii', '10', 'Amministrativo', ALL, true],
  ['man-ii', '11', 'Amministrativo', DIR, false],
  ['man-ii', '14', 'Operativo',      ALL, true],
  ['man-ii', '15', 'Operativo',      ALL, true],
  ['man-ii', '16', 'Operativo',      ALL, false],
  ['man-ii', '17', 'Operativo',      ALL, false],
  ['man-ii', '18', 'Operativo',      ALL, true],
  ['man-ii', '19', 'Operativo',      ALL, false],
  ['man-ii', '20', 'Disciplinare',   ALL, true],
  ['man-ii', '21', 'Disciplinare',   ALL, true]
];

/* Titolo leggibile: il manuale scrive i titoli dei banner in maiuscolo. Le
   parole che il manuale capitalizza anche nel testo corrente restano tali. */
const KEEP_CAPS = { famiglia: 'Famiglia', cartello: 'Cartello', rp: 'RP', direzione: 'Direzione' };
const titleCase = s => (s.charAt(0) + s.slice(1).toLowerCase())
  .replace(/\b[a-zà-ù]+\b/g, w => KEEP_CAPS[w] || w);

const byId = id => manuals.find(m => m.id === id);
const sectionOf = (mid, num) => byId(mid).sections.find(s => s.num === num);

const regulations = REG_SPEC.map(([mid, num, category, audience, mandatory]) => {
  const m = byId(mid), s = sectionOf(mid, num);
  if (!s) throw new Error(`sezione assente: ${mid} §${num}`);
  return {
    id: `reg-${mid.replace('man-', '')}-${num.toLowerCase()}`,
    title: titleCase(s.title),
    category,
    description: s.subtitle,
    version: m.version,
    /* Stato nell'applicazione: pubblicato ai destinatari perché sia leggibile
       e confermabile. Lo stato documentale resta separato. */
    status: 'Pubblicato',
    priority: mandatory ? 'Alta' : 'Media',
    audience,
    author: '',
    publishedAt: '',
    updatedAt: '',
    mandatory,
    acknowledgements: [],
    attachments: [`${m.sourceFile} — sezione ${num}`],
    notes: '',
    /* --- provenienza --- */
    sourceManualId: m.id,
    sourceManual: `Manuale ${m.code}`,
    sourceSection: num,
    sourceSectionTitle: s.title,
    /* Il manuale è nel suo insieme una bozza da ratificare: nessuna sezione
       può essere presentata come regola definitiva finché non è ratificata. */
    documentStatus: m.documentStatus,
    documentStatusInherited: true,
    documentStates: s.states
  };
});

/* =======================================================================
   CHECKLIST DERIVATE
   Gli elementi sono le voci reali delle procedure: elenchi numerati, elenchi
   puntati o righe di tabella del manuale, riportate senza riformulazioni.
   `restricted` marca le voci che il manuale attribuisce alla Direzione, a una
   ratifica o a una verifica dello staff.
   ===================================================================== */
const CHK_SPEC = [
  { mid: 'man-i', num: '08', title: 'Ingresso nella Famiglia — fasi',
    procedure: '8.1 Fasi di ingresso', category: 'Persone',
    role: 'Vicecapo - Persone e relazioni', block: 1, restricted: [2, 5],
    recurrence: 'Nessuna', priority: 'Alta' },
  { mid: 'man-i', num: '09', title: 'Revoca degli accessi e uscita',
    procedure: '9.2 Revoca e uscita', category: 'Sicurezza',
    role: 'Direzione', block: 4, restricted: [0, 4],
    recurrence: 'Nessuna', priority: 'Alta' },
  { mid: 'man-i', num: '13', title: 'Gestione di un conflitto interno',
    procedure: '13.1 Procedura', category: 'Disciplina',
    role: 'Responsabile o Direzione', block: 1, restricted: [3, 4],
    recurrence: 'Nessuna', priority: 'Alta' },
  { mid: 'man-i', num: '16', title: 'Modifica del sistema documentale',
    procedure: '16.1 Processo di modifica', category: 'Documentazione',
    role: 'Direzione', block: 2, restricted: [3, 4],
    recurrence: 'Nessuna', priority: 'Media' },
  { mid: 'man-i', num: '17', title: 'Piano di avvio in sette giorni',
    procedure: '17.2 Piano di avvio in sette giorni', category: 'Attuazione',
    role: 'Direzione', block: 3, join: ' — ', restricted: [0],
    recurrence: 'Nessuna', priority: 'Alta' },
  { mid: 'man-i', num: '17', title: 'Verifica del primo mese',
    procedure: '17.3 Verifica del primo mese', category: 'Attuazione',
    role: 'Direzione', block: 6, join: ' — ', restricted: [3],
    recurrence: 'Mensile', priority: 'Media', suffix: 'verifica' },
  { mid: 'man-ii', num: '02', title: 'Ciclo standard delle attività',
    procedure: '02 Ciclo standard delle attività', category: 'Operativo',
    role: 'Coordinatore', block: 0, join: ' — ', cols: [0, 2], restricted: [1],
    recurrence: 'Nessuna', priority: 'Alta' },
  { mid: 'man-ii', num: '08', title: 'Debriefing post incontro con il Cartello',
    procedure: '8.1 Procedura post incontro', category: 'Accordi',
    role: 'Rappresentante', block: 3, restricted: [0, 3],
    recurrence: 'Nessuna', priority: 'Alta' },
  { mid: 'man-ii', num: '14', title: 'Preparazione del ticket',
    procedure: '14 Operazioni complesse e ticket', category: 'Autorizzazioni',
    role: 'Responsabile del ticket', block: 0, join: ' — ', restricted: [],
    recurrence: 'Nessuna', priority: 'Media' },
  { mid: 'man-ii', num: '18', title: 'Controllo inventario e approvvigionamenti',
    procedure: '18 Armi, munizioni e approvvigionamenti', category: 'Logistica',
    role: 'Magazzino / logistica', block: 0, join: ' — ', restricted: [3, 5],
    recurrence: 'Settimanale', priority: 'Media' },
  { mid: 'man-ii', num: '22', title: 'Debriefing di fine attività',
    procedure: '22 Debriefing e miglioramento', category: 'Operativo',
    role: 'Responsabile attività', block: 0, join: ' — ', restricted: [6],
    recurrence: 'Nessuna', priority: 'Alta' },
  { mid: 'man-ii', num: 'B', title: 'Checklist rapina strutturata',
    procedure: 'Allegato B - Checklist rapina strutturata', category: 'Operativo',
    role: 'Coordinatore', block: 0, cols: [0], restricted: [6],
    recurrence: 'Nessuna', priority: 'Alta' }
];

const checklists = CHK_SPEC.map(spec => {
  const m = byId(spec.mid), s = sectionOf(spec.mid, spec.num);
  const b = s.blocks[spec.block];
  let items;
  if (b.t === 'ol' || b.t === 'ul') items = b.v.slice();
  else if (b.t === 'table') {
    const pick = spec.cols || b.rows[0].map((_, i) => i);
    items = b.rows.map(r => pick.map(i => r[i]).filter(Boolean).join(spec.join || ' — '));
  } else throw new Error(`blocco non convertibile: ${spec.mid} §${spec.num} [${spec.block}]`);
  const id = `chk-${spec.mid.replace('man-', '')}-${spec.num.toLowerCase()}${spec.suffix ? '-' + spec.suffix : ''}`;
  return {
    id,
    title: spec.title,
    description: `${s.title} — ${s.subtitle}`,
    category: spec.category,
    responsible: '',
    responsibleRole: spec.role,
    participants: [],
    items: items.map((text, i) => ({
      id: `${id}-i${i + 1}`, text, done: false,
      restricted: spec.restricted.includes(i), doneBy: '', doneAt: ''
    })),
    progress: 0,
    status: 'Aperta',
    priority: spec.priority,
    dueDate: '',
    recurrence: spec.recurrence,
    objectiveId: '',
    missionId: '',
    evidence: [],
    notes: '',
    createdAt: '',
    updatedAt: '',
    /* --- provenienza --- */
    sourceManualId: m.id,
    sourceManual: `Manuale ${m.code}`,
    sourceSection: spec.num,
    sourceProcedure: spec.procedure
  };
});

const header = `/* Button's Family OS — contenuto dei manuali operativi.
 * =========================================================================
 * DATI, NON CODICE. Il testo di questo file è la trascrizione strutturata dei
 * manuali ufficiali della Famiglia Button per Gamma RP, generata dai DOCX di
 * origine senza riassunti né riformulazioni: i blocchi contengono le stesse
 * stringhe presenti nel documento sorgente.
 *
 *   Manuale I  — Statuto, Struttura e Governance    (v1.0, 33 pagine)
 *   Manuale II — Procedure Operative e Risorse      (v1.0, 32 pagine)
 *
 * Gli stati documentali (APPROVATO, DA RATIFICARE, CONFIGURABILE,
 * SPERIMENTALE, VERIFICA STAFF, TEMPORANEO, RISERVATO) sono riportati come
 * compaiono nei manuali e non vengono reinterpretati dall'applicazione.
 *
 * I Manuali III e IV non sono ancora importati.
 *
 * Generato da tests/build-manuals.mjs a partire dai DOCX ufficiali: non
 * modificare a mano, rigenerare.
 * ========================================================================= */
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT,
  header
  + 'window.BFOS_MANUALS = ' + JSON.stringify(manuals) + ';\n\n'
  + 'window.BFOS_REGULATIONS = ' + JSON.stringify(regulations) + ';\n\n'
  + 'window.BFOS_CHECKLISTS = ' + JSON.stringify(checklists) + ';\n', 'utf8');

for (const m of manuals) {
  const nb = m.sections.reduce((a, s) => a + s.blocks.length, 0);
  console.log(`Manuale ${m.code}: ${m.sections.length} sezioni, ${nb} blocchi`);
}
console.log(`Regolamenti: ${regulations.length} · obbligatori ${regulations.filter(r => r.mandatory).length}`);
console.log(`Checklist:   ${checklists.length} · elementi ${checklists.reduce((a, c) => a + c.items.length, 0)}`
  + ` · riservati ${checklists.reduce((a, c) => a + c.items.filter(i => i.restricted).length, 0)}`);
console.log(`${OUT}: ${(readFileSync(OUT, 'utf8').length / 1024).toFixed(1)} KB`);
