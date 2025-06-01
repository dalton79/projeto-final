// Este arquivo define as rotas relacionadas ao gerenciamento de ações

// Importando o Express para criar as rotas
const express = require("express");

// Importando o controller de ações
const acaoController = require("../controllers/acaoController");

// Criando o objeto de rotas
const router = express.Router();

// Rota para listar ações com filtros opcionais
// GET /api/acoes?nome=Visita&ativa=true
router.get("/", acaoController.listarAcoes);

// Rota para buscar uma ação específica pelo ID
// GET /api/acoes/1
router.get("/:id", acaoController.buscarAcaoPorId);

// Rota para criar uma nova ação
// POST /api/acoes
router.post("/", acaoController.criarAcao);

// Rota para atualizar uma ação existente
// PUT /api/acoes/1
router.put("/:id", acaoController.atualizarAcao);

// Rota para excluir uma ação
// DELETE /api/acoes/1
router.delete("/:id", acaoController.excluirAcao);

module.exports = router;
