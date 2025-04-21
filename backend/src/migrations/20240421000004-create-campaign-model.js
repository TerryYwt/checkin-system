'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('campaigns', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      merchant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'merchants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('discount', 'points', 'gift', 'trial'),
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'paused', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft'
      },
      rules: {
        type: Sequelize.JSON,
        allowNull: true
      },
      rewards: {
        type: Sequelize.JSON,
        allowNull: true
      },
      target_audience: {
        type: Sequelize.JSON,
        allowNull: true
      },
      budget: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      spent: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      metrics: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })

    // Add indexes
    await queryInterface.addIndex('campaigns', ['merchant_id'])
    await queryInterface.addIndex('campaigns', ['status'])
    await queryInterface.addIndex('campaigns', ['type'])
    await queryInterface.addIndex('campaigns', ['start_date'])
    await queryInterface.addIndex('campaigns', ['end_date'])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('campaigns')
  }
} 