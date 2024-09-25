// models/Produto.js
const sequelize = require("../db.js");
const { DataTypes } = require("sequelize");
const Usuario = require("./Usuario");

const Produto = sequelize.define("Produto", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  fotos: {
    type: DataTypes.JSON, // Alterado para JSON para suportar arrays
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  origem: {
    type: DataTypes.ENUM,
    values: ['China', 'EUA'],
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

Usuario.hasMany(Produto, { foreignKey: "vendedorId" });
Produto.belongsTo(Usuario, { foreignKey: "vendedorId" });

module.exports = Produto;