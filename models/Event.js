const { DataTypes } = require("sequelize");
const sequelize = require("../setup.js");


const Event = sequelize.define('event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  thumbnail: {
    type: DataTypes.BLOB,
    allowNull: true,
    get() {
      const data = this.getDataValue('thumbnail');
      return data ? `data:image/jpeg;base64,${data.toString('base64')}` : null;
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  uid: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  startTime: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  endTime: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  age: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
  }
}, {
  tableName: 'events',
  timestamps: true,
});

module.exports = Event;