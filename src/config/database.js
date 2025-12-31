require('dotenv').config();

module.exports = {
  development: {
    database: process.env.DB_NAME || 'enno-db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '123456',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    logging: false
  }
};