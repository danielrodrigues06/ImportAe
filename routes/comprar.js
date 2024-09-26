
const express = require('express');
const router = express.Router();
const Usuario = require('../model/Usuario'); // Importe o modelo Usuario
const Compra = require('../model/Compra');
const Produto = require('../model/Produto');

router.get('/:id', async (req, res) => {
    const produto = await Produto.findByPk(req.params.id, {
        include: [{ model: Usuario, as: 'vendedor' }], // Inclua o vendedor na busca
        attributes: ['id', 'nome', 'descricao', 'preco', 'fotos'] // Inclua o campo 'fotos' na busca
    });
    
    if (!produto) {
        // Se o produto não foi encontrado, retorne um erro
        return res.status(404).send('Produto não encontrado');
    }

    // Renderiza a página de compra com os detalhes do produto e do vendedor
    res.render('comprar', { produto, vendedor: produto.vendedor });
});

router.post('/comprar/:id', async (req, res) => {
    const { nomeCompleto, cpf, endereco, formaPagamento } = req.body;
    const produto = await Produto.findByPk(req.params.id);
    
    // Cria uma nova compra
    const novaCompra = await Compra.create({
        nomeCompleto,
        cpf,
        endereco,
        formaPagamento,
        produtoId: produto.id,
        clienteId: req.user.id, // Supondo que o usuário esteja autenticado e seu ID esteja disponível em req.user.id
        vendedorId: produto.vendedorId, // O vendedorId é obtido do produto
    });

    res.redirect('/produtos');
});

module.exports = router;