const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'toyotadb',
  process.env.DB_USER || 'toyota',
  process.env.DB_PASSWORD || 'newvadas',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    logging: true 
  }
);

module.exports = sequelize;
