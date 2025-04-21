const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Setting = sequelize.define('Setting', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Stores',
        key: 'id'
      }
    },
    merchant_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'merchants',
        key: 'id'
      }
    }
  }, {
    tableName: 'settings',
    timestamps: true,
    underscored: true
  });

  Setting.associate = (models) => {
    Setting.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });
    Setting.belongsTo(models.Store, {
      foreignKey: 'store_id',
      as: 'store'
    });
    Setting.belongsTo(models.Merchant, {
      foreignKey: 'merchant_id',
      as: 'merchant'
    });
  };

  return Setting;
}; 