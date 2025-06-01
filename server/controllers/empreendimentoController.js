// Este arquivo contém as funções para gerenciar empreendimentos no banco de dados

// Importando a conexão com o banco de dados
const pool = require("../config/db");

// Objeto que vai conter as funções do controller de empreendimentos
const empreendimentoController = {
  // Função para listar todos os empreendimentos com filtros opcionais
  listarEmpreendimentos: async (req, res) => {
    try {
      // Obtém os filtros enviados pela URL (query parameters)
      const { nome, cidade, uf, incorporadora_id } = req.query;

      // Monta a query base
      let query = `
        SELECT e.id, e.nome, e.endereco, e.cidade, e.uf, 
               e.incorporadora_id, i.nome_exibicao as incorporadora_nome,
               e.criado_em
        FROM empreendimentos e
        INNER JOIN incorporadoras i ON e.incorporadora_id = i.id
        WHERE 1=1
      `;

      // Array para armazenar os valores dos filtros
      const valores = [];
      let contador = 1;

      // Adiciona filtros dinamicamente se foram fornecidos
      if (nome) {
        query += ` AND e.nome ILIKE $${contador}`;
        valores.push(`%${nome}%`);
        contador++;
      }

      if (cidade) {
        query += ` AND e.cidade ILIKE $${contador}`;
        valores.push(`%${cidade}%`);
        contador++;
      }

      if (uf) {
        query += ` AND e.uf ILIKE $${contador}`;
        valores.push(`%${uf}%`);
        contador++;
      }

      if (incorporadora_id) {
        query += ` AND e.incorporadora_id = $${contador}`;
        valores.push(incorporadora_id);
        contador++;
      }

      // Ordena os resultados por nome
      query += ` ORDER BY e.nome`;

      // Executa a consulta no banco
      const resultado = await pool.query(query, valores);

      // Retorna os dados encontrados
      return res.status(200).json({
        sucesso: true,
        dados: resultado.rows,
        total: resultado.rows.length,
      });
    } catch (erro) {
      console.error("Erro ao listar empreendimentos:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao consultar empreendimentos",
      });
    }
  },

  // Função para buscar um empreendimento específico pelo ID
  buscarEmpreendimentoPorId: async (req, res) => {
    try {
      // Obtém o ID do empreendimento da URL
      const { id } = req.params;

      // Consulta o empreendimento no banco
      const query = `
        SELECT e.id, e.nome, e.endereco, e.cidade, e.uf, 
               e.incorporadora_id, i.nome_exibicao as incorporadora_nome,
               e.criado_em
        FROM empreendimentos e
        INNER JOIN incorporadoras i ON e.incorporadora_id = i.id
        WHERE e.id = $1
      `;

      const resultado = await pool.query(query, [id]);

      // Verifica se encontrou o empreendimento
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Empreendimento não encontrado",
        });
      }

      // Retorna o empreendimento encontrado
      return res.status(200).json({
        sucesso: true,
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao buscar empreendimento:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar empreendimento",
      });
    }
  },

  // Função para criar um novo empreendimento
  criarEmpreendimento: async (req, res) => {
    try {
      // Obtém os dados do empreendimento do corpo da requisição
      const { nome, endereco, cidade, uf, incorporadora_id } = req.body;

      // Validações básicas
      if (!nome || !endereco || !cidade || !uf || !incorporadora_id) {
        return res.status(400).json({
          sucesso: false,
          mensagem:
            "Nome, endereço, cidade, UF e incorporadora são obrigatórios",
        });
      }

      // Verifica se a incorporadora existe
      const incorporadoraExiste = await pool.query(
        "SELECT id FROM incorporadoras WHERE id = $1",
        [incorporadora_id]
      );

      if (incorporadoraExiste.rows.length === 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "A incorporadora informada não existe",
        });
      }

      // Prepara os dados para inserção
      const dadosParaInserir = [nome, endereco, cidade, uf, incorporadora_id];

      // Query para inserir o novo empreendimento
      const query = `
        INSERT INTO empreendimentos (nome, endereco, cidade, uf, incorporadora_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, nome, endereco, cidade, uf, incorporadora_id, criado_em
      `;

      // Executa a inserção
      const resultado = await pool.query(query, dadosParaInserir);

      // Retorna o empreendimento criado
      return res.status(201).json({
        sucesso: true,
        mensagem: "Empreendimento criado com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao criar empreendimento:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao criar empreendimento",
      });
    }
  },

  // Função para atualizar um empreendimento existente
  atualizarEmpreendimento: async (req, res) => {
    try {
      // Obtém o ID do empreendimento da URL
      const { id } = req.params;

      // Obtém os dados atualizados do corpo da requisição
      const { nome, endereco, cidade, uf, incorporadora_id } = req.body;

      // Validações básicas
      if (!nome || !endereco || !cidade || !uf || !incorporadora_id) {
        return res.status(400).json({
          sucesso: false,
          mensagem:
            "Nome, endereço, cidade, UF e incorporadora são obrigatórios",
        });
      }

      // Verifica se a incorporadora existe
      const incorporadoraExiste = await pool.query(
        "SELECT id FROM incorporadoras WHERE id = $1",
        [incorporadora_id]
      );

      if (incorporadoraExiste.rows.length === 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "A incorporadora informada não existe",
        });
      }

      // Prepara os dados para atualização
      const dadosParaAtualizar = [
        nome,
        endereco,
        cidade,
        uf,
        incorporadora_id,
        id,
      ];

      // Query para atualizar o empreendimento
      const query = `
        UPDATE empreendimentos 
        SET nome = $1, endereco = $2, cidade = $3, uf = $4, incorporadora_id = $5
        WHERE id = $6
        RETURNING id, nome, endereco, cidade, uf, incorporadora_id, criado_em
      `;

      // Executa a atualização
      const resultado = await pool.query(query, dadosParaAtualizar);

      // Verifica se o empreendimento foi encontrado e atualizado
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Empreendimento não encontrado",
        });
      }

      // Retorna o empreendimento atualizado
      return res.status(200).json({
        sucesso: true,
        mensagem: "Empreendimento atualizado com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao atualizar empreendimento:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao atualizar empreendimento",
      });
    }
  },

  // Função para excluir um empreendimento
  excluirEmpreendimento: async (req, res) => {
    try {
      // Obtém o ID do empreendimento da URL
      const { id } = req.params;

      // Query para excluir o empreendimento
      const query =
        "DELETE FROM empreendimentos WHERE id = $1 RETURNING id, nome";

      // Executa a exclusão
      const resultado = await pool.query(query, [id]);

      // Verifica se o empreendimento foi encontrado e excluído
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Empreendimento não encontrado",
        });
      }

      // Retorna confirmação da exclusão
      return res.status(200).json({
        sucesso: true,
        mensagem: "Empreendimento excluído com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao excluir empreendimento:", erro);

      // Verifica se o erro é de chave estrangeira (foreign key constraint)
      if (erro.code === "23503") {
        return res.status(400).json({
          sucesso: false,
          mensagem:
            "Não é possível excluir este empreendimento porque ele está sendo usado em outros registros",
        });
      }

      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao excluir empreendimento",
      });
    }
  },
};

module.exports = empreendimentoController;
