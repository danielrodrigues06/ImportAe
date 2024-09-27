const sequelize = require("../db.js");
const { DataTypes } = require("sequelize");
const Usuario = require("../model/Usuario");

const Mensagem = sequelize.define('Mensagem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    texto: {
        type: DataTypes.TEXT,
        allowNull: false  // Certifique-se de que o campo texto não seja nulo
    },
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,  // Certifique-se de que o campo usuarioId não seja nulo
        references: {
            model: Usuario,
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    destinatarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,  // Certifique-se de que o campo destinatarioId não seja nulo
        references: {
            model: Usuario,
            key: 'id'
        }
    }
});

Usuario.hasMany(Mensagem, { foreignKey: 'usuarioId' });
Mensagem.belongsTo(Usuario, { foreignKey: 'usuarioId' });

module.exports = Mensagem;
