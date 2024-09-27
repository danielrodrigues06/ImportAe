const express = require('express');
const router = express.Router();
const Mensagem = require('../model/Mensagem');
const Usuario = require('../model/Usuario');
const Op = require('sequelize').Op; // Certifique-se de importar o Op se estiver usando Sequelize

// Renderiza a página de chat
router.get('/', async (req, res) => {
    try {
        const mensagens = await Mensagem.findAll({
            include: Usuario,
            order: [['createdAt', 'ASC']]
        });
        const usuarios = await Usuario.findAll(); // Busca todos os usuários
        res.render('chat', { mensagens, usuario: req.user, usuarios }); // Passa 'usuarios' para a view
    } catch (error) {
        console.error('Erro ao renderizar a página de chat:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// Rota para enviar mensagem
router.post('/enviar', async (req, res) => {
    const { texto, destinatarioId } = req.body;

    // Verifica se os campos necessários estão presentes
    if (!texto || !destinatarioId) {
        return res.status(400).json({ sucesso: false, error: 'Texto e destinatário são obrigatórios.' });
    }

    console.log('Enviando mensagem:', { texto, destinatarioId, usuarioId: req.user.id });

    try {
        const mensagem = await Mensagem.create({
            texto,
            usuarioId: req.user.id,
            destinatarioId
        });
        console.log('Mensagem criada com sucesso:', mensagem);
        res.status(200).json({ sucesso: true });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ sucesso: false, error: error.message });
    }
});

// Rota para obter as mensagens do chat (usada pelo AJAX)
router.get('/mensagens/:destinatarioId', async (req, res) => {
    const { destinatarioId } = req.params;
    try {
        const mensagens = await Mensagem.findAll({
            where: {
                [Op.or]: [
                    { usuarioId: req.user.id, destinatarioId: destinatarioId },
                    { usuarioId: destinatarioId, destinatarioId: req.user.id }
                ]
            },
            include: Usuario,
            order: [['createdAt', 'ASC']]
        });
        res.json(mensagens);
    } catch (error) {
        console.error('Erro ao obter mensagens:', error);
        res.status(500).json({ sucesso: false });
    }
});

module.exports = router;