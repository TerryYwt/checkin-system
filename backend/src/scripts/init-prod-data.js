const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  'checkindb',
  process.env.ZEABUR_DB_USER || 'root',
  process.env.ZEABUR_DB_PASSWORD,
  {
    host: process.env.ZEABUR_DB_HOST,
    port: parseInt(process.env.ZEABUR_DB_PORT || '30629'),
    dialect: 'mysql',
    logging: console.log
  }
);

async function initializeData() {
  try {
    console.log('Connecting to Zeabur database...');
    await sequelize.authenticate();
    console.log('Connection established successfully.');

    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Create campaigns table
    console.log('Creating campaigns table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('discount', 'points', 'gift', 'other') NOT NULL DEFAULT 'other',
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        status ENUM('draft', 'active', 'inactive', 'expired') NOT NULL DEFAULT 'draft',
        rules JSON,
        rewards JSON,
        target_audience VARCHAR(255),
        store_id INTEGER NOT NULL,
        created_by INTEGER NOT NULL,
        merchant_id INTEGER NOT NULL,
        budget DECIMAL(10, 2),
        spent DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        metrics JSON,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (store_id) REFERENCES stores(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (merchant_id) REFERENCES merchants(id)
      )
    `);

    // Create qrcodes table
    console.log('Creating qrcodes table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS qrcodes (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        store_id INTEGER NOT NULL,
        created_by INTEGER NOT NULL,
        type ENUM('checkin', 'promotion', 'reward', 'other') NOT NULL DEFAULT 'checkin',
        content TEXT NOT NULL,
        description TEXT,
        expires_at DATETIME,
        usage_count INTEGER NOT NULL DEFAULT 0,
        status ENUM('active', 'inactive', 'expired') NOT NULL DEFAULT 'active',
        scan_limit INTEGER,
        scan_count INTEGER NOT NULL DEFAULT 0,
        metadata JSON,
        campaign_id INTEGER,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (store_id) REFERENCES stores(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
      )
    `);

    // Create checkins table
    console.log('Creating checkins table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS checkins (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        user_id INTEGER,
        store_id INTEGER,
        campaign_id INTEGER,
        checkin_time DATETIME NOT NULL,
        points_earned INTEGER NOT NULL DEFAULT 0,
        status ENUM('valid', 'invalid', 'pending') NOT NULL DEFAULT 'valid',
        location POINT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (store_id) REFERENCES stores(id),
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
      )
    `);

    // Create settings table
    console.log('Creating settings table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(255) PRIMARY KEY,
        setting_key VARCHAR(255) NOT NULL,
        value TEXT NOT NULL,
        type VARCHAR(255) NOT NULL,
        description TEXT,
        updated_by INTEGER,
        store_id INTEGER,
        merchant_id INTEGER,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users(id),
        FOREIGN KEY (store_id) REFERENCES stores(id),
        FOREIGN KEY (merchant_id) REFERENCES merchants(id)
      )
    `);

    // Enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Create sample campaigns
    console.log('Creating sample campaigns...');
    await sequelize.query(`
      INSERT INTO campaigns (name, description, type, start_date, end_date, status, rules, rewards, target_audience, store_id, created_by, merchant_id, budget, spent, metrics)
      SELECT 
        'Welcome Campaign',
        'New user welcome campaign',
        'points',
        NOW(),
        DATE_ADD(NOW(), INTERVAL 30 DAY),
        'active',
        '{"points_per_checkin": 20, "duration_days": 30, "max_points": 200}',
        '{"type": "points", "amount": 20}',
        '{"user_type": "new"}',
        s.id,
        u.id,
        m.id,
        1000.00,
        0.00,
        '{"total_checkins": 0, "total_points_awarded": 0}'
      FROM stores s
      JOIN merchants m ON s.merchant_id = m.id
      JOIN users u ON m.user_id = u.id
      WHERE u.username = 'testmerchant'
      ON DUPLICATE KEY UPDATE
        name = 'Welcome Campaign',
        description = 'New user welcome campaign',
        type = 'points',
        start_date = NOW(),
        end_date = DATE_ADD(NOW(), INTERVAL 30 DAY),
        status = 'active',
        rules = '{"points_per_checkin": 20, "duration_days": 30, "max_points": 200}',
        rewards = '{"type": "points", "amount": 20}',
        target_audience = '{"user_type": "new"}',
        budget = 1000.00,
        spent = 0.00,
        metrics = '{"total_checkins": 0, "total_points_awarded": 0}'
    `);

    // Create sample QR codes
    console.log('Creating sample QR codes...');
    await sequelize.query(`
      INSERT INTO qrcodes (store_id, created_by, type, content, description, status, scan_limit, scan_count, metadata, campaign_id)
      SELECT 
        s.id,
        u.id,
        'checkin',
        CONCAT('{"type": "checkin", "store_id": ', s.id, '}'),
        'Store check-in QR code',
        'active',
        1000,
        0,
        CONCAT('{"created_at": "', NOW(), '"}'),
        c.id
      FROM stores s
      JOIN merchants m ON s.merchant_id = m.id
      JOIN users u ON m.user_id = u.id
      JOIN campaigns c ON c.store_id = s.id
      WHERE u.username = 'testmerchant'
      ON DUPLICATE KEY UPDATE
        type = 'checkin',
        content = CONCAT('{"type": "checkin", "store_id": ', s.id, '}'),
        description = 'Store check-in QR code',
        status = 'active',
        scan_limit = 1000,
        scan_count = 0,
        metadata = CONCAT('{"created_at": "', NOW(), '"}')
    `);

    // Create sample checkins
    console.log('Creating sample checkins...');
    await sequelize.query(`
      INSERT INTO checkins (user_id, store_id, campaign_id, checkin_time, points_earned, status, location)
      SELECT 
        u.id,
        s.id,
        c.id,
        NOW(),
        20,
        'valid',
        ST_GeomFromText('POINT(121.5654 25.0330)')
      FROM users u
      CROSS JOIN stores s
      JOIN merchants m ON s.merchant_id = m.id
      JOIN campaigns c ON c.store_id = s.id
      WHERE u.username = 'testmerchant'
      ON DUPLICATE KEY UPDATE
        checkin_time = NOW(),
        points_earned = 20,
        status = 'valid',
        location = ST_GeomFromText('POINT(121.5654 25.0330)')
    `);

    // Create sample settings
    console.log('Creating sample settings...');
    await sequelize.query(`
      INSERT INTO settings (id, setting_key, value, type, description)
      VALUES 
        ('points_expiry_days', 'points_expiry_days', '365', 'system', 'Number of days before points expire'),
        ('min_points_redemption', 'min_points_redemption', '100', 'system', 'Minimum points required for redemption'),
        ('points_per_checkin', 'points_per_checkin', '10', 'system', 'Points earned per check-in')
      ON DUPLICATE KEY UPDATE
        value = VALUES(value),
        type = VALUES(type),
        description = VALUES(description)
    `);

    console.log('Data initialization completed successfully.');
  } catch (error) {
    console.error('Data initialization failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

initializeData()
  .then(() => {
    console.log('Data initialization completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to initialize data:', error);
    process.exit(1);
  }); 