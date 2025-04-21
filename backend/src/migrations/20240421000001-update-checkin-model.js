'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to Checkins table
    await queryInterface.addColumn('Checkins', 'campaignId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Campaigns',
        key: 'id'
      }
    });

    await queryInterface.addColumn('Checkins', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    await queryInterface.addColumn('Checkins', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    // Add index for campaignId
    await queryInterface.addIndex('Checkins', ['campaignId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Checkins', 'campaignId');
    await queryInterface.removeColumn('Checkins', 'createdAt');
    await queryInterface.removeColumn('Checkins', 'updatedAt');
  }
}; 