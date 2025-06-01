// Este arquivo contém as funções para gerenciar incorporadoras no banco de dados

// Importando a conexão com o banco de dados
const pool = require("../config/db");

// Objeto que vai conter as funções do controller de incorporadoras
const incorporadoraController = {
  // Função para listar todas as incorporadoras com filtros opcionais
  listarIncorporadoras: async (req, res) => {
    try {
      // Obtém os filtros enviados pela URL (query parameters)
      const { razaoSocial, cnpj, cidade, uf } = req.query;

      // Monta a query base
      let query = `
        SELECT id, razao_social, cnpj, endereco, cidade, uf, 
               nome_exibicao, email, telefone, responsavel, 
               telefone_responsavel, email_responsavel, criado_em
        FROM incorporadoras
        WHERE 1=1
      `;

      // Array para armazenar os valores dos filtros
      const valores = [];
      let contador = 1;

      // Adiciona filtros dinamicamente se foram fornecidos
      if (razaoSocial) {
        query += ` AND razao_social ILIKE $${contador}`;
        valores.push(`%${razaoSocial}%`);
        contador++;
      }

      if (cnpj) {
        query += ` AND cnpj ILIKE $${contador}`;
        valores.push(`%${cnpj}%`);
        contador++;
      }

      if (cidade) {
        query += ` AND cidade ILIKE $${contador}`;
        valores.push(`%${cidade}%`);
        contador++;
      }

      if (uf) {
        query += ` AND uf ILIKE $${contador}`;
        valores.push(`%${uf}%`);
        contador++;
      }

      // Ordena os resultados por razão social
      query += ` ORDER BY razao_social`;

      // Executa a consulta no banco
      const resultado = await pool.query(query, valores);

      // Retorna os dados encontrados
      return res.status(200).json({
        sucesso: true,
        dados: resultado.rows,
        total: resultado.rows.length,
      });
    } catch (erro) {
      console.error("Erro ao listar incorporadoras:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao consultar incorporadoras",
      });
    }
  },

  // Função para buscar uma incorporadora específica pelo ID
  buscarIncorporadoraPorId: async (req, res) => {
    try {
      // Obtém o ID da incorporadora da URL
      const { id } = req.params;

      // Consulta a incorporadora no banco
      const query = `
        SELECT id, razao_social, cnpj, endereco, cidade, uf, 
               nome_exibicao, email, telefone, responsavel, 
               telefone_responsavel, email_responsavel, criado_em
        FROM incorporadoras
        WHERE id = $1
      `;

      const resultado = await pool.query(query, [id]);

      // Verifica se encontrou a incorporadora
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Incorporadora não encontrada",
        });
      }

      // Retorna a incorporadora encontrada
      return res.status(200).json({
        sucesso: true,
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao buscar incorporadora:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar incorporadora",
      });
    }
  },

  // Função para criar uma nova incorporadora
  criarIncorporadora: async (req, res) => {
    try {
      // Obtém os dados da incorporadora do corpo da requisição
      const {
        razao_social,
        cnpj,
        endereco,
        cidade,
        uf,
        nome_exibicao,
        email,
        telefone,
        responsavel,
        telefone_responsavel,
        email_responsavel,
      } = req.body;

      // Validações básicas
      if (!razao_social || !cnpj || !endereco || !cidade || !uf) {
        return res.status(400).json({
          sucesso: false,
          mensagem:
            "Razão social, CNPJ, endereço, cidade e UF são obrigatórios",
        });
      }

      // Verifica se o CNPJ já existe
      const cnpjExistente = await pool.query(
        "SELECT id FROM incorporadoras WHERE cnpj = $1",
        [cnpj]
      );

      if (cnpjExistente.rows.length > 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Este CNPJ já está cadastrado no sistema",
        });
      }

      // Prepara os dados para inserção
      const dadosParaInserir = [
        razao_social,
        cnpj,
        endereco,
        cidade,
        uf,
        nome_exibicao || razao_social,
        email || "",
        telefone || "",
        responsavel || "",
        telefone_responsavel || "",
        email_responsavel || "",
      ];

      // Query para inserir a nova incorporadora
      const query = `
        INSERT INTO incorporadoras (
          razao_social, cnpj, endereco, cidade, uf, 
          nome_exibicao, email, telefone, responsavel, 
          telefone_responsavel, email_responsavel
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, razao_social, cnpj, endereco, cidade, uf, 
                  nome_exibicao, email, telefone, responsavel, 
                  telefone_responsavel, email_responsavel, criado_em
      `;

      // Executa a inserção
      const resultado = await pool.query(query, dadosParaInserir);

      // Retorna a incorporadora criada
      return res.status(201).json({
        sucesso: true,
        mensagem: "Incorporadora criada com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao criar incorporadora:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao criar incorporadora",
      });
    }
  },

  // Função para atualizar uma incorporadora existente
  atualizarIncorporadora: async (req, res) => {
    try {
      // Obtém o ID da incorporadora da URL
      const { id } = req.params;

      // Obtém os dados atualizados do corpo da requisição
      const {
        razao_social,
        cnpj,
        endereco,
        cidade,
        uf,
        nome_exibicao,
        email,
        telefone,
        responsavel,
        telefone_responsavel,
        email_responsavel,
      } = req.body;

      // Validações básicas
      if (!razao_social || !cnpj || !endereco || !cidade || !uf) {
        return res.status(400).json({
          sucesso: false,
          mensagem:
            "Razão social, CNPJ, endereço, cidade e UF são obrigatórios",
        });
      }

      // Verifica se o CNPJ já existe para outra incorporadora
      const cnpjExistente = await pool.query(
        "SELECT id FROM incorporadoras WHERE cnpj = $1 AND id != $2",
        [cnpj, id]
      );

      if (cnpjExistente.rows.length > 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Este CNPJ já está cadastrado para outra incorporadora",
        });
      }

      // Prepara os dados para atualização
      const dadosParaAtualizar = [
        razao_social,
        cnpj,
        endereco,
        cidade,
        uf,
        nome_exibicao || razao_social,
        email || "",
        telefone || "",
        responsavel || "",
        telefone_responsavel || "",
        email_responsavel || "",
        id,
      ];

      // Query para atualizar a incorporadora
      const query = `
        UPDATE incorporadoras 
        SET razao_social = $1, cnpj = $2, endereco = $3, cidade = $4, uf = $5,
            nome_exibicao = $6, email = $7, telefone = $8, responsavel = $9,
            telefone_responsavel = $10, email_responsavel = $11
        WHERE id = $12
        RETURNING id, razao_social, cnpj, endereco, cidade, uf, 
                  nome_exibicao, email, telefone, responsavel, 
                  telefone_responsavel, email_responsavel, criado_em
      `;

      // Executa a atualização
      const resultado = await pool.query(query, dadosParaAtualizar);

      // Verifica se a incorporadora foi encontrada e atualizada
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Incorporadora não encontrada",
        });
      }

      // Retorna a incorporadora atualizada
      return res.status(200).json({
        sucesso: true,
        mensagem: "Incorporadora atualizada com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao atualizar incorporadora:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao atualizar incorporadora",
      });
    }
  },

  // Função para excluir uma incorporadora
  excluirIncorporadora: async (req, res) => {
    try {
      // Obtém o ID da incorporadora da URL
      const { id } = req.params;

      // Query para excluir a incorporadora
      const query =
        "DELETE FROM incorporadoras WHERE id = $1 RETURNING id, razao_social";

      // Executa a exclusão
      const resultado = await pool.query(query, [id]);

      // Verifica se a incorporadora foi encontrada e excluída
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Incorporadora não encontrada",
        });
      }

      // Retorna confirmação da exclusão
      return res.status(200).json({
        sucesso: true,
        mensagem: "Incorporadora excluída com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao excluir incorporadora:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao excluir incorporadora",
      });
    }
  },
};

module.exports = incorporadoraController;
