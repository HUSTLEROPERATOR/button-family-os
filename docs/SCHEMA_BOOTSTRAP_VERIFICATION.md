# Verifica dello schema applicativo canonico

Come è stata prodotta e verificata la migrazione
`supabase/migrations/202607280000_application_schema.sql`.

> **Production changes: 0.**
> Nessun accesso al database di produzione è stato effettuato per produrre
> questa migrazione, e nessuno è necessario per applicarla.

---

## 1. Origine

Uno **snapshot offline** dello stato applicativo precedente alla migrazione di
sicurezza, conservato localmente da un'attività di verifica precedente.

Lo snapshot è stato **copiato** su un volume temporaneo e montato da un
contenitore isolato: nessuna rete, nessuna porta pubblicata, nessun riavvio
automatico, accesso esclusivamente tramite socket interno. Lo snapshot
originale non è stato montato in scrittura e non è stato modificato.

Sorgenti scartate e perché:

| Sorgente | Motivo dello scarto |
|---|---|
| Stato successivo alla migrazione di sicurezza | Le policy permissive sono già state rimosse: non rappresenta lo schema di partenza |
| Stato del modello di ruoli | Contiene tabella membership, helper e policy che appartengono a una migrazione successiva |
| Stato della verifica visuale | Contiene un dataset sintetico e adattamenti locali |
| Database di produzione | Escluso per decisione: l'obiettivo è proprio eliminare questa dipendenza |

## 2. Firma dello stato di partenza

Verificata sullo snapshot **prima** di qualunque estrazione:

| Elemento | Atteso | Trovato |
|---|---|---|
| Tabelle applicative | 14 | 14 ✅ |
| Primary key | 14 | 14 ✅ |
| Check constraint | 1 | 1 ✅ |
| Foreign key | 0 | 0 ✅ |
| Unique constraint aggiuntivi | 0 | 0 ✅ |
| Indici | 14 | 14 ✅ |
| Policy legacy | 12 | 12 ✅ |
| Funzioni legacy | 3 | 3 ✅ |
| Tabella membership | assente | assente ✅ |
| Helper del modello di ruoli | assenti | assenti ✅ |
| Righe complessive | 91 | 91 ✅ |

Il conteggio delle policy è il discriminante decisivo: lo stato **successivo**
alla migrazione di sicurezza ne avrebbe una sola. Dodici conferma che si tratta
dello stato di partenza corretto.

Le 91 righe sono state **contate e mai lette**: nessun contenuto è stato
estratto, visualizzato o copiato.

## 3. Metodo di sanitizzazione

1. **Estrazione** — dump della sola struttura dello schema applicativo, senza
   ownership e senza privilegi, scritto **fuori dal repository**.
2. **Scansione del dump grezzo** — nessun `COPY`, nessun dato, nessun indirizzo,
   nessuna chiave, nessun token, nessun URL, nessun IP, nessun identificativo,
   nessun percorso locale, nessun riferimento a contenitori.
3. **Trasformazione ancorata** — uno script estrae dal dump **soltanto** gli
   oggetti ammessi e **rifiuta di produrre alcun file** se nell'output compare
   una qualsiasi categoria vietata. Non è una copia: è un filtro che fallisce in
   modo esplicito.
4. **Nessuna invenzione** — colonne, tipi, nullability e default provengono
   integralmente dalla sorgente verificata. Nulla è stato dedotto o scritto a
   mano.
5. **Eliminazione** — dump grezzo e file intermedi rimossi al termine.

L'unico `INSERT` presente nel dump grezzo si trovava **dentro il corpo di una
funzione legacy**, che è fra gli oggetti esclusi: non è mai entrato nell'output.

## 4. Oggetti inclusi

* le 14 tabelle applicative;
* colonne, con ordine, nomi, tipi, nullability e default;
* le 14 primary key;
* l'unico check constraint presente;
* gli indici strutturali (quelli impliciti delle primary key).

## 5. Oggetti esclusi

Dati, righe, `INSERT`, `COPY`, seed · policy, `GRANT`, `REVOKE`, privilegi
predefiniti, ownership, ruoli · funzioni, funzioni legacy, `SECURITY DEFINER`,
trigger · oggetti di autenticazione, archiviazione e realtime · estensioni non
necessarie · adattamenti locali · URL, identificativi di progetto, chiavi,
password, identificativi di record.

Lo schema prodotto è **deliberatamente neutro**: la sicurezza arriva
interamente dalle migrazioni successive.

## 6. Confronto strutturale

Confrontati, fra la sorgente e il database costruito dalla migrazione:
nomi delle tabelle, ordine e nomi delle colonne, tipi, nullability, default,
primary key, check constraint e indici.

