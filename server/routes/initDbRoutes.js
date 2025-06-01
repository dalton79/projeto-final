// Rota temporária para inicializar o banco de dados

const express = require("express");
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const router = express.Router();

// Rota para inicializar o banco de dados
router.get("/init-db", async (req, res) => {
  try {
    console.log("Tentando inicializar o banco de dados...");

    // Lê o arquivo schema.sql
    const schemaPath = path.join(__dirname, "../database/schema.sql");
    console.log("Caminho do schema:", schemaPath);

    const schema = fs.readFileSync(schemaPath, "utf8");
    console.log("Schema SQL carregado com sucesso");

    // Executa o script SQL
    console.log("Executando script SQL...");
    await pool.query(schema);
    console.log("Script SQL executado com sucesso!");

    // Retorna sucesso
    return res.status(200).json({
      sucesso: true,
      mensagem: "Banco de dados inicializado com sucesso",
    });
  } catch (erro) {
    console.error("Erro ao inicializar banco de dados:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao inicializar banco de dados",
      erro: erro.message,
    });
  }
});

module.exports = router;
