const localConfig = require('./backend/src/config/database');
const zeaburConfig = require('./backend/src/config/zeabur-db-config');

console.log('Local database configuration:');
console.log(JSON.stringify(localConfig, null, 2));

console.log('\nZeabur database configuration:');
console.log(JSON.stringify(zeaburConfig, null, 2)); 