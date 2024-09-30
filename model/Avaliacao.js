const sequelize = require("../db.js");
const { DataTypes } = require("sequelize");

const Avaliacao = sequelize.define("Avaliacao", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fotos: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  clienteId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Usuarios",
      key: "id",
    },
    allowNull: false,
  },
  vendedorId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Usuarios",
      key: "id",
    },
    allowNull: false,
  },
  compraId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Compras",
      key: "id",
    },
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('cliente_para_vendedor', 'vendedor_para_cliente'),
    allowNull: false,
  },
});

module.exports = Avaliacao;