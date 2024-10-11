const express = require('express');
const router = express.Router();
const Usuario = require('../model/Usuario');
const Avaliacao = require('../model/Avaliacao');
const Produto = require('../model/Produto');
const Compra = require('../model/Compra'); // Adicione esta linha
const { Op } = require('sequelize');
const moment = require('moment'); // Importa a biblioteca moment

// Rota para exibir o perfil do usuário (vendedor ou cliente)
router.get('/:id', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 3; // Número de produtos por página
        const offset = (page - 1) * pageSize;

        const usuario = await Usuario.findByPk(req.params.id, {
            include: [
                {
                    model: Avaliacao,
                    as: 'avaliacoesRecebidas',
                    required: false,
                    where: {
                        tipo: 'cliente_para_vendedor'
                    },
                    include: [
                        { model: Usuario, as: 'cliente', attributes: ['id', 'nome', 'fotoPerfil'] },
                        {
                            model: Compra,
                            as: 'compra',
                            include: [
                                { model: Produto, as: 'produto', attributes: ['id', 'nome'] }
                            ]
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: Avaliacao,
                    as: 'avaliacoesRecebidasCliente',
                    required: false,
                    where: {
                        tipo: 'vendedor_para_cliente'
                    },
                    include: [
                        { model: Usuario, as: 'vendedorAvaliacao', attributes: ['id', 'nome', 'fotoPerfil'] },
                        {
                            model: Compra,
                            as: 'compra',
                            include: [
                                { model: Produto, as: 'produto', attributes: ['id', 'nome'] }
                            ]
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: Produto,
                    as: 'produtos',
                    attributes: ['id', 'nome', 'preco', 'fotos', 'estoque'],
                    limit: pageSize,
                    offset: offset
                }
            ],
            attributes: ['id', 'nome', 'email', 'tipo', 'fotoPerfil', 'deOndeImporta', 'sobreMim', 'createdAt']
        });

        if (!usuario) {
            return res.status(404).send('Usuário não encontrado');
        }

        // Formata a data de criação do usuário
        usuario.createdAtFormatted = moment(usuario.createdAt).format('DD/MM/YYYY');

        // Calcular a nota média do vendedor, se aplicável
        const avaliacoes = usuario.avaliacoesRecebidas.map(avaliacao => {
            return {
                ...avaliacao.toJSON(),
                fotos: avaliacao.fotos || []
            };
        });
        const notaMedia = avaliacoes.length > 0 ? (avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.nota, 0) / avaliacoes.length).toFixed(1) : null;

        // Calcular a nota média do cliente, se aplicável
        const avaliacoesCliente = usuario.avaliacoesRecebidasCliente.map(avaliacao => {
            return {
                ...avaliacao.toJSON(),
                fotos: avaliacao.fotos || []
            };
        });
        const notaMediaCliente = avaliacoesCliente.length > 0 ? (avaliacoesCliente.reduce((acc, avaliacao) => acc + avaliacao.nota, 0) / avaliacoesCliente.length).toFixed(1) : null;

        // Total de produtos para paginação
        const totalProdutos = await Produto.count({ where: { vendedorId: req.params.id } });
        const totalPages = Math.ceil(totalProdutos / pageSize);

        res.render('perfil', { usuario, notaMedia, avaliacoes, notaMediaCliente, avaliacoesCliente, totalPages, currentPage: page });
    } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        res.status(500).send('Erro ao buscar perfil do usuário');
    }
});

module.exports = router;