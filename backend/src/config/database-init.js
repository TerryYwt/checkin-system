const { Sequelize } = require('sequelize')
const bcryptjs = require('bcryptjs')
const testAccounts = require('./test-accounts')
require('dotenv').config()

async function initializeDatabase() {
  try {
    // 創建數據庫連接
    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false
      }
    )

    // 測試連接
    await sequelize.authenticate()
    console.log('Database connection established successfully')

    // 定義用戶模型
    const User = sequelize.define('User', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      role: {
        type: Sequelize.ENUM('user', 'admin', 'merchant'),
        defaultValue: 'user'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active'
      }
    })

    // 同步數據庫（創建表）
    await sequelize.sync({ force: true })
    console.log('Database tables created successfully')

    // 創建測試管理員用戶
    const hashedPassword = await bcryptjs.hash(process.env.TEST_ADMIN_PASSWORD, 10)
    await User.create({
      username: testAccounts.admin.username,
      password: hashedPassword,
      email: testAccounts.admin.email,
      role: testAccounts.admin.role,
      status: 'active'
    })
    console.log('Test admin user created successfully')

    await sequelize.close()
    console.log('Database connection closed')
  } catch (error) {
    console.error('Database initialization failed:', error)
  }
}

// 執行初始化
initializeDatabase()

module.exports = initializeDatabase 