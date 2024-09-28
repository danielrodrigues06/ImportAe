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
        allowNull: true  // Permitir que o campo texto seja nulo
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
    },
    imagem: {
        type: DataTypes.STRING,
        allowNull: true  // Permitir que o campo imagem seja nulo
    }
});

Usuario.hasMany(Mensagem, { foreignKey: 'usuarioId', as: 'mensagensEnviadas' });
Usuario.hasMany(Mensagem, { foreignKey: 'destinatarioId', as: 'mensagensRecebidas' });
Mensagem.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'remetente' });
Mensagem.belongsTo(Usuario, { foreignKey: 'destinatarioId', as: 'destinatario' });

module.exports = Mensagem;