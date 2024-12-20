const express = require("express");
const router = express.Router();
const Produto = require("../model/Produto");
const Usuario = require("../model/Usuario");
const Compra = require("../model/Compra");
const Avaliacao = require("../model/Avaliacao");
const Solicitacao = require("../model/Solicitacao");
const path = require('path');
const multer = require('multer');
const bcrypt = require("bcryptjs");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/imagens');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // appending extension
  }
});

const upload = multer({ storage: storage });

// Função para validar o código de rastreio
function validarCodigoRastreio(codigo) {
  const regex = /^[A-Z]{2}\d{9}[A-Z]{2}$/;
  return regex.test(codigo);
}

// Painel do vendedor - mostra perfil, produtos, compras e solicitações
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
          attributes: ['id', 'nome', 'email']
        },
        {
          model: Avaliacao,
          as: 'avaliacoes',
          where: { vendedorId: req.user.id, tipo: 'vendedor_para_cliente' },
          required: false
        }
      ],
      attributes: ['id', 'endereco', 'quantidade', 'status', 'codigoRastreio']
    });
    const solicitacoes = await Solicitacao.findAll({
      where: { vendedorId: req.user.id },
      include: [
        {
          model: Usuario,
          as: 'cliente',
          attributes: ['id', 'nome']
        }
      ]
    });

    const categorias = ['Eletrônicos', 'Roupas', 'Livros', 'Móveis', 'Brinquedos', 'Ferramentas', 'Beleza', 'Esportes', 'Automotivo', 'Alimentos'];

    res.render("painelVendedor", { vendedor, produtos, compras, solicitacoes, categorias });
  } catch (error) {
    console.error("Erro ao carregar o painel do vendedor:", error);
    res.status(500).send("Erro ao carregar o painel do vendedor.");
  }
});

// Editar perfil do vendedor
router.post("/editar-perfil", upload.single('fotoPerfil'), async (req, res) => {
  try {
    const { nome, email, telefone, deOndeImporta, sobreMim, senha } = req.body;
    const fotoPerfil = req.file ? req.file.filename : null;
    const updateData = { nome, email, telefone, deOndeImporta, sobreMim };

    if (fotoPerfil) {
      updateData.fotoPerfil = fotoPerfil;
    }

    if (senha) {
      const hashedPassword = await bcrypt.hash(senha, 10);
      updateData.senha = hashedPassword;
    }

    await Usuario.update(updateData, { where: { id: req.user.id } });
    req.flash('success', 'Perfil editado com sucesso.');
    res.redirect("/painelVendedor");
  } catch (error) {
    console.error("Erro ao editar perfil:", error);
    req.flash('error', 'Erro ao editar o perfil.');
    res.redirect("/painelVendedor");
  }
});

// Excluir perfil do vendedor
router.post("/excluir-perfil", async (req, res) => {
  try {
    const { confirmSenha } = req.body;
    const vendedor = await Usuario.findByPk(req.user.id);

    const isMatch = await bcrypt.compare(confirmSenha, vendedor.senha);
    if (!isMatch) {
      req.flash('error', 'Senha incorreta.');
      return res.redirect("/painelVendedor");
    }

    await Usuario.destroy({ where: { id: req.user.id } });
    req.logout();
    req.flash('success', 'Conta excluída com sucesso.');
    res.redirect("/");
  } catch (error) {
    console.error("Erro ao excluir perfil do vendedor:", error);
    req.flash('error', 'Erro ao excluir o perfil do vendedor.');
    res.redirect("/painelVendedor");
  }
});

// Editar produto do vendedor
router.post("/editar-produto/:id", upload.array('foto', 5), async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, categoria, origem, estoque } = req.body;

  try {
    const updateData = { nome, descricao, preco, categoria, origem, estoque };

    if (req.files.length > 0) {
      const fotosArray = req.files.map(file => file.filename); // Captura os nomes dos arquivos enviados
      updateData.fotos = fotosArray;
    }

    await Produto.update(updateData, { where: { id, vendedorId: req.user.id } });

    req.flash('success', 'Produto editado com sucesso.');
    res.redirect("/painelVendedor");
  } catch (error) {
    console.error("Erro ao editar produto:", error);
    req.flash('error', 'Erro ao editar o produto.');
    res.redirect("/painelVendedor");
  }
});

// Deletar produto do vendedor
router.post("/deletar-produto/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Produto.destroy({ where: { id, vendedorId: req.user.id } });

    req.flash('success', 'Produto deletado com sucesso.');
    res.redirect("/painelVendedor");
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    req.flash('error', 'Erro ao deletar o produto.');
    res.redirect("/painelVendedor");
  }
});

// Atualizar status da compra
router.post("/atualizar-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const compra = await Compra.findByPk(id);
    if (!compra || compra.vendedorId !== req.user.id) {
      return res.status(404).send("Compra não encontrada ou acesso negado.");
    }

    compra.status = status;
    await compra.save();

    req.flash('success', 'Compra atualizada com sucesso.');
    res.redirect("/painelVendedor");
  } catch (error) {
    console.error("Erro ao atualizar status da compra:", error);
    res.status(500).send("Erro ao atualizar status da compra.");
  }
});

// Adicionar fotos do produto e da embalagem
router.post("/adicionar-fotos/:id", upload.array('fotos', 5), async (req, res) => {
  const { id } = req.params;

  try {
    const fotosArray = req.files.map(file => file.filename); // Captura os nomes dos arquivos enviados

    const compra = await Compra.findByPk(id);
    if (!compra || compra.vendedorId !== req.user.id) {
      return res.status(404).send("Compra não encontrada ou acesso negado.");
    }

    compra.fotos = fotosArray;
    compra.status = "fotos enviadas";
    await compra.save();

    req.flash('success', 'Compra atualizada com sucesso.');
    res.redirect("/painelVendedor");
  } catch (error) {
    console.error("Erro ao adicionar fotos:", error);
    res.status(500).send("Erro ao adicionar fotos.");
  }
});

// Adicionar código de rastreio
router.post("/adicionar-rastreio/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { codigoRastreio } = req.body;

    if (!validarCodigoRastreio(codigoRastreio)) {
      req.flash('error', 'Código de rastreio inválido. Deve seguir o padrão dos Correios.');
      return res.redirect("/painelVendedor");
    }

    const compra = await Compra.findByPk(id);
    if (!compra || compra.vendedorId !== req.user.id) {
      return res.status(404).send("Compra não encontrada ou acesso negado.");
    }

    compra.codigoRastreio = codigoRastreio;
    await compra.save();

    req.flash('success', 'Compra atualizada com sucesso.');
    res.redirect("/painelVendedor");
  } catch (error) {
    console.error("Erro ao adicionar código de rastreio:", error);
    res.status(500).send("Erro ao adicionar código de rastreio.");
  }
});

module.exports = router;