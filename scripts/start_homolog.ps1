$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$DataDir = Join-Path $ProjectRoot "data"
$DbPath = Join-Path $DataDir "atlasflow_homolog.sqlite3"
New-Item -ItemType Directory -Force -Path $DataDir | Out-Null

$IPv4 = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object {
    $_.IPAddress -notlike "127.*" -and
    $_.IPAddress -notlike "169.254.*" -and
    $_.PrefixOrigin -ne "WellKnown"
  } |
  Select-Object -First 1 -ExpandProperty IPAddress

if (-not $IPv4) {
  $IPv4 = "localhost"
}

Write-Host ""
Write-Host "AtlasFlow HOMOLOGACAO" -ForegroundColor Cyan
Write-Host "Site: http://$IPv4`:8124" -ForegroundColor Green
Write-Host "API:  http://$IPv4`:8001/docs" -ForegroundColor Green
Write-Host "Banco: $DbPath" -ForegroundColor Green
Write-Host "Login: senhas obrigatorias na homologacao" -ForegroundColor Green
Write-Host ""
Write-Host "Este ambiente nao usa o banco de producao." -ForegroundColor Yellow
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:ATLASFLOW_DB='$DbPath'; `$env:ATLASFLOW_REQUIRE_PASSWORDS='1'; cd '$ProjectRoot'; python -m uvicorn api.main:app --host 0.0.0.0 --port 8001"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot'; python -m http.server 8124 --bind 0.0.0.0"
