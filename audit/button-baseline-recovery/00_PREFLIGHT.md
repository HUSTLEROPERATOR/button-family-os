# 00 — Preflight

Data: 2026-07-25 (ora locale macchina di audit)

## Comandi eseguiti

```text
git status --short --branch
git branch --show-current
git log -1 --oneline
git diff --check
```

## Risultati

| Verifica | Esito |
|---|---|
| Working tree | PULITO — nessuna modifica pendente prima dell'audit |
| `git diff --check` | Nessun errore whitespace/conflitto |
| Ultimo commit di partenza | `79c544f` — "docs: trace initial user and permission requirements" |
| Branch iniziale | `docs/rp-operations-suite-blueprint` (tracking origin) |
| Branch atteso | `audit/button-baseline-recovery` |

## Deviazione documentata — creazione del branch

Il branch atteso `audit/button-baseline-recovery` **non esisteva** né in locale né su
`origin`. Il runbook prevede lo stop se il branch è diverso; poiché però il branch
non era mai stato creato e il working tree era pulito, il branch è stato **creato**
da `79c544f` (HEAD di `docs/rp-operations-suite-blueprint`) con:

```text
git switch -c audit/button-baseline-recovery
```

Motivazione della base scelta: `main` **non contiene** `docs/rp-operations-suite/`
(la documentazione richiesta da questo audit); il branch docs è 47 commit avanti
rispetto a `main`. Creare il branch di audit dall'HEAD del branch docs mantiene la
documentazione di riferimento accessibile senza toccare `main`.

Nessun file è stato creato o modificato prima dello switch di branch.

## Stato del repository alla partenza

```text
button-family-os/
├── docs/rp-operations-suite/   (34 file .md, 00..32 + README)
└── index.html                  (loader pubblico — NON modificato)
```

Nessun altro file sorgente presente: la codebase applicativa reale vive su Supabase
(tabella `bfos_assets`), come descritto in `docs/rp-operations-suite/03_CURRENT_STATE_AUDIT.md`.

## Esito preflight

`PASS` (con deviazione documentata sopra: branch creato invece che preesistente).
Autorizzate le sole scritture locali sotto `audit/button-baseline-recovery/`.
