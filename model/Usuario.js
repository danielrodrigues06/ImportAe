const sequelize = require("../db.js");
const { DataTypes } = require("sequelize");

const Usuario = sequelize.define("Usuario", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM("cliente", "vendedor"),
    allowNull: false,
  },
  fotoPerfil: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deOndeImporta: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sobreMim: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Usuario;