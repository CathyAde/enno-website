'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Vérifier si la colonne section existe déjà
    const tableDescription = await queryInterface.describeTable('contents');
    
    if (!tableDescription.section) {
      await queryInterface.addColumn('contents', 'section', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    // Ajouter des index uniques pour page et section
    try {
      await queryInterface.addIndex('contents', {
        fields: ['page'],
        unique: true,
        where: {
          page: { [Sequelize.Op.ne]: null }
        },
        name: 'contents_page_unique'
      });
    } catch (error) {
      console.log('Index page déjà existant ou erreur:', error.message);
    }

    try {
      await queryInterface.addIndex('contents', {
        fields: ['section'],
        unique: true,
        where: {
          section: { [Sequelize.Op.ne]: null }
        },
        name: 'contents_section_unique'
      });
    } catch (error) {
      console.log('Index section déjà existant ou erreur:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Supprimer les index
    try {
      await queryInterface.removeIndex('contents', 'contents_page_unique');
    } catch (error) {
      console.log('Erreur suppression index page:', error.message);
    }

    try {
      await queryInterface.removeIndex('contents', 'contents_section_unique');
    } catch (error) {
      console.log('Erreur suppression index section:', error.message);
    }

    // Supprimer la colonne section
    await queryInterface.removeColumn('contents', 'section');
  }
};