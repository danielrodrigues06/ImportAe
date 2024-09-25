const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const Usuario = require("./model/Usuario");

module.exports = function (passport) {
  passport.serializeUser((user, done) => {
    done(null, {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      fotoPerfil: user.fotoPerfil,
    });
  });

  passport.deserializeUser(async (id, done) => {
    try {
      let user = await Usuario.findAll({
        where: {
          id: id,
        },
      });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "senha" },
      async (email, senha, done) => {
        try {
          const user = await Usuario.findOne({ where: { email: email } });
          if (!user) {
            return done(null, false, { message: "Usuário não encontrado" });
          }
          const isValid = bcrypt.compareSync(senha, user.senha);
          if (!isValid) {
            return done(null, false, { message: "Senha incorreta" });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};