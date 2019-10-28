const Sequelize = require('sequelize');
const db = require('../database');

const Root = db.define('root',{
  id_root: {
    type: Sequelize.STRING,
    primaryKey: true
  },Description: {
    type: Sequelize.STRING
  },isActive: {
    type: Sequelize.INTEGER
  },Image: {
    type: Sequelize.STRING
  }
});

module.exports = Root;