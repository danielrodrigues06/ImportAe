const express = require("express");
const router = express.Router();
const Produto = require("../model/Produto");
const Usuario = require("../model/Usuario");
const Compra = require("../model/Compra");
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/imagens');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // appending extension
  }
});

const upload = multer({ storage: storage });

// Painel do vendedor - mostra perfil, produtos e compras
router.get("/", async (req, res) => {
  try {
    const vendedor = await Usuario.findByPk(req.user.id);
    const produtos = await Produto.findAll({ where: { vendedorId: req.user.id } });
    const compras = await Compra.findAll({
      where: { vendedorId: req.user.id },
      include: [
        {
          model: Produto,
          as: 'produto',
          attributes: ['nome', 'preco']
        },
        {
          model: Usuario,
          as: 'cliente',
          attributes: ['id', 'nome', 'email'] // Inclua o atributo 'id' do cliente
        }
      ]
    });
    res.render("painelVendedor", { vendedor, produtos, compras });
  } catch (error) {
    console.error("Erro ao carregar o painel do vendedor:", error);
    res.status(500).send("Erro ao carregar o painel do vendedor.");
  }
});

// Editar perfil do vendedor
router.post("/editar-perfil", upload.single('fotoPerfil'), async (req, res) => {
  try {
    const { nome, email, telefone, deOndeImporta, sobreMim } = req.body;
    const fotoPerfil = req.file ? req.file.filename : null;
    const updateData = { nome, email, telefone, deOndeImporta, sobreMim };
    if (fotoPerfil) {
      updateData.fotoPerfil = fotoPerfil;
    }
    await Usuario.update(updateData, { where: { id: req.user.id } });
    res.redirect("/painelVendedor");
  } catch (error) {
    console.error("Erro ao editar perfil:", error);
    res.status(500).send("Erro ao editar o perfil.");
  }
});

// Editar produto do vendedor
router.post("/editar-produto/:id", upload.array('foto', 5), async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, categoria, origem, estoque } = req.body;

  try {
    const updateData = { nome, descricao, preco, categoria, origem, estoque };

    if (req.files.length > 0) {
      if (req.files.length < 3) {
        return res.status(400).send("Por favor, envie pelo menos 3 fotos.");
      }
      const fotosArray = req.files.map(file => file.filename); // Captura os nomes dos arquivos enviados
      updateData.fotos = fotosArray;
    }

    await Produto.update(updateData, { where: { id, vendedorId: req.user.id } });

    res.redirect("/painelVendedor");
  } catch (error) {
    console.error("Erro ao editar produto:", error);
    res.status(500).send("Erro ao editar o produto.");
  }
});

// Deletar produto do vendedor
router.post("/deletar-produto/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Produto.destroy({ where: { id, vendedorId: req.user.id } });
    res.redirect("/painelVendedor");
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).send("Erro ao deletar o produto.");
  }
});

module.exports = router;