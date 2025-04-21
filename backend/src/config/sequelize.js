const { Sequelize } = require('sequelize')
const config = require('./database')

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    dialectOptions: config.dialectOptions,
    define: config.define,
    pool: config.pool,
    logging: console.log
  }
)

module.exports = sequelize 