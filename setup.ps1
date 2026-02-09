# Gestion RV - Application Setup Script
# Exécuter avec: powershell -ExecutionPolicy Bypass -File setup.ps1

# Vérifier les droits admin
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "⚠ Relancement en tant qu'administrateur..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    🏥 Installation Gestion RV Médicaux v1.0.0              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Vérifier Node.js
Write-Host "Vérification de Node.js..." -ForegroundColor Yellow
$nodePath = Get-Command node -ErrorAction SilentlyContinue

if (-not $nodePath) {
    Write-Host "✗ Node.js n'est pas installé!" -ForegroundColor Red
    Write-Host "Téléchargez-le: https://nodejs.org/`n" -ForegroundColor Yellow
    
    $response = Read-Host "Voulez-vous le télécharger maintenant? (O/N)"
    if ($response -eq "O") {
        Start-Process "https://nodejs.org/"
    }
    exit
}

Write-Host "✓ Node.js: " -ForegroundColor Green -NoNewline
node --version

# Vérifier MySQL
Write-Host "Vérification de MySQL..." -ForegroundColor Yellow
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue

if (-not $mysqlPath) {
    Write-Host "⚠ MySQL non détecté" -ForegroundColor Yellow
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  • XAMPP: https://www.apachefriends.org/" -ForegroundColor Gray
    Write-Host "  • MySQL: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Gray
    Write-Host "  • MariaDB: https://mariadb.org/download/`n" -ForegroundColor Gray
} else {
    Write-Host "✓ MySQL détecté`n" -ForegroundColor Green
}

# Installer les dépendances
Write-Host "Installation des dépendances npm..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit
}
Write-Host "✓ Dépendances installées`n" -ForegroundColor Green

# Créer le dossier d'installation
$installPath = "$env:ProgramFiles\GestionRV"
Write-Host "Création de l'installation en: $installPath" -ForegroundColor Yellow

if (-not (Test-Path $installPath)) {
    New-Item -ItemType Directory -Path $installPath -Force | Out-Null
}

# Copier les fichiers
Write-Host "Copie des fichiers..." -ForegroundColor Yellow
Copy-Item -Path ".\*" -Destination $installPath -Recurse -Force
Write-Host "✓ Fichiers copiés`n" -ForegroundColor Green

# Créer un raccourci sur le Bureau
Write-Host "Création du raccourci sur le Bureau..." -ForegroundColor Yellow
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\GestionRV.lnk")
$Shortcut.TargetPath = "$installPath\launch.bat"
$Shortcut.WorkingDirectory = $installPath
$Shortcut.IconLocation = "$env:systemroot\System32\imageres.dll,20"
$Shortcut.Save()
Write-Host "✓ Raccourci créé`n" -ForegroundColor Green

# Résumé
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ ✓ Installation réussie!                                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📍 Installation: $installPath" -ForegroundColor Green
Write-Host "🖥️  Raccourci: Desktop\GestionRV.lnk`n" -ForegroundColor Green

Write-Host "UTILISATION:" -ForegroundColor Yellow
Write-Host "1. Double-cliquez sur GestionRV.lnk sur le Bureau"
Write-Host "2. L'application s'ouvrira automatiquement`n" -ForegroundColor Gray

Write-Host "IDENTIFIANTS DE TEST:" -ForegroundColor Yellow
Write-Host "  🔐 Secrétaire: Sophie / Danty" -ForegroundColor Gray
Write-Host "  🔐 Médecins: Goku / Danty" -ForegroundColor Gray
Write-Host "  🔐 Médecins: Mouha / Danty" -ForegroundColor Gray
Write-Host "  🔐 Médecins: Hercule / Danty`n" -ForegroundColor Gray

Write-Host "Démarrage de l'application..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Lancer l'app
Set-Location $installPath
npm start
