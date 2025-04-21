'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('qrcodes', 'scan_limit', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('qrcodes', 'scan_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('qrcodes', 'scan_limit');
    await queryInterface.removeColumn('qrcodes', 'scan_count');
  }
}; 