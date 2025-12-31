'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Vérifier si la colonne name existe déjà
    const tableDescription = await queryInterface.describeTable('admins');
    
    if (!tableDescription.name) {
      await queryInterface.addColumn('admins', 'name', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Admin'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('admins', 'name');
  }
};