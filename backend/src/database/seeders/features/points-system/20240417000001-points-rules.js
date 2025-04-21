'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert points system settings
    await queryInterface.bulkInsert('Settings', [
      {
        key: 'points_expiry_days',
        value: '365',
        type: 'system',
        description: 'Number of days before points expire',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'min_points_redemption',
        value: '100',
        type: 'system',
        description: 'Minimum points required for redemption',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'points_per_checkin',
        value: '10',
        type: 'system',
        description: 'Points earned per check-in',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Insert points earning rules
    await queryInterface.bulkInsert('PointsRules', [
      {
        name: 'First Check-in Bonus',
        description: 'Extra points for first check-in',
        points: 50,
        type: 'bonus',
        conditions: JSON.stringify({
          checkin_count: 1,
          time_period: 'lifetime'
        }),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Consecutive Check-ins',
        description: 'Bonus for consecutive check-ins',
        points: 20,
        type: 'bonus',
        conditions: JSON.stringify({
          consecutive_days: 7,
          time_period: 'weekly'
        }),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove points system settings
    await queryInterface.bulkDelete('Settings', {
      key: ['points_expiry_days', 'min_points_redemption', 'points_per_checkin']
    });

    // Remove points rules
    await queryInterface.bulkDelete('PointsRules', {
      name: ['First Check-in Bonus', 'Consecutive Check-ins']
    });
  }
}; 