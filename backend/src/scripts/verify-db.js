const { Sequelize } = require('sequelize');
const config = require('../config/database');
const fs = require('fs');
const path = require('path');

async function verifyDatabase() {
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
  );

  try {
    await sequelize.authenticate();
    console.log('Database connection successful');
    
    // Test query
    const [results] = await sequelize.query('SELECT 1');
    console.log('Database query successful:', results);
    
    // Get all tables
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'checkin_system'
    `);

    console.log('\n=== Database Tables ===');
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`\nTable: ${tableName}`);
      
      // Get columns for each table
      const [columns] = await sequelize.query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'checkin_system' 
        AND TABLE_NAME = ?
      `, { replacements: [tableName] });

      console.log('Columns:');
      columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} ${col.COLUMN_KEY ? `[${col.COLUMN_KEY}]` : ''}`);
      });

      // Get foreign keys
      const [foreignKeys] = await sequelize.query(`
        SELECT 
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'checkin_system'
        AND TABLE_NAME = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `, { replacements: [tableName] });

      if (foreignKeys.length > 0) {
        console.log('Foreign Keys:');
        foreignKeys.forEach(fk => {
          console.log(`  - ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
        });
      }
    }

    // Check if admin user exists
    const [adminUser] = await sequelize.query(`
      SELECT id, username, email, role, status
      FROM Users
      WHERE username = 'testadmin'
    `);

    console.log('\n=== Admin User ===');
    if (adminUser.length > 0) {
      console.log('Admin user exists:');
      console.log(adminUser[0]);
    } else {
      console.log('Admin user not found!');
    }

  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await sequelize.close();
  }
}

verifyDatabase(); 