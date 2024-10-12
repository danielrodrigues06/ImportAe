const express = require('express');
const router = express.Router();
const Produto = require('../model/Produto');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/imagens'); // Diretório onde as imagens serão salvas
    },
    filename: (req, file, cb) => {
        const hash = crypto.createHash("md5").update(Date.now().toString()).digest("hex");
        const randomBytes = crypto.randomBytes(4).toString('hex'); // Gera um identificador aleatório
        const fileExt = path.extname(file.originalname);
        cb(null, `${hash}-${randomBytes}${fileExt}`); // Nome do arquivo com hash, identificador aleatório e extensão original
    }
});

const upload = multer({ storage: storage });

router.get('/', function(req, res) {
    const categorias = ['Eletrônicos', 'Roupas', 'Livros', 'Móveis', 'Brinquedos', 'Ferramentas', 'Beleza', 'Esportes', 'Automotivo', 'Alimentos']; // Novas categorias
    res.render('cadastrarproduto', { categorias: categorias, success: req.flash('success'), error: req.flash('error') });
});

// Rota para cadastrar produto com upload de imagens
router.post('/', upload.array('imagem', 5), async (req, res) => {
    const { nome, descricao, preco, categoria, origem, estoque } = req.body;
    
    try {
        // Validações no backend
        if (descricao.length < 50) {
            req.flash('error', 'A descrição deve ter no mínimo 50 caracteres.');
            return res.redirect('/cadastrarProduto');
        }

        if (req.files.length < 3) {
            req.flash('error', 'Por favor, anexe no mínimo 3 imagens.');
            return res.redirect('/cadastrarProduto');
        }

        const fotosArray = req.files.map(file => file.filename); // Captura os nomes dos arquivos enviados

        await Produto.create({
            nome,
            descricao,
            preco,
            fotos: fotosArray,
            categoria,
            origem,
            estoque,
            vendedorId: req.user.id,
        });

        req.flash('success', 'Produto cadastrado com sucesso!');
        return res.redirect('/produtos'); // Redireciona para a página de produtos após o cadastro bem-sucedido
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        req.flash('error', 'Erro ao cadastrar produto.');
        return res.redirect('/cadastrarProduto');
    }
});

module.exports = router;