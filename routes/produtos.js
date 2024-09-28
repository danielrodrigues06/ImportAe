const express = require("express");
const router = express.Router();
const Produto = require("../model/Produto");
const Usuario = require("../model/Usuario");
const { Op } = require("sequelize");

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
            { descricao: { [Op.like]: `%${query}%` } }
          ]
        },
        { preco: { [Op.between]: [precoMin, precoMax] } }
      ]
    };

    if (origem) {
      conditions[Op.and].push({ origem: origem });
    }

    // Buscar todos os produtos e incluir os dados do vendedor
    const produtos = await Produto.findAll({
      where: conditions,
      include: [
        {
          model: Usuario,
          as: "vendedor", // Use o alias "vendedor" configurado no model
          attributes: ["id", "nome", "fotoPerfil"], // Atributos do vendedor que queremos mostrar
        },
      ],
      attributes: ["id", "nome", "descricao", "preco", "fotos", "estoque"], // Inclua o atributo estoque
    });

    // Renderizando a view de produtos com os dados obtidos
    res.render("produtos", { produtos });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).send("Erro ao buscar produtos");
  }
});

module.exports = router;