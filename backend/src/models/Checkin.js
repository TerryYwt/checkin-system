const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Checkin = sequelize.define('Checkin', {
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
    checkinTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    pointsEarned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 1000
      }
    },
    status: {
      type: DataTypes.ENUM('valid', 'invalid', 'pending'),
      allowNull: false,
      defaultValue: 'valid'
    },
    location: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: true
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['storeId']
      },
      {
        fields: ['campaignId']
      },
      {
        fields: ['checkinTime']
      }
    ]
  });

  Checkin.associate = (models) => {
    Checkin.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'checkinUser'
    });
    Checkin.belongsTo(models.Store, {
      foreignKey: 'storeId',
      as: 'checkinStore'
    });
    Checkin.belongsTo(models.Campaign, {
      foreignKey: 'campaignId',
      as: 'campaign',
      allowNull: true
    });
  };

  return Checkin;
}; 