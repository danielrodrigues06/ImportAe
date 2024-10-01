const sequelize = require("../db.js");
const { DataTypes } = require("sequelize");
const Usuario = require("./Usuario");
const Produto = require("./Produto");

const Comentario = sequelize.define("Comentario", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  resposta: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    references: {
      model: Usuario,
      key: "id",
    },
    allowNull: false,
  },
  produtoId: {
    type: DataTypes.INTEGER,
    references: {
      model: Produto,
      key: "id",
    },
    allowNull: false,
  },
});

module.exports = Comentario;