const { Sequelize } = require('sequelize');

// Configuração da conexão com o banco de dados
const sequelize = new Sequelize('importae', 'root', '', {
    host: 'localhost',
    dialect: 'mysql' // ou 'postgres', 'sqlite', 'mssql'
});

// Sincronização com o banco de dados
sequelize
    .sync({ alter: true })
    .then(() => {
        console.log("Todas as tabelas foram sincronizadas!");
    })
    .catch((error) => {
        console.error("Erro ao sincronizar as tabelas:", error);
    });
    