const sequelize = require("../db.js");
const { DataTypes } = require("sequelize");
const Avaliacao = require("./Avaliacao");

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

// Método para calcular a nota média do vendedor
Usuario.prototype.getNotaMedia = async function () {
  const avaliacoes = await Avaliacao.findAll({
    where: {
      vendedorId: this.id,
      tipo: 'cliente_para_vendedor'
    },
    attributes: ['nota']
  });

  if (avaliacoes.length === 0) return null;

  const somaNotas = avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.nota, 0);
  return (somaNotas / avaliacoes.length).toFixed(1);
};

module.exports = Usuario;