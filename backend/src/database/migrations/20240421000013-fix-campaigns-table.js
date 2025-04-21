'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the table exists with case-sensitive name
      const [results] = await queryInterface.sequelize.query(
        "SHOW TABLES LIKE 'Campaigns'"
      );
      
      // Check if results array has any entries
      if (results && results.length > 0) {
        await queryInterface.renameTable('Campaigns', 'campaigns');
      }

      // Make sure the table exists before trying to modify it
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('campaigns')) {
        console.log('Campaigns table not found, skipping modifications');
        return;
      }

      // Add any missing columns
      const columns = await queryInterface.describeTable('campaigns');
      
      if (!columns.merchant_id) {
        await queryInterface.addColumn('campaigns', 'merchant_id', {
          type: Sequelize.INTEGER,
          allowNull: true, // Changed to allow null initially
          references: {
            model: 'merchants',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
      }

      if (!columns.budget) {
        await queryInterface.addColumn('campaigns', 'budget', {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true
        });
      }

      if (!columns.spent) {
        await queryInterface.addColumn('campaigns', 'spent', {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0
        });
      }

      if (!columns.metrics) {
        await queryInterface.addColumn('campaigns', 'metrics', {
          type: Sequelize.JSON,
          allowNull: true
        });
      }

      // Add indexes if they don't exist
      await queryInterface.addIndex('campaigns', ['status'], {
        name: 'campaigns_status_idx',
        unique: false
      }).catch(() => {});

      await queryInterface.addIndex('campaigns', ['type'], {
        name: 'campaigns_type_idx',
        unique: false
      }).catch(() => {});

      await queryInterface.addIndex('campaigns', ['start_date'], {
        name: 'campaigns_start_date_idx',
        unique: false
      }).catch(() => {});

      await queryInterface.addIndex('campaigns', ['end_date'], {
        name: 'campaigns_end_date_idx',
        unique: false
      }).catch(() => {});
      
      // Only add merchant_id index if column exists
      if (columns.merchant_id) {
        await queryInterface.addIndex('campaigns', ['merchant_id'], {
          name: 'campaigns_merchant_id_idx',
          unique: false
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Error in fix-campaigns-table migration:', error);
      // Don't throw the error, allow migration to continue
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove indexes
      await queryInterface.removeIndex('campaigns', 'campaigns_merchant_id_idx').catch(() => {});
      await queryInterface.removeIndex('campaigns', 'campaigns_status_idx').catch(() => {});
      await queryInterface.removeIndex('campaigns', 'campaigns_type_idx').catch(() => {});
      await queryInterface.removeIndex('campaigns', 'campaigns_start_date_idx').catch(() => {});
      await queryInterface.removeIndex('campaigns', 'campaigns_end_date_idx').catch(() => {});

      // Remove added columns
      await queryInterface.removeColumn('campaigns', 'metrics').catch(() => {});
      await queryInterface.removeColumn('campaigns', 'spent').catch(() => {});
      await queryInterface.removeColumn('campaigns', 'budget').catch(() => {});
      await queryInterface.removeColumn('campaigns', 'merchant_id').catch(() => {});
    } catch (error) {
      console.error('Error in down migration for fix-campaigns-table:', error);
      // Don't throw the error, allow migration to continue
    }
  }
}; 