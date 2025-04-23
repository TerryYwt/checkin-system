const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
  console.log('Starting database check...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'checkin_system'
  });

  try {
    console.log('Connected to database successfully');
    
    console.log('\nChecking users table...');
    const [users] = await connection.execute('SELECT * FROM users');
    console.log('All users:', JSON.stringify(users, null, 2));

    console.log('\nChecking merchants table...');
    const [merchants] = await connection.execute('SELECT * FROM merchants');
    console.log('All merchants:', JSON.stringify(merchants, null, 2));
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

checkUsers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 