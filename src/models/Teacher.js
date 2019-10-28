const Sequelize = require('sequelize');
const db = require('../database');

const Teacher = db.define('teacher',{
  id_teacher: {
    type: Sequelize.STRING,
    primaryKey: true
  },Name: {
    type: Sequelize.STRING
  },Image: {
    type: Sequelize.STRING
  },Specialties: {
    type: Sequelize.STRING
  },Description: {
    type: Sequelize.STRING
  },Twitter: {
    type: Sequelize.INTEGER
  },WhatsApp: {
    type: Sequelize.STRING
  },Cordination:{
    type: Sequelize.STRING
  },AcademicRate:{
    type: Sequelize.STRING
  }
})

module.exports = Teacher;