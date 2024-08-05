const { DataTypes } = require("sequelize");
const sequelize = require("../setup.js");
  
  
  const Event = sequelize.define('event', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    venue: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    time: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    category: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    age: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    date: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    }
  });

  module.exports = Event;






