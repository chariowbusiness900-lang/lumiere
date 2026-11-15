@echo off
chcp 65001 >nul
title PUSH LUMIERE vers GitHub - CORRIGE
echo ==========================================
echo  PUSH LUMIERE v1.3 - VERSION CORRIGEE
echo ==========================================
echo.
echo [1/5] Configuration Git (corrige l'erreur email)...
git config --global user.email "chariowbusiness900-lang@github.com"
git config --global user.name "chariowbusiness900-lang"
git config user.email "chariowbusiness900-lang@github.com"
git config user.name "chariowbusiness900-lang"
echo OK - email et nom configures
echo.
echo [2/5] Initialisation Git...
if not exist .git git init
echo.
echo [3/5] Ajout des fichiers...
git add .
echo.
echo [4/5] Commit...
git commit -m "LUMIERE v1.3 - structure corrigee"
if errorlevel 1 (
  echo Pas de nouveau commit, on continue quand meme...
)
echo.
echo [5/5] Push vers GitHub (ecrase l'ancien contenu)...
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin https://github.com/chariowbusiness900-lang/lumiere.git
git push -f origin main
echo.
echo ==========================================
echo  TERMINE ! Va sur GitHub et fais F5
echo  Tu dois voir les dossiers src/, src-tauri/, .github/
echo ==========================================
echo.
pause
