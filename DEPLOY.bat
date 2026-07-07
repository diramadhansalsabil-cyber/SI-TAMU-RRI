@echo off
title Deploy SI-TAMU RRI ke GitHub
cd /d "%~dp0"
echo.
echo ========================================
echo   Deploy SI-TAMU RRI ke GitHub
echo ========================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy-github.ps1"
