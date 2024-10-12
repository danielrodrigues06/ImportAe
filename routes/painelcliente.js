const express = require("express");
const router = express.Router();
const Usuario = require("../model/Usuario");
const Produto = require('../model/Produto');
const Compra = require("../model/Compra");
const Avaliacao = require("../model/Avaliacao");
const path = require('path');
const multer = require('multer');

// Configuração do multer para upload de fotos de perfil
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/imagens/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Painel do cliente - mostra perfil e compras
router.get("/", async (req, res) => {
  try {
    const cliente = await Usuario.findByPk(req.user.id);
    const compras = await Compra.findAll({
      where: { clienteId: req.user.id },
      include: [
        {
          model: Produto,
          as: 'produto',
          attributes: ['nome', 'preco', 'fotos']
        },
        {
          model: Avaliacao,
          as: 'avaliacoes',
          required: false,
          where: { clienteId: req.user.id }
        }
      ]
    });
    res.render("painelCliente", { cliente, compras });
  } catch (error) {
    console.error("Erro ao carregar o painel do cliente:", error);
    res.status(500).send("Erro ao carregar o painel do cliente.");
  }
});

// Editar perfil do cliente
router.post("/editar-perfil", upload.single('fotoPerfil'), async (req, res) => {
  try {
    const { nome, email, telefone } = req.body;
    const fotoPerfil = req.file ? req.file.filename : null;
    const updateData = { nome, email, telefone };

    if (fotoPerfil) {
      updateData.fotoPerfil = fotoPerfil;
    }

    await Usuario.update(updateData, { where: { id: req.user.id } });
    req.flash('success', 'Perfil editado com sucesso!');
    res.redirect("/painelCliente");
  } catch (error) {
    console.error("Erro ao editar perfil do cliente:", error);
    req.flash('error', 'Erro ao editar o perfil do cliente.');
    res.redirect("/painelCliente");
  }
});

module.exports = router;