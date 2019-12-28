const Sequelize = require('sequelize');
const db = require('../database');

const Event = db.define('events',{
  id_event: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },DateStart: {
    type: Sequelize.DATE
  },id_room: {
    type: Sequelize.DATE
  },Duration: {
    type: Sequelize.INTEGER
  },id_type: {
    type: Sequelize.STRING
  },Type: {
    type: Sequelize.INTEGER
  },IsActive: {
    type: Sequelize.INTEGER
  }
})

module.exports = Event;