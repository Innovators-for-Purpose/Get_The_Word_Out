const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "test.db",
  // storage: "archive.db",
});

module.exports = sequelize;
