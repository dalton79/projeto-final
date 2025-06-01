// Configuração da conexão com o banco de dados PostgreSQL

const { Pool } = require("pg");
require("dotenv").config();

// Criando o pool de conexões com o banco de dados

const pool = new Pool({
  host: process.env.DB_HOST, // Endereço do servidor do banco
  port: process.env.DB_PORT, // Porta do PostgreSQL (padrão: 5432)
  database: process.env.DB_NAME, // Nome do banco de dados
  user: process.env.DB_USER, // Usuário do banco (postgres)
  password: process.env.DB_PASSWORD, // Senha do banco
});

module.exports = pool;
