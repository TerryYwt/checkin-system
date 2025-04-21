const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Campaign = sequelize.define('Campaign', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    merchant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'merchants',
        key: 'id'
      }
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'stores',
        key: 'id'
      }
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
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
      type: DataTypes.ENUM('discount', 'points', 'gift', 'trial'),
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'paused', 'completed', 'cancelled'),
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
    target_audience: {
      type: DataTypes.JSON,
      allowNull: true
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    spent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    metrics: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'campaigns',
    timestamps: true,
    underscored: true
  })

  Campaign.associate = (models) => {
    Campaign.belongsTo(models.Merchant, {
      foreignKey: 'merchant_id',
      as: 'merchant',
      underscored: true
    })
    Campaign.belongsTo(models.Store, {
      foreignKey: 'store_id',
      as: 'store',
      underscored: true
    })
    Campaign.hasMany(models.QRCode, {
      foreignKey: 'campaign_id',
      as: 'qrcodes',
      underscored: true
    })
    Campaign.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
      underscored: true
    })
  }

  return Campaign
} 