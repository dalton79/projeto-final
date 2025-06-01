// Este arquivo define as rotas relacionadas ao gerenciamento de corretores

// Importando o Express para criar as rotas
const express = require("express");

// Importando o controller de corretores
const corretorController = require("../controllers/corretorController");

// Criando o objeto de rotas
const router = express.Router();

// Rota para listar corretores com filtros opcionais
// GET /api/corretores?nome=João&sobrenome=Silva
router.get("/", corretorController.listarCorretores);

// Rota para buscar um corretor específico pelo ID
// GET /api/corretores/1
router.get("/:id", corretorController.buscarCorretorPorId);

// Rota para criar um novo corretor
// POST /api/corretores
router.post("/", corretorController.criarCorretor);

// Rota para atualizar um corretor existente
// PUT /api/corretores/1
router.put("/:id", corretorController.atualizarCorretor);

// Rota para excluir um corretor
// DELETE /api/corretores/1
router.delete("/:id", corretorController.excluirCorretor);

module.exports = router;
