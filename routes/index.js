var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Express',
    logado: req.isAuthenticated(), // Passa a variável logado para a view
    user: req.user, // Passa o usuário autenticado para a view
    success: req.flash('success') // Passa a mensagem de sucesso para a view
  });
});

module.exports = router;