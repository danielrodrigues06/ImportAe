const express = require('express');
const router = express.Router();
const Produto = require('../model/Produto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

router.get('/', function(req, res) {
    const categorias = ['Categoria1', 'Categoria2', 'Categoria3']; // Exemplo de categorias
    res.render('cadastrarproduto', { categorias: categorias });
});

// Rota para cadastrar produto com upload de imagens
router.post('/', upload.array('imagem', 5), async (req, res) => {
    const { nome, descricao, preco, categoria, origem } = req.body;
    
    try {
        const fotosArray = req.files.map(file => file.filename); // Captura os nomes dos arquivos enviados

        await Produto.create({
            nome,
            descricao,
            preco,
            fotos: fotosArray,
            categoria,
            origem,
            vendedorId: req.user.id,
        });

        res.redirect('/produtos'); // Redireciona para a página de produtos cadastrados
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        res.status(500).send('Erro ao cadastrar produto.');
    }
});

module.exports = router;