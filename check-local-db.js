const { Sequelize } = require('sequelize');

// Local database connection details
const localConfig = {
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'checkin_system',
  dialect: 'mysql',
  logging: console.log
};

async function checkLocalDatabase() {
  console.log('Checking local database...');
  
  // First create a connection without database to create it if needed
  const rootSequelize = new Sequelize({
    host: localConfig.host,
    port: localConfig.port,
    username: localConfig.username,
    password: localConfig.password,
    dialect: localConfig.dialect,
    logging: localConfig.logging
  });

  try {
    // Test connection
    await rootSequelize.authenticate();
    console.log('Successfully connected to MySQL server');
    
    // Create database if it doesn't exist
    await rootSequelize.query(`CREATE DATABASE IF NOT EXISTS ${localConfig.database};`);
    console.log(`Ensured database ${localConfig.database} exists`);
    
    // Close root connection
    await rootSequelize.close();
    
    // Create connection to the specific database
    const dbSequelize = new Sequelize(
      localConfig.database,
      localConfig.username,
      localConfig.password,
      {
        host: localConfig.host,
        port: localConfig.port,
        dialect: localConfig.dialect,
        logging: localConfig.logging
      }
    );
    
    // Test connection to the database
    await dbSequelize.authenticate();
    console.log(`Successfully connected to ${localConfig.database} database`);
    
    // Get list of tables
    const [tables] = await dbSequelize.query('SHOW TABLES');
    console.log('\nTables in local database:');
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });
    
    // Close database connection
    await dbSequelize.close();
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('Database check error:', error);
  }
}

// Run the check
checkLocalDatabase(); 