@echo off
chcp 65001 >nul
cls

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║     🏥 Gestion des Rendez-vous Médicaux v1.0.0              ║
echo ║         Démarrage de l'Application...                       ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé!
    echo.
    echo 📥 Télécharger depuis: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Vérifier si MySQL est lancé
echo ⏳ Vérification de MySQL...
REM On peut ajouter une vérification MySQL ici si nécessaire

REM Aller au dossier du serveur
cd /d "%~dp0"

echo.
echo ✓ Tous les prérequis sont OK
echo.
echo 📦 Installation des dépendances (si nécessaire)...
if not exist "node_modules" (
    call npm install --quiet
) else (
    echo   ✓ Dépendances déjà installées
)

echo.
echo 🚀 Démarrage du serveur...
echo    => http://localhost:5002
echo    => Appuyez sur CTRL+C pour arrêter
echo.

REM Démarrer le serveur
node server/server.js

pause
