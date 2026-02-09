#!/usr/bin/env pwsh
# Application de Gestion des Rendez-vous Médicaux - Script de démarrage

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🏥 Gestion des Rendez-vous Médicaux v1.0.0              ║" -ForegroundColor Cyan
Write-Host "║         Démarrage de l'Application...                       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier Node.js
Write-Host "⏳ Vérification de Node.js..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js n'est pas installé!" -ForegroundColor Red
    Write-Host "📥 Télécharger depuis: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour fermer"
    exit 1
}
Write-Host "✓ Node.js $(node --version)" -ForegroundColor Green

# Vérifier NPM
Write-Host "⏳ Vérification de NPM..." -ForegroundColor Yellow
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ NPM n'est pas installé!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ NPM $(npm --version)" -ForegroundColor Green

Write-Host ""

# Aller au dossier du projet
Set-Location $PSScriptRoot

# Installer les dépendances si nécessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
    Write-Host "✓ Dépendances installées" -ForegroundColor Green
} else {
    Write-Host "✓ Dépendances déjà installées" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Démarrage du serveur..." -ForegroundColor Green
Write-Host "   => http://localhost:5002" -ForegroundColor Cyan
Write-Host "   => Appuyez sur CTRL+C pour arrêter" -ForegroundColor Yellow
Write-Host ""

# Démarrer le serveur
node server/server.js
