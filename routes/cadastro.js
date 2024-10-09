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
    success: req.flash('success'),
    error: req.flash('error')
  });
});

router.post("/", async function (req, res) {
  try {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        req.flash('error', 'Erro ao processar o formulário.');
        return res.redirect("/cadastro");
      }

      const senha = fields["senha"][0];
      const rsenha = fields["rsenha"][0];

      // Verificações básicas
      if (
        senha.length == 0 ||
        fields.email[0].length == 0 ||
        fields.nome[0].length == 0
      ) {
        req.flash('error', 'Todos os campos são obrigatórios.');
        return res.redirect("/cadastro");
      }

      if (senha !== rsenha) {
        console.error("As senhas não coincidem.");
        req.flash('error', 'As senhas não coincidem.');
        return res.redirect("/cadastro");
      }

      const existeUser = await Usuario.findOne({
        where: { email: fields["email"][0] },
      });
      if (existeUser) {
        console.error("Email já cadastrado.");
        req.flash('error', 'Email já cadastrado.');
        return res.redirect("/cadastro");
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
          req.flash('error', 'Foto de perfil é obrigatória para vendedores.');
          return res.redirect("/cadastro");
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
          req.flash('error', 'O arquivo de imagem não possui uma extensão válida.');
          return res.redirect("/cadastro");
        }

        nomeimg = hash + "." + file.mimetype.split("/")[1];
        const newpath = path.join(__dirname, "../public/imagens/", nomeimg);

        fs.rename(file.filepath, newpath, function (err) {
          if (err) {
            console.error(err);
            req.flash('error', 'Erro ao salvar a imagem.');
            return res.redirect("/cadastro");
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

      req.flash('success', 'Cadastro realizado com sucesso!');
      return res.redirect("/cadastro?success=true");
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao realizar o cadastro.');
    res.redirect("/cadastro");
  }
});

module.exports = router;