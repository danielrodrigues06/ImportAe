const { DataTypes } = require('sequelize');
const sequelize = require('../db');

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
        type: DataTypes.STRING
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
}, {
    tableName: 'Usuarios',
    indexes: [
        {
            unique: true,
            fields: ['email']
        }
    ]
});

module.exports = Usuario;