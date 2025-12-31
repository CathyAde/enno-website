const { Sequelize } = require("sequelize");
require('dotenv').config(); // ⚠️ Important : charge le .env

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => console.log("💾 PostgreSQL connecté avec succès"))
  .catch(err => console.error("❌ Erreur connexion PostgreSQL :", err));

module.exports = sequelize;
