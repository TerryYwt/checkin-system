require('dotenv').config();

module.exports = {
  username: process.env.ZEABUR_DB_USER || 'root',
  password: process.env.ZEABUR_DB_PASSWORD,
  database: process.env.ZEABUR_DB_NAME || 'zeabur',
  host: process.env.ZEABUR_DB_HOST || 'hnd1.clusters.zeabur.com',
  port: process.env.ZEABUR_DB_PORT || 30629,
  dialect: 'mysql',
  logging: console.log,
  timezone: '+08:00',
  charset: 'utf8mb4',
  define: {
    timestamps: true,
    underscored: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}; 