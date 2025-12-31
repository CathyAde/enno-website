require('dotenv').config();
const { Sequelize } = require('sequelize');

// On force le mot de passe en string pour éviter l'erreur SASL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  String(process.env.DB_PASS), // ⚡ important
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('💾 PostgreSQL connecté avec succès');
  } catch (err) {
    console.error('❌ Impossible de se connecter à PostgreSQL:', err);
  }
};

// Importer tous les modèles
const Admin = require('./Admin')(sequelize, Sequelize.DataTypes);
const Content = require('./Content')(sequelize, Sequelize.DataTypes);
const Service = require('./Service')(sequelize, Sequelize.DataTypes);
const ContactMessage = require('./ContactMessage')(sequelize, Sequelize.DataTypes);
const Visitor = require('./Visitor')(sequelize, Sequelize.DataTypes);
const Projet = require('./Projet')(sequelize, Sequelize.DataTypes);

testConnection();

module.exports = { 
  sequelize, 
  Admin, 
  Content, 
  Service, 
  ContactMessage, 
  Visitor,
  Projet
};
