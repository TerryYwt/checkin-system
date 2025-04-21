const path = require('path');

// Determine migration paths and configuration for Zeabur
const config = {
  'config': path.resolve('src/config', 'zeabur-db-config.js'),
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('src/database', 'seeders'),
  'migrations-path': path.resolve('src/database', 'migrations')
};

// Run the migrations
const { execSync } = require('child_process');

try {
  console.log('Starting migration to Zeabur MySQL...');
  
  // Write config to .sequelizerc temporarily
  const fs = require('fs');
  fs.writeFileSync(
    path.resolve('.sequelizerc'),
    `const path = require('path');
module.exports = ${JSON.stringify(config, null, 2)};`
  );
  
  console.log('Running migrations...');
  execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
  
  console.log('Running seeders...');
  execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
  
  console.log('Migration to Zeabur completed successfully!');
  
  // Restore original .sequelizerc
  fs.unlinkSync(path.resolve('.sequelizerc'));
} catch (error) {
  console.error('Migration failed:', error);
} 