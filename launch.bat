@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║     🏥 Gestion des Rendez-vous Médicaux v1.0.0           ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js n'est pas installé!
    echo.
    echo Veuillez installer Node.js depuis: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✓ Node.js détecté: 
node --version
echo.

REM Vérifier et installer les dépendances
if not exist "node_modules" (
    echo 📦 Installation des dépendances...
    call npm install
    if errorlevel 1 (
        echo ✗ Erreur lors de l'installation
        pause
        exit /b 1
    )
    echo ✓ Dépendances installées
    echo.
)

REM Vérifier MySQL
echo Vérification de MySQL...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ⚠ MySQL ne semble pas installé ou non accessible
    echo   L'application va fonctionner si MySQL est accessible sur localhost
    echo.
)

REM Démarrer l'application
echo 🚀 Démarrage de l'application...
echo.
timeout /t 2 >nul

REM Ouvrir le navigateur
start http://localhost:5002

REM Lancer le serveur
call npm start
