
const sequelize = require("../db.js");
const { DataTypes } = require("sequelize");
const Usuario = require("./Usuario");

const Solicitacao = sequelize.define("Solicitacao", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nomeProduto: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  precoDesejado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  fotos: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  clienteId: {
    type: DataTypes.INTEGER,
    references: {
      model: Usuario,
      key: "id",
    },
    allowNull: false,
  },
  vendedorId: {
    type: DataTypes.INTEGER,
    references: {
      model: Usuario,
      key: "id",
    },
    allowNull: false,
  },
});


module.exports = Solicitacao;