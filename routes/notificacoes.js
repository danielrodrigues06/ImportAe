const express = require("express");
const router = express.Router();
const Notificacao = require("../model/Notificacao");

// Rota para marcar notificações como lidas
router.post("/marcar-como-lida/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const notificacao = await Notificacao.findByPk(id);
    if (notificacao && notificacao.usuarioId === req.user.id) {
      notificacao.lida = true;
      await notificacao.save();
      res.status(200).json({ sucesso: true });
    } else {
      res.status(404).json({ sucesso: false, mensagem: "Notificação não encontrada" });
    }
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    res.status(500).json({ sucesso: false, mensagem: "Erro ao marcar notificação como lida" });
  }
});

// Rota para obter notificações do usuário
router.get("/", async (req, res) => {
  try {
    const notificacoes = await Notificacao.findAll({
      where: { usuarioId: req.user.id, lida: false },
      order: [["createdAt", "DESC"]],
    });
    res.json(notificacoes);
  } catch (error) {
    console.error("Erro ao obter notificações:", error);
    res.status(500).json({ sucesso: false, mensagem: "Erro ao obter notificações" });
  }
});

module.exports = router;