const Sequelize = require('sequelize');
const db = require('../database');

const Sell = db.define('sell',{
    id_sell: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },id_user: {
    type: Sequelize.STRING,
    allowNull: false,
  },Product: {
    type: Sequelize.STRING,
    allowNull: false,
  },Price: {
    type: Sequelize.STRING,
    allowNull: false,
  },StartDate: {
    type: Sequelize.DATE,
    allowNull: true,
  },EndDate: {
    type: Sequelize.DATE,
    allowNull: true,
  },Map: {
    type: Sequelize.STRING,
    allowNull: true,
  },SellDate: {
    type: Sequelize.DATE,
    allowNull: true,
  }
},
{ timestamps: false },
{freezeTableName: true}
);

module.exports = Sell;