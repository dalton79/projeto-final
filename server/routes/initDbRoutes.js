// Arquivo: server/routes/initDbRoutes.js
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

    // Primeiro, vamos dropar as tabelas existentes para evitar conflitos
    await pool.query(`
      DROP TABLE IF EXISTS registro_acoes;
      DROP TABLE IF EXISTS acoes;
      DROP TABLE IF EXISTS corretores;
      DROP TABLE IF EXISTS imobiliarias;
      DROP TABLE IF EXISTS empreendimentos;
      DROP TABLE IF EXISTS usuarios;
      DROP TABLE IF EXISTS incorporadoras;
    `);
    console.log("Tabelas antigas removidas se existiam");

    // Agora, vamos criar as tabelas uma a uma, na ordem correta

    // 1. Incorporadoras
    await pool.query(`
      CREATE TABLE incorporadoras (
          id SERIAL PRIMARY KEY,
          razao_social VARCHAR(255) NOT NULL,
          cnpj VARCHAR(20) UNIQUE NOT NULL,
          endereco VARCHAR(255) NOT NULL,
          cidade VARCHAR(100) NOT NULL,
          uf VARCHAR(2) NOT NULL,
          nome_exibicao VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          telefone VARCHAR(20) NOT NULL,
          responsavel VARCHAR(255) NOT NULL,
          telefone_responsavel VARCHAR(20) NOT NULL,
          email_responsavel VARCHAR(255) NOT NULL,
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Tabela incorporadoras criada");

    // 2. Usuários
    await pool.query(`
      CREATE TABLE usuarios (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          telefone VARCHAR(20) NOT NULL,
          senha VARCHAR(255) NOT NULL,
          perfil VARCHAR(50) NOT NULL,
          incorporadora_id INTEGER,
          ativo BOOLEAN DEFAULT TRUE,
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (incorporadora_id) REFERENCES incorporadoras(id) ON DELETE SET NULL
      )
    `);
    console.log("Tabela usuarios criada");

    // 3. Empreendimentos
    await pool.query(`
      CREATE TABLE empreendimentos (
          id SERIAL PRIMARY KEY,
          incorporadora_id INTEGER NOT NULL,
          nome VARCHAR(255) NOT NULL,
          endereco VARCHAR(255) NOT NULL,
          cidade VARCHAR(100) NOT NULL,
          uf VARCHAR(2) NOT NULL,
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (incorporadora_id) REFERENCES incorporadoras(id) ON DELETE CASCADE
      )
    `);
    console.log("Tabela empreendimentos criada");

    // 4. Imobiliárias
    await pool.query(`
      CREATE TABLE imobiliarias (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          cidade VARCHAR(100) NOT NULL,
          uf VARCHAR(2) NOT NULL,
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Tabela imobiliarias criada");

    // 5. Corretores (sem vinculação com imobiliária)
    await pool.query(`
      CREATE TABLE corretores (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          sobrenome VARCHAR(255) NOT NULL,
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Tabela corretores criada");

    // 6. Ações
    await pool.query(`
      CREATE TABLE acoes (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(255) UNIQUE NOT NULL,
          pontuacao INTEGER NOT NULL,
          ativa BOOLEAN DEFAULT TRUE,
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Tabela acoes criada");

    // 7. Registro de ações
    await pool.query(`
      CREATE TABLE registro_acoes (
          id SERIAL PRIMARY KEY,
          incorporadora_id INTEGER NOT NULL,
          empreendimento_id INTEGER NOT NULL,
          imobiliaria_id INTEGER NOT NULL,
          corretor_id INTEGER NOT NULL,
          acao_id INTEGER NOT NULL,
          data_acao DATE NOT NULL,
          quantidade INTEGER NOT NULL,
          pontuacao_total INTEGER NOT NULL,
          vgv DECIMAL(10,2) DEFAULT 0,
          anotacoes TEXT,
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (incorporadora_id) REFERENCES incorporadoras(id) ON DELETE CASCADE,
          FOREIGN KEY (empreendimento_id) REFERENCES empreendimentos(id) ON DELETE CASCADE,
          FOREIGN KEY (imobiliaria_id) REFERENCES imobiliarias(id) ON DELETE CASCADE,
          FOREIGN KEY (corretor_id) REFERENCES corretores(id) ON DELETE CASCADE,
          FOREIGN KEY (acao_id) REFERENCES acoes(id) ON DELETE CASCADE
      )
    `);
    console.log("Tabela registro_acoes criada");

    // Agora vamos inserir os dados iniciais

    // 1. Inserir uma incorporadora para testes
    await pool.query(`
      INSERT INTO incorporadoras (razao_social, cnpj, endereco, cidade, uf, nome_exibicao, email, telefone, responsavel, telefone_responsavel, email_responsavel)
      VALUES ('Construtora Exemplo S.A.', '12345678000199', 'Av. Principal, 123', 'Porto Alegre', 'RS', 'Construtora Exemplo', 'contato@exemplo.com', '(51) 3333-4444', 'João Silva', '(51) 99999-8888', 'joao@exemplo.com')
    `);
    console.log("Dados da incorporadora inseridos");

    // 2. Inserir usuários iniciais
    await pool.query(`
      INSERT INTO usuarios (nome, email, telefone, senha, perfil)
      VALUES ('Administrador', 'admin@sistema.com', '(51) 99999-1111', '123456', 'Administrador')
    `);

    await pool.query(`
      INSERT INTO usuarios (nome, email, telefone, senha, perfil)
      VALUES ('Gestor', 'gestor@sistema.com', '(51) 99999-2222', '123456', 'Gestor Consultoria')
    `);

    await pool.query(`
      INSERT INTO usuarios (nome, email, telefone, senha, perfil, incorporadora_id)
      VALUES ('Colaborador', 'colaborador@exemplo.com', '(51) 99999-3333', '123456', 'Colaborador Incorporadora', 1)
    `);
    console.log("Dados dos usuários inseridos");

    // 3. Inserir um empreendimento para teste
    await pool.query(`
      INSERT INTO empreendimentos (incorporadora_id, nome, endereco, cidade, uf)
      VALUES (1, 'Residencial Solar', 'Rua das Flores, 500', 'Porto Alegre', 'RS')
    `);
    console.log("Dados do empreendimento inseridos");

    // 4. Inserir uma imobiliária para teste
    await pool.query(`
      INSERT INTO imobiliarias (nome, cidade, uf)
      VALUES ('Imobiliária Sucesso', 'Porto Alegre', 'RS')
    `);
    console.log("Dados da imobiliária inseridos");

    // 5. Inserir um corretor para teste (sem imobiliária)
    await pool.query(`
      INSERT INTO corretores (nome, sobrenome)
      VALUES ('Maria', 'Santos')
    `);
    console.log("Dados do corretor inseridos");

    // 6. Inserir ações para teste
    await pool.query(`
      INSERT INTO acoes (nome, pontuacao) VALUES ('Visita com cliente', 10)
    `);

    await pool.query(`
      INSERT INTO acoes (nome, pontuacao) VALUES ('Proposta enviada', 20)
    `);

    await pool.query(`
      INSERT INTO acoes (nome, pontuacao) VALUES ('Venda concretizada', 100)
    `);
    console.log("Dados das ações inseridos");

    // 7. Inserir um registro de ação para teste
    await pool.query(`
      INSERT INTO registro_acoes (incorporadora_id, empreendimento_id, imobiliaria_id, corretor_id, acao_id, data_acao, quantidade, pontuacao_total, vgv, anotacoes)
      VALUES (1, 1, 1, 1, 3, CURRENT_DATE, 1, 100, 500000.00, 'Venda de unidade 101')
    `);
    console.log("Registro de ação inserido");

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
