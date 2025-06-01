// Este arquivo define as rotas relacionadas ao dashboard da incorporadora

// Importando o Express para criar as rotas
const express = require("express");

// Importando o controller de dashboard da incorporadora
const dashboardIncorporadoraController = require("../controllers/dashboardIncorporadoraController");

// Criando o objeto de rotas
const router = express.Router();

// Rota para obter o ranking de imobiliárias para o Dashboard da Incorporadora
// GET /api/dashboard-incorporadora?incorporadora_id=1&data_inicio=2025-01-01&data_fim=2025-12-31&empreendimento_id=1
router.get("/", dashboardIncorporadoraController.obterRankingIncorporadora);

// Rota para obter os dados para os filtros do Dashboard da Incorporadora
// GET /api/dashboard-incorporadora/filtros?incorporadora_id=1
router.get(
  "/filtros",
  dashboardIncorporadoraController.obterDadosFiltrosIncorporadora
);

module.exports = router;
