require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize } = require('../src/models');

async function initDatabase() {
  try {
    // Vérifier la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à PostgreSQL établie');
    
    // Synchroniser les modèles
    await sequelize.sync({ force: true });
    console.log('✅ Base de données synchronisée');
    
    // Créer un admin par défaut
    const Admin = require('../src/models/Admin')(sequelize, require('sequelize').DataTypes);
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await Admin.create({
      email: 'admin@enno.com',
      password: hashedPassword,
      name: 'Administrateur ENNO'
    });
    
    console.log('✅ Admin créé: admin@enno.com / admin123');
    
    // Créer des exemples de contenu
    const Content = require('../src/models/Content')(sequelize, require('sequelize').DataTypes);
    
    await Content.bulkCreate([
      {
        title: 'Nos expertises',
        text: 'Solutions clés en main : étude, installation, solaire, maintenance et support.',
        page: 'services'
      },
      {
        title: 'À propos de ENNO',
        text: 'Energies Nouvelles (ENNO) est spécialisée dans les solutions énergétiques modernes et durables au Congo.',
        page: 'about'
      },
      {
        title: 'Bienvenue chez ENNO',
        text: 'Solutions énergétiques fiables pour entreprises et particuliers au Congo',
        page: 'home'
      }
    ]);
    
    console.log('✅ Exemples de contenu créés');
    
    // Créer des exemples de services
    const Service = require('../src/models/Service')(sequelize, require('sequelize').DataTypes);
    
    await Service.bulkCreate([
      {
        title: 'Installation électrique',
        description: 'Conception et installation de systèmes électriques pour maisons, bureaux et entreprises.',
        category: 'Électricité'
      },
      {
        title: 'Solaire & Énergies renouvelables',
        description: 'Installation de panneaux solaires et solutions hybrides pour réduire vos coûts d\'énergie.',
        category: 'Solaire'
      },
      {
        title: 'Maintenance & Dépannage',
        description: 'Interventions rapides, maintenance préventive et corrective pour tous vos équipements.',
        category: 'Maintenance'
      },
      {
        title: 'Études & Conseils',
        description: 'Analyse, audit énergétique et accompagnement sur vos projets d\'installation.',
        category: 'Conseil'
      }
    ]);
    
    console.log('✅ Exemples de services créés');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

initDatabase();l