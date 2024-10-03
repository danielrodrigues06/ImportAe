const express = require('express');
const router = express.Router();
const Solicitacao = require('../model/Solicitacao');
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

// Rota para criar uma nova solicitação
router.post('/', upload.array('fotos', 5), async (req, res) => {
  const { nomeProduto, precoDesejado, vendedorId } = req.body;
  const clienteId = req.user.id;

  try {
    const fotosArray = req.files.map(file => file.filename); // Captura os nomes dos arquivos enviados

    await Solicitacao.create({
      nomeProduto,
      precoDesejado,
      fotos: fotosArray,
      clienteId,
      vendedorId,
    });

    res.redirect(`/perfil/${vendedorId}`); // Redireciona para o perfil do vendedor
  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    res.status(500).send('Erro ao criar solicitação.');
  }
});

module.exports = router;