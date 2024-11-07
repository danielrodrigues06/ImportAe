const express = require('express');
const router = express.Router();
const Usuario = require('../model/Usuario');
const Compra = require('../model/Compra');
const Produto = require('../model/Produto');

router.get('/:id', async (req, res) => {
    try {
        const produto = await Produto.findByPk(req.params.id, {
            include: [{ model: Usuario, as: 'vendedor' }],
            attributes: ['id', 'nome', 'descricao', 'preco', 'fotos', 'estoque']
        });

        if (!produto) {
            return res.status(404).send('Produto não encontrado');
        }

        if (produto.estoque === 0) {
            return res.status(400).send('Produto indisponível para compra');
        }

        const fotos = Array.isArray(produto.fotos) ? produto.fotos : [];

        res.render('comprar', { produto, vendedor: produto.vendedor, fotos });
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).send('Erro ao buscar produto');
    }
});

router.post('/:id', async (req, res) => {
    const { nomeCompleto, cpf, endereco, formaPagamento, quantidade } = req.body;
    const produto = await Produto.findByPk(req.params.id);

    if (!produto) {
        return res.status(404).send('Produto não encontrado');
    }

    if (produto.estoque < quantidade) {
        return res.status(400).send('Quantidade insuficiente no estoque');
    }

    try {
        const novaCompra = await Compra.create({
            nomeCompleto,
            cpf,
            endereco,
            formaPagamento,
            produtoId: produto.id,
            clienteId: req.user.id,
            vendedorId: produto.vendedorId,
            quantidade,
        });

        produto.estoque -= quantidade;
        await produto.save();

        req.flash('success', 'Compra realizada com sucesso');
        res.redirect('/painelCliente');
    } catch (error) {
        console.error('Erro ao realizar compra:', error);
        req.flash('error', 'Erro ao realizar compra');
        res.redirect('/comprar/' + req.params.id);
    }
});

module.exports = router;