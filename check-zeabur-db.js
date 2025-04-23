const { Sequelize } = require('sequelize');

// Zeabur database connection details
const zeaburConfig = {
  host: 'hnd1.clusters.zeabur.com',
  port: 30629,
  username: 'root',
  password: 'CefB9iP5qIxS2Kr0uo74ZO31thd68JYR',
  database: 'zeabur',
  dialect: 'mysql',
  logging: console.log
};

async function checkZeaburDatabase() {
  console.log('Connecting to Zeabur database...');
  
  // Create Sequelize instance
  const sequelize = new Sequelize(
    zeaburConfig.database,
    zeaburConfig.username,
    zeaburConfig.password,
    {
      host: zeaburConfig.host,
      port: zeaburConfig.port,
      dialect: zeaburConfig.dialect,
      logging: zeaburConfig.logging
    }
  );

  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Successfully connected to Zeabur database');
    
    // Get list of tables
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('\nTables in Zeabur database:');
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });
    
    // Check if campaigns table exists
    const [campaignsTable] = await sequelize.query('SHOW TABLES LIKE "campaigns"');
    if (campaignsTable.length > 0) {
      console.log('\nCampaigns table exists!');
      
      // Get campaigns table structure
      const [campaignsStructure] = await sequelize.query('DESCRIBE campaigns');
      console.log('\nCampaigns table structure:');
      campaignsStructure.forEach(column => {
        console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
      // Count records in campaigns table
      const [campaignsCount] = await sequelize.query('SELECT COUNT(*) as count FROM campaigns');
      console.log(`\nNumber of records in campaigns table: ${campaignsCount[0].count}`);
    } else {
      console.log('\nCampaigns table does not exist!');
    }
    
    // Check if users table exists
    const [usersTable] = await sequelize.query('SHOW TABLES LIKE "users"');
    if (usersTable.length > 0) {
      console.log('\nUsers table exists!');
      
      // Get users table structure
      const [usersStructure] = await sequelize.query('DESCRIBE users');
      console.log('\nUsers table structure:');
      usersStructure.forEach(column => {
        console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
      // Count records in users table
      const [usersCount] = await sequelize.query('SELECT COUNT(*) as count FROM users');
      console.log(`\nNumber of records in users table: ${usersCount[0].count}`);
    } else {
      console.log('\nUsers table does not exist!');
    }
    
  } catch (error) {
    console.error('Error connecting to Zeabur database:', error);
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the check
checkZeaburDatabase(); 