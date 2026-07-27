# 03 — Live source manifest

Inventario **statico** del sorgente recuperato. Il file non è stato eseguito, non è
stato aperto nel browser e non è tracciato in Git. Tutte le evidenze citate sono
righe del file esportato (analisi testuale).

## Identità della baseline (AUD-003)

| Campo | Valore |
|---|---|
| Data export (UTC) | 2026-07-25, run `20260725-025330Z` |
| Origine | `GET /rest/v1/bfos_assets?key=eq.app&select=content` (stessa GET del loader) |
| HTTP status | 200 — 1 record (atteso: 1) |
| File locale | `exports/20260725-025330Z/button-live-app.html` (fuori da Git) |
| SHA-256 | `16DA604373877C94FDDF0C6A4BCAF64758774ED9C55B1C57B1EADA4C747ACEDC` |
| Dimensione | 192.478 byte |
| Righe | 2.733 |
| Titolo documento | `Button's Family OS` |
| Auto-descrizione nel sorgente | "BUTTON FAMILY OS — gestionale single-file" (r. 316), BOOT "v2 — backend Supabase" (r. 2827) |

## Tecnologie e dipendenze osservate (AUD-005 parziale)

- **HTML + CSS + JavaScript vanilla in un unico file.** Nessun framework, nessun
  bundler, nessun modulo ES.
- **Zero dipendenze CDN/esterne.** Le uniche URL esterne nel sorgente sono: il
  progetto Supabase (r. 324), `https://twitch.tv/` (link profili membri) e i
  namespace SVG inline. Nessun `<script src>` remoto.
- **Persistenza:** Supabase REST (PostgREST) via `fetch` con chiave publishable
  (oggetto `SB`, r. 323-337); sessione di login in `sessionStorage` (`bfos.session`).
- **UI:** rendering per stringhe template, tabs, modali, drag&drop ruoli, toast,
  layout responsive con card mobile.

## Riferimenti Supabase osservati nel sorgente

### Endpoint e chiave

- URL progetto: `https://mbd***zzv.supabase.co` (r. 324, stesso del loader).
- Chiave: **la stessa publishable del loader** (`sb_publishable_Qpb1…amd`, r. 325).
- Il testo della schermata Impostazioni (r. 1597) chiama il progetto Supabase
  "**button-family-os**".

### Tabelle referenziate (13)

| Tabella | Uso osservato |
|---|---|
| `bfos_assets` | solo dal loader (`key=eq.app`, colonna `content`) |
| `bfos_roles` | ruoli/gerarchia — read + upsert/delete in sync |
| `bfos_members` | membri — read + upsert/delete in sync |
| `bfos_activities` | registro attività — read + upsert/delete + **DELETE retention >12 mesi** |
| `bfos_weapon_tests` | prove armi ("Armeria") — read + sync |
| `bfos_deposits` | depositi (casa/garage/veicolo/magazzino) — read + sync |
| `bfos_movements` | movimenti magazzino — read + sync |
| `bfos_agreements` | accordi — read + sync |
| `bfos_cash_movements` | movimenti cassa — read + sync |
| `bfos_factions` | fazioni (Intel/Relazioni) — read + sync |
| `bfos_intel` | diario intel — read + sync + **DELETE retention >12 mesi** |
| `bfos_settings` | chiavi osservate: `wipe_date`, `session_epoch` (kill-switch), `conversions` — read + upsert |
| `bfos_users` | account applicativi; gestiti "da dashboard Supabase → Table Editor" (r. 1602) |

### Funzioni RPC referenziate (2)

| RPC | Uso |
|---|---|
| `bfos_login(p_user, p_pass)` | login con verifica password lato server (r. 797) |
| `bfos_list_users()` | elenco account per la schermata Impostazioni (r. 360) |

## Moduli e schermate osservati

Tab principali (r. 291-298): **Membri, Attività, Magazzino, Casse, Intel, Ruoli,
Backup, Impostazioni**. Dettaglio nella parity checklist (`04_BUTTON_PARITY_CHECKLIST.md`).

Modello permessi applicativo osservato: **due livelli** — `admin` ("modifica tutto")
e `viewer` ("sola lettura") — applicati **solo lato client** (`App.isAdmin`, r. 811;
badge r. 817; pulsanti condizionati r. 1568-1587).

## Secret-like strings

- **1 sola** occorrenza di stringa tipo-chiave: la publishable Supabase (r. 325),
  identica a quella del loader; valore non ristampato qui.
- Nessuna occorrenza di `service_role`, `sb_secret`, JWT (`eyJ…`) o altre credenziali.
- Le password utente **non** sono nel sorgente: verificate lato server via RPC.

## Comportamenti rilevanti per il rischio (osservati, NON testati)

1. **Scritture con chiave pubblica.** L'app esegue upsert (`POST … Prefer:
   resolution=merge-duplicates`) e `DELETE` su tutte le tabelle `bfos_*` usando la
   sola chiave publishable (r. 407-418). Se ciò funziona in produzione, il ruolo
   `anon` ha permessi di scrittura/cancellazione: chiunque abbia la chiave (che è
   pubblica) potrebbe modificare i dati via REST, senza login. **Da verificare in
   AUD-007 — questo audit non ha eseguito alcuna scrittura di prova.**
2. **Retention distruttiva al load.** `Store.load()` cancella da `bfos_activities` e
   `bfos_intel` i record più vecchi di 12 mesi (r. 370-378) e viene eseguito in
   `App.init()` **prima del login**: il semplice caricamento dell'app nel browser può
   produrre DELETE. (Motivo in più per cui questo audit non apre l'HTML nel browser.)
3. **Sync "cancella ciò che non è locale".** `del(table, rows)` elimina ogni riga con
   id non presente nello stato locale (r. 414-416); con stato locale vuoto la
   variante `id=neq.__none__` svuota la tabella. Un client con dati stantii può
   cancellare dati altrui; c'è un anti-sovrascrittura solo parziale (refresh dopo
   60s in foreground, r. 772-787).
4. **Autenticazione custom, non Supabase Auth.** Sessione in `sessionStorage`,
   kill-switch con `session_epoch` (r. 399-404, 764-766, azione "Disconnetti tutti
   gli utenti" r. 1604). Il gating admin/viewer è solo UI.
5. **Copia informativa non aggiornata.** La schermata Backup dichiara "Tutti i dati
   vivono nel browser (localStorage)" (r. 1561), ma il boot è "v2 — backend
   Supabase": documentazione interna in ritardo sull'architettura reale.
6. **Wipe totale dal client.** `IO.wipe()` svuota tutte le tabelle di dominio dopo un
   semplice `confirm()` (r. 2817-2824); `IO.importJSON()` sostituisce l'intero
   dataset.

## Costanti di dominio osservate

- Stati membro: `Attivo, In prova, Sospeso, Inattivo, Terminato` (r. 428).
- Affidabilità: `bassa, media, alta` (r. 430).
- Specializzazioni: `guida, mira, trattativa, meccanico, logistica, intelligence,
  braccio armato, direzione` (r. 432).
- Categorie ruolo: `Direzione, Comando, Unità Operative, Membri, Esterni, Sistema` (r. 433).
- Tipi denaro in cassa: `sporco`/`pulito`; causali osservate: `Pulizia cartello`,
  `Pulizia per terzi` (r. 1323-1332) — economia RP di gioco.
- Export CSV membri con 16 colonne (r. 2722), inclusi `nickDiscord`, `discordId`,
  `twitchLink`, `isLive`.
