'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('settings', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      store_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Stores',
          key: 'id'
        }
      },
      merchant_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'merchants',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('settings', ['key']);
    await queryInterface.addIndex('settings', ['updated_by']);
    await queryInterface.addIndex('settings', ['store_id']);
    await queryInterface.addIndex('settings', ['merchant_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('settings');
  }
}; 