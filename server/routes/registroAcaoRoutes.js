// Este arquivo define as rotas relacionadas ao gerenciamento de registros de ações executadas

// Importando o Express para criar as rotas
const express = require("express");

// Importando o controller de registro de ações
const registroAcaoController = require("../controllers/registroAcaoController");

// Criando o objeto de rotas
const router = express.Router();

// Rota para listar registros de ações com filtros opcionais
// GET /api/registro-acoes?data_inicio=2025-01-01&data_fim=2025-12-31&incorporadora_id=1&empreendimento_id=1&imobiliaria_id=1&corretor_id=1&acao_id=1
router.get("/", registroAcaoController.listarRegistrosAcoes);

// Rota para obter dados para o formulário (ações, imobiliárias, corretores, empreendimentos)
// GET /api/registro-acoes/dados-formulario?incorporadora_id=1
router.get("/dados-formulario", registroAcaoController.obterDadosFormulario);

// Rota para buscar um registro de ação específico pelo ID
// GET /api/registro-acoes/1
router.get("/:id", registroAcaoController.buscarRegistroAcaoPorId);

// Rota para criar um novo registro de ação
// POST /api/registro-acoes
router.post("/", registroAcaoController.criarRegistroAcao);

// Rota para atualizar um registro de ação existente
// PUT /api/registro-acoes/1
router.put("/:id", registroAcaoController.atualizarRegistroAcao);

// Rota para excluir um registro de ação
// DELETE /api/registro-acoes/1
router.delete("/:id", registroAcaoController.excluirRegistroAcao);

module.exports = router;
