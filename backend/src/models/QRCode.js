const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const QRCode = sequelize.define('QRCode', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Stores',
        key: 'id'
      }
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('store', 'campaign', 'trial'),
      allowNull: false,
      defaultValue: 'store'
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'expired'),
      allowNull: false,
      defaultValue: 'active'
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    scan_limit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    scan_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'qrcodes',
    timestamps: true,
    underscored: true
  });

  QRCode.associate = (models) => {
    QRCode.belongsTo(models.Store, {
      foreignKey: 'store_id',
      as: 'store'
    });
    QRCode.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
  };

  return QRCode;
}; 