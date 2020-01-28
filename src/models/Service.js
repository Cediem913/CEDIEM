const Sequelize = require('sequelize');
const db = require('../database');

const Service = db.define('services',{
  id_service: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },Name: {
    type: Sequelize.STRING
  },Price: {
    type: Sequelize.INTEGER
  },Type: {
    type: Sequelize.STRING
  },id_root: {
    type: Sequelize.STRING
  },Owner: {
    type: Sequelize.STRING
  },Info: {
    type: Sequelize.STRING
  },Description: {
    type: Sequelize.STRING
  },File: {
    type: Sequelize.STRING
  },Image: {
    type: Sequelize.STRING
  },Duration: {
    type: Sequelize.INTEGER
  },IsActive: {
    type: Sequelize.INTEGER
  },DateUp: {
    type: Sequelize.DATE
  }
})

module.exports = Service;