const Sequelize = require('sequelize');
const sequelize = require('../database');
//const bcrypt = require('bcrypt');

const User = sequelize.define('user', {
  id_user: {
    type: Sequelize.STRING,
    primaryKey: true
  }, Secret: {
    type: Sequelize.STRING
  }, Email: {
    type: Sequelize.INTEGER
  }, TokenPublic: {
    type: Sequelize.STRING
  }, TokenSession: {
    type: Sequelize.STRING
  }, IsActive: {
    type: Sequelize.INTEGER
  }
},

  { timestamps: false },

  {
    freezeTableName: true/*,
    instanceMethods: {
      encryptPassword: async (password) => {
        const salt = await bcrypt.genSalt(10);
        const hash = bcrypt.hash(password, salt);
        return hash;
      },

      matchPassword: async function (password) {
        return await bcrypt.compare(password, this.password);
      }
    }*/
  });

/*User.encryptPasswords = async function (password) {
  const salt = await bcrypt.genSalt(10);
  const hash = bcrypt.hash(password, salt);
  return hash;
};*/

module.exports = User;