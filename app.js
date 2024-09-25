  var createError = require('http-errors');
  var express = require('express');
  var path = require('path');
  var cookieParser = require('cookie-parser');
  var logger = require('morgan');
  var passport = require('passport');
  var session = require('express-session');
  var flash = require('connect-flash');
  const sequelize = require('./db'); 

  var indexRouter = require('./routes/index');
  var usersRouter = require('./routes/users');
  var cadastroRouter = require('./routes/cadastro');
  var loginRouter = require('./routes/login');
  var logoutRouter = require('./routes/logout');
  var cadastrarProdutoRouter = require('./routes/cadastrarproduto');

  var app = express();


  require('./auth')(passport);

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  

  function authenticationMiddleware(req, res, next) {
    if (req.isAuthenticated()) {
      res.locals.logado = true;
      return next();
    }

    if (req.path === "/login") return next();
    res.redirect("/login?erro=1");
  }

  function vendedorMiddleware(req, res, next) {
    if (req.isAuthenticated()) {
      console.log(req.user); // Log para verificar os dados do usuário
      if (req.user.tipo === 'vendedor') {
        return next();
      }
    }
    res.status(403).send("Acesso negado: apenas vendedores podem acessar esta rota.");
  }

  app.use('/', indexRouter);
  app.use('/users', usersRouter);
  app.use('/cadastro', cadastroRouter);
  app.use('/login', loginRouter);
  app.use('/logout', logoutRouter);
  app.use('/cadastrarProduto',vendedorMiddleware, cadastrarProdutoRouter);

    

  sequelize.sync({ alter: true })
    .then(() => {
      console.log("Todas as tabelas foram sincronizadas!");
    })
    .catch((error) => {
      console.error("Erro ao sincronizar as tabelas:", error);
    });


  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  module.exports = app;
