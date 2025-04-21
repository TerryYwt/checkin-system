'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const columns = await queryInterface.describeTable('campaigns');
    
    if (!columns.created_by) {
      await queryInterface.addColumn('campaigns', 'created_by', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });

      // Add index for created_by
      await queryInterface.addIndex('campaigns', ['created_by'], {
        name: 'campaigns_created_by_idx',
        unique: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('campaigns', 'campaigns_created_by_idx').catch(() => {});
    await queryInterface.removeColumn('campaigns', 'created_by').catch(() => {});
  }
}; 