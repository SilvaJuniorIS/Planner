@echo off
setlocal

set "PROD=C:\Planner"
set "HOMOLOG=C:\Planner_Homolog"
set "PROD_DB=%PROD%\data\atlasflow.sqlite3"
set "BACKUP_DIR=%PROD%\backups"

echo.
echo Publicacao da homologacao para producao
echo Origem:  %HOMOLOG%
echo Destino: %PROD%
echo.
echo ATENCAO: o banco de producao NAO sera substituido.
echo.
choice /C SN /M "Deseja continuar"
if errorlevel 2 exit /b 0

if not exist "%HOMOLOG%" (
  echo Homologacao nao encontrada: %HOMOLOG%
  pause
  exit /b 1
)

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
if exist "%PROD_DB%" (
  for /f "tokens=1-3 delims=/ " %%a in ("%date%") do (
    set "DD=%%a"
    set "MM=%%b"
    set "YYYY=%%c"
  )
  set "HH=%time:~0,2%"
  set "HH=%HH: =0%"
  set "MIN=%time:~3,2%"
  set "SEC=%time:~6,2%"
  copy "%PROD_DB%" "%BACKUP_DIR%\pre_deploy_%YYYY%-%MM%-%DD%_%HH%-%MIN%-%SEC%.sqlite3" >nul
)

robocopy "%HOMOLOG%" "%PROD%" /E /XD data backups .git /XF *.sqlite3 *.sqlite3-* >nul
if errorlevel 8 (
  echo Falha ao publicar arquivos.
  pause
  exit /b 1
)

echo.
echo Publicacao concluida.
echo Reinicie a API/site de producao e solicite Ctrl+F5 aos usuarios.
echo.
pause
