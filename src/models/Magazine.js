const Sequelize = require('sequelize');
const db = require('../database');

const Magazine = db.define('magazine',{
  id_magazine: {
    type: Sequelize.STRING,
    primaryKey: true
  },Title: {
    type: Sequelize.STRING
  },Author: {
    type: Sequelize.STRING
  },DateRelease: {
    type: Sequelize.DATE
  },Content: {
    type: Sequelize.STRING
  },File: {
    type: Sequelize.STRING
  },Image: {
    type: Sequelize.STRING
  },isActive: {
    type: Sequelize.INTEGER
  }
});

module.exports = Magazine;