@echo off
setlocal
title AtlasFlow - Inicializacao

cd /d "%~dp0"

echo.
echo ==========================================
echo   ATLASFLOW - INICIANDO O PLANNER
echo ==========================================
echo.

where python >nul 2>&1
if errorlevel 1 (
  echo ERRO: Python nao foi encontrado.
  echo Execute primeiro o arquivo scripts\install_rede.bat.
  echo.
  pause
  exit /b 1
)

if not exist "scripts\start_rede.ps1" (
  echo ERRO: O arquivo scripts\start_rede.ps1 nao foi encontrado.
  echo Mantenha este arquivo na pasta principal do Planner.
  echo.
  pause
  exit /b 1
)

echo Iniciando o site e a API...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%CD%\scripts\start_rede.ps1"

if errorlevel 1 (
  echo.
  echo ERRO: Nao foi possivel iniciar o Planner.
  echo Consulte as mensagens acima para identificar o problema.
  echo.
  pause
  exit /b 1
)

echo.
echo Aguardando os servicos...
timeout /t 4 /nobreak >nul

start "" "http://localhost:8123/"

echo.
echo Planner iniciado em http://localhost:8123/
echo Mantenha abertas as janelas da API e do site.
echo.
timeout /t 3 /nobreak >nul

endlocal
