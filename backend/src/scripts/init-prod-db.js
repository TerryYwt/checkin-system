const { Sequelize } = require('sequelize');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

// Log database configuration
console.log('Database Configuration:');
console.log('Host:', process.env.ZEABUR_DB_HOST);
console.log('Port:', process.env.ZEABUR_DB_PORT);
console.log('Name:', process.env.ZEABUR_DB_NAME);
console.log('User:', process.env.ZEABUR_DB_USER);

const sequelize = new Sequelize(
  'checkindb', // Fixed database name
  process.env.ZEABUR_DB_USER || 'root',
  process.env.ZEABUR_DB_PASSWORD,
  {
    host: process.env.ZEABUR_DB_HOST,
    port: parseInt(process.env.ZEABUR_DB_PORT || '30629'),
    dialect: 'mysql',
    logging: console.log
  }
);

async function initializeDatabase() {
  try {
    console.log('Connecting to Zeabur database...');
    await sequelize.authenticate();
    console.log('Connection established successfully.');

    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Create tables
    console.log('Creating tables...');
    
    // Users table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role ENUM('admin', 'merchant', 'user') NOT NULL DEFAULT 'user',
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        refresh_token VARCHAR(255),
        last_login DATETIME,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Merchants table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS merchants (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        business_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Stores table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        merchant_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (merchant_id) REFERENCES merchants(id)
      )
    `);

    // Enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Tables created successfully.');

    // Create test accounts
    console.log('Creating test accounts...');

    // Create admin user
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'Admin@123456';
    const hashedAdminPassword = await bcryptjs.hash(adminPassword, 10);
    await sequelize.query(`
      INSERT INTO users (username, password, email, role, status)
      VALUES ('testadmin', '${hashedAdminPassword}', 'admin@test.com', 'admin', 'active')
      ON DUPLICATE KEY UPDATE
      password = '${hashedAdminPassword}',
      email = 'admin@test.com',
      role = 'admin',
      status = 'active'
    `);

    // Create merchant user
    const merchantPassword = process.env.TEST_MERCHANT_PASSWORD || 'Merchant@123456';
    const hashedMerchantPassword = await bcryptjs.hash(merchantPassword, 10);
    await sequelize.query(`
      INSERT INTO users (username, password, email, role, status)
      VALUES ('testmerchant', '${hashedMerchantPassword}', 'merchant@test.com', 'merchant', 'active')
      ON DUPLICATE KEY UPDATE
      password = '${hashedMerchantPassword}',
      email = 'merchant@test.com',
      role = 'merchant',
      status = 'active'
    `);

    // Create merchant profile
    await sequelize.query(`
      INSERT INTO merchants (user_id, business_name, contact_person, phone, status)
      SELECT id, '測試商家', 'Test Contact', '0912345678', 'active'
      FROM users WHERE username = 'testmerchant'
      ON DUPLICATE KEY UPDATE
      business_name = '測試商家',
      contact_person = 'Test Contact',
      phone = '0912345678',
      status = 'active'
    `);

    // Create store
    await sequelize.query(`
      INSERT INTO stores (merchant_id, name, address, phone, status)
      SELECT m.id, '測試商店', '台北市測試區測試路123號', '0912345678', 'active'
      FROM merchants m
      JOIN users u ON m.user_id = u.id
      WHERE u.username = 'testmerchant'
      ON DUPLICATE KEY UPDATE
      name = '測試商店',
      address = '台北市測試區測試路123號',
      phone = '0912345678',
      status = 'active'
    `);

    console.log('Test accounts created successfully.');

  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

initializeDatabase()
  .then(() => {
    console.log('Database initialization completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }); 