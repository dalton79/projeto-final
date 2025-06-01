// Este arquivo define as rotas relacionadas ao gerenciamento de empreendimentos

// Importando o Express para criar as rotas
const express = require("express");

// Importando o controller de empreendimentos
const empreendimentoController = require("../controllers/empreendimentoController");

// Criando o objeto de rotas
const router = express.Router();

// Rota para listar empreendimentos com filtros opcionais
// GET /api/empreendimentos?nome=Residencial&cidade=Porto&uf=RS&incorporadora_id=1
router.get("/", empreendimentoController.listarEmpreendimentos);

// Rota para buscar um empreendimento específico pelo ID
// GET /api/empreendimentos/1
router.get("/:id", empreendimentoController.buscarEmpreendimentoPorId);

// Rota para criar um novo empreendimento
// POST /api/empreendimentos
router.post("/", empreendimentoController.criarEmpreendimento);

// Rota para atualizar um empreendimento existente
// PUT /api/empreendimentos/1
router.put("/:id", empreendimentoController.atualizarEmpreendimento);

// Rota para excluir um empreendimento
// DELETE /api/empreendimentos/1
router.delete("/:id", empreendimentoController.excluirEmpreendimento);

module.exports = router;
