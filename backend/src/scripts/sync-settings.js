const mysql = require('mysql2/promise');
require('dotenv').config();

async function syncSettings() {
  console.log('Starting settings sync...');
  
  const localConnection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'checkin_system'
  });

  const zeaburConnection = await mysql.createConnection({
    host: process.env.ZEABUR_DB_HOST,
    port: parseInt(process.env.ZEABUR_DB_PORT || '30629'),
    user: process.env.ZEABUR_DB_USER || 'root',
    password: process.env.ZEABUR_DB_PASSWORD,
    database: process.env.ZEABUR_DB_NAME || 'zeabur'
  });

  try {
    console.log('Connected to databases successfully');
    
    // Get settings from local database
    const [settings] = await localConnection.execute('SELECT * FROM settings');
    console.log('Found settings:', JSON.stringify(settings, null, 2));

    // Clear existing settings in Zeabur
    await zeaburConnection.execute('DELETE FROM settings');
    console.log('Cleared existing settings in Zeabur');

    // Insert settings one by one
    for (const setting of settings) {
      const values = Object.entries(setting).map(([col, val]) => {
        if (val === null) return 'NULL';
        if (col.includes('_at') || col.includes('_time')) {
          return `'${new Date(val).toISOString().slice(0, 19).replace('T', ' ')}'`;
        }
        return typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val;
      }).join(',');
      
      const columns = Object.keys(setting).map(col => col === 'key' ? '`key`' : col).join(',');
      
      console.log(`Inserting setting: ${setting.id}`);
      await zeaburConnection.execute(
        `INSERT INTO settings (${columns}) VALUES (${values})`
      );
    }
    
    console.log('Settings sync completed successfully');
  } catch (error) {
    console.error('Error during settings sync:', error);
  } finally {
    await localConnection.end();
    await zeaburConnection.end();
    console.log('Database connections closed');
  }
}

syncSettings().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 