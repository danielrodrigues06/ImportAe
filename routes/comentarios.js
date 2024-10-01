const express = require('express');
const router = express.Router();
const Comentario = require('../model/Comentario');
const Produto = require('../model/Produto');

// Rota para criar um novo comentário
router.post('/:produtoId', async (req, res) => {
  const { comentario } = req.body;
  const { produtoId } = req.params;
  const usuarioId = req.user.id;

  try {
    await Comentario.create({
      comentario,
      usuarioId,
      produtoId,
    });

    res.redirect(`/produtos/${produtoId}`);
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    res.status(500).send('Erro ao criar comentário.');
  }
});

module.exports = router;