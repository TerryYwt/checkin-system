require('dotenv').config();

// Print database connection attempt details for debugging
const dbHost = process.env.DB_HOST || process.env.ZEABUR_DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || process.env.ZEABUR_DB_PORT || '3306';
const dbName = process.env.DB_NAME || process.env.ZEABUR_DB_NAME || 'checkin_system';
const dbUser = process.env.DB_USER || process.env.ZEABUR_DB_USER || 'root';
const dbPass = process.env.DB_PASS || process.env.ZEABUR_DB_PASSWORD || '';

console.log('Database connection config:');
console.log(`Host: ${dbHost}`);
console.log(`Port: ${dbPort}`);
console.log(`Name: ${dbName}`);
console.log(`User: ${dbUser}`);
console.log(`Pass: ${dbPass ? '[PROVIDED]' : '[NOT PROVIDED]'}`);

module.exports = {
  database: dbName,
  username: dbUser,
  password: dbPass,
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  },
  // Add retry mechanism for Zeabur deployment
  retry: {
    max: 5,
    match: [/SequelizeConnectionError/, /SequelizeConnectionRefusedError/, /SequelizeHostNotFoundError/, /SequelizeHostNotReachableError/, /SequelizeInvalidConnectionError/, /SequelizeConnectionTimedOutError/],
    timeout: 5000
  }
}; 