const sequelize = require("../db.js");
const { DataTypes } = require("sequelize");

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
      model: "Usuarios",
      key: "id",
    },
    allowNull: false,
  },
  produtoId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Produtos",
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

module.exports = Compra;