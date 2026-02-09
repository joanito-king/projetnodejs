#!/bin/bash
# Script de démarrage pour développement

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🏥 Application de Gestion des Rendez-vous Médicaux 🏥     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

echo "⏳ Vérification des prérequis..."
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé!"
    echo "Télécharger depuis: https://nodejs.org"
    exit 1
fi

echo "✓ Node.js trouvé"
node --version

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé!"
    exit 1
fi

echo "✓ npm trouvé"
npm --version
echo ""

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    echo ""
fi

echo "✓ Dépendances installées"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Configuration requise:"
echo ""
echo "1️⃣  S'assurer que MySQL est en cours d'exécution"
echo "    - Windows: Services → MySQL"
echo "    - Ou: XAMPP/WAMP/MAMP"
echo ""
echo "2️⃣  Initialiser la base de données (si pas déjà fait)"
echo "    - Exécuter setup.sql dans MySQL Workbench"
echo ""
echo "3️⃣  Vérifier .env pour les paramètres MySQL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🚀 Démarrage du serveur..."
echo ""

npm start
