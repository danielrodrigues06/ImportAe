// app.js
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");
const session = require("express-session");
const createError = require('http-errors');
const flash = require("connect-flash");
const sequelize = require("./db");
const associations = require('./model/associations'); // Importando associações

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
const notificacoesRouter = require('./routes/notificacoes');

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

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Middleware de autenticação
function authenticationMiddleware(req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.isAuthenticated = true;
    res.locals.user = req.user;
    res.locals.logado = true;
    return next();
  }
  res.locals.isAuthenticated = false;
  res.locals.user = null;
  res.locals.logado = false;
  // Permite acesso à rota de login sem redirecionar novamente
  if (req.path === "/login") return next();

  // Redireciona para login com mensagem de erro
  res.redirect("/login?erro=1");
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
app.use('/notificacoes', authenticationMiddleware, notificacoesRouter);

// Sincronização com o banco de dados
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Todas as tabelas foram sincronizadas!");
  })
  .catch((error) => {
    console.error("Erro ao sincronizar as tabelas:", error);
  });

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