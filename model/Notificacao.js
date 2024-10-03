const sequelize = require("../db.js");
const { DataTypes } = require("sequelize");
const Usuario = require("./Usuario");

const Notificacao = sequelize.define("Notificacao", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: "id",
    },
  },
  mensagem: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Notificacao;