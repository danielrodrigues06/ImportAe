const Usuario = require("./Usuario");
const Compra = require("./Compra");
const Avaliacao = require("./Avaliacao");
const Produto = require("./Produto");
const Comentario = require("./Comentario");
const Solicitacao = require("./Solicitacao");

Usuario.hasMany(Compra, { foreignKey: "clienteId", as: "compras" });
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

Produto.hasMany(Avaliacao, { foreignKey: "produtoId", as: "avaliacoesProduto" });
Avaliacao.belongsTo(Produto, { foreignKey: "produtoId", as: "produto" });

Usuario.hasMany(Comentario, { foreignKey: "usuarioId" });
Comentario.belongsTo(Usuario, { foreignKey: "usuarioId", as: "usuario" });

Produto.hasMany(Comentario, { foreignKey: "produtoId", as: "comentarios" });
Comentario.belongsTo(Produto, { foreignKey: "produtoId", as: "produto" });

Usuario.hasMany(Solicitacao, { foreignKey: "clienteId", as: "solicitacoesFeitas" });
Solicitacao.belongsTo(Usuario, { foreignKey: "clienteId", as: "cliente" });

Usuario.hasMany(Solicitacao, { foreignKey: "vendedorId", as: "solicitacoesRecebidas" });
Solicitacao.belongsTo(Usuario, { foreignKey: "vendedorId", as: "vendedor" });

module.exports = {
  Usuario,
  Compra,
  Avaliacao,
  Produto,
  Comentario,
  Solicitacao,
};