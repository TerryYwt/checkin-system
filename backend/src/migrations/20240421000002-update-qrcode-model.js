'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to QRCodes table
    await queryInterface.addColumn('QRCodes', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('QRCodes', 'content', {
      type: Sequelize.TEXT,
      allowNull: false
    });

    await queryInterface.addColumn('QRCodes', 'expiresAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('QRCodes', 'usageCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // Modify type column to be an ENUM
    await queryInterface.changeColumn('QRCodes', 'type', {
      type: Sequelize.ENUM('checkin', 'promotion', 'reward', 'other'),
      allowNull: false
    });

    // Add indexes
    await queryInterface.addIndex('QRCodes', ['createdBy']);
    await queryInterface.addIndex('QRCodes', ['expiresAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('QRCodes', 'createdBy');
    await queryInterface.removeColumn('QRCodes', 'content');
    await queryInterface.removeColumn('QRCodes', 'expiresAt');
    await queryInterface.removeColumn('QRCodes', 'usageCount');
    
    // Revert type column to STRING
    await queryInterface.changeColumn('QRCodes', 'type', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
}; 