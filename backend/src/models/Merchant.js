const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Merchant = sequelize.define('Merchant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
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
    }
  });

  Merchant.associate = (models) => {
    Merchant.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    Merchant.hasMany(models.Store, {
      foreignKey: 'merchantId',
      as: 'stores'
    });
  };

  return Merchant;
}; 