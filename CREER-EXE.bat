@echo off
REM LUMIERE — Double-clic pour creer le .exe sur Windows 11
REM Installe Node + Rust si besoin, build Tauri, signe auto-signe, cree dist-exe/
setlocal
title LUMIERE - Creation du .exe
echo ==========================================
echo  LUMIERE - Creation du .exe
echo ==========================================
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo [1/6] Installation de Node.js...
  winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
)
where cargo >nul 2>&1
if %errorlevel% neq 0 (
  echo [2/6] Installation de Rust...
  winget install -e --id Rustlang.Rustup --accept-source-agreements --accept-package-agreements
  call "%USERPROFILE%\.cargo\bin\rustup.exe" default stable
)
echo [3/6] Installation des dependances...
call npm ci
if %errorlevel% neq 0 call npm install
echo [4/6] Build Tauri...
call npm run tauri build
if %errorlevel% neq 0 (
  echo ERREUR pendant le build. Lis le message au-dessus.
  pause
  exit /b 1
)
echo [5/6] Signature auto-signee (si cert.pfx existe, sinon creation)...
if not exist cert.pfx (
  powershell -ExecutionPolicy Bypass -File scripts\generate-cert.ps1
)
powershell -ExecutionPolicy Bypass -Command "$pwd=Read-Host 'Mot de passe PFX (si tu viens de le creer, retape-le)' -AsSecureString; Import-PfxCertificate -FilePath cert.pfx -CertStoreLocation Cert:\CurrentUser\My -Password $pwd | Out-Null; $c=Get-ChildItem Cert:\CurrentUser\My | Where-Object {$_.Subject -like '*LUMIERE*'} | Select-Object -First 1; $sdk=Get-ChildItem '${env:ProgramFiles(x86)}\Windows Kits\10\bin' -Recurse -Filter signtool.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName; if($sdk){ Get-ChildItem -Recurse -Filter *.exe src-tauri\target\release\bundle | ForEach-Object { & $sdk sign /sha1 $c.Thumbprint /tr http://timestamp.digicert.com /td sha256 /fd sha256 /v $_.FullName } ; Write-Host 'Signe OK' } else { Write-Host 'signtool introuvable, .exe non signe mais utilisable' }"
echo [6/6] Copie vers dist-exe...
if not exist dist-exe mkdir dist-exe
copy /Y src-tauri\target\release\bundle\nsis\*.exe dist-exe\ 2>nul
copy /Y src-tauri\target\release\LUMIERE.exe dist-exe\ 2>nul
copy /Y cert.cer dist-exe\ 2>nul
powershell -Command "Get-ChildItem dist-exe\*.exe | ForEach-Object { (Get-FileHash $_.FullName -Algorithm SHA256).Hash + '  ' + $_.Name } | Out-File dist-exe\SHA256SUMS.txt"
echo.
echo TERMINE ! Ouvre le dossier dist-exe :
echo  - LUMIERE-Setup.exe = installateur
echo  - LUMIERE.exe = portable
echo  - cert.cer = a installer chez tes proches (Racines de confiance) pour enlever l'alerte
echo  - SHA256SUMS.txt = empreintes a publier
explorer dist-exe
pause
