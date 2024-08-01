const sqlite3 = require ('sqlite3');
const sequelize = require('sequelize');
const fs = require("fs")

let db = new sqlite3.Database('test.db', (err) => {
    if (err) {
      return console.error(err.message);
    }else{
      db.exec(fs.readFileSync("databasetest.sql",  "utf8"));
    }
    console.log('Connected to the in-memory SQlite database.');
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });

  /*
  const User = sequelize.define(
    'User',
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        
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
    }
    
  );
  */





