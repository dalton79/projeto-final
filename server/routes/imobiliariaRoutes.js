// Este arquivo define as rotas relacionadas ao gerenciamento de imobiliárias

// Importando o Express para criar as rotas
const express = require("express");

// Importando o controller de imobiliárias
const imobiliariaController = require("../controllers/imobiliariaController");

// Criando o objeto de rotas
const router = express.Router();

// Rota para listar imobiliárias com filtros opcionais
// GET /api/imobiliarias?nome=Imobiliaria&cidade=Porto&uf=RS
router.get("/", imobiliariaController.listarImobiliarias);

// Rota para buscar uma imobiliária específica pelo ID
// GET /api/imobiliarias/1
router.get("/:id", imobiliariaController.buscarImobiliariaPorId);

// Rota para criar uma nova imobiliária
// POST /api/imobiliarias
router.post("/", imobiliariaController.criarImobiliaria);

// Rota para atualizar uma imobiliária existente
// PUT /api/imobiliarias/1
router.put("/:id", imobiliariaController.atualizarImobiliaria);

// Rota para excluir uma imobiliária
// DELETE /api/imobiliarias/1
router.delete("/:id", imobiliariaController.excluirImobiliaria);

module.exports = router;
