
-- Este script cria todas as tabelas necessárias para o sistema de mensuração
-- da relação entre incorporadoras e imobiliárias.

-- =========================================================================
-- INÍCIO DO SCRIPT
-- =========================================================================

-- Remove tabelas se já existirem se for preciso recriar o banco
DROP TABLE IF EXISTS registro_acoes;
DROP TABLE IF EXISTS acoes;
DROP TABLE IF EXISTS corretores;
DROP TABLE IF EXISTS imobiliarias;
DROP TABLE IF EXISTS empreendimentos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS incorporadoras;

-- =========================================================================
-- TABELA: incorporadoras
-- =========================================================================
CREATE TABLE incorporadoras (
    id SERIAL PRIMARY KEY,                         -- Identificador único (autoincremento)
    razao_social VARCHAR(255) NOT NULL,            -- Nome oficial da empresa
    cnpj VARCHAR(20) UNIQUE NOT NULL,              -- CNPJ (único no sistema)
    endereco VARCHAR(255) NOT NULL,                -- Endereço completo
    cidade VARCHAR(100) NOT NULL,                  -- Cidade
    uf VARCHAR(2) NOT NULL,                        -- Estado (sigla)
    nome_exibicao VARCHAR(255) NOT NULL,           -- Nome para exibição no sistema
    email VARCHAR(255) NOT NULL,                   -- Email de contato
    telefone VARCHAR(20) NOT NULL,                 -- Telefone de contato
    responsavel VARCHAR(255) NOT NULL,             -- Nome do responsável
    telefone_responsavel VARCHAR(20) NOT NULL,     -- Telefone do responsável
    email_responsavel VARCHAR(255) NOT NULL,       -- Email do responsável
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Data de criação do registro
);

-- =========================================================================
-- TABELA: usuarios
-- Armazena os usuários do sistema e seus perfis
-- =========================================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,                         -- Identificador único (autoincremento)
    nome VARCHAR(255) NOT NULL,                    -- Nome completo do usuário
    email VARCHAR(255) UNIQUE NOT NULL,            -- Email (único no sistema)
    telefone VARCHAR(20) NOT NULL,                 -- Telefone de contato
    senha VARCHAR(255) NOT NULL,                   -- Senha (deve ser armazenada com hash)
    perfil VARCHAR(50) NOT NULL,                   -- Perfil: "Administrador", "Gestor Consultoria", "Colaborador Incorporadora"
    incorporadora_id INTEGER,                      -- ID da incorporadora (apenas para COLABORADOR INCORPORADORA)
    ativo BOOLEAN DEFAULT TRUE,                    -- Indica se o usuário está ativo
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data de criação do registro
    
    FOREIGN KEY (incorporadora_id) REFERENCES incorporadoras(id) ON DELETE SET NULL
);

-- =========================================================================
-- TABELA: empreendimentos
-- Armazena os empreendimentos das incorporadoras
-- =========================================================================
CREATE TABLE empreendimentos (
    id SERIAL PRIMARY KEY,                         -- Identificador único (autoincremento)
    incorporadora_id INTEGER NOT NULL,             -- ID da incorporadora responsável
    nome VARCHAR(255) NOT NULL,                    -- Nome do empreendimento
    endereco VARCHAR(255) NOT NULL,                -- Endereço completo
    cidade VARCHAR(100) NOT NULL,                  -- Cidade
    uf VARCHAR(2) NOT NULL,                        -- Estado (sigla)
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data de criação do registro
    
    FOREIGN KEY (incorporadora_id) REFERENCES incorporadoras(id) ON DELETE CASCADE
);

-- =========================================================================
-- TABELA: imobiliarias
-- Armazena as imobiliárias parceiras das incorporadoras
-- =========================================================================
CREATE TABLE imobiliarias (
    id SERIAL PRIMARY KEY,                         -- Identificador único (autoincremento)
    nome VARCHAR(255) NOT NULL,                    -- Nome da imobiliária
    cidade VARCHAR(100) NOT NULL,                  -- Cidade
    uf VARCHAR(2) NOT NULL,                        -- Estado (sigla)
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Data de criação do registro
);

-- =========================================================================
-- TABELA: corretores
-- Armazena os corretores das imobiliárias
-- =========================================================================
CREATE TABLE corretores (
    id SERIAL PRIMARY KEY,                         -- Identificador único (autoincremento)
    nome VARCHAR(255) NOT NULL,                    -- Nome do corretor
    sobrenome VARCHAR(255) NOT NULL,               -- Sobrenome do corretor
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data de criação do registro
    
    -- Referência à tabela imobiliárias
    FOREIGN KEY (imobiliaria_id) REFERENCES imobiliarias(id) ON DELETE CASCADE
);

