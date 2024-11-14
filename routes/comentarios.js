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

// Rota para responder a um comentário
router.post('/responder/:comentarioId', async (req, res) => {
  const { resposta } = req.body;
  const { comentarioId } = req.params;
  const usuarioId = req.user.id;

  try {
    const comentario = await Comentario.findByPk(comentarioId, {
      include: [{ model: Produto, as: 'produto' }]
    });

    if (!comentario) {
      return res.status(404).send('Comentário não encontrado');
    }

    if (comentario.produto.vendedorId !== usuarioId) {
      return res.status(403).send('Acesso negado: apenas o vendedor pode responder a este comentário');
    }

    comentario.resposta = resposta;
    await comentario.save();

    res.redirect(`/produtos/${comentario.produtoId}`);
  } catch (error) {
    console.error('Erro ao responder comentário:', error);
    res.status(500).send('Erro ao responder comentário.');
  }
});

// Rota para deletar um comentário
router.post('/deletar/:comentarioId', async (req, res) => {
  const { comentarioId } = req.params;
  const usuarioId = req.user.id;

  try {
    const comentario = await Comentario.findByPk(comentarioId);

    if (!comentario) {
      return res.status(404).send('Comentário não encontrado');
    }

    if (comentario.usuarioId !== usuarioId) {
      return res.status(403).send('Acesso negado: apenas o autor pode deletar este comentário');
    }

    await comentario.destroy();

    res.redirect(`/produtos/${comentario.produtoId}`);
  } catch (error) {
    console.error('Erro ao deletar comentário:', error);
    res.status(500).send('Erro ao deletar comentário.');
  }
});

module.exports = router;