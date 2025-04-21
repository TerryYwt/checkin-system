'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('qrcodes', 'campaign_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'campaigns',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('qrcodes', 'campaign_id');
  }
}; 