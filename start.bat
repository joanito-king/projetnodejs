@echo off
REM Script de démarrage pour Windows

cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║     🏥 Application de Gestion des Rendez-vous Médicaux 🏥     ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo ⏳ Vérification des prérequis...
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js n'est pas installé!
    echo Télécharger depuis: https://nodejs.org
    pause
    exit /b 1
)

echo ✓ Node.js trouvé
node --version

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm n'est pas installé!
    pause
    exit /b 1
)

echo ✓ npm trouvé
npm --version
echo.

if not exist "node_modules" (
    echo 📦 Installation des dépendances...
    call npm install
    echo.
)

echo ✓ Dépendances installées
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📝 Configuration requise:
echo.
echo 1️⃣  S'assurer que MySQL est en cours d'exécution
echo     - Windows: Services ^(services.msc^) → MySQL
echo     - Ou: XAMPP/WAMP/MAMP
echo.
echo 2️⃣  Initialiser la base de données ^(si pas déjà fait^)
echo     - Exécuter setup.sql dans MySQL Workbench
echo.
echo 3️⃣  Vérifier .env pour les paramètres MySQL
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 🚀 Démarrage du serveur sur http://localhost:5000
echo    Appuyez sur Ctrl+C pour arrêter
echo.

call npm start

pause
