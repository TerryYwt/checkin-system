'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const settings = [
      {
        id: 'basic',
        key: 'site_name',
        value: 'Check-in System',
        type: 'string',
        description: 'Name of the site',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'email',
        key: 'smtp_host',
        value: 'smtp.gmail.com',
        type: 'string',
        description: 'SMTP host for email',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'security',
        key: 'password_min_length',
        value: '8',
        type: 'number',
        description: 'Minimum password length',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('settings', settings, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('settings', null, {});
  }
}; 