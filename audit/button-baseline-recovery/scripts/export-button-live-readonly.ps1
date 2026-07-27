<#
.SYNOPSIS
    Export read-only della app live Button's Family OS (Slice 0 — Baseline Recovery).

.DESCRIPTION
    Replica ESATTAMENTE la GET pubblica gia' eseguita dal loader index.html:

        GET /rest/v1/bfos_assets?key=eq.app&select=content

    - Default: DRY RUN (nessuna richiesta di rete, nessuna scrittura).
    - Con -ExecuteReadOnly esegue la sola GET e salva il risultato sotto
      audit/button-baseline-recovery/exports/<timestamp>/ (cartella ignorata da Git).
    - Nessun metodo diverso da GET e' supportato o costruibile da parametri.
    - Non usa service_role: accetta esclusivamente la chiave publishable gia'
      pubblica in index.html, e non la stampa mai integralmente.
    - Non analizza ne' salva dati utente: interroga solo il record app.
    - Non modifica Supabase in alcun modo.

.PARAMETER ExecuteReadOnly
    Esegue realmente la GET read-only. Senza questo switch lo script si ferma
    dopo l'anteprima (dry run).

.NOTES
    Exit code: 0 = ok/dry-run; 2 = numero record inatteso; 3 = HTTP/blocker;
               4 = estrazione URL/chiave fallita o guardia di sicurezza.
