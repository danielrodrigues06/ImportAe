const express = require('express');
const router = express.Router();
const path = require('path');
const crypto = require('crypto');
const Avaliacao = require('../model/Avaliacao');
const Compra = require('../model/Compra');
const Usuario = require('../model/Usuario');

// Rota para criar uma nova avaliação pelo vendedor
router.post('/vendedor/:compraId', async (req, res) => {
    const { nota, comentario } = req.body;
    const { compraId } = req.params;
    const vendedorId = req.user.id;

    try {
        const compra = await Compra.findByPk(compraId, {
            include: [{ model: Usuario, as: 'cliente' }]
        });

        if (!compra) {
            return res.status(404).send('Compra não encontrada');
        }

        // Verificar se já existe uma avaliação para esta compra e vendedor
        const avaliacaoExistente = await Avaliacao.findOne({
            where: {
                compraId: compra.id,
                vendedorId: vendedorId,
                clienteId: compra.clienteId,
                tipo: 'vendedor_para_cliente' // Adicionando tipo na verificação
            }
        });

        if (avaliacaoExistente) {
            return res.status(400).send('Você já avaliou este cliente para esta compra.');
        }

        await Avaliacao.create({
            nota,
            comentario,
            clienteId: compra.clienteId,
            vendedorId,
            compraId: compra.id,
            tipo: 'vendedor_para_cliente' // Adicionando tipo na criação
        });

        req.flash('success', 'Avaliação enviada com sucesso!');
        res.redirect('/painelVendedor'); // Redireciona para o painel do vendedor
    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        req.flash('error', 'Erro ao criar avaliação.');
        res.status(500).send('Erro ao criar avaliação.');
    }
});

router.post('/:compraId', async (req, res) => {
    const { nota, comentario } = req.body;
    const { compraId } = req.params;
    const clienteId = req.user.id;

    try {
        const compra = await Compra.findByPk(compraId, {
            include: [{ model: Usuario, as: 'vendedorCompra' }] // Use o alias correto aqui
        });

        if (!compra) {
            return res.status(404).send('Compra não encontrada');
        }

        // Verificar se já existe uma avaliação para esta compra e cliente
        const avaliacaoExistente = await Avaliacao.findOne({
            where: {
                compraId: compra.id,
                clienteId: clienteId,
                tipo: 'cliente_para_vendedor' // Adicionando tipo na verificação
            }
        });

        if (avaliacaoExistente) {
            return res.status(400).send('Você já avaliou esta compra.');
        }

        await Avaliacao.create({
            nota,
            comentario,
            clienteId,
            vendedorId: compra.vendedorId, // Acessando o vendedorId corretamente
            compraId: compra.id,
            tipo: 'cliente_para_vendedor' // Adicionando tipo na criação
        });

        req.flash('success', 'Avaliação enviada com sucesso!');
        res.redirect('/painelCliente'); // Redireciona para o painel do cliente
    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        req.flash('error', 'Erro ao criar avaliação.');
        res.status(500).send('Erro ao criar avaliação.');
    }
});

module.exports = router;