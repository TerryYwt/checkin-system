const { Sequelize, DataTypes } = require('sequelize');
const localConfig = require('../config/database');
const zeaburConfig = require('../config/zeabur-db-config');
const fs = require('fs');
const path = require('path');

// Helper function to format dates for MySQL
function formatDateForMySQL(date) {
  if (!date) return 'NULL';
  if (typeof date === 'string') {
    // Try to parse the string as a date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return 'NULL';
    }
    date = parsedDate;
  }
  return `'${date.toISOString().slice(0, 19).replace('T', ' ')}'`;
}

// Store ID mappings between local and Zeabur databases
const idMappings = {
  users: {},
  merchants: {},
  stores: {},
  campaigns: {},
  qrcodes: {},
  checkins: {},
  settings: {}
};

console.log('Starting sync script...');
console.log('Local database config:', {
  ...localConfig,
  password: localConfig.password ? '***' : undefined
});
console.log('Zeabur database config:', {
  ...zeaburConfig,
  password: zeaburConfig.password ? '***' : undefined
});

// Create connections
console.log('Creating database connections...');
const localSequelize = new Sequelize(localConfig);
const zeaburSequelize = new Sequelize(zeaburConfig);

async function createTables() {
  try {
    console.log('Starting table creation process...');
    
    // Test connection first
    await zeaburSequelize.authenticate();
    console.log('Successfully connected to Zeabur database');

    // Disable foreign key checks
    await zeaburSequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('Foreign key checks disabled');

    // Define tables to create
    const tables = [
      {
        name: 'users',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(255) NOT NULL UNIQUE,
            trial_id VARCHAR(255) UNIQUE,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            role ENUM('admin', 'merchant', 'user') NOT NULL DEFAULT 'user',
            status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
            refresh_token VARCHAR(255),
            last_login DATETIME,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'merchants',
        sql: `
          CREATE TABLE IF NOT EXISTS merchants (
            id INTEGER PRIMARY KEY AUTO_INCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            business_name VARCHAR(255) NOT NULL,
            contact_person VARCHAR(255) NOT NULL,
            phone VARCHAR(255) NOT NULL,
            status ENUM('active', 'inactive') DEFAULT 'active',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
          )
        `
      },
      {
        name: 'stores',
        sql: `
          CREATE TABLE IF NOT EXISTS stores (
            id INTEGER PRIMARY KEY AUTO_INCREMENT,
            merchant_id INTEGER NOT NULL,
            name VARCHAR(255) NOT NULL,
            address VARCHAR(255) NOT NULL,
            phone VARCHAR(255) NOT NULL,
            status ENUM('active', 'inactive') DEFAULT 'active',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (merchant_id) REFERENCES merchants(id)
          )
        `
      },
      {
        name: 'campaigns',
        sql: `
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
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (store_id) REFERENCES stores(id),
            FOREIGN KEY (created_by) REFERENCES users(id),
            FOREIGN KEY (merchant_id) REFERENCES merchants(id),
            INDEX store_id_idx (store_id),
            INDEX created_by_idx (created_by),
            INDEX status_idx (status),
            INDEX merchant_id_idx (merchant_id),
            INDEX type_idx (type),
            INDEX start_date_idx (start_date),
            INDEX end_date_idx (end_date)
          )
        `
      },
      {
        name: 'qrcodes',
        sql: `
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
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (store_id) REFERENCES stores(id),
            FOREIGN KEY (created_by) REFERENCES users(id),
            FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
          )
        `
      },
      {
        name: 'checkins',
        sql: `
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
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (store_id) REFERENCES stores(id),
            FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
          )
        `
      },
      {
        name: 'settings',
        sql: `
          CREATE TABLE IF NOT EXISTS settings (
            id VARCHAR(255) PRIMARY KEY,
            \`key\` VARCHAR(255) NOT NULL,
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
            FOREIGN KEY (merchant_id) REFERENCES merchants(id),
            INDEX key_idx (\`key\`),
            INDEX updated_by_idx (updated_by),
            INDEX store_id_idx (store_id),
            INDEX merchant_id_idx (merchant_id)
          )
        `
      }
    ];

    // Create tables one by one
    for (const table of tables) {
      try {
        console.log(`Creating ${table.name} table...`);
        const [result] = await zeaburSequelize.query(table.sql);
        console.log(`Successfully created ${table.name} table`);
      } catch (err) {
        console.error(`Error creating ${table.name} table:`, err);
        console.error('SQL:', table.sql);
        throw err;
      }
    }

    // Enable foreign key checks
    await zeaburSequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Foreign key checks enabled');

    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error in createTables():', error);
    // Re-enable foreign key checks even if there's an error
    try {
      await zeaburSequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('Foreign key checks re-enabled after error');
    } catch (fkError) {
      console.error('Error re-enabling foreign key checks:', fkError);
    }
    throw error;
  }
}

async function clearAllData() {
  console.log('Clearing all data from Zeabur database...');
  
  // Delete in reverse order to respect foreign key constraints
  const deleteOrder = [
    'settings',
    'checkins',
    'qrcodes',
    'campaigns',
    'stores',
    'merchants',
    'users'
  ];

  for (const table of deleteOrder) {
    console.log(`Clearing data from ${table} table...`);
    await zeaburSequelize.query(`DELETE FROM ${table}`);
    console.log(`Cleared data from ${table} table`);
  }
}

