'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert campaign types
    await queryInterface.bulkInsert('CampaignTypes', [
      {
        name: 'points',
        description: 'Points-based loyalty campaign',
        rules_template: JSON.stringify({
          points_per_checkin: 10,
          bonus_rules: [
            {
              type: 'consecutive_days',
              days: 7,
              bonus_points: 50
            }
          ]
        }),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'discount',
        description: 'Discount-based promotion campaign',
        rules_template: JSON.stringify({
          discount_type: 'percentage',
          min_purchase: 100,
          max_discount: 50
        }),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'gift',
        description: 'Gift-based reward campaign',
        rules_template: JSON.stringify({
          points_required: 1000,
          gift_options: [
            {
              name: 'Free Coffee',
              points: 1000
            }
          ]
        }),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Insert sample campaign templates
    await queryInterface.bulkInsert('CampaignTemplates', [
      {
        name: 'Welcome Campaign',
        description: 'New user welcome campaign',
        type: 'points',
        rules: JSON.stringify({
          points_per_checkin: 20,
          duration_days: 30,
          max_points: 200
        }),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Holiday Special',
        description: 'Holiday season promotion',
        type: 'discount',
        rules: JSON.stringify({
          discount_percentage: 20,
          min_purchase: 50,
          valid_dates: {
            start: '2024-12-01',
            end: '2024-12-31'
          }
        }),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove campaign types
    await queryInterface.bulkDelete('CampaignTypes', {
      name: ['points', 'discount', 'gift']
    });

    // Remove campaign templates
    await queryInterface.bulkDelete('CampaignTemplates', {
      name: ['Welcome Campaign', 'Holiday Special']
    });
  }
}; 