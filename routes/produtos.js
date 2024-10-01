const express = require("express");
const router = express.Router();
const Produto = require("../model/Produto");
const Usuario = require("../model/Usuario");
const Comentario = require("../model/Comentario");
const Compra = require("../model/Compra");
const Avaliacao = require("../model/Avaliacao");
const { Op, fn, col } = require("sequelize");

// Rota para listar todos os produtos
router.get("/", async (req, res) => {
  try {
    const query = req.query.q ? req.query.q : "";
    const precoMin = req.query.precoMin ? parseFloat(req.query.precoMin) : 0;
    const precoMax = req.query.precoMax ? parseFloat(req.query.precoMax) : Number.MAX_VALUE;
    const origem = req.query.origem ? req.query.origem : "";

    // Condições de filtro
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
      ],
    };

    const produtos = await Produto.findAll({
      where: conditions,
      include: [{ model: Usuario, as: "vendedorProduto", attributes: ["id", "nome", "fotoPerfil"] }],
    });

    res.render("produtos", { produtos });
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
        { model: Usuario, as: "vendedorProduto", attributes: ["id", "nome", "fotoPerfil"] }, // Removido "createdAt"
        { model: Comentario, as: "comentarios", include: [{ model: Usuario, as: "usuario", attributes: ["id", "nome", "fotoPerfil"] }] }
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

    res.render("detalhesProduto", { produto, vendas, notaMedia: notaMedia.dataValues.notaMedia, numeroAvaliacoes });
  } catch (error) {
    console.error("Erro ao buscar detalhes do produto:", error);
    res.status(500).send("Erro ao buscar detalhes do produto");
  }
});

module.exports = router;