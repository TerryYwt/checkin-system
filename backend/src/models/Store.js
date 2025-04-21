const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Store = sequelize.define('Store', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    merchant_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Merchants',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[0-9]{10}$/ // Taiwan phone number format
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'stores',
    underscored: true
  });

  Store.associate = (models) => {
    Store.belongsTo(models.Merchant, {
      foreignKey: 'merchant_id',
      as: 'merchant',
      onDelete: 'SET NULL',
      underscored: true
    });
    Store.hasMany(models.QRCode, {
      foreignKey: 'store_id',
      as: 'qrcodes',
      underscored: true
    });
    Store.hasMany(models.Checkin, {
      foreignKey: 'store_id',
      as: 'checkins',
      underscored: true
    });
    Store.hasMany(models.Campaign, {
      foreignKey: 'store_id',
      as: 'campaigns',
      underscored: true
    });
  };

  return Store;
}; 