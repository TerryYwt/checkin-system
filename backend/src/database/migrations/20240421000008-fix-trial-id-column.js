'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First check if the column exists
    const tableInfo = await queryInterface.describeTable('users');
    
    // If trialId exists, rename it to trial_id
    if (tableInfo.trialId) {
      await queryInterface.renameColumn('users', 'trialId', 'trial_id');
    }
    // If neither exists, add trial_id
    else if (!tableInfo.trial_id) {
      await queryInterface.addColumn('users', 'trial_id', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        validate: {
          len: [6, 20],
          is: /^[a-zA-Z0-9]+$/
        }
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('users');
    
    if (tableInfo.trial_id) {
      await queryInterface.removeColumn('users', 'trial_id');
    }
  }
}; 