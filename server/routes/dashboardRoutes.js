// Este arquivo define as rotas relacionadas aos dashboards

// Importando o Express para criar as rotas
const express = require("express");

// Importando o controller de dashboard
const dashboardController = require("../controllers/dashboardController");

// Criando o objeto de rotas
const router = express.Router();

// Rota para obter o ranking de imobiliárias para o Dashboard da Consultoria
// GET /api/dashboard/consultoria?data_inicio=2025-01-01&data_fim=2025-12-31&incorporadora_id=1&empreendimento_id=1
router.get("/consultoria", dashboardController.obterRankingConsultoria);

// Rota para obter os dados para os filtros do Dashboard da Consultoria
// GET /api/dashboard/consultoria/filtros
router.get(
  "/consultoria/filtros",
  dashboardController.obterDadosFiltrosConsultoria
);

module.exports = router;
