const express = require('express');
const router = express.Router();
const Usuario = require('../model/Usuario');
const Avaliacao = require('../model/Avaliacao');
const Produto = require('../model/Produto');
const Compra = require('../model/Compra');
const { Op } = require('sequelize');

// Rota para exibir o perfil do vendedor
router.get('/vendedor/:id', async (req, res) => {
    try {
        const vendedor = await Usuario.findByPk(req.params.id, {
            include: [
                {
                    model: Avaliacao,
                    as: 'avaliacoesRecebidas',
                    where: { tipo: 'cliente_para_vendedor' },
                    required: false,
                    include: [{ model: Usuario, as: 'cliente', attributes: ['id', 'nome', 'fotoPerfil'] }]
                },
                {
                    model: Produto,
                    as: 'produtos',
                    attributes: ['id', 'nome', 'preco', 'fotos', 'estoque']
                }
            ]
        });

        if (!vendedor || vendedor.tipo !== 'vendedor') {
            return res.status(404).send('Vendedor não encontrado');
        }

        // Calcular a nota média do vendedor
        const avaliacoes = vendedor.avaliacoesRecebidas.map(avaliacao => {
            return {
                ...avaliacao.toJSON(),
                fotos: avaliacao.fotos || []
            };
        });
        const notaMedia = avaliacoes.length > 0 ? (avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.nota, 0) / avaliacoes.length).toFixed(1) : null;

        res.render('perfilVendedor', { vendedor, notaMedia, avaliacoes });
    } catch (error) {
        console.error('Erro ao buscar perfil do vendedor:', error);
        res.status(500).send('Erro ao buscar perfil do vendedor');
    }
});

router.get('/cliente/:id', async (req, res) => {
    try {
        const cliente = await Usuario.findByPk(req.params.id, {
            include: [
                {
                    model: Compra,
                    as: 'compras', // Associação de compras feitas pelo cliente
                    attributes: ['id']
                },
                {
                    model: Avaliacao,
                    as: 'avaliacoesRecebidas', // Associação de avaliações recebidas como cliente
                    where: { tipo: 'vendedor_para_cliente' },
                    required: false,
                    include: [{ model: Usuario, as: 'vendedorAvaliacao', attributes: ['id', 'nome', 'fotoPerfil'] }]
                }
            ]
        });

        if (!cliente || cliente.tipo !== 'cliente') {
            return res.status(404).send('Esse usuário não é um cliente');
        }

        // Calcular a nota média do cliente
        const avaliacoes = cliente.avaliacoesRecebidas.map(avaliacao => avaliacao.toJSON());
        const notaMedia = avaliacoes.length > 0 ? (avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.nota, 0) / avaliacoes.length).toFixed(1) : null;

        // Obter a última avaliação recebida
        const ultimaAvaliacao = avaliacoes.length > 0 ? avaliacoes[avaliacoes.length - 1] : null;

        // Formatar a data de criação do cliente
        const dataCriacao = new Date(cliente.createdAt);
        const mesAnoCriacao = `${dataCriacao.getMonth() + 1}/${dataCriacao.getFullYear()}`;

        res.render('perfilCliente', { cliente, notaMedia, numeroCompras: cliente.compras.length, mesAnoCriacao, ultimaAvaliacao });
    } catch (error) {
        console.error('Erro ao buscar perfil do cliente:', error);
        res.status(500).send('Erro ao buscar perfil do cliente');
    }
});


module.exports = router;