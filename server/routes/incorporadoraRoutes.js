// Este arquivo define as rotas relacionadas ao gerenciamento de incorporadoras

// Importando o Express para criar as rotas
const express = require("express");

// Importando o controller de incorporadoras
const incorporadoraController = require("../controllers/incorporadoraController");

// Criando o objeto de rotas
const router = express.Router();

// Rota para listar incorporadoras com filtros opcionais
// GET /api/incorporadoras?razaoSocial=Construtora&cnpj=12345&cidade=Porto&uf=RS
router.get("/", incorporadoraController.listarIncorporadoras);

// Rota para buscar uma incorporadora específica pelo ID
// GET /api/incorporadoras/1
router.get("/:id", incorporadoraController.buscarIncorporadoraPorId);

// Rota para criar uma nova incorporadora
// POST /api/incorporadoras
router.post("/", incorporadoraController.criarIncorporadora);

// Rota para atualizar uma incorporadora existente
// PUT /api/incorporadoras/1
router.put("/:id", incorporadoraController.atualizarIncorporadora);

// Rota para excluir uma incorporadora
// DELETE /api/incorporadoras/1
router.delete("/:id", incorporadoraController.excluirIncorporadora);

module.exports = router;
