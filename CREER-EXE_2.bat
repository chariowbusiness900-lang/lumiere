@echo off
REM LUMIERE — Double-clic pour creer le .exe sur Windows 11
setlocal
title LUMIERE - Creation du .exe
echo ==========================================
echo  LUMIERE - Creation du .exe
echo ==========================================

REM [0/6] Verif Build Tools C++ (link.exe) — OBLIGATOIRE pour Tauri/Rust
where link.exe >nul 2>&1
if %errorlevel% neq 0 (
  echo.
  echo [!] link.exe introuvable -> Il manque Visual Studio Build Tools C++.
  echo [!] VS Code ne suffit pas, il faut les Build Tools.
  echo.
  echo [0/6] Installation des Build Tools C++ (environ 3-5 Go, 5-15 min)...
  echo      Si Windows te demande une autorisation, clique Oui.
  winget install -e --id Microsoft.VisualStudio.2022.BuildTools --accept-source-agreements --accept-package-agreements --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
  echo.
  echo [0/6] Verif apres installation...
  where link.exe >nul 2>&1
  if %errorlevel% neq 0 (
    echo.
    echo ==================================================
    echo  Build Tools installes mais link.exe pas encore visible.
    echo  1. REDEMARRE ton PC
    echo  2. Relance CREER-EXE.bat
    echo ==================================================
    pause
    exit /b 1
  )
)
echo [0/6] Build Tools C++ OK - link.exe trouve.

REM Charge l'environnement VC++ si dispo (pour que Rust trouve link.exe)
if exist "%ProgramFiles%\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat" call "%ProgramFiles%\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat" >nul
if exist "%ProgramFiles%\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" call "%ProgramFiles%\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" >nul
if exist "%ProgramFiles(x86)%\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat" call "%ProgramFiles(x86)%\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat" >nul

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
REM S'assure que Rust utilise bien le toolchain MSVC
call rustup default stable-msvc 2>nul
call rustup target add x86_64-pc-windows-msvc 2>nul

echo [3/6] Installation des dependances...
call npm ci
if %errorlevel% neq 0 call npm install
call npm install-scripts approve esbuild 2>nul

echo [4/6] Build Tauri...
call npm run tauri build
if %errorlevel% neq 0 (
  echo.
  echo ERREUR pendant le build. Lis le message au-dessus.
  echo Si c'est encore link.exe : redemarre ton PC et relance CREER-EXE.bat
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
echo  - cert.cer = a installer chez tes proches (Racines de confiance)
echo  - SHA256SUMS.txt = empreintes a publier
explorer dist-exe
pause
