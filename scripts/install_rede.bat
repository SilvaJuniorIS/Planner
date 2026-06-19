@echo off
setlocal

cd /d "%~dp0.."

echo.
echo Instalando dependencias do AtlasFlow...
echo.

python -m pip install --upgrade pip
python -m pip install -r requirements.txt

if errorlevel 1 (
  echo.
  echo Nao foi possivel instalar as dependencias.
  echo Verifique se o Python esta instalado e tente novamente.
  pause
  exit /b 1
)

echo.
echo Dependencias instaladas com sucesso.
echo Para iniciar em rede, execute: scripts\start_rede.ps1
echo.
pause
