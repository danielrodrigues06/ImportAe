const express = require("express");
const router = express.Router();
const Produto = require("../model/Produto");
const Usuario = require("../model/Usuario");
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
      include: [
        {
          model: Usuario,
          as: "vendedorProduto",
          attributes: ["id", "nome", "fotoPerfil"],
          include: [
            {
              model: Avaliacao,
              as: "avaliacoesRecebidas",
              attributes: [[fn('AVG', col('nota')), 'notaMedia']],
              where: { tipo: 'cliente_para_vendedor' },
              required: false
            }
          ]
        }
      ],
    });

    // Adiciona a nota média ao vendedorProduto
    produtos.forEach(produto => {
      const vendedor = produto.vendedorProduto;
      if (vendedor && vendedor.avaliacoesRecebidas.length > 0) {
        vendedor.notaMedia = vendedor.avaliacoesRecebidas[0].dataValues.notaMedia;
      } else {
        vendedor.notaMedia = null;
      }
    });

    res.render("produtos", { produtos });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).send("Erro ao buscar produtos");
  }
});

module.exports = router;