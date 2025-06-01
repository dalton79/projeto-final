// Este arquivo contém as funções para gerenciar ações no banco de dados

// Importando a conexão com o banco de dados
const pool = require("../config/db");

// Objeto que vai conter as funções do controller de ações
const acaoController = {
  // Função para listar todas as ações com filtros opcionais
  listarAcoes: async (req, res) => {
    try {
      // Obtém os filtros enviados pela URL (query parameters)
      const { nome, ativa } = req.query;

      // Monta a query base
      let query = `
        SELECT id, nome, pontuacao, ativa, criado_em
        FROM acoes
        WHERE 1=1
      `;

      // Array para armazenar os valores dos filtros
      const valores = [];
      let contador = 1;

      // Adiciona filtros dinamicamente se foram fornecidos
      if (nome) {
        query += ` AND nome ILIKE $${contador}`;
        valores.push(`%${nome}%`);
        contador++;
      }

      if (ativa !== undefined && ativa !== "") {
        query += ` AND ativa = $${contador}`;
        valores.push(ativa === "true");
        contador++;
      }

      // Ordena os resultados por nome
      query += ` ORDER BY nome`;

      // Executa a consulta no banco
      const resultado = await pool.query(query, valores);

      // Retorna os dados encontrados
      return res.status(200).json({
        sucesso: true,
        dados: resultado.rows,
        total: resultado.rows.length,
      });
    } catch (erro) {
      console.error("Erro ao listar ações:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao consultar ações",
      });
    }
  },

  // Função para buscar uma ação específica pelo ID
  buscarAcaoPorId: async (req, res) => {
    try {
      // Obtém o ID da ação da URL
      const { id } = req.params;

      // Consulta a ação no banco
      const query = `
        SELECT id, nome, pontuacao, ativa, criado_em
        FROM acoes
        WHERE id = $1
      `;

      const resultado = await pool.query(query, [id]);

      // Verifica se encontrou a ação
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Ação não encontrada",
        });
      }

      // Retorna a ação encontrada
      return res.status(200).json({
        sucesso: true,
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao buscar ação:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar ação",
      });
    }
  },

  // Função para criar uma nova ação
  criarAcao: async (req, res) => {
    try {
      // Obtém os dados da ação do corpo da requisição
      const { nome, pontuacao, ativa } = req.body;

      // Validações básicas
      if (!nome || pontuacao === undefined) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Nome e pontuação são obrigatórios",
        });
      }

      // Verifica se o nome já existe
      const nomeExistente = await pool.query(
        "SELECT id FROM acoes WHERE nome = $1",
        [nome]
      );

      if (nomeExistente.rows.length > 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Esta ação já está cadastrada no sistema",
        });
      }

      // Prepara os dados para inserção
      const dadosParaInserir = [
        nome,
        pontuacao,
        ativa !== undefined ? ativa : true,
      ];

      // Query para inserir a nova ação
      const query = `
        INSERT INTO acoes (nome, pontuacao, ativa)
        VALUES ($1, $2, $3)
        RETURNING id, nome, pontuacao, ativa, criado_em
      `;

      // Executa a inserção
      const resultado = await pool.query(query, dadosParaInserir);

      // Retorna a ação criada
      return res.status(201).json({
        sucesso: true,
        mensagem: "Ação criada com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao criar ação:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao criar ação",
      });
    }
  },

  // Função para atualizar uma ação existente
  atualizarAcao: async (req, res) => {
    try {
      // Obtém o ID da ação da URL
      const { id } = req.params;

      // Obtém os dados atualizados do corpo da requisição
      const { nome, pontuacao, ativa } = req.body;

      // Validações básicas
      if (!nome || pontuacao === undefined) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Nome e pontuação são obrigatórios",
        });
      }

      // Verifica se o nome já existe para outra ação
      const nomeExistente = await pool.query(
        "SELECT id FROM acoes WHERE nome = $1 AND id != $2",
        [nome, id]
      );

      if (nomeExistente.rows.length > 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Esta ação já está cadastrada para outra ação",
        });
      }

      // Prepara os dados para atualização
      const dadosParaAtualizar = [
        nome,
        pontuacao,
        ativa !== undefined ? ativa : true,
        id,
      ];

      // Query para atualizar a ação
      const query = `
        UPDATE acoes 
        SET nome = $1, pontuacao = $2, ativa = $3
        WHERE id = $4
        RETURNING id, nome, pontuacao, ativa, criado_em
      `;

      // Executa a atualização
      const resultado = await pool.query(query, dadosParaAtualizar);

      // Verifica se a ação foi encontrada e atualizada
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Ação não encontrada",
        });
      }

      // Retorna a ação atualizada
      return res.status(200).json({
        sucesso: true,
        mensagem: "Ação atualizada com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao atualizar ação:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao atualizar ação",
      });
    }
  },

  // Função para excluir uma ação
  excluirAcao: async (req, res) => {
    try {
      // Obtém o ID da ação da URL
      const { id } = req.params;

      // Query para excluir a ação
      const query = "DELETE FROM acoes WHERE id = $1 RETURNING id, nome";

      // Executa a exclusão
      const resultado = await pool.query(query, [id]);

      // Verifica se a ação foi encontrada e excluída
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Ação não encontrada",
        });
      }

      // Retorna confirmação da exclusão
      return res.status(200).json({
        sucesso: true,
        mensagem: "Ação excluída com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao excluir ação:", erro);

      // Verifica se o erro é de chave estrangeira (foreign key constraint)
      if (erro.code === "23503") {
        return res.status(400).json({
          sucesso: false,
          mensagem:
            "Não é possível excluir esta ação porque ela está sendo usada em outros registros",
        });
      }

      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao excluir ação",
      });
    }
  },
};

module.exports = acaoController;
