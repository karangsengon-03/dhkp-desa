@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title DHKP Desa — Deploy ke Vercel

echo.
echo ============================================
echo   DHKP Desa Karang Sengon — Deploy Script
echo ============================================
echo.

:: Pastikan berada di direktori yang benar
cd /d "%~dp0"

:: Simpan sw.js original (dengan __BUILD_HASH__) sebelum build
set SW_FILE=public\sw.js
set SW_BACKUP=public\sw.js.bak

echo [1/4] Backup sw.js...
copy /Y "%SW_FILE%" "%SW_BACKUP%" >nul
echo       OK

:: Build — next.config.ts akan inject BUILD_HASH ke sw.js
echo [2/4] Build aplikasi (npm run build)...
call npm run build
if %errorlevel% neq 0 (
  echo.
  echo [ERROR] Build gagal! Cek error di atas.
  :: Restore sw.js
  copy /Y "%SW_BACKUP%" "%SW_FILE%" >nul
  del "%SW_BACKUP%" >nul
  pause
  exit /b 1
)
echo       Build berhasil!

:: Restore sw.js ke versi __BUILD_HASH__ agar repo tetap bersih
echo [3/4] Restore sw.js ke template...
copy /Y "%SW_BACKUP%" "%SW_FILE%" >nul
del "%SW_BACKUP%" >nul
echo       OK

:: Push ke GitHub → Vercel auto-deploy
echo [4/4] Push ke GitHub (auto-deploy Vercel)...
echo.
set /p COMMIT_MSG="Pesan commit (Enter = 'deploy'): "
if "!COMMIT_MSG!"=="" set COMMIT_MSG=deploy

git add -A
git commit -m "!COMMIT_MSG!"
git push origin main
if %errorlevel% neq 0 (
  echo.
  echo [ERROR] Git push gagal! Pastikan remote origin sudah dikonfigurasi.
  pause
  exit /b 1
)

echo.
echo ============================================
echo   SELESAI! Vercel akan deploy otomatis.
echo   Cek: https://vercel.com/dashboard
echo ============================================
echo.
pause
