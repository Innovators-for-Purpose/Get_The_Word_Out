const { Sequelize, DataTypes } = require("sequelize");
const config = require('./config/config.json')
var env = process.env['NODE_ENV']
if (!env) {
  env = 'development'
}
const sequelize = new Sequelize(config[env]);

module.exports = sequelize;
