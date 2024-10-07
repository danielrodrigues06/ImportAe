const bcrypt = require("bcryptjs");
const express = require("express");
const formidable = require("formidable");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const Usuario = require("../model/Usuario");
var saltRounds = 10;

router.get("/", function (req, res) {
  res.render("registro", {
    title: "cadastro",
  });
});

router.post("/", async function (req, res) {
  try {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        return res.redirect("/cadastro?erro=1");
      }

      const senha = fields["senha"][0];
      const rsenha = fields["rsenha"][0];

      // Verificações básicas
      if (
        senha.length == 0 ||
        fields.email[0].length == 0 ||
        fields.nome[0].length == 0
      ) {
        return res.redirect("/cadastro?erro=5");
      }

      if (senha !== rsenha) {
        console.error("As senhas não coincidem.");
        return res.redirect("/cadastro?erro=2");
      }

      const existeUser = await Usuario.findOne({
        where: { email: fields["email"][0] },
      });
      if (existeUser) {
        console.error("Email já cadastrado.");
        return res.redirect("/cadastro?erro=3");
      }

      const hashedPassword = await bcrypt.hash(senha, saltRounds);

      // Verificação do tipo de usuário
      const tipoUsuario = fields["tipo"][0];
      let deOndeImporta = null;
      let sobreMim = null;
      let nomeimg = null;

      // Se o usuário for vendedor, esses campos serão processados
      if (tipoUsuario === "vendedor") {
        deOndeImporta = fields["deOndeImporta"] ? fields["deOndeImporta"][0] : null;
        sobreMim = fields["sobreMim"] ? fields["sobreMim"][0] : null;

        // Verificação de imagem obrigatória para vendedores
        if (!files.fotoPerfil || !files.fotoPerfil[0] || files.fotoPerfil[0].size === 0) {
          console.error("Foto de perfil é obrigatória para vendedores.");
          return res.redirect("/cadastro?erro=6"); // Erro para foto obrigatória
        }
      }

      // Processamento da imagem (opcional para clientes, obrigatória para vendedores)
      if (files.fotoPerfil && files.fotoPerfil[0] && files.fotoPerfil[0].size > 0) {
        const file = files.fotoPerfil[0];
        const hash = crypto
          .createHash("md5")
          .update(Date.now().toString())
          .digest("hex");

        const fileExt = file.mimetype.toLowerCase();
        if (
          ![
            "image/jpg",
            "image/webp",
            "image/jpeg",
            "image/png",
            "image/gif",
          ].includes(fileExt)
        ) {
          console.log("O arquivo de imagem não possui uma extensão válida");
          return res.redirect("/cadastro?erro=4");
        }

        nomeimg = hash + "." + file.mimetype.split("/")[1];
        const newpath = path.join(__dirname, "../public/imagens/", nomeimg);

        fs.rename(file.filepath, newpath, function (err) {
          if (err) {
            console.error(err);
            return res.redirect("/cadastro?erro=1");
          }
          console.log("Arquivo de imagem enviado com sucesso");
        });
      }

      // Criação do usuário com base na model
      await Usuario.create({
        nome: fields["nome"][0],
        senha: hashedPassword,
        email: fields["email"][0],
        telefone: fields["telefone"] ? fields["telefone"][0] : null,
        dataNascimento: fields["dataNascimento"] ? fields["dataNascimento"][0] : null,
        tipo: tipoUsuario,  // Cliente ou vendedor
        deOndeImporta: tipoUsuario === "vendedor" ? deOndeImporta : null, // Apenas para vendedores
        sobreMim: tipoUsuario === "vendedor" ? sobreMim : null, // Apenas para vendedores
        fotoPerfil: nomeimg,  // Salva a foto se enviada, independente do tipo
      });

      return res.redirect("/login?erro=0");
    });
  } catch (err) {
    console.error(err);
    res.redirect("/cadastro?erro=1");
  }
});

module.exports = router;
