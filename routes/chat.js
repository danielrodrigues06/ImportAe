const express = require('express');
const router = express.Router();
const Mensagem = require('../model/Mensagem');
const Usuario = require('../model/Usuario');
const Op = require('sequelize').Op;
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/imagens'); // Diretório onde as imagens serão salvas
    },
    filename: (req, file, cb) => {
        const hash = crypto.createHash("md5").update(Date.now().toString()).digest("hex");
        const fileExt = path.extname(file.originalname);
        cb(null, `${hash}${fileExt}`); // Nome do arquivo com hash e extensão original
    }
});

const upload = multer({ storage: storage });

// Renderiza a página de chat
router.get('/', async (req, res) => {
    try {
        const mensagens = await Mensagem.findAll({
            where: {
                [Op.or]: [
                    { usuarioId: req.user.id },
                    { destinatarioId: req.user.id }
                ]
            },
            include: [
                { model: Usuario, as: 'remetente', attributes: ['id', 'nome'] },
                { model: Usuario, as: 'destinatario', attributes: ['id', 'nome'] }
            ],
            order: [['createdAt', 'ASC']]
        });

        const usuarios = await Usuario.findAll(); // Busca todos os usuários

        // Busca os chats recentes
        const chatsRecentes = await Mensagem.findAll({
            where: {
                [Op.or]: [
                    { usuarioId: req.user.id },
                    { destinatarioId: req.user.id }
                ]
            },
            include: [
                { model: Usuario, as: 'remetente', attributes: ['id', 'nome', 'fotoPerfil'] },
                { model: Usuario, as: 'destinatario', attributes: ['id', 'nome', 'fotoPerfil'] }
            ],
            group: ['usuarioId', 'destinatarioId', 'remetente.id', 'destinatario.id'],
            order: [['createdAt', 'DESC']]
        });

        const destinatarioId = req.query.destinatarioId || (usuarios.length > 0 ? usuarios[0].id : null);
        const destinatario = await Usuario.findByPk(destinatarioId);

        res.render('chat', { mensagens, usuario: req.user, usuarios, chatsRecentes, destinatario }); // Passa 'destinatario' para a view
    } catch (error) {
        console.error('Erro ao renderizar a página de chat:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// Rota para obter as mensagens do chat (usada pelo AJAX)
router.get('/mensagens/:destinatarioId', async (req, res) => {
    try {
        const { destinatarioId } = req.params;
        const mensagens = await Mensagem.findAll({
            where: {
                [Op.or]: [
                    {
                        [Op.and]: [
                            { usuarioId: req.user.id },
                            { destinatarioId }
                        ]
                    },
                    {
                        [Op.and]: [
                            { usuarioId: destinatarioId },
                            { destinatarioId: req.user.id }
                        ]
                    }
                ]
            },
            include: [
                { model: Usuario, as: 'remetente', attributes: ['id', 'nome'] },
                { model: Usuario, as: 'destinatario', attributes: ['id', 'nome'] }
            ],
            order: [['createdAt', 'ASC']]
        });

        res.json(mensagens);
    } catch (error) {
        console.error('Erro ao obter mensagens:', error);
        res.status(500).send('Erro ao obter mensagens.');
    }
});

// Rota para enviar mensagem
router.post('/enviar', upload.single('imagem'), async (req, res) => {
    const { texto, destinatarioId } = req.body;
    const imagem = req.file ? req.file.filename : null;

    // Verifica se os campos necessários estão presentes
    if (!texto && !imagem) {
        return res.status(400).json({ sucesso: false, error: 'Texto ou imagem são obrigatórios.' });
    }

    console.log('Enviando mensagem:', { texto, destinatarioId, usuarioId: req.user.id, imagem });

    try {
        const mensagem = await Mensagem.create({
            texto,
            usuarioId: req.user.id,
            destinatarioId,
            imagem
        });
        console.log('Mensagem criada com sucesso:', mensagem);
        res.status(200).json({ sucesso: true });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ sucesso: false, error: error.message });
    }
});

module.exports = router;