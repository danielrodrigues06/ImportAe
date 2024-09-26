// routes/produtos.js
const express = require("express");
const router = express.Router();
const Produto = require("../model/Produto");
const Usuario = require("../model/Usuario");

// Rota para listar todos os produtos
router.get("/", async (req, res) => {
  try {
    // Buscar todos os produtos e incluir os dados do vendedor
    const produtos = await Produto.findAll({
      include: [
        {
          model: Usuario,
          as: "vendedor", // Use o alias "vendedor" configurado no model
          attributes: ["nome", "fotoPerfil"], // Atributos do vendedor que queremos mostrar
        },
      ],
    });

    // Renderizando a view de produtos com os dados obtidos
    res.render("produtos", { produtos });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).send("Erro ao buscar produtos");
  }
});

module.exports = router;