-- =========================================================================
-- TABELA: acoes
-- Armazena os tipos de ações que serão pontuadas
-- =========================================================================
CREATE TABLE acoes (
    id SERIAL PRIMARY KEY,                         -- Identificador único (autoincremento)
    nome VARCHAR(255) UNIQUE NOT NULL,             -- Nome da ação (único no sistema)
    pontuacao INTEGER NOT NULL,                    -- Valor da pontuação atribuída à ação
    ativa BOOLEAN DEFAULT TRUE,                    -- Indica se a ação está ativa
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Data de criação do registro
);

-- =========================================================================
-- TABELA: registro_acoes
-- Armazena as ações executadas pelas imobiliárias
-- =========================================================================
CREATE TABLE registro_acoes (
    id SERIAL PRIMARY KEY,                         -- Identificador único (autoincremento)
    incorporadora_id INTEGER NOT NULL,             -- ID da incorporadora
    empreendimento_id INTEGER NOT NULL,            -- ID do empreendimento
    imobiliaria_id INTEGER NOT NULL,               -- ID da imobiliária
    corretor_id INTEGER NOT NULL,                  -- ID do corretor
    acao_id INTEGER NOT NULL,                      -- ID da ação executada
    data_acao DATE NOT NULL,                       -- Data em que a ação foi executada
    quantidade INTEGER NOT NULL,                   -- Quantidade de vezes que a ação foi executada
    pontuacao_total INTEGER NOT NULL,              -- Pontuação total (quantidade * pontuacao da ação)
    vgv DECIMAL(10,2) DEFAULT 0,                   -- Valor Geral de Vendas (opcional)
    anotacoes TEXT,                                -- Anotações adicionais (opcional)
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data de criação do registro
    
    -- Referências às outras tabelas
    FOREIGN KEY (incorporadora_id) REFERENCES incorporadoras(id) ON DELETE CASCADE,
    FOREIGN KEY (empreendimento_id) REFERENCES empreendimentos(id) ON DELETE CASCADE,
    FOREIGN KEY (imobiliaria_id) REFERENCES imobiliarias(id) ON DELETE CASCADE,
    FOREIGN KEY (corretor_id) REFERENCES corretores(id) ON DELETE CASCADE,
    FOREIGN KEY (acao_id) REFERENCES acoes(id) ON DELETE CASCADE
);

-- =========================================================================
-- POPULAÇÃO INICIAL DE DADOS PARA TESTE
-- =========================================================================

-- Inserindo uma incorporadora para testes
INSERT INTO incorporadoras (razao_social, cnpj, endereco, cidade, uf, nome_exibicao, email, telefone, responsavel, telefone_responsavel, email_responsavel) 
VALUES ('Construtora Exemplo S.A.', '12345678000199', 'Av. Principal, 123', 'Porto Alegre', 'RS', 'Construtora Exemplo', 'contato@exemplo.com', '(51) 3333-4444', 'João Silva', '(51) 99999-8888', 'joao@exemplo.com');

-- Inserindo usuários iniciais
-- Senha: 123456 (em produção, utilizar senhas seguras e hash)
INSERT INTO usuarios (nome, email, telefone, senha, perfil) 
VALUES ('Administrador', 'admin@sistema.com', '(51) 99999-1111', '123456', 'Administrador');

INSERT INTO usuarios (nome, email, telefone, senha, perfil) 
VALUES ('Gestor', 'gestor@sistema.com', '(51) 99999-2222', '123456', 'Gestor Consultoria');

INSERT INTO usuarios (nome, email, telefone, senha, perfil, incorporadora_id) 
VALUES ('Colaborador', 'colaborador@exemplo.com', '(51) 99999-3333', '123456', 'Colaborador Incorporadora', 1);

-- Inserindo um empreendimento para teste
INSERT INTO empreendimentos (incorporadora_id, nome, endereco, cidade, uf) 
VALUES (1, 'Residencial Solar', 'Rua das Flores, 500', 'Porto Alegre', 'RS');

-- Inserindo uma imobiliária para teste
INSERT INTO imobiliarias (nome, cidade, uf) 
VALUES ('Imobiliária Sucesso', 'Porto Alegre', 'RS');

-- Inserindo um corretor para teste
INSERT INTO corretores (imobiliaria_id, nome, sobrenome) 
VALUES (1, 'Maria', 'Santos');

-- Inserindo ações para teste
INSERT INTO acoes (nome, pontuacao) VALUES ('Visita com cliente', 10);
INSERT INTO acoes (nome, pontuacao) VALUES ('Proposta enviada', 20);
INSERT INTO acoes (nome, pontuacao) VALUES ('Venda concretizada', 100);

-- Inserindo um registro de ação para teste
INSERT INTO registro_acoes (incorporadora_id, empreendimento_id, imobiliaria_id, corretor_id, acao_id, data_acao, quantidade, pontuacao_total, vgv, anotacoes) 
VALUES (1, 1, 1, 1, 3, CURRENT_DATE, 1, 100, 500000.00, 'Venda de unidade 101');

-- =========================================================================
-- FIM DO SCRIPT
-- =========================================================================