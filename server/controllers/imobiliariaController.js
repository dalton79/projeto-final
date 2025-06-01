// Este arquivo contém as funções para gerenciar imobiliárias no banco de dados

// Importando a conexão com o banco de dados
const pool = require("../config/db");

// Objeto que vai conter as funções do controller de imobiliárias
const imobiliariaController = {
  // Função para listar todas as imobiliárias com filtros opcionais
  // Filtra automaticamente por incorporadora_id se o usuário for Colaborador Incorporadora
  listarImobiliarias: async (req, res) => {
    try {
      // Obtém os filtros enviados pela URL (query parameters)
      const { nome, cidade, uf, incorporadora_id } = req.query;

      // Monta a query base
      let query = `
        SELECT id, nome, cidade, uf, criado_em
        FROM imobiliarias
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
      console.error("Erro ao listar imobiliárias:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao consultar imobiliárias",
      });
    }
  },

  // Função para buscar uma imobiliária específica pelo ID
  buscarImobiliariaPorId: async (req, res) => {
    try {
      // Obtém o ID da imobiliária da URL
      const { id } = req.params;

      // Consulta a imobiliária no banco
      const query = `
        SELECT id, nome, cidade, uf, criado_em
        FROM imobiliarias
        WHERE id = $1
      `;

      const resultado = await pool.query(query, [id]);

      // Verifica se encontrou a imobiliária
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Imobiliária não encontrada",
        });
      }

      // Retorna a imobiliária encontrada
      return res.status(200).json({
        sucesso: true,
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao buscar imobiliária:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar imobiliária",
      });
    }
  },

  // Função para criar uma nova imobiliária
  criarImobiliaria: async (req, res) => {
    try {
      // Obtém os dados da imobiliária do corpo da requisição
      const { nome, cidade, uf } = req.body;

      // Validações básicas
      if (!nome || !cidade || !uf) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Nome, cidade e UF são obrigatórios",
        });
      }

      // Prepara os dados para inserção
      const dadosParaInserir = [nome, cidade, uf];

      // Query para inserir a nova imobiliária
      const query = `
        INSERT INTO imobiliarias (nome, cidade, uf)
        VALUES ($1, $2, $3)
        RETURNING id, nome, cidade, uf, criado_em
      `;

      // Executa a inserção
      const resultado = await pool.query(query, dadosParaInserir);

      // Retorna a imobiliária criada
      return res.status(201).json({
        sucesso: true,
        mensagem: "Imobiliária criada com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao criar imobiliária:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao criar imobiliária",
      });
    }
  },

  // Função para atualizar uma imobiliária existente
  atualizarImobiliaria: async (req, res) => {
    try {
      // Obtém o ID da imobiliária da URL
      const { id } = req.params;

      // Obtém os dados atualizados do corpo da requisição
      const { nome, cidade, uf } = req.body;

      // Validações básicas
      if (!nome || !cidade || !uf) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Nome, cidade e UF são obrigatórios",
        });
      }

      // Prepara os dados para atualização
      const dadosParaAtualizar = [nome, cidade, uf, id];

      // Query para atualizar a imobiliária
      const query = `
        UPDATE imobiliarias 
        SET nome = $1, cidade = $2, uf = $3
        WHERE id = $4
        RETURNING id, nome, cidade, uf, criado_em
      `;

      // Executa a atualização
      const resultado = await pool.query(query, dadosParaAtualizar);

      // Verifica se a imobiliária foi encontrada e atualizada
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Imobiliária não encontrada",
        });
      }

      // Retorna a imobiliária atualizada
      return res.status(200).json({
        sucesso: true,
        mensagem: "Imobiliária atualizada com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao atualizar imobiliária:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao atualizar imobiliária",
      });
    }
  },

  // Função para excluir uma imobiliária
  excluirImobiliaria: async (req, res) => {
    try {
      // Obtém o ID da imobiliária da URL
      const { id } = req.params;

      // Query para excluir a imobiliária
      const query = "DELETE FROM imobiliarias WHERE id = $1 RETURNING id, nome";

      // Executa a exclusão
      const resultado = await pool.query(query, [id]);

      // Verifica se a imobiliária foi encontrada e excluída
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Imobiliária não encontrada",
        });
      }

      // Retorna confirmação da exclusão
      return res.status(200).json({
        sucesso: true,
        mensagem: "Imobiliária excluída com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao excluir imobiliária:", erro);

      // Verifica se o erro é de chave estrangeira (foreign key constraint)
      // Isso acontece se houver corretores ou registros de ações vinculados a esta imobiliária
      if (erro.code === "23503") {
        return res.status(400).json({
          sucesso: false,
          mensagem:
            "Não é possível excluir esta imobiliária porque ela está sendo usada por corretores ou registros de ações",
        });
      }

      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao excluir imobiliária",
      });
    }
  },
};

module.exports = imobiliariaController;
