const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Disable foreign key checks temporarily
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Drop existing tables if they exist
    await queryInterface.dropTable('RewardRedemptions', { force: true });
    await queryInterface.dropTable('Rewards', { force: true });
    await queryInterface.dropTable('Points', { force: true });
    await queryInterface.dropTable('Checkins', { force: true });
    await queryInterface.dropTable('Campaigns', { force: true });
    await queryInterface.dropTable('QRCodes', { force: true });
    await queryInterface.dropTable('Stores', { force: true });
    await queryInterface.dropTable('Merchants', { force: true });
    await queryInterface.dropTable('Users', { force: true });

    // 1. Create Users table
    await queryInterface.createTable('Users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      role: {
        type: DataTypes.ENUM('admin', 'merchant', 'user'),
        defaultValue: 'user',
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 2. Create Merchants table
    await queryInterface.createTable('Merchants', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      businessName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      contactPerson: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: /^[0-9]{10}$/
        }
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Add unique constraint for userId in Merchants
    await queryInterface.addConstraint('Merchants', {
      fields: ['userId'],
      type: 'unique',
      name: 'merchants_userId_unique'
    });

    // 3. Create Stores table
    await queryInterface.createTable('Stores', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      merchantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Merchants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 4. Create QRCodes table
    await queryInterface.createTable('QRCodes', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      storeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Stores',
          key: 'id'
        }
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 5. Create Campaigns table
    await queryInterface.createTable('Campaigns', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      type: {
        type: DataTypes.ENUM('discount', 'points', 'gift', 'other'),
        allowNull: false,
        defaultValue: 'other'
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('draft', 'active', 'inactive', 'expired'),
        allowNull: false,
        defaultValue: 'draft'
      },
      rules: {
        type: DataTypes.JSON,
        allowNull: true
      },
      rewards: {
        type: DataTypes.JSON,
        allowNull: true
      },
      targetAudience: {
        type: DataTypes.STRING,
        allowNull: true
      },
      storeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Stores',
          key: 'id'
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 6. Create Points table
    await queryInterface.createTable('Points', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      storeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Stores',
          key: 'id'
        }
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      type: {
        type: DataTypes.ENUM('earned', 'redeemed'),
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 7. Create Rewards table
    await queryInterface.createTable('Rewards', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      type: {
        type: DataTypes.ENUM('discount', 'gift', 'service'),
        allowNull: false,
        defaultValue: 'discount'
      },
      pointsCost: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      storeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Stores',
          key: 'id'
        }
      },
      campaignId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Campaigns',
          key: 'id'
        }
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'expired'),
        allowNull: false,
        defaultValue: 'active'
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 8. Create Checkins table
    await queryInterface.createTable('Checkins', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      storeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Stores',
          key: 'id'
        }
      },
      campaignId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Campaigns',
          key: 'id'
        }
      },
      qrcodeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'QRCodes',
          key: 'id'
        }
      },
      checkinTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      pointsEarned: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: DataTypes.ENUM('valid', 'invalid', 'pending'),
        allowNull: false,
        defaultValue: 'valid'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 9. Create RewardRedemptions table
    await queryInterface.createTable('RewardRedemptions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      rewardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Rewards',
          key: 'id'
        }
      },
      storeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Stores',
          key: 'id'
        }
      },
      pointsUsed: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      redemptionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'used', 'expired', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      usedDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('Points', ['userId', 'storeId'], {
      name: 'points_user_store_idx'
    });
    await queryInterface.addIndex('RewardRedemptions', ['userId', 'storeId'], {
      name: 'redemptions_user_store_idx'
    });
    await queryInterface.addIndex('RewardRedemptions', ['rewardId', 'status'], {
      name: 'redemptions_reward_status_idx'
    });
    await queryInterface.addIndex('Checkins', ['userId', 'storeId'], {
      name: 'checkins_user_store_idx'
    });
    await queryInterface.addIndex('Checkins', ['checkinTime'], {
      name: 'checkins_time_idx'
    });

    // Enable foreign key checks
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  },

  async down(queryInterface, Sequelize) {
    // Disable foreign key checks
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Drop all tables in reverse order
    await queryInterface.dropTable('RewardRedemptions', { force: true });
    await queryInterface.dropTable('Rewards', { force: true });
    await queryInterface.dropTable('Points', { force: true });
    await queryInterface.dropTable('Checkins', { force: true });
    await queryInterface.dropTable('Campaigns', { force: true });
    await queryInterface.dropTable('QRCodes', { force: true });
    await queryInterface.dropTable('Stores', { force: true });
    await queryInterface.dropTable('Merchants', { force: true });
    await queryInterface.dropTable('Users', { force: true });

    // Enable foreign key checks
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  }
}; 