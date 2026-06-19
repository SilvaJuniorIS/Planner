@echo off
setlocal

set "PROD=C:\Planner"
set "HOMOLOG=C:\Planner_Homolog"
set "PROD_DB=%PROD%\data\atlasflow.sqlite3"
set "HOMOLOG_DB=%HOMOLOG%\data\atlasflow_homolog.sqlite3"

echo.
echo Criando ambiente de homologacao do AtlasFlow...
echo Producao:   %PROD%
echo Homologacao:%HOMOLOG%
echo.

if not exist "%PROD%" (
  echo Pasta de producao nao encontrada: %PROD%
  pause
  exit /b 1
)

if not exist "%HOMOLOG%" mkdir "%HOMOLOG%"

robocopy "%PROD%" "%HOMOLOG%" /E /XD data backups .git /XF *.sqlite3 *.sqlite3-* >nul
if errorlevel 8 (
  echo Falha ao copiar arquivos para homologacao.
  pause
  exit /b 1
)

if not exist "%HOMOLOG%\data" mkdir "%HOMOLOG%\data"

if exist "%PROD_DB%" (
  copy "%PROD_DB%" "%HOMOLOG_DB%" >nul
  echo Banco de producao copiado como modelo:
  echo %HOMOLOG_DB%
) else (
  echo Banco de producao nao encontrado. A homologacao iniciara com banco vazio.
)

echo.
echo Homologacao criada com sucesso.
echo Para iniciar: %HOMOLOG%\scripts\start_homolog.ps1
echo.
pause
