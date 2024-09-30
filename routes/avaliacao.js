const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const Avaliacao = require('../model/Avaliacao');
const Compra = require('../model/Compra');
const Usuario = require('../model/Usuario');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/imagens');
    },
    filename: (req, file, cb) => {
        const hash = crypto.createHash("md5").update(Date.now().toString()).digest("hex");
        const fileExt = path.extname(file.originalname);
        cb(null, `${hash}${fileExt}`);
    }
});

const upload = multer({ storage: storage });

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

        res.redirect('/painelVendedor'); // Redireciona para o painel do vendedor
    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        res.status(500).send('Erro ao criar avaliação.');
    }
});

// Rota para criar uma nova avaliação pelo cliente
router.post('/:compraId', upload.array('fotos', 5), async (req, res) => {
    const { nota, comentario } = req.body;
    const { compraId } = req.params;
    const clienteId = req.user.id;

    try {
        const compra = await Compra.findByPk(compraId, {
            include: [{ model: Usuario, as: 'vendedor' }]
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

        const fotosArray = req.files.map(file => file.filename);

        await Avaliacao.create({
            nota,
            comentario,
            fotos: fotosArray,
            clienteId,
            vendedorId: compra.vendedorId,
            compraId: compra.id,
            tipo: 'cliente_para_vendedor' // Adicionando tipo na criação
        });

        res.redirect('/painelCliente'); // Redireciona para o painel do cliente
    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        res.status(500).send('Erro ao criar avaliação.');
    }
});

module.exports = router;