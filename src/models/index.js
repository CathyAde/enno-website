require('dotenv').config();
const { Sequelize } = require('sequelize');

// On force le mot de passe en string pour éviter l'erreur SASL
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

module.exports = {
  sequelize,
  Sequelize
};

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
