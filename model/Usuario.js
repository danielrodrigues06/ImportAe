const database = require("../db.js");
const sequelize = require("../db.js");
const { DataTypes } = require("sequelize");


const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fotoPerfil: {
      type: DataTypes.STRING
    },
    nome: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    senha: {
      type: DataTypes.STRING
    },
    dataNascimento: {
      type: DataTypes.DATE
    },
    telefone: {
      type: DataTypes.STRING
    },
    tipo: {
      type: DataTypes.ENUM,
      values: ['cliente', 'vendedor']
    },
    deOndeImporta: {
      type: DataTypes.ENUM,
      values: ['eua', 'china']
    },
    sobreMim: {
      type: DataTypes.TEXT
    }
  });
  

module.exports = Usuario;