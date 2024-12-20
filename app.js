// app.js
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const createError = require('http-errors');
const flash = require('connect-flash');
const sequelize = require("./db");
const associations = require('./model/associations'); 

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const cadastroRouter = require("./routes/cadastro");
const loginRouter = require("./routes/login");
const logoutRouter = require("./routes/logout");
const cadastrarProdutoRouter = require("./routes/cadastrarproduto");
const produtosRouter = require("./routes/produtos");
const painelvendedorRouter = require("./routes/painelvendedor");
const comprarRouter = require("./routes/comprar");
const painelclienteRouter = require("./routes/painelcliente");
const chatRouter = require('./routes/chat');
const avaliacaoRouter = require('./routes/avaliacao');
const perfilRouter = require('./routes/perfil');
const comentariosRouter = require('./routes/comentarios');
const solicitacoesRouter = require('./routes/solicitacoes');

const app = express();

require("./auth")(passport);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Configuração da sessão com SequelizeStore
app.use(
  session({
    secret: "secret",
    store: new SequelizeStore({
      db: sequelize,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 60 * 1000, // 30 minutos
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Middleware global para definir variáveis locais
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user || null;
  res.locals.logado = req.isAuthenticated();
  res.locals.success = req.flash('success'); // Adiciona a variável success globalmente
  res.locals.error = req.flash('error'); // Adiciona a variável error globalmente
  next();
});

// Middleware de autenticação
function authenticationMiddleware(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.redirect('/login'); // Redireciona para a página de login se não estiver autenticado
  }
}

// Middleware específico para vendedores
function vendedorMiddleware(req, res, next) {
  if (req.isAuthenticated() && req.user.tipo === 'vendedor') {
    return next();
  }
  res.status(403).send("Acesso negado: apenas vendedores podem acessar esta rota.");
}

// Middleware específico para clientes
function clienteMiddleware(req, res, next) {
  if (req.isAuthenticated() && req.user.tipo === 'cliente') {
    return next();
  }
  res.status(403).send("Acesso negado: apenas clientes podem acessar esta rota.");
}

// Sincronização das tabelas com o banco de dados
sequelize
    .sync({ alter: true })
    .then(() => {
        console.log("Todas as tabelas foram sincronizadas!");
    })
    .catch((error) => {
        console.error("Erro ao sincronizar as tabelas:", error);
    });

// Aplicação das rotas com middlewares
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/cadastro", cadastroRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/cadastrarProduto", authenticationMiddleware, vendedorMiddleware, cadastrarProdutoRouter); // Autenticação e verificação de vendedor
app.use("/produtos", produtosRouter);
app.use("/painelvendedor", authenticationMiddleware, vendedorMiddleware, painelvendedorRouter);
app.use('/comprar', authenticationMiddleware, comprarRouter);
app.use('/painelcliente', authenticationMiddleware, clienteMiddleware, painelclienteRouter);
app.use('/chat', authenticationMiddleware, chatRouter);
app.use('/avaliacao', authenticationMiddleware, avaliacaoRouter);
app.use('/perfil', authenticationMiddleware, perfilRouter);
app.use('/comentarios', authenticationMiddleware, comentariosRouter);
app.use('/solicitacoes', authenticationMiddleware, solicitacoesRouter);

// Tratamento de erros
app.use(function (req, res, next) {
  if (!req.route) {
    next(createError(404));
  }
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;