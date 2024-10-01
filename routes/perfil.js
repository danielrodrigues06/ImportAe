const express = require('express');
const router = express.Router();
const Usuario = require('../model/Usuario');
const Avaliacao = require('../model/Avaliacao');
const Produto = require('../model/Produto');
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
                    include: [{ model: Usuario, as: 'cliente', attributes: ['id', 'nome', 'fotoPerfil'] }],
                    order: [['createdAt', 'DESC']] // Ordenar por data de criação em ordem decrescente
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

module.exports = router;