// Configuração da conexão com o banco de dados PostgreSQL

const { Pool } = require("pg");
require("dotenv").config();

let pool;

// Verifica se está em ambiente de produção (Render) usando DATABASE_URL
if (process.env.DATABASE_URL) {
  // Configuração para ambiente de produção
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Necessário para conexões SSL no Render
    },
  });
  console.log("Conectando ao banco de dados usando DATABASE_URL");
} else {
  // Configuração para ambiente de desenvolvimento local
  pool = new Pool({
    host: process.env.DB_HOST, // Endereço do servidor do banco
    port: process.env.DB_PORT, // Porta do PostgreSQL (padrão: 5432)
    database: process.env.DB_NAME, // Nome do banco de dados
    user: process.env.DB_USER, // Usuário do banco (postgres)
    password: process.env.DB_PASSWORD, // Senha do banco
  });
  console.log("Conectando ao banco de dados usando variáveis separadas");
}

// Testando a conexão
pool.on("connect", () => {
  console.log("Conexão com o banco de dados estabelecida com sucesso");
});

pool.on("error", (err) => {
  console.error("Erro na conexão com o banco de dados:", err);
});

// Exportando o pool para usar em outros arquivos
module.exports = pool;