#>
[CmdletBinding()]
param(
    [switch]$ExecuteReadOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# --- Percorsi (derivati dalla posizione dello script, nessun path hardcoded) ---
$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$AuditRoot   = Split-Path -Parent $ScriptDir                       # audit/button-baseline-recovery
$RepoRoot    = Split-Path -Parent (Split-Path -Parent $AuditRoot)  # radice repo
$IndexPath   = Join-Path $RepoRoot 'index.html'
$ExportsRoot = Join-Path $AuditRoot 'exports'

function Get-MaskedKey([string]$Key) {
    if ($Key.Length -le 12) { return '***' }
    return $Key.Substring(0, [Math]::Min(19, $Key.Length)) + '...' + $Key.Substring($Key.Length - 3)
}

function Get-MaskedUrl([string]$Url) {
    # https://<ref>.supabase.co -> https://mbd***zzv.supabase.co
    if ($Url -match '^(https://)([a-z0-9]+)(\.supabase\.co)$') {
        $ref = $Matches[2]
        $maskedRef = $ref.Substring(0,3) + ('*' * [Math]::Max(0, $ref.Length - 6)) + $ref.Substring($ref.Length - 3)
        return $Matches[1] + $maskedRef + $Matches[3]
    }
    return '<url non standard — mascherata>'
}

# --- 1. Lettura locale di index.html (nessuna rete) ---
if (-not (Test-Path $IndexPath)) {
    Write-Error "index.html non trovato in: $IndexPath"
    exit 4
}
$indexContent = Get-Content -Path $IndexPath -Raw

# --- 2. Estrazione URL e chiave publishable ---
if ($indexContent -notmatch "const\s+SB_URL\s*=\s*'([^']+)'") {
    Write-Error 'SB_URL non trovato in index.html: impossibile procedere.'
    exit 4
}
$sbUrl = $Matches[1].TrimEnd('/')

if ($indexContent -notmatch "const\s+SB_KEY\s*=\s*'([^']+)'") {
    Write-Error 'SB_KEY non trovata in index.html: impossibile procedere.'
    exit 4
}
$sbKey = $Matches[1]

# --- 3. Guardie di sicurezza ---
if ($sbUrl -notmatch '^https://[a-z0-9]+\.supabase\.co$') {
    Write-Error "URL estratto non conforme al pattern Supabase atteso ($(Get-MaskedUrl $sbUrl)). Stop."
    exit 4
}
# Solo chiave publishable/anon gia' pubblica nel loader. Mai service_role o secret.
if ($sbKey -match 'service_role' -or $sbKey -like 'sb_secret*') {
    Write-Error 'La chiave estratta NON e'' una chiave publishable. Guardia di sicurezza attivata: stop.'
    exit 4
}
if (-not ($sbKey.StartsWith('sb_publishable_') -or $sbKey.StartsWith('eyJ'))) {
    Write-Error 'Formato chiave non riconosciuto come publishable/anon. Stop prudenziale.'
    exit 4
}

$maskedKey = Get-MaskedKey $sbKey
$maskedUrl = Get-MaskedUrl $sbUrl

# --- 4. Costruzione della STESSA GET del loader (unico endpoint consentito) ---
$restPath    = '/rest/v1/bfos_assets?key=eq.app&select=content'
$requestUri  = $sbUrl + $restPath
$maskedUri   = $maskedUrl + $restPath
$timestamp   = (Get-Date).ToUniversalTime().ToString('yyyyMMdd-HHmmss') + 'Z'
$destDir     = Join-Path $ExportsRoot $timestamp

# --- 5. Anteprima obbligatoria ---
Write-Host ''
Write-Host '=== EXPORT BUTTON LIVE — READ ONLY ===' -ForegroundColor Cyan
Write-Host ("Endpoint (sanitizzato) : {0}" -f $maskedUri)
Write-Host  'Metodo                 : GET (unico metodo supportato da questo script)'
Write-Host ("Chiave (mascherata)    : {0}" -f $maskedKey)
Write-Host ("Destinazione           : {0}" -f $destDir)
Write-Host  'Scritture remote       : NESSUNA (nessun POST/PUT/PATCH/DELETE/RPC)'
Write-Host ''

if (-not $ExecuteReadOnly) {
    Write-Host 'DRY RUN: nessuna richiesta eseguita. Rilanciare con -ExecuteReadOnly per procedere.' -ForegroundColor Yellow
    exit 0
}

# --- 6. Esecuzione GET read-only ---
$headers = @{
    'apikey'        = $sbKey
    'Authorization' = "Bearer $sbKey"
}

New-Item -ItemType Directory -Force -Path $destDir | Out-Null

$startedUtc = (Get-Date).ToUniversalTime().ToString('o')
try {
    $response = Invoke-WebRequest -Uri $requestUri -Method Get -Headers $headers `
                                  -SkipHttpErrorCheck -TimeoutSec 60
} catch {
    # Errore di rete/DNS/timeout: nessuna risposta HTTP. Non si ritenta, non si cambia nulla.
    $netMsg = $_.Exception.Message -replace [regex]::Escape($sbKey), $maskedKey
    $blocker = @(
        '# BLOCKER — errore di rete durante GET read-only',
        "- Data/ora UTC: $startedUtc",
        "- Endpoint (sanitizzato): $maskedUri",
        '- Metodo: GET',
        "- Errore: $netMsg",
        '- Nessun bypass tentato; nessuna credenziale modificata.'
    ) -join "`n"
    Set-Content -Path (Join-Path $destDir 'BLOCKER.md') -Value $blocker -Encoding utf8
    Write-Host "BLOCKER di rete registrato in $destDir\BLOCKER.md" -ForegroundColor Red
    exit 3
}

$status = [int]$response.StatusCode
if ($status -lt 200 -or $status -ge 300) {
    # 401/403/404/5xx: registrare e fermarsi. Nessun bypass, nessun token nel log.
    $blocker = @(
        '# BLOCKER — risposta HTTP non valida alla GET read-only',
        "- Data/ora UTC: $startedUtc",
        "- Endpoint (sanitizzato): $maskedUri",
        '- Metodo: GET',
        "- HTTP status: $status",
        '- Il corpo della risposta NON viene salvato per evitare di registrare dettagli sensibili.',
        '- Nessun bypass tentato; nessuna credenziale modificata; nessuna scrittura remota.'
    ) -join "`n"
    Set-Content -Path (Join-Path $destDir 'BLOCKER.md') -Value $blocker -Encoding utf8
    Write-Host "HTTP $status — blocker registrato in $destDir\BLOCKER.md" -ForegroundColor Red
    exit 3
}

# --- 7. Validazione: esattamente UN record ---
$records = $response.Content | ConvertFrom-Json
if ($null -eq $records) { $records = @() }
$records = @($records)
$recordCount = $records.Count

if ($recordCount -ne 1) {
    $anomaly = @(
        '# ANOMALIA — numero record inatteso',
        "- Data/ora UTC: $startedUtc",
        "- Endpoint (sanitizzato): $maskedUri",
        "- Record ricevuti: $recordCount (atteso: 1)",
        '- Lo script NON sceglie arbitrariamente un record: nessun file app salvato.',
        '- Azione richiesta: verifica manuale della tabella bfos_assets dalla dashboard autorizzata.'
    ) -join "`n"
    Set-Content -Path (Join-Path $destDir 'ANOMALY.md') -Value $anomaly -Encoding utf8
    Write-Host "ANOMALIA: $recordCount record ricevuti (atteso 1). Vedi $destDir\ANOMALY.md" -ForegroundColor Red
    exit 2
}

$content = $records[0].content
if ([string]::IsNullOrEmpty($content)) {
    Set-Content -Path (Join-Path $destDir 'ANOMALY.md') `
        -Value "# ANOMALIA — record presente ma campo content vuoto`n- Data/ora UTC: $startedUtc" -Encoding utf8
    Write-Host 'ANOMALIA: campo content vuoto.' -ForegroundColor Red
    exit 2
}

# --- 8. Salvataggio locale (solo sotto exports/, mai eseguito, mai in Git) ---
$appFile = Join-Path $destDir 'button-live-app.html'
[System.IO.File]::WriteAllText($appFile, $content)   # UTF-8 senza BOM

$hash      = (Get-FileHash -Path $appFile -Algorithm SHA256).Hash
$sizeBytes = (Get-Item $appFile).Length
$doneUtc   = (Get-Date).ToUniversalTime().ToString('o')

$manifest = [ordered]@{
    slice              = 'Slice 0 — Baseline Recovery'
    exportStartedUtc   = $startedUtc
    exportCompletedUtc = $doneUtc
    endpointSanitized  = $maskedUri
    method             = 'GET'
    httpStatus         = $status
    recordCount        = $recordCount
    file               = 'button-live-app.html'
    sha256             = $hash
    sizeBytes          = $sizeBytes
    keyMasked          = $maskedKey
    remoteWrites       = 'NONE'
    executedInBrowser  = $false
    notes              = 'Contenuto NON eseguito, NON aperto come app, NON tracciato in Git.'
}
$manifest | ConvertTo-Json | Set-Content -Path (Join-Path $destDir 'manifest.json') -Encoding utf8

$manifestMd = @(
    '# Manifest export read-only — Button live app',
    '',
    "- **Slice:** 0 — Baseline Recovery",
    "- **Inizio (UTC):** $startedUtc",
    "- **Fine (UTC):** $doneUtc",
    "- **Endpoint (sanitizzato):** ``$maskedUri``",
    "- **Metodo:** GET — nessuna scrittura remota",
    "- **HTTP status:** $status",
    "- **Record ricevuti:** $recordCount",
    "- **File:** ``button-live-app.html``",
    "- **SHA-256:** ``$hash``",
    "- **Dimensione:** $sizeBytes byte",
    "- **Chiave usata (mascherata):** ``$maskedKey``",
    '',
    'Il contenuto non è stato eseguito né aperto nel browser; la cartella exports/ è esclusa da Git.'
) -join "`n"
Set-Content -Path (Join-Path $destDir 'manifest.md') -Value $manifestMd -Encoding utf8

Write-Host 'EXPORT COMPLETATO (read-only).' -ForegroundColor Green
Write-Host ("File      : {0}" -f $appFile)
Write-Host ("SHA-256   : {0}" -f $hash)
Write-Host ("Dimensione: {0} byte" -f $sizeBytes)
Write-Host ("Manifest  : {0}" -f (Join-Path $destDir 'manifest.json'))
exit 0
