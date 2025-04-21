const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Checkin = sequelize.define('Checkin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'stores',
        key: 'id'
      }
    },
    campaign_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'campaigns',
        key: 'id'
      }
    },
    checkin_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    points_earned: {
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
    tableName: 'checkins',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['store_id']
      },
      {
        fields: ['campaign_id']
      },
      {
        fields: ['checkin_time']
      }
    ]
  });

  Checkin.associate = (models) => {
    Checkin.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'checkinUser'
    });
    Checkin.belongsTo(models.Store, {
      foreignKey: 'store_id',
      as: 'checkinStore'
    });
    Checkin.belongsTo(models.Campaign, {
      foreignKey: 'campaign_id',
      as: 'campaign',
      allowNull: true
    });
  };

  return Checkin;
}; 