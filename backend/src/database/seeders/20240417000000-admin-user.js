'use strict';
const bcryptjs = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcryptjs.hash('Test@123', 10);
    const now = new Date();
    
    await queryInterface.bulkInsert('users', [{
      username: 'admin',
      password: hashedPassword,
      email: 'admin@checkin.com',
      role: 'admin',
      status: 'active',
      refresh_token: null,
      last_login: null,
      created_at: now,
      updated_at: now
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { username: 'admin' }, {});
  }
}; 