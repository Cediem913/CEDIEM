const Sequelize = require('sequelize');
const db = require('../database');

const Room = db.define('rooms',{
  id_room: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },id_campus: {
    type: Sequelize.STRING
  },isActive: {
    type: Sequelize.INTEGER
  },Name: {
    type: Sequelize.STRING
  },Description: {
    type: Sequelize.STRING
  },Image: {
    type: Sequelize.STRING
  },Price: {
    type: Sequelize.INTEGER
  },Courses:{
    type:Sequelize.JSONB
  }
})

module.exports = Room;