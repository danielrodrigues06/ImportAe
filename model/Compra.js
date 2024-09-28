const sequelize = require("../db.js");
const { DataTypes } = require("sequelize");
const Usuario = require("./Usuario");
const Produto = require("./Produto");

const Compra = sequelize.define("Compra", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nomeCompleto: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  endereco: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  formaPagamento: {
    type: DataTypes.ENUM,
    values: ["pix", "cartao"],
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
  produtoId: {
    type: DataTypes.INTEGER,
    references: {
      model: Produto,
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
  status: {
    type: DataTypes.ENUM,
    values: [
      "aguardando pagamento",
      "pago",
      "aguardando fotos",
      "fotos enviadas",
      "enviado",
      "entregue"
    ],
    defaultValue: "aguardando pagamento",
    allowNull: false,
  },
});

Usuario.hasMany(Compra, { foreignKey: "clienteId" });
Compra.belongsTo(Usuario, { foreignKey: "clienteId", as: "cliente" });

Produto.hasMany(Compra, { foreignKey: "produtoId" });
Compra.belongsTo(Produto, { foreignKey: "produtoId", as: "produto" });

Usuario.hasMany(Compra, { foreignKey: "vendedorId" });
Compra.belongsTo(Usuario, { foreignKey: "vendedorId", as: "vendedor" });

module.exports = Compra;