'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('visitors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ip: {
        type: Sequelize.STRING,
        allowNull: false
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      page: {
        type: Sequelize.STRING,
        allowNull: false
      },
      referer: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sessionId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Ajouter les index
    await queryInterface.addIndex('visitors', ['ip']);
    await queryInterface.addIndex('visitors', ['page']);
    await queryInterface.addIndex('visitors', ['createdAt']);
    await queryInterface.addIndex('visitors', ['sessionId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('visitors');
  }
};