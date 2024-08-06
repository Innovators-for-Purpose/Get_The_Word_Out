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
      type: DataTypes.ENUM('Kids/1-7','Pre-teen/7-12','Teen/13-17,Young Adults/18-25','Adults/25-65', 'Senior/65+'),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  });

  module.exports = Event;






