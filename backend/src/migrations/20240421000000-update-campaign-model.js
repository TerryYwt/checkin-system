'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to Campaigns table
    await queryInterface.addColumn('Campaigns', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('Campaigns', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    await queryInterface.addColumn('Campaigns', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    // Add index for createdBy
    await queryInterface.addIndex('Campaigns', ['createdBy']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Campaigns', 'createdBy');
    await queryInterface.removeColumn('Campaigns', 'createdAt');
    await queryInterface.removeColumn('Campaigns', 'updatedAt');
  }
}; 