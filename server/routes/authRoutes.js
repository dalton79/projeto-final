// Este arquivo define as rotas relacionadas à autenticação

// Importando o Express para criar as rotas
const express = require("express");

// Importando o controller de autenticação
const authController = require("../controllers/authController");

// Criando o objeto de rotas
const router = express.Router();

// Definindo a rota de login (POST /api/auth/login)
router.post("/login", authController.login);

module.exports = router;
