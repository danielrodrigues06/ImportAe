const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const Usuario = require("./usuario"); // Sua model de Usuario

const Produto = sequelize.define("Produto", {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  preco: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: "id",
    },
  },
  imagem: {
    type: DataTypes.STRING,
    allowNull: true, // Imagem é opcional
  },
});

// Relacionamento com o usuário (vendedor)
Produto.belongsTo(Usuario, { foreignKey: "usuarioId" });

module.exports = Produto;