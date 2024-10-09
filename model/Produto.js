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
    type: DataTypes.JSON,
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  origem: {
    type: DataTypes.ENUM,
    values: ["China", "EUA"],
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
  estoque: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
},
});

Usuario.hasMany(Produto, { foreignKey: "vendedorId" });
Produto.belongsTo(Usuario, { foreignKey: "vendedorId", as: "vendedor" }); // Assegure que o alias é "vendedor"

module.exports = Produto;
