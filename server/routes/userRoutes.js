// Este arquivo define as rotas relacionadas ao gerenciamento de usuários

// Importando o Express para criar as rotas
const express = require("express");

// Importando o controller de usuários
const userController = require("../controllers/userController");

// Criando o objeto de rotas
const router = express.Router();

// Rota para listar usuários com filtros opcionais
// GET /api/usuarios?nome=João&email=joao@teste.com&perfil=Administrador&ativo=true
router.get("/", userController.listarUsuarios);

// Rota para buscar um usuário específico pelo ID
// GET /api/usuarios/1
router.get("/:id", userController.buscarUsuarioPorId);

// Rota para criar um novo usuário
// POST /api/usuarios
router.post("/", userController.criarUsuario);

// Rota para atualizar um usuário existente
// PUT /api/usuarios/1
router.put("/:id", userController.atualizarUsuario);

// Rota para excluir um usuário
// DELETE /api/usuarios/1
router.delete("/:id", userController.excluirUsuario);

module.exports = router;
