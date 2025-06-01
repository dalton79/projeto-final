// Este arquivo contém as funções para gerenciar corretores no banco de dados

// Importando a conexão com o banco de dados
const pool = require("../config/db");

// Objeto que vai conter as funções do controller de corretores
const corretorController = {
  // Função para listar todos os corretores com filtros opcionais
  listarCorretores: async (req, res) => {
    try {
      // Obtém os filtros enviados pela URL (query parameters)
      const { nome, sobrenome } = req.query;

      // Monta a query base
      let query = `
        SELECT id, nome, sobrenome, criado_em
        FROM corretores
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

      if (sobrenome) {
        query += ` AND sobrenome ILIKE $${contador}`;
        valores.push(`%${sobrenome}%`);
        contador++;
      }

      // Ordena os resultados por nome e sobrenome
      query += ` ORDER BY nome, sobrenome`;

      // Executa a consulta no banco
      const resultado = await pool.query(query, valores);

      // Retorna os dados encontrados
      return res.status(200).json({
        sucesso: true,
        dados: resultado.rows,
        total: resultado.rows.length,
      });
    } catch (erro) {
      console.error("Erro ao listar corretores:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao consultar corretores",
      });
    }
  },

  // Função para buscar um corretor específico pelo ID
  buscarCorretorPorId: async (req, res) => {
    try {
      // Obtém o ID do corretor da URL
      const { id } = req.params;

      // Consulta o corretor no banco
      const query = `
        SELECT id, nome, sobrenome, criado_em
        FROM corretores
        WHERE id = $1
      `;

      const resultado = await pool.query(query, [id]);

      // Verifica se encontrou o corretor
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Corretor não encontrado",
        });
      }

      // Retorna o corretor encontrado
      return res.status(200).json({
        sucesso: true,
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao buscar corretor:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar corretor",
      });
    }
  },

  // Função para criar um novo corretor
  criarCorretor: async (req, res) => {
    try {
      // Obtém os dados do corretor do corpo da requisição
      const { nome, sobrenome } = req.body;

      // Validações básicas
      if (!nome || !sobrenome) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Nome e sobrenome são obrigatórios",
        });
      }

      // Prepara os dados para inserção
      const dadosParaInserir = [nome, sobrenome];

      // Query para inserir o novo corretor
      const query = `
        INSERT INTO corretores (nome, sobrenome)
        VALUES ($1, $2)
        RETURNING id, nome, sobrenome, criado_em
      `;

      // Executa a inserção
      const resultado = await pool.query(query, dadosParaInserir);

      // Retorna o corretor criado
      return res.status(201).json({
        sucesso: true,
        mensagem: "Corretor criado com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao criar corretor:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao criar corretor",
      });
    }
  },

  // Função para atualizar um corretor existente
  atualizarCorretor: async (req, res) => {
    try {
      // Obtém o ID do corretor da URL
      const { id } = req.params;

      // Obtém os dados atualizados do corpo da requisição
      const { nome, sobrenome } = req.body;

      // Validações básicas
      if (!nome || !sobrenome) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Nome e sobrenome são obrigatórios",
        });
      }

      // Prepara os dados para atualização
      const dadosParaAtualizar = [nome, sobrenome, id];

      // Query para atualizar o corretor
      const query = `
        UPDATE corretores 
        SET nome = $1, sobrenome = $2
        WHERE id = $3
        RETURNING id, nome, sobrenome, criado_em
      `;

      // Executa a atualização
      const resultado = await pool.query(query, dadosParaAtualizar);

      // Verifica se o corretor foi encontrado e atualizado
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Corretor não encontrado",
        });
      }

      // Retorna o corretor atualizado
      return res.status(200).json({
        sucesso: true,
        mensagem: "Corretor atualizado com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao atualizar corretor:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao atualizar corretor",
      });
    }
  },

  // Função para excluir um corretor
  excluirCorretor: async (req, res) => {
    try {
      // Obtém o ID do corretor da URL
      const { id } = req.params;

      // Query para excluir o corretor
      const query =
        "DELETE FROM corretores WHERE id = $1 RETURNING id, nome, sobrenome";

      // Executa a exclusão
      const resultado = await pool.query(query, [id]);

      // Verifica se o corretor foi encontrado e excluído
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Corretor não encontrado",
        });
      }

      // Retorna confirmação da exclusão
      return res.status(200).json({
        sucesso: true,
        mensagem: "Corretor excluído com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao excluir corretor:", erro);

      // Verifica se o erro é de chave estrangeira (foreign key constraint)
      // Isso acontece se houver registros de ações vinculados a este corretor
      if (erro.code === "23503") {
        return res.status(400).json({
          sucesso: false,
          mensagem:
            "Não é possível excluir este corretor porque ele está sendo usado em registros de ações",
        });
      }

      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao excluir corretor",
      });
    }
  },
};

module.exports = corretorController;
