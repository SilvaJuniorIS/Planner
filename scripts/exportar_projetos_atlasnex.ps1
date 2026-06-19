param(
  [Parameter(Mandatory = $true)]
  [string]$Destino
)

$ErrorActionPreference = "Stop"

$projects = @(
  "C:\Planner",
  "C:\Projeto_Hermes_Premium",
  "C:\Projeto_Icaro",
  "C:\ProjetoArgos",
  "C:\FiscalBot"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$root = Join-Path $Destino "AtlasNex_Projetos_$timestamp"

$excludeDirs = @(
  ".git",
  ".venv",
  "venv",
  "__venv",
  "node_modules",
  "__pycache__",
  ".pytest_cache",
  ".ruff_cache",
  ".mypy_cache",
  ".cache"
)

$excludeFiles = @(
  "*.pyc",
  "*.pyo",
  "*.log",
  "celerybeat-schedule"
)

New-Item -ItemType Directory -Path $root -Force | Out-Null

$manifest = @()

foreach ($project in $projects) {
  if (-not (Test-Path $project)) {
    Write-Warning "Projeto nao encontrado: $project"
    continue
  }

  $name = Split-Path $project -Leaf
  $target = Join-Path $root $name

  Write-Host ""
  Write-Host "Copiando $name..." -ForegroundColor Cyan

  $robocopyArgs = @(
    $project,
    $target,
    "/E",
    "/COPY:DAT",
    "/DCOPY:DAT",
    "/R:2",
    "/W:2",
    "/NFL",
    "/NDL",
    "/NP",
    "/XD"
  ) + $excludeDirs + @("/XF") + $excludeFiles

  & robocopy @robocopyArgs | Out-Host

  if ($LASTEXITCODE -gt 7) {
    throw "Falha ao copiar $project. Codigo robocopy: $LASTEXITCODE"
  }

  $manifest += [pscustomobject]@{
    Projeto = $name
    Origem = $project
    Destino = $target
    CopiadoEm = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  }
}

$manifestPath = Join-Path $root "MANIFESTO_EXPORTACAO_ATLASNEX.csv"
$manifest | Export-Csv -Path $manifestPath -NoTypeInformation -Encoding UTF8

$readmePath = Join-Path $root "LEIA-ME_TRANSFERENCIA.txt"
@"
Exportacao AtlasNex
Gerada em: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Projetos incluidos:
- Planner
- Projeto_Hermes_Premium
- Projeto_Icaro
- ProjetoArgos
- FiscalBot

Pastas pesadas removidas da copia:
- .git
- venv / .venv / __venv
- node_modules
- caches Python e testes

Depois de copiar para o notebook:
1. Instale Python, Node.js, Git e Docker Desktop, conforme o projeto exigir.
2. Abra cada projeto e instale as dependencias pelo README.
3. Recrie ambientes virtuais Python no notebook.
4. Reinstale node_modules nos projetos frontend.
5. Confira arquivos .env antes de subir sistemas com Docker/API.

Manifesto:
$manifestPath
"@ | Set-Content -Path $readmePath -Encoding UTF8

Write-Host ""
Write-Host "Exportacao concluida em:" -ForegroundColor Green
Write-Host $root
Write-Host ""
Write-Host "Manifesto:" -ForegroundColor Green
Write-Host $manifestPath
