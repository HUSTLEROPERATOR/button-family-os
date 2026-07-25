# 01 — Loader audit (`index.html`)

Analisi statica in sola lettura del loader pubblico. Il file **non è stato modificato**.
Righe citate: `index.html` (35 righe totali).

## Cosa fa il loader

1. Mostra una schermata di caricamento brandizzata ("B", tema scuro, testo `Caricamento…`).
2. Esegue una `fetch` verso Supabase REST.
3. Se la risposta contiene un record con `content`, **sostituisce l'intero documento**
   con quel contenuto tramite `document.open()/document.write()/document.close()`.
4. In caso di errore mostra un messaggio nell'elemento `#msg`, incluso il suggerimento
   di riattivare il progetto Supabase dalla dashboard se in pausa.

Il commento nel sorgente (riga 20-21) conferma il design: *"Per aggiornare l'app basta
ricaricare l'HTML su Supabase: questo file non cambia mai."*

## Endpoint e richiesta

| Elemento | Valore osservato (sanitizzato) |
|---|---|
| URL Supabase | `https://mbd********zzv.supabase.co` — project ref di 20 caratteri, valore completo alla riga 22 di `index.html` |
| Endpoint REST | `/rest/v1/bfos_assets` |
| Tabella | `bfos_assets` |
| Filtro | `key=eq.app` (PostgREST: colonna `key` uguale a `app`) |
| Campi richiesti | `select=content` (solo la colonna `content`) |
| Metodo HTTP | `GET` (unico metodo usato dal loader) |
| Header 1 | `apikey: <chiave publishable>` |
| Header 2 | `Authorization: Bearer <stessa chiave publishable>` |

## Chiave pubblica presente

Alla riga 23 è presente una chiave **publishable** Supabase (formato `sb_publishable_…`,
valore mascherato: `sb_publishable_Qpb1…amd`). Non viene ristampata integralmente qui.

Note:

- è una chiave *pubblica per design* (già esposta nel repo pubblico e a ogni visitatore
  del sito), soggetta a RLS lato Supabase;
- **non** va assunta come accesso amministrativo: consente solo ciò che le policy RLS
  del progetto permettono al ruolo `anon` (come minimo, `SELECT` su `bfos_assets`);
- non è dato sapere da qui quali altre tabelle siano leggibili/scrivibili dal ruolo
  `anon`: va verificato dalla dashboard Supabase (blocker Q-TECH-002).

## Gestione errori osservata

| Caso | Comportamento |
|---|---|
| HTTP non-2xx | `throw new Error('HTTP '+r.status)` → messaggio a schermo |
| Risposta vuota o senza `content` | `throw new Error('App non trovata nel database')` |
| Qualsiasi errore | Messaggio in `#msg` con classe `.err`; nessun retry, nessun fallback, nessun log remoto |

Il messaggio d'errore cita esplicitamente il caso "progetto Supabase in pausa"
(piano free: pausa automatica per inattività) — indizio che è un fallimento già
osservato in passato.

## Rischi architetturali

1. **Codice remoto eseguito senza verifica di integrità.** `document.write` esegue
   qualunque HTML/JS presente nel record `bfos_assets.key='app'`. Chiunque riesca a
   scrivere quel record (misconfigurazione RLS, credenziali dashboard compromesse)
   controlla l'intera app per tutti gli utenti. Nessun hash, nessuna firma, nessun
   version pinning.
2. **Single point of failure.** Se il progetto Supabase è in pausa, cancellato o
   irraggiungibile, l'app non esiste più: il repository non contiene la codebase reale
   (conferma di `03_CURRENT_STATE_AUDIT.md`).
3. **Nessun versionamento.** Il filtro `key=eq.app` prende "l'unico" record: non c'è
   colonna versione osservabile dalla query, né storicizzazione nota. Un aggiornamento
   sbagliato è irreversibile senza backup esterno.
4. **Superficie RLS ignota.** La chiave publishable è esposta by design, ma non è noto
   quali altre tabelle il ruolo `anon` possa leggere. Serve audit RLS dalla dashboard
   (AUD-007).
5. **Nessuna telemetria/osservabilità.** Un errore di caricamento è visibile solo
   all'utente che lo incontra.
6. **Cache/CDN assente.** Ogni visita rifà la GET; la disponibilità dell'app coincide
   con la disponibilità del database.

## Recuperabilità read-only

Il contenuto dell'app **è recuperabile in sola lettura** replicando esattamente la GET
del loader (stessa tabella, stesso filtro, stessa chiave pubblica, metodo GET). Questo
è ciò che fa `scripts/export-button-live-readonly.ps1`. Nessuna scrittura è necessaria
né possibile con questo flusso.

Ciò che **non** è recuperabile con la sola chiave publishable (salvo RLS permissive non
verificate): schema completo, altre tabelle, utenti, storage, policy RLS, funzioni,
trigger. Per questi serve accesso alla dashboard/CLI del progetto (blocker Q-TECH-002,
AUD-006..AUD-010).
