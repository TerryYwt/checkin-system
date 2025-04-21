'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to Settings table
    await queryInterface.addColumn('Settings', 'updatedBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('Settings', 'storeId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Stores',
        key: 'id'
      }
    });

    await queryInterface.addColumn('Settings', 'merchantId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Merchants',
        key: 'id'
      }
    });

    await queryInterface.addColumn('Settings', 'type', {
      type: Sequelize.ENUM('string', 'number', 'boolean', 'json', 'array'),
      allowNull: false,
      defaultValue: 'string'
    });

    // Add indexes
    await queryInterface.addIndex('Settings', ['updatedBy']);
    await queryInterface.addIndex('Settings', ['storeId']);
    await queryInterface.addIndex('Settings', ['merchantId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Settings', 'updatedBy');
    await queryInterface.removeColumn('Settings', 'storeId');
    await queryInterface.removeColumn('Settings', 'merchantId');
    await queryInterface.removeColumn('Settings', 'type');
  }
}; 