async function insertWithIdMapping(table, rows, columns, values) {
  // Insert the data
  await zeaburSequelize.query(
    `INSERT INTO ${table} (${columns.join(',')}) VALUES ${values}`
  );

  // Get the inserted IDs by selecting the rows we just inserted
  const whereClause = rows.map(row => {
    const conditions = [];
    if (row.username) conditions.push(`username = '${row.username}'`);
    if (row.email) conditions.push(`email = '${row.email}'`);
    if (row.business_name) conditions.push(`business_name = '${row.business_name}'`);
    if (row.name) conditions.push(`name = '${row.name}'`);
    return `(${conditions.join(' AND ')})`;
  }).join(' OR ');

  const [insertedRows] = await zeaburSequelize.query(
    `SELECT id FROM ${table} WHERE ${whereClause}`
  );

  // Map the original IDs to the new IDs
  rows.forEach((row, index) => {
    if (insertedRows[index]) {
      idMappings[table][row.id] = insertedRows[index].id;
    }
  });

  return insertedRows.length;
}

async function syncData() {
  try {
    console.log('Starting data sync process...');
    
    // Disable foreign key checks
    await zeaburSequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('Foreign key checks disabled for sync');

    // Test connections
    await localSequelize.authenticate();
    console.log('Local database connection successful.');
    await zeaburSequelize.authenticate();
    console.log('Zeabur database connection successful.');

    // Create tables if they don't exist
    console.log('Creating tables...');
    await createTables();
    console.log('Tables created or already exist.');

    // Clear all data in the correct order
    await clearAllData();

    // Get all tables
    console.log('Getting table list...');
    const [localTables] = await localSequelize.query('SHOW TABLES');
    const tableNames = localTables.map(table => Object.values(table)[0]);
    console.log('Found tables:', tableNames);

    // Sort tables to handle foreign key constraints
    const tableOrder = [
      'users',
      'merchants',
      'stores',
      'campaigns',
      'qrcodes',
      'checkins',
      'settings'
    ];

    for (const table of tableOrder) {
      console.log(`Starting sync for table: ${table}`);
      
      // Get data from local database
      console.log(`Fetching data from local ${table} table...`);
      const [rows] = await localSequelize.query(`SELECT * FROM ${table}`);
      console.log(`Found ${rows.length} rows in local ${table} table`);

      if (rows.length > 0) {
        // Special handling for merchants table to avoid duplicate user_id
        if (table === 'merchants') {
          console.log('Processing merchants table with special handling...');
          // Group by user_id and keep only the most recent entry
          const uniqueMerchants = {};
          rows.forEach(row => {
            if (!uniqueMerchants[row.user_id] || 
                new Date(row.updated_at) > new Date(uniqueMerchants[row.user_id].updated_at)) {
              uniqueMerchants[row.user_id] = row;
            }
          });
          const uniqueRows = Object.values(uniqueMerchants);
          console.log(`Found ${uniqueRows.length} unique merchants after deduplication`);
          
          if (uniqueRows.length > 0) {
            const columns = Object.keys(uniqueRows[0]);
            const values = uniqueRows.map(row => {
              const mappedValues = columns.map(col => {
                if (row[col] === null) return 'NULL';
                if (col.includes('_at') || col.includes('_time') || col === 'last_login') {
                  return formatDateForMySQL(row[col]);
                }
                if (col === 'user_id' && idMappings.users[row[col]]) {
                  return idMappings.users[row[col]];
                }
                return typeof row[col] === 'string' ? `'${row[col].replace(/'/g, "''")}'` : row[col];
              });
              return `(${mappedValues.join(',')})`;
            }).join(',');
            
            console.log(`Inserting ${uniqueRows.length} unique merchants...`);
            const insertedCount = await insertWithIdMapping(table, uniqueRows, columns, values);
            console.log(`Inserted ${insertedCount} unique merchants successfully`);
          }
        } else {
          // Normal handling for other tables
          console.log(`Processing ${table} table normally...`);
          const columns = Object.keys(rows[0]);
          const values = rows.map(row => {
            const mappedValues = columns.map(col => {
              if (row[col] === null) return 'NULL';
              if (col.includes('_at') || col.includes('_time') || col === 'last_login') {
                return formatDateForMySQL(row[col]);
              }
              // Map foreign key IDs
              if (col === 'user_id' && idMappings.users[row[col]]) {
                return idMappings.users[row[col]];
              }
              if (col === 'merchant_id' && idMappings.merchants[row[col]]) {
                return idMappings.merchants[row[col]];
              }
              if (col === 'store_id' && idMappings.stores[row[col]]) {
                return idMappings.stores[row[col]];
              }
              if (col === 'campaign_id' && idMappings.campaigns[row[col]]) {
                return idMappings.campaigns[row[col]];
              }
              if (col === 'created_by' && idMappings.users[row[col]]) {
                return idMappings.users[row[col]];
              }
              return typeof row[col] === 'string' ? `'${row[col].replace(/'/g, "''")}'` : row[col];
            });
            return `(${mappedValues.join(',')})`;
          }).join(',');
          
          console.log(`Inserting ${rows.length} rows into ${table}...`);
          const insertedCount = await insertWithIdMapping(table, rows, columns, values);
          console.log(`Inserted ${insertedCount} rows into ${table} successfully`);
        }
        console.log(`Completed sync for table: ${table}`);
        console.log(`Current ID mappings for ${table}:`, idMappings[table]);
      } else {
        console.log(`No data to sync for table: ${table}`);
      }
    }

    // Re-enable foreign key checks
    await zeaburSequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Foreign key checks re-enabled');
    
    console.log('Data sync completed successfully');
  } catch (error) {
    console.error('Error during sync:', error);
    // Ensure foreign key checks are re-enabled even if an error occurs
    await zeaburSequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    throw error;
  } finally {
    // Close database connections
    await localSequelize.close();
    await zeaburSequelize.close();
    console.log('Database connections closed');
  }
}

module.exports = {
  syncData
}; 