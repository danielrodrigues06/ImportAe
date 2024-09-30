const Usuario = require("./Usuario");
const Compra = require("./Compra");
const Avaliacao = require("./Avaliacao");
const Produto = require("./Produto");

// Definindo associações
Usuario.hasMany(Compra, { foreignKey: "clienteId" });
Compra.belongsTo(Usuario, { foreignKey: "clienteId", as: "cliente" });

Produto.hasMany(Compra, { foreignKey: "produtoId" });
Compra.belongsTo(Produto, { foreignKey: "produtoId", as: "produto" });

Usuario.hasMany(Compra, { foreignKey: "vendedorId", as: "vendas" });
Compra.belongsTo(Usuario, { foreignKey: "vendedorId", as: "vendedorCompra" });

Compra.hasMany(Avaliacao, { foreignKey: "compraId", as: "avaliacoes" });
Avaliacao.belongsTo(Compra, { foreignKey: "compraId", as: "compra" });

Usuario.hasMany(Avaliacao, { foreignKey: "clienteId", as: "avaliacoesFeitas" });
Avaliacao.belongsTo(Usuario, { foreignKey: "clienteId", as: "cliente" });

Usuario.hasMany(Avaliacao, { foreignKey: "vendedorId", as: "avaliacoesRecebidas" });
Avaliacao.belongsTo(Usuario, { foreignKey: "vendedorId", as: "vendedorAvaliacao" });

Usuario.hasMany(Produto, { foreignKey: "vendedorId", as: "produtos" });
Produto.belongsTo(Usuario, { foreignKey: "vendedorId", as: "vendedorProduto" });

module.exports = {
  Usuario,
  Compra,
  Avaliacao,
  Produto
};