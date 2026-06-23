@echo off
setlocal

cd /d "%~dp0.."

set "DATA_DIR=%CD%\data"
set "DB=%DATA_DIR%\atlasflow.sqlite3"
set "BACKUP_DIR=%DATA_DIR%\backups"

if /I "%~1"=="homolog" set "DB=%DATA_DIR%\atlasflow_homolog.sqlite3"
if /I "%~1"=="homolog" set "NOME=atlasflow_homolog"
if not defined NOME set "NOME=atlasflow"

if not exist "%DB%" (
  echo.
  echo Banco nao encontrado em:
  echo %DB%
  echo.
  pause
  exit /b 1
)

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

for /f "tokens=1-3 delims=/ " %%a in ("%date%") do (
  set "DD=%%a"
  set "MM=%%b"
  set "YYYY=%%c"
)

set "HH=%time:~0,2%"
set "HH=%HH: =0%"
set "MIN=%time:~3,2%"
set "SEC=%time:~6,2%"
set "OUT=%BACKUP_DIR%\%NOME%_%YYYY%-%MM%-%DD%_%HH%-%MIN%-%SEC%.sqlite3"

copy "%DB%" "%OUT%" >nul

echo.
echo Backup criado:
echo %OUT%
echo.
pause
