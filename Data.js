const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('sqlite::memory:') 
const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname') 

