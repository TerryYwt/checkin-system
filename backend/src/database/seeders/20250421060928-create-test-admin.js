'use strict';

const bcryptjs = require('bcryptjs');
const testAccounts = require('../../config/test-accounts');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcryptjs.hash(process.env.TEST_ADMIN_PASSWORD, 10);
    
    // Check if test admin already exists
    const existingUser = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE username = '${testAccounts.admin.username}'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingUser.length === 0) {
      await queryInterface.bulkInsert('users', [{
        username: testAccounts.admin.username,
        password: hashedPassword,
        email: testAccounts.admin.email,
        role: testAccounts.admin.role,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }], {});
      console.log('Test admin user created successfully');
    } else {
      console.log('Test admin user already exists');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { username: testAccounts.admin.username }, {});
  }
};
