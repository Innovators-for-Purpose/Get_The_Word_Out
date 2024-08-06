const { DataTypes } = require("sequelize");
const sequelize = require("../setup.js");
  
  
  const User = sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    notify: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    }
  });

  module.exports = User;






