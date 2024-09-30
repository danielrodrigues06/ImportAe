const Usuario = require("./Usuario");
const Compra = require("./Compra");
const Avaliacao = require("./Avaliacao");
const Produto = require("./Produto");

// Definindo associações
Usuario.hasMany(Compra, { foreignKey: "clienteId" });
Compra.belongsTo(Usuario, { foreignKey: "clienteId", as: "cliente" });

Produto.hasMany(Compra, { foreignKey: "produtoId" });
Compra.belongsTo(Produto, { foreignKey: "produtoId", as: "produto" });

Usuario.hasMany(Compra, { foreignKey: "vendedorId" });
Compra.belongsTo(Usuario, { foreignKey: "vendedorId", as: "vendedor" });

Compra.hasMany(Avaliacao, { foreignKey: "compraId", as: "avaliacoes" });
Avaliacao.belongsTo(Compra, { foreignKey: "compraId", as: "compra" });

Usuario.hasMany(Avaliacao, { foreignKey: "clienteId" });
Avaliacao.belongsTo(Usuario, { foreignKey: "clienteId", as: "cliente" });

Usuario.hasMany(Avaliacao, { foreignKey: "vendedorId" });
Avaliacao.belongsTo(Usuario, { foreignKey: "vendedorId", as: "vendedor" });

module.exports = {
  Usuario,
  Compra,
  Avaliacao,
  Produto
};