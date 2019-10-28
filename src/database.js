const Sequelize = require('sequelize');
const dotenv = require('dotenv');
const result = dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_SECRET,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false
  });

sequelize.authenticate().then(() => console.log('Database connected')).catch(err => console.log(err));

module.exports = sequelize;
