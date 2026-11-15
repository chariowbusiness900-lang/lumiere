# LUMIERE — Lecteur de Musique Windows 11
Lecteur local, design Fluent, theme adaptatif a la pochette. Tauri 2 + WebView2.
Fichiers locaux uniquement : MP3, FLAC, M4A, OGG, WAV.

## METHODE RAPIDE — 1 fichier, 1 double-clic (sur Windows)
1. Dezippe ce dossier sur Windows 11
2. Double-clique sur `CREER-EXE.bat`
3. Le script installe Node + Rust si besoin, build, signe en auto-signe, et cree :
   - `dist-exe/LUMIERE.exe` (portable)
   - `dist-exe/LUMIERE-Setup.exe` (installateur NSIS)
   - `dist-exe/SHA256SUMS.txt`
   - `dist-exe/cert.cer` (a partager avec tes proches)

## METHODE GITHUB — Release automatique
1. Push ce dossier sur GitHub
2. Genere le certificat UNE SEULE FOIS : double-clique `scripts/generate-cert.ps1` ou lance-le en PowerShell
3. Dans GitHub > Settings > Secrets > Actions, ajoute :
   - SIGNING_PFX_BASE64 : contenu de cert.pfx en base64
   - SIGNING_PFX_PASSWORD : mot de passe du PFX
4. `git tag v1.0.0` puis `git push origin v1.0.0`
5. GitHub Actions build sur windows-latest, signe, publie la Release.

## Cas 3 — Auto-signe (perso / proches)
Windows affichera « editeur inconnu » chez les autres tant qu'ils n'installent pas cert.cer.
Dans la Release : .exe + installateur + cert.cer + SHA256SUMS.txt
Note pour tes proches : « Informations complementaires -> Executer quand meme ».

## Fonctionnement
- Dossiers choisis une fois, memorises. Dossier Musique Windows propose au 1er lancement.
- A chaque ouverture : scan incremental en arriere-plan (chemin / taille / date modif).
- Surveillance dossiers en direct.
- Filtres par defaut : < 60s OU < 100 Ko -> ignore. Modifiables dans Parametres.
- Ecran « Fichiers ignores » avec bouton « Forcer l'ajout ».
