const express = require("express");
const router = express.Router();
const Produto = require("../model/Produto");
const Usuario = require("../model/Usuario");
const Comentario = require("../model/Comentario");
const Compra = require("../model/Compra");
const Avaliacao = require("../model/Avaliacao");
const { Op, fn, col } = require("sequelize");
const moment = require("moment"); // Importa a biblioteca moment

router.get("/", async (req, res) => {
  try {
    const query = req.query.q || "";
    const precoMin = req.query.precoMin ? parseFloat(req.query.precoMin) : 0;
    const precoMax = req.query.precoMax ? parseFloat(req.query.precoMax) : Number.MAX_VALUE;
    const origem = req.query.origem || "";
    const categoria = req.query.categoria || "";

    // Paginação
    const page = parseInt(req.query.page) || 1; // Pega a página atual, default 1
    const pageSize = 6; // Número de produtos por página
    const offset = (page - 1) * pageSize;

    const conditions = {
      [Op.and]: [
        {
          [Op.or]: [
            { nome: { [Op.like]: `%${query}%` } },
            { descricao: { [Op.like]: `%${query}%` } },
          ],
        },
        { preco: { [Op.between]: [precoMin, precoMax] } },
        origem ? { origem: origem } : {},
        categoria ? { categoria: categoria } : {},
      ],
    };

    // Consultar produtos com paginação
    const { rows: produtos, count: totalProdutos } = await Produto.findAndCountAll({
      where: conditions,
      include: [{ model: Usuario, as: "vendedorProduto", attributes: ["id", "nome", "fotoPerfil"] }],
      limit: pageSize,
      offset: offset,
    });

    const totalPages = Math.ceil(totalProdutos / pageSize); // Total de páginas

    res.render("produtos", { produtos, page, totalPages });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).send("Erro ao buscar produtos");
  }
});

// Rota para exibir os detalhes do produto
router.get("/:id", async (req, res) => {
  try {
    const produto = await Produto.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: "vendedorProduto", attributes: ["id", "nome", "fotoPerfil", "createdAt"] },
        { model: Comentario, as: "comentarios", include: [{ model: Usuario, as: "usuario", attributes: ["id", "nome", "fotoPerfil", "createdAt"] }] }
      ],
    });

    if (!produto) {
      return res.status(404).send("Produto não encontrado");
    }

    const vendas = await Compra.count({ where: { produtoId: produto.id } });
    const notaMedia = await Avaliacao.findOne({
      where: { vendedorId: produto.vendedorProduto.id, tipo: 'cliente_para_vendedor' },
      attributes: [[fn('AVG', col('nota')), 'notaMedia']]
    });
    const numeroAvaliacoes = await Avaliacao.count({ where: { vendedorId: produto.vendedorProduto.id, tipo: 'cliente_para_vendedor' } });

    // Formata as datas de criação
    produto.vendedorProduto.createdAtFormatted = moment(produto.vendedorProduto.createdAt).format('DD/MM/YYYY');
    produto.comentarios.forEach(comentario => {
      comentario.usuario.createdAtFormatted = moment(comentario.usuario.createdAt).format('DD/MM/YYYY');
    });

    res.render("detalhesProduto", { produto, vendas, notaMedia: notaMedia.dataValues.notaMedia, numeroAvaliacoes, user: req.user });
  } catch (error) {
    console.error("Erro ao buscar detalhes do produto:", error);
    res.status(500).send("Erro ao buscar detalhes do produto");
  }
});

module.exports = router;