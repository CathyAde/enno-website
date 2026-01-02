#!/bin/bash

echo "🚀 Build script pour Render"

# Installer les dépendances
npm install

# Synchroniser la base de données et créer l'admin
node -e "
const { sequelize, Admin, Content } = require('./src/models/index');
const bcrypt = require('bcrypt');

async function setup() {
  try {
    console.log('🔄 Synchronisation base de données...');
    await sequelize.sync({ force: false });
    console.log('✅ Base synchronisée');
    
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
    
    console.log('✅ Setup terminé');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur setup:', error);
    process.exit(1);
  }
}

setup();
"

echo "✅ Build terminé"