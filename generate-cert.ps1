# Genere UNE SEULE FOIS le certificat auto-signe. Ne pas relancer a chaque build.
$pwdPlain = Read-Host "Mot de passe pour le PFX (a mettre dans SIGNING_PFX_PASSWORD)" -AsSecureString
$cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=LUMIERE Personnel" -CertStoreLocation Cert:\CurrentUser\My -NotAfter (Get-Date).AddYears(3) -KeyUsage DigitalSignature -FriendlyName "LUMIERE Code Signing"
Export-PfxCertificate -Cert $cert -FilePath "$PSScriptRoot\..\cert.pfx" -Password $pwdPlain | Out-Null
Export-Certificate -Cert $cert -FilePath "$PSScriptRoot\..\cert.cer" | Out-Null
Write-Host "OK — Thumbprint : $($cert.Thumbprint)"
Write-Host "Pour GitHub Secrets, encode en base64 : [Convert]::ToBase64String([IO.File]::ReadAllBytes('cert.pfx'))"
