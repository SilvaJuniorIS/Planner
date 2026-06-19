@echo off
setlocal

echo ===============================================
echo  Exportacao dos projetos AtlasNex para notebook
echo ===============================================
echo.

if "%~1"=="" (
  echo Uso:
  echo   scripts\exportar_projetos_atlasnex.bat E:\AtlasNex_Backup
  echo.
  echo Informe como parametro a pasta de destino no pendrive, HD externo ou rede.
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0exportar_projetos_atlasnex.ps1" -Destino "%~1"

echo.
echo Finalizado.
pause
