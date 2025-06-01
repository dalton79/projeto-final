// Este arquivo contém as funções para gerenciar usuários no banco de dados

// Importando a conexão com o banco de dados
const pool = require("../config/db");

// Objeto que vai conter as funções do controller de usuários
const userController = {
  // Função para listar todos os usuários com filtros opcionais
  listarUsuarios: async (req, res) => {
    try {
      // Obtém os filtros enviados pela URL (query parameters)
      const { nome, email, perfil, ativo } = req.query;

      // Monta a query base
      let query = `
        SELECT u.id, u.nome, u.email, u.telefone, u.perfil, u.ativo, 
               u.incorporadora_id, i.nome_exibicao as incorporadora_nome,
               u.criado_em
        FROM usuarios u
        LEFT JOIN incorporadoras i ON u.incorporadora_id = i.id
        WHERE 1=1
      `;

      // Array para armazenar os valores dos filtros
      const valores = [];
      let contador = 1;

      // Adiciona filtros dinamicamente se foram fornecidos
      if (nome) {
        query += ` AND u.nome ILIKE $${contador}`;
        valores.push(`%${nome}%`);
        contador++;
      }

      if (email) {
        query += ` AND u.email ILIKE $${contador}`;
        valores.push(`%${email}%`);
        contador++;
      }

      if (perfil) {
        query += ` AND u.perfil = $${contador}`;
        valores.push(perfil);
        contador++;
      }

      if (ativo !== undefined && ativo !== "") {
        query += ` AND u.ativo = $${contador}`;
        valores.push(ativo === "true");
        contador++;
      }

      // Ordena os resultados por nome
      query += ` ORDER BY u.nome`;

      // Executa a consulta no banco
      const resultado = await pool.query(query, valores);

      // Retorna os dados encontrados
      return res.status(200).json({
        sucesso: true,
        dados: resultado.rows,
        total: resultado.rows.length,
      });
    } catch (erro) {
      console.error("Erro ao listar usuários:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao consultar usuários",
      });
    }
  },

  // Função para buscar um usuário específico pelo ID
  buscarUsuarioPorId: async (req, res) => {
    try {
      // Obtém o ID do usuário da URL
      const { id } = req.params;

      // Consulta o usuário no banco
      const query = `
        SELECT u.id, u.nome, u.email, u.telefone, u.perfil, u.ativo, 
               u.incorporadora_id, i.nome_exibicao as incorporadora_nome,
               u.criado_em
        FROM usuarios u
        LEFT JOIN incorporadoras i ON u.incorporadora_id = i.id
        WHERE u.id = $1
      `;

      const resultado = await pool.query(query, [id]);

      // Verifica se encontrou o usuário
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Usuário não encontrado",
        });
      }

      // Retorna o usuário encontrado
      return res.status(200).json({
        sucesso: true,
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao buscar usuário:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar usuário",
      });
    }
  },

  // Função para criar um novo usuário
  criarUsuario: async (req, res) => {
    try {
      // Obtém os dados do usuário do corpo da requisição
      const { nome, email, telefone, senha, perfil, incorporadora_id, ativo } =
        req.body;

      // Validações básicas
      if (!nome || !email || !senha || !perfil) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Nome, email, senha e perfil são obrigatórios",
        });
      }

      // Verifica se o email já existe
      const emailExistente = await pool.query(
        "SELECT id FROM usuarios WHERE email = $1",
        [email]
      );

      if (emailExistente.rows.length > 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Este email já está cadastrado no sistema",
        });
      }

      // Prepara os dados para inserção
      const dadosParaInserir = [
        nome,
        email,
        telefone || "",
        senha, // Em produção, a senha deveria ser hasheada
        perfil,
        perfil === "Colaborador Incorporadora" ? incorporadora_id : null,
        ativo !== undefined ? ativo : true,
      ];

      // Query para inserir o novo usuário
      const query = `
        INSERT INTO usuarios (nome, email, telefone, senha, perfil, incorporadora_id, ativo)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, nome, email, telefone, perfil, ativo, incorporadora_id, criado_em
      `;

      // Executa a inserção
      const resultado = await pool.query(query, dadosParaInserir);

      // Retorna o usuário criado
      return res.status(201).json({
        sucesso: true,
        mensagem: "Usuário criado com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao criar usuário:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao criar usuário",
      });
    }
  },

  // Função para atualizar um usuário existente
  atualizarUsuario: async (req, res) => {
    try {
      // Obtém o ID do usuário da URL
      const { id } = req.params;

      // Obtém os dados atualizados do corpo da requisição
      const { nome, email, telefone, perfil, incorporadora_id, ativo } =
        req.body;

      // Validações básicas
      if (!nome || !email || !perfil) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Nome, email e perfil são obrigatórios",
        });
      }

      // Verifica se o email já existe para outro usuário
      const emailExistente = await pool.query(
        "SELECT id FROM usuarios WHERE email = $1 AND id != $2",
        [email, id]
      );

      if (emailExistente.rows.length > 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Este email já está cadastrado para outro usuário",
        });
      }

      // Prepara os dados para atualização
      const dadosParaAtualizar = [
        nome,
        email,
        telefone || "",
        perfil,
        perfil === "Colaborador Incorporadora" ? incorporadora_id : null,
        ativo !== undefined ? ativo : true,
        id,
      ];

      // Query para atualizar o usuário
      const query = `
        UPDATE usuarios 
        SET nome = $1, email = $2, telefone = $3, perfil = $4, 
            incorporadora_id = $5, ativo = $6
        WHERE id = $7
        RETURNING id, nome, email, telefone, perfil, ativo, incorporadora_id, criado_em
      `;

      // Executa a atualização
      const resultado = await pool.query(query, dadosParaAtualizar);

      // Verifica se o usuário foi encontrado e atualizado
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Usuário não encontrado",
        });
      }

      // Retorna o usuário atualizado
      return res.status(200).json({
        sucesso: true,
        mensagem: "Usuário atualizado com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao atualizar usuário:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao atualizar usuário",
      });
    }
  },

  // Função para excluir um usuário
  excluirUsuario: async (req, res) => {
    try {
      // Obtém o ID do usuário da URL
      const { id } = req.params;

      // Query para excluir o usuário
      const query = "DELETE FROM usuarios WHERE id = $1 RETURNING id, nome";

      // Executa a exclusão
      const resultado = await pool.query(query, [id]);

      // Verifica se o usuário foi encontrado e excluído
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Usuário não encontrado",
        });
      }

      // Retorna confirmação da exclusão
      return res.status(200).json({
        sucesso: true,
        mensagem: "Usuário excluído com sucesso",
        dados: resultado.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao excluir usuário:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao excluir usuário",
      });
    }
  },
};

module.exports = userController;
