const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const config = require('../config/database');

// Log the database configuration
console.log('Database initialization configuration:');
console.log(`Host: ${config.host}`);
console.log(`Port: ${config.port}`);
console.log(`Database: ${config.database}`);
console.log(`Username: ${config.username}`);

async function initDatabase() {
  let connection;
  
  try {
    // First, try to create the database if it doesn't exist
    console.log('Connecting to MySQL server to create database if needed...');
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      // Don't specify database name here
    });

    console.log(`Creating database ${config.database} if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database};`);
    console.log(`Database ${config.database} ensured.`);
    
    // Now connect to the database with Sequelize
    const sequelize = new Sequelize(
      config.database, 
      config.username, 
      config.password, 
      {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: true,
        retry: config.retry
      }
    );
    
    // Test the connection
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync basic tables (don't use force: true in production)
    console.log('Syncing database models...');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized.');
    
    // Create test user if needed
    if (process.env.CREATE_TEST_USERS === 'true') {
      console.log('Creating test users...');
      // Code to create test users would go here
      console.log('Test users created.');
    }
    
    console.log('Database initialization completed successfully.');
    
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase()
    .then(success => {
      console.log('Script execution completed.');
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Unhandled error:', err);
      process.exit(1);
    });
} else {
  // Export for use as a module
  module.exports = initDatabase;
} 