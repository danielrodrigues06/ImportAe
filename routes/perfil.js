const express = require('express');
const router = express.Router();
const Usuario = require('../model/Usuario');
const Avaliacao = require('../model/Avaliacao');
const Produto = require('../model/Produto');
const Compra = require('../model/Compra');
const { Op } = require('sequelize');

// Rota para exibir o perfil do usuário (vendedor ou cliente)
router.get('/:id', async (req, res) => {
    try {
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
                    attributes: ['id', 'nome', 'preco', 'fotos', 'estoque']
                },
                {
                    model: Compra,
                    as: 'compras',
                    include: [{ model: Produto, as: 'produto', attributes: ['id', 'nome', 'fotos'] }],
                    order: [['createdAt', 'DESC']]
                }
            ],
            attributes: ['id', 'nome', 'email', 'tipo', 'fotoPerfil', 'deOndeImporta', 'sobreMim'] // Remova createdAt
        });

        if (!usuario) {
            return res.status(404).send('Usuário não encontrado');
        }

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

        res.render('perfil', { usuario, notaMedia, avaliacoes, notaMediaCliente, avaliacoesCliente });
    } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        res.status(500).send('Erro ao buscar perfil do usuário');
    }
});

module.exports = router;