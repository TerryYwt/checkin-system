const { DataTypes } = require('sequelize')
const bcryptjs = require('bcryptjs')

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 20],
        is: /^[a-zA-Z0-9_]+$/ // Only allow letters, numbers, and underscores
      }
    },
    trial_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        len: [6, 20],
        is: /^[a-zA-Z0-9]+$/ // Only allow letters and numbers
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
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
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcryptjs.genSalt(10);
          user.password = await bcryptjs.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcryptjs.genSalt(10);
          user.password = await bcryptjs.hash(user.password, salt);
        }
      }
    }
  })

  // Password strength check
  User.validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    return {
      isValid: hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      requirements: {
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      }
    }
  }

  // Add password comparison method
  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcryptjs.compare(candidatePassword, this.password)
  }

  // Define associations
  User.associate = (models) => {
    User.hasOne(models.Merchant, {
      foreignKey: 'user_id',
      as: 'merchant',
      underscored: true
    });
    User.hasMany(models.QRCode, {
      foreignKey: 'created_by',
      as: 'created_qrcodes',
      underscored: true
    });
  };

  return User
} 