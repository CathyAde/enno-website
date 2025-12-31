#!/bin/bash

echo "🚀 Installation finale du site ENNO"
echo "=================================="

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# Synchronisation de la base de données
echo "💾 Synchronisation de la base de données..."
node -e "
const { sequelize, Admin, Content, Service, ContactMessage, Visitor, Projet } = require('./src/models/index');
const bcrypt = require('bcrypt');

async function setup() {
  try {
    await sequelize.sync({ force: false });
    console.log('✅ Base de données synchronisée');
    
    // Créer admin par défaut
    const adminExists = await Admin.findOne({ where: { email: 'admin@enno.com' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        name: 'Admin ENNO',
        email: 'admin@enno.com',
        password: hashedPassword
      });
      console.log('✅ Admin créé: admin@enno.com / admin123');
    }
    
    // Créer contenu par défaut
    await Content.upsert({
      page: 'accueil',
      title: 'ENNO - Solutions Énergétiques',
      subtitle: 'Votre partenaire en énergie depuis 2008',
      text: 'ENNO accompagne les entreprises et particuliers dans leurs projets énergétiques avec expertise et professionnalisme.'
    });
    
    await Content.upsert({
      page: 'services',
      title: 'Nos Services',
      subtitle: 'Des solutions complètes pour tous vos besoins',
      text: 'Installation solaire, maintenance, études techniques et accompagnement personnalisé.'
    });
    
    await Content.upsert({
      page: 'apropos',
      title: 'À propos d\'ENNO',
      subtitle: 'Une entreprise engagée pour l\'avenir énergétique',
      text: 'Fondée en 2008, ENNO est spécialisée dans les solutions énergétiques durables en République du Congo.'
    });
    
    console.log('✅ Contenu par défaut créé');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

setup();
"

echo ""
echo "🎉 Installation terminée !"
echo ""
echo "📋 Informations importantes :"
echo "• URL du site: http://localhost:3000"
echo "• Admin: http://localhost:3000/admin/login"
echo "• Email admin: admin@enno.com"
echo "• Mot de passe: admin123"
echo ""
echo "🚀 Pour démarrer le serveur :"
echo "npm start"