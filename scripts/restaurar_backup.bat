@echo off
setlocal EnableDelayedExpansion

cd /d "%~dp0.."

set "DATA_DIR=%CD%\data"
set "DB=%DATA_DIR%\atlasflow.sqlite3"
set "BACKUP_DIR=%DATA_DIR%\backups"
set "NOME=atlasflow"

if /I "%~1"=="homolog" (
  set "DB=%DATA_DIR%\atlasflow_homolog.sqlite3"
  set "NOME=atlasflow_homolog"
)

if not exist "%BACKUP_DIR%" (
  echo.
  echo Pasta de backups nao encontrada:
  echo %BACKUP_DIR%
  echo.
  pause
  exit /b 1
)

echo.
echo ============================================
echo  Restaurar backup do banco AtlasFlow
echo ============================================
echo.
echo Banco atual:
echo %DB%
echo.
echo Backups encontrados:
echo.

set /a COUNT=0
for /f "delims=" %%F in ('dir /b /a-d /o-d "%BACKUP_DIR%\%NOME%*.sqlite3" 2^>nul') do (
  set /a COUNT+=1
  set "FILE_!COUNT!=%%F"
  echo !COUNT!. %%F
)

if "%COUNT%"=="0" (
  echo Nenhum backup encontrado para %NOME%.
  echo.
  pause
  exit /b 1
)

echo.
echo ATENCAO:
echo - Feche usuarios do sistema antes de restaurar.
echo - Pare a API antes de restaurar, se ela estiver em uso.
echo - O script criara uma copia do banco atual antes da restauracao.
echo.
set /p CHOICE="Digite o numero do backup para restaurar ou ENTER para cancelar: "
if "%CHOICE%"=="" exit /b 0

if not defined FILE_%CHOICE% (
  echo Opcao invalida.
  pause
  exit /b 1
)

set "SELECTED=!FILE_%CHOICE%!"
set "SOURCE=%BACKUP_DIR%\%SELECTED%"

for /f "tokens=1-3 delims=/ " %%a in ("%date%") do (
  set "DD=%%a"
  set "MM=%%b"
  set "YYYY=%%c"
)
set "HH=%time:~0,2%"
set "HH=%HH: =0%"
set "MIN=%time:~3,2%"
set "SEC=%time:~6,2%"
set "PRE=%BACKUP_DIR%\pre_restore_%NOME%_%YYYY%-%MM%-%DD%_%HH%-%MIN%-%SEC%.sqlite3"

echo.
echo Backup escolhido:
echo %SOURCE%
echo.
choice /C SN /M "Confirma restauracao"
if errorlevel 2 exit /b 0

if exist "%DB%" copy "%DB%" "%PRE%" >nul
copy "%SOURCE%" "%DB%" >nul

echo.
echo Restauracao concluida.
echo Copia de seguranca do banco anterior:
echo %PRE%
echo.
echo Reinicie a API e atualize o navegador com Ctrl+F5.
echo.
pause
