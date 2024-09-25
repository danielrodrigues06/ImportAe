const express = require('express');
const router = express.Router();

// Rota para fazer logout
router.get('/', (req, res, next) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/login'); // Redireciona para a página de login após o logout
    });
  });
});

module.exports = router;