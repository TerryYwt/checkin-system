require('dotenv').config();

module.exports = {
  username: 'root',
  password: 'CefB9iP5qIxS2Kr0uo74ZO31thd68JYR',
  database: 'zeabur',
  host: 'hnd1.clusters.zeabur.com',
  port: 30629,
  dialect: 'mysql',
  logging: console.log,
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