Ignorati deliberatamente: dati, policy legacy, privilegi legacy, funzioni
legacy, ownership e commenti operativi.

```
righe di firma strutturale   156 / 156
differenze                   nessuna
```

**Hash strutturale deterministico** (SHA-256 della firma normalizzata,
identico su entrambi i lati):

```
b1c30c0abc7485bd42aeafc2622d6c1e9add0da3a9402c10017d67a1af44b392
```

**SCHEMA STRUCTURE: MATCH**

## 7. Test su database vuoto

Contenitore PostgreSQL temporaneo, isolato (nessuna rete, nessuna porta),
creato vuoto e distrutto al termine.

**Dopo la migrazione 0000**

| Verifica | Esito |
|---|---|
| 14 tabelle | ✅ |
| 0 righe | ✅ |
| 14 primary key | ✅ |
| 1 check constraint | ✅ |
| 0 foreign key | ✅ |
| 0 unique aggiuntivi | ✅ |
| 0 policy | ✅ |
| 0 funzioni applicative | ✅ |
| 0 trigger | ✅ |
| tabella utenti legacy vuota | ✅ |
| tabella segreti vuota | ✅ |

**Catena completa 0000 → 0001 → 0002**

| Verifica | Esito |
|---|---|
| Tutte e tre applicate senza errori | ✅ |
| Tabella membership presente | ✅ |
| Helper lato server presenti (3) | ✅ |
| Funzioni amministrative presenti (3) | ✅ |
| Policy per operazione (49) | ✅ |
| Privilegi per `anon` | 0 ✅ |
| Privilegi per `PUBLIC` | 0 ✅ |
| Policy per `anon` | 0 ✅ |
| Privilegi client su tabelle utenti e segreti | 0 ✅ |
| RLS attiva su tutte le tabelle | ✅ |
| Righe presenti | 0 ✅ |
| Riapplicazione di 0000 (idempotenza) | no-op ✅ |

## 8. Risultato

**STAGING PACKAGE: FULLY SELF-CONTAINED**
**PRODUCTION DATABASE ACCESS REQUIRED: NO**

La catena parte da un progetto Supabase vuoto e arriva allo stato finale usando
soltanto file versionati in questo repository.

## 9. Limitazioni

Vanno lette prima di considerare lo staging validato.

1. **Il gate su `auth.uid()` non è stato superato in locale, ed è corretto
   così.** Nell'immagine PostgreSQL usata per il test la funzione `auth.uid()`
   ricava l'identità **soltanto** dal vecchio parametro per-claim, non dal
   parametro JSON che PostgREST v10 e successivi impostano a partire da un JWT
   reale. Il test lo rileva e si ferma con un messaggio esplicito. **Non è stato
   aggiunto alcun adattamento per farlo passare**: la verifica va ripetuta sul
   progetto di staging reale, dove la definizione della funzione può essere
   diversa. Resta il gate più importante prima di dichiarare valido lo staging.

2. **La piattaforma concede privilegi automaticamente.** Alla creazione delle
   tabelle, i privilegi predefiniti del progetto concedono accesso ai ruoli
   client sui nuovi oggetti. La migrazione 0001 li revoca e disattiva quel
   comportamento per il ruolo proprietario, ma **esiste una seconda regola di
   privilegi predefiniti** intestata al ruolo amministrativo della piattaforma
   che 0001 non tocca: oggetti creati in futuro da quel ruolo potrebbero essere
   nuovamente concessi in automatico. Va verificato sul progetto di staging e,
   se confermato, chiuso con una migrazione dedicata. **Non incide sullo stato
   raggiunto dalla catena**, che è stato verificato a zero privilegi.

3. **Il confronto strutturale non copre tutto.** Copre colonne, tipi,
   nullability, default, primary key, check e indici. Non copre policy,
   privilegi, funzioni, ownership e commenti, che appartengono alle migrazioni
   successive o sono deliberatamente esclusi.

4. **Le migrazioni si applicano una volta sola, e in ordine.** La 0000 è
   idempotente. Riapplicare 0001 o 0002 fuori ordine su un database dove la
   catena è già completa fallisce in modo esplicito invece di corrompere lo
   stato: è il comportamento voluto, e un runner di migrazioni non lo fa
   comunque.

5. **La migrazione 0002 richiede lo schema di autenticazione**, presente in
   qualunque progetto Supabase ma non in un database PostgreSQL creato a mano.

## 10. Production changes: 0

Nessuna connessione al database di produzione. Nessuna lettura, nessun dump,
nessuna migrazione, nessun dato, nessun utente, nessuna configurazione.
Nessuna interazione con Supabase Cloud.
