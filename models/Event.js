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
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    venue: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('STEAM','Music','Art','Entertainment','Technology','Other'),
      allowNull: false,
    },
    age: {
      type: DataTypes.ENUM('1-7','7+'),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  });

  module.exports = Event;






