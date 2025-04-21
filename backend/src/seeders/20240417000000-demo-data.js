const bcryptjs = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add admin user
    await queryInterface.bulkInsert('Users', [{
      username: 'admin',
      password: await bcryptjs.hash('admin123', 10),
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Add demo store
    await queryInterface.bulkInsert('Stores', [{
      name: 'Demo Store',
      address: '123 Demo Street',
      phone: '123-456-7890',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Add demo QR code
    await queryInterface.bulkInsert('QRCodes', [{
      storeId: 1,
      type: 'checkin',
      description: 'Store check-in QR code',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Add demo campaign
    await queryInterface.bulkInsert('Campaigns', [{
      name: 'Welcome Points',
      description: 'Earn points on your first visit',
      type: 'points',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'active',
      rules: JSON.stringify({
        pointsPerVisit: 100,
        maxPoints: 100
      }),
      rewards: JSON.stringify({
        type: 'points',
        amount: 100
      }),
      targetAudience: 'new_users',
      storeId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Add demo reward
    await queryInterface.bulkInsert('Rewards', [{
      name: 'Welcome Discount',
      description: '10% off on your next purchase',
      type: 'discount',
      pointsCost: 100,
      storeId: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'active',
      quantity: 100,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Rewards', null, {});
    await queryInterface.bulkDelete('Campaigns', null, {});
    await queryInterface.bulkDelete('QRCodes', null, {});
    await queryInterface.bulkDelete('Stores', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
}; 