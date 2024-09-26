const { Sequelize } = require('sequelize');
const sequelize = new Sequelize("importae", "root", "", {
  dialect: "mysql",
  host: "localhost",
  define: { timestamps: false },
});

module.exports = sequelize;