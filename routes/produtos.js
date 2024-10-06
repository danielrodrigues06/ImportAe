router.get("/", async (req, res) => {
  try {
    const query = req.query.q ? req.query.q : "";
    const precoMin = req.query.precoMin ? parseFloat(req.query.precoMin) : 0;
    const precoMax = req.query.precoMax ? parseFloat(req.query.precoMax) : Number.MAX_VALUE;
    const origem = req.query.origem ? req.query.origem : "";

    // Condições de filtro
    const conditions = {
      [Op.and]: [
        {
          [Op.or]: [
            { nome: { [Op.like]: `%${query}%` } },
            { descricao: { [Op.like]: `%${query}%` } },
          ],
        },
        { preco: { [Op.between]: [precoMin, precoMax] } },
        origem ? { origem: origem } : {},
      ],
    };

    const produtos = await Produto.findAll({
      where: conditions,
      include: [{ model: Usuario, as: "vendedorProduto", attributes: ["id", "nome", "fotoPerfil"] }],
    });

    // Calcular a nota média para cada vendedor
    for (const produto of produtos) {
      const notaMedia = await Avaliacao.findOne({
        where: { vendedorId: produto.vendedorProduto.id, tipo: 'cliente_para_vendedor' },
        attributes: [[fn('AVG', col('nota')), 'notaMedia']]
      });
      produto.vendedorProduto.notaMedia = notaMedia ? notaMedia.dataValues.notaMedia : null;
    }

    res.render("produtos", { produtos });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).send("Erro ao buscar produtos");
  }
});