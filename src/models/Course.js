const Sequelize = require('sequelize');
const db = require('../database');

const Course = db.define('course',{
  id_course: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },id_root: {
    type: Sequelize.STRING
  },isActive: {
    type: Sequelize.INTEGER
  },Description: {
    type: Sequelize.DOUBLE
  },Price: {
    type: Sequelize.DOUBLE
  },StartDate: {
    type: Sequelize.DATEONLY
  },EndDate: {
    type: Sequelize.DATEONLY
  },Schedule: {
    type: Sequelize.STRING
  },Duration: {
    type: Sequelize.INTEGER
  },Map: {
    type: Sequelize.STRING
  },Image: {
    type: Sequelize.STRING
  },Video: {
    type: Sequelize.STRING
  },Syllabus: {
    type: Sequelize.STRING
  },Benefits: {
    type: Sequelize.STRING
  },Documents: {
    type: Sequelize.STRING
  },Modal: {
    type: Sequelize.STRING
  }
})

module.exports = Course;