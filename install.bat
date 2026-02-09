@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║    🏥 Installation Gestion RV Médicaux v1.0.0             ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Vérifier privilèges administrateur
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠ Droits administrateur requis
    echo Relancement en tant qu'administrateur...
    powershell -Command "Start-Process cmd -ArgumentList '/c cd /d %cd% && %~f0' -Verb RunAs"
    exit /b
)

REM Vérifier Node.js
echo Vérification de Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js n'est pas installé!
    echo.
    echo Installation de Node.js en cours...
    REM Télécharger et installer Node.js
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi' -OutFile '%temp%\node-setup.msi'; Start-Process '%temp%\node-setup.msi' -Wait"
    
    REM Vérifier à nouveau
    node --version >nul 2>&1
    if errorlevel 1 (
        echo ✗ Installation de Node.js échouée
        echo Veuillez installer manuellement: https://nodejs.org/
        pause
        exit /b 1
    )
)

echo ✓ Node.js détecté: 
node --version
echo.

REM Vérifier MySQL
echo Vérification de MySQL...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ⚠ MySQL n'a pas été détecté
    echo.
    echo Options:
    echo 1. XAMPP/WAMP: https://www.apachefriends.org/
    echo 2. MySQL Community: https://dev.mysql.com/downloads/mysql/
    echo 3. MariaDB: https://mariadb.org/download/
    echo.
    set /p install="Voulez-vous continuer? (O/N) "
    if /i not "!install!"=="O" exit /b 1
) else (
    echo ✓ MySQL détecté
)
echo.

REM Créer le dossier d'installation
set "installPath=%ProgramFiles%\GestionRV"
echo Préparation de l'installation...
if not exist "!installPath!" mkdir "!installPath!"

REM Copier les fichiers
echo Copie des fichiers...
xcopy /E /I /Y "." "!installPath!" >nul

REM Créer un raccourci sur le Bureau
echo Création du raccourci...
powershell -Command "
\$WshShell = New-Object -ComObject WScript.Shell
\$Shortcut = \$WshShell.CreateShortcut('%userprofile%\Desktop\GestionRV.lnk')
\$Shortcut.TargetPath = '!installPath!\launch.bat'
\$Shortcut.WorkingDirectory = '!installPath!'
\$Shortcut.IconLocation = '%systemroot%\System32\imageres.dll,20'
\$Shortcut.Save()
"

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║ ✓ Installation réussie!                                  ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 📍 Installation: !installPath!
echo 🖥️  Raccourci: Desktop\GestionRV.lnk
echo.
echo Utilisation:
echo 1. Double-cliquez sur GestionRV.lnk
echo 2. L'application s'ouvrira automatiquement
echo.
echo Identifiants de test:
echo • Secrétaire: Sophie / Danty
echo • Médecins: Goku/Mouha/Hercule / Danty
echo.
pause
