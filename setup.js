const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "newdatabase.db",
  // storage: "archive.db",
});

module.exports = sequelize;