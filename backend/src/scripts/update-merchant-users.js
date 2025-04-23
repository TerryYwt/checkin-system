const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateMerchantUsers() {
  console.log('Starting merchant user update...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'checkin_system'
  });

  try {
    console.log('Connected to database successfully');
    
    // Get all merchants
    const [merchants] = await connection.execute('SELECT * FROM merchants ORDER BY id');
    console.log('Current merchants:', JSON.stringify(merchants, null, 2));

    // Get available user IDs (excluding those already used by merchants)
    const [users] = await connection.execute('SELECT * FROM users WHERE role = "merchant"');
    console.log('Available merchant users:', JSON.stringify(users, null, 2));

    // Update merchant with ID 3 to use user_id 3 (testmerchant)
    console.log('\nUpdating merchant ID 3 to use user_id 3...');
    await connection.execute(
      'UPDATE merchants SET user_id = 3 WHERE id = 3'
    );

    // Verify the update
    const [updatedMerchants] = await connection.execute('SELECT * FROM merchants ORDER BY id');
    console.log('\nUpdated merchants:', JSON.stringify(updatedMerchants, null, 2));

  } catch (error) {
    console.error('Error occurred:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await connection.end();
    console.log('\nDatabase connection closed');
  }
}

updateMerchantUsers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 