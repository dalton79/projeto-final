// Este arquivo define as rotas relacionadas ao gerenciamento do histórico geral das ações

// Importando o Express para criar as rotas
const express = require("express");

// Importando o controller de histórico de ações
const historicoAcaoController = require("../controllers/historicoAcaoController");

// Criando o objeto de rotas
const router = express.Router();

// Rota para obter dados para os filtros (incorporadoras, empreendimentos, imobiliárias, corretores, ações)
// GET /api/historico-acoes/dados-filtros
router.get("/dados-filtros", historicoAcaoController.obterDadosFiltros);

// Rota para listar histórico de ações com filtros opcionais
// GET /api/historico-acoes?data_inicio=2025-01-01&data_fim=2025-12-31&incorporadora_id=1&empreendimento_id=1&imobiliaria_id=1&corretor_id=1&acao_id=1
router.get("/", historicoAcaoController.listarHistoricoAcoes);

// Rota para buscar um registro de ação específico pelo ID
// GET /api/historico-acoes/1
router.get("/:id", historicoAcaoController.buscarHistoricoAcaoPorId);

// Rota para atualizar um registro de ação existente
// PUT /api/historico-acoes/1
router.put("/:id", historicoAcaoController.atualizarHistoricoAcao);

// Rota para excluir um registro de ação
// DELETE /api/historico-acoes/1
router.delete("/:id", historicoAcaoController.excluirHistoricoAcao);

module.exports = router;
