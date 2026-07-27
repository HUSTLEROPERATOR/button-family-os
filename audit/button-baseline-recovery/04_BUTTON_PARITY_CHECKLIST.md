# 04 — Button parity checklist (prima stesura)

Prima checklist di parità per Slice 2 (Button Parity), costruita **solo** da evidenze
nel sorgente esportato (`exports/20260725-025330Z/button-live-app.html`, SHA-256
`16DA6043…ACEDC`). Nessuna funzione è dichiarata `CONFIRMED` senza riga di evidenza.

Stati: `CONFIRMED` = codice della funzione osservato nel sorgente; `PARTIAL` =
osservata l'esistenza ma non tutti i comportamenti; `UNKNOWN` = non verificabile
senza eseguire l'app o senza accesso al DB.

Nota permessi: nell'app live esistono solo `admin` e `viewer` (client-side). La
colonna "Permessi osservati" riflette questo, non i futuri ADMIN/DIREZIONE/STAFF.

| # | Funzione | Schermata/Modulo | Evidenza (riga sorgente) | Stato | Dati coinvolti | Permessi osservati | Test futuro | Note |
|---|---|---|---|---|---|---|---|---|
| 1 | Login username/password con verifica server | Login | r. 791-805, RPC `bfos_login` | CONFIRMED | `bfos_users` | tutti | login ok/ko, lockout da definire | password mai nel client |
| 2 | Sessione con kill-switch di Direzione | Login/Impostazioni | r. 764-766, 399-404, 1604 | CONFIRMED | `bfos_settings.session_epoch` | admin invalida tutti | invalidazione sessioni | da mappare su audit reale |
| 3 | Elenco membri con ricerca e filtri (ruolo, stato, spec., affidabilità, attivi, live) | Membri | r. 846-859, 748 | CONFIRMED | `bfos_members`, `bfos_roles` | admin edit / viewer read (UI) | parità filtri e conteggi | include badge "live" Twitch |
| 4 | Scheda membro / dettaglio e modifica | Membri → dettaglio | sezione MODALS r. 1611+, CSV cols r. 2722 | PARTIAL | `bfos_members` | admin (UI) | CRUD completo campo per campo | campi: nick Discord, nome RP, telefono, note, avatar, ecc. |
| 5 | Registro attività | Attività → Registro | r. 968-974 (`actSub 'log'`) | CONFIRMED | `bfos_activities` | admin/viewer (UI) | parità tipi/esiti attività | retention 12 mesi lato client (r. 370-378) |
| 6 | Armeria / prove armi | Attività → Armeria | r. 973, tabella `bfos_weapon_tests` | CONFIRMED | `bfos_weapon_tests` | admin (UI) | parità flusso prova | dettaglio flusso da eseguire in staging |
| 7 | Crescita (andamento) | Attività → Crescita | r. 974 | PARTIAL | `bfos_activities`, `bfos_members` | viewer ok | parità metriche/grafici | logica interna non ancora inventariata |
| 8 | Inventario magazzino | Magazzino → Inventario | r. 1128-1135 | CONFIRMED | `bfos_movements`, `bfos_deposits` | admin (UI) | giacenze derivate dai movimenti | filtri kind/cat/deposito r. 750 |
| 9 | Movimenti magazzino | Magazzino → Movimenti | r. 1133 | CONFIRMED | `bfos_movements` | admin (UI) | parità causali | periodo 7gg default r. 751 |
| 10 | Depositi (casa/garage/veicolo/magazzino) | Magazzino → Depositi | r. 1134, r. 1340 | CONFIRMED | `bfos_deposits` | admin (UI) | parità tipi deposito | icone per tipo |
| 11 | Accordi | Magazzino → Accordi | r. 1135 | PARTIAL | `bfos_agreements` | admin (UI) | parità campi accordo | contenuto schermata non inventariato |
| 12 | Casse: saldi per deposito, denaro sporco/pulito | Casse | r. 1316-1345 | CONFIRMED | `bfos_cash_movements`, `bfos_deposits` | admin (UI) | riconciliazione saldi | stat 30gg: pulizia cartello/per terzi |
| 13 | Intel: relazioni con fazioni | Intel → Relazioni | r. 1427-1432 | CONFIRMED | `bfos_factions` | admin (UI) | parità relazioni | |
| 14 | Intel: diario | Intel → Diario | r. 1432 | CONFIRMED | `bfos_intel` | admin (UI) | parità note/diario | retention 12 mesi lato client |
| 15 | Gerarchia ruoli con drag&drop e categorie | Ruoli | r. 836 (`DnD.bind()`), r. 433, 1524 | CONFIRMED | `bfos_roles` | admin (UI) | parità gerarchia e ordinamento | categorie: Direzione, Comando, Unità Operative, Membri, Esterni, Sistema |
| 16 | Export backup JSON completo | Backup | r. 2724-2728 | CONFIRMED | tutte le tabelle di dominio | tutti (UI) | export riproducibile | |
| 17 | Import backup JSON (sostituzione totale) | Backup | r. 2750-2761 | CONFIRMED | tutte | solo admin (UI r. 1568) | import idempotente nel nuovo sistema | oggi sostituisce tutto |
| 18 | Export membri CSV | Backup | r. 2729-2740 | CONFIRMED | `bfos_members`, `bfos_roles` | tutti (UI) | parità colonne | 16 colonne, r. 2722 |
| 19 | Import membri CSV (add/update per nickDiscord) | Backup | r. 2762-2793 | CONFIRMED | `bfos_members` | solo admin (UI) | dedup per chiave | |
| 20 | Ripristino dati demo (seed) | Backup | r. 2812-2816, sezione SEED r. 576 | CONFIRMED | roles/members demo | solo admin (UI) | n/a (solo staging) | |
| 21 | Svuota tutto (wipe manuale) | Backup | r. 2817-2824 | CONFIRMED | tutte le tabelle di dominio | solo admin (UI) | nel nuovo sistema: wipe stagionale con archivio (DEC-009) | oggi è irreversibile, solo `confirm()` |
| 22 | Elenco account e livelli | Impostazioni | r. 1592-1602, RPC `bfos_list_users` | CONFIRMED | `bfos_users` | tutti vedono elenco | gestione utenti nel nuovo sistema | creazione account solo da dashboard |
| 23 | Data wipe / conversioni (impostazioni) | Impostazioni | r. 367-369, 383-392 | PARTIAL | `bfos_settings` | admin (UI) | parità impostazioni | UI di modifica non ancora localizzata nel sorgente |
| 24 | Sync automatico multi-dispositivo con debounce | trasversale | r. 393-423, 772-787 | CONFIRMED | tutte | n/a | strategia sync nuova (server-authoritative) | modello attuale: upsert tutto + delete assenti |
| 25 | Enforcement permessi lato server | trasversale | — (nessuna evidenza di enforcement server) | UNKNOWN | tutte | *non osservato* | test RLS deny-by-default in staging | rischio chiave publishable con scritture, vedi 03 §rischi |
| 26 | Comportamento reale RLS/policy in produzione | backend | non osservabile dal sorgente | UNKNOWN | tutte | — | AUD-007 con accesso dashboard | bloccato da Q-TECH-002 |

## Funzioni della documentazione suite NON presenti nell'app osservata

Per evitare false aspettative di parità: nel sorgente live **non** c'è evidenza di
missioni/obiettivi strutturati, valutazioni, manuali/procedure in-app, turni,
payroll, clienti/vendite o integrazione Discord attiva (esistono solo campi
anagrafici Discord/Twitch dei membri). La "Button parity" di Slice 2 va quindi
misurata sulle 24 funzioni osservate sopra, non sul perimetro futuro della suite.

## Prossimi passi della checklist

1. Completare le voci `PARTIAL` con lettura mirata delle sezioni VIEWS/ACTIONS.
2. Dopo accesso Supabase (Q-TECH-002): trasformare le voci `UNKNOWN` in verificate
   (schema reale, RLS, conteggi record per tabella).
3. In staging: eseguire l'app esportata in ambiente isolato (mai in produzione) e
   validare ogni riga con un test funzionale.
