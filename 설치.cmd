@echo off
rem 3D office installer: double-click. Runs setup.ps1 (Node.js required)
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0설치.ps1"
echo.
echo (this window can be closed)
pause
