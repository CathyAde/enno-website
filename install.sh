#!/bin/bash

echo "🚀 Installation du site ENNO..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si PostgreSQL est installé
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "📦 Installation des dépendances npm..."
npm install

echo "📁 Création des dossiers nécessaires..."
mkdir -p public/images/uploads

echo "🗄️ Configuration de la base de données..."
echo "Veuillez créer une base de données PostgreSQL nommée 'enno_website'"
echo "Et configurer le fichier .env avec vos paramètres de connexion"

echo "📋 Exemple de fichier .env :"
cat << EOF
# Base de données
DB_HOST=localhost
DB_NAME=enno_website
DB_USER=your_username
DB_PASS=your_password
DATABASE_URL=postgres://user:pass@localhost/enno_website

# Session
SESSION_SECRET=your-super-secret-key-change-this

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@enno-af.com

# Serveur
PORT=3000
NODE_ENV=development
EOF

echo ""
echo "📝 Prochaines étapes :"
echo "1. Créer le fichier .env avec vos paramètres"
echo "2. Exécuter : npx sequelize-cli db:migrate"
echo "3. Créer un admin : node src/createAdmin.js"
echo "4. Démarrer le serveur : npm run dev"

echo ""
echo "✅ Installation terminée !"