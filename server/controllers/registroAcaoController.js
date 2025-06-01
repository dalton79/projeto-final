// Este arquivo contém as funções para gerenciar o registro de ações executadas pelas imobiliárias

// Importando a conexão com o banco de dados
const pool = require("../config/db");

// Objeto que vai conter as funções do controller de registro de ações
const registroAcaoController = {
  // Função para listar os registros de ações com filtros opcionais
  // Filtra automaticamente por incorporadora_id se o usuário for Colaborador Incorporadora
  listarRegistrosAcoes: async (req, res) => {
    try {
      // Obtém os filtros enviados pela URL (query parameters)
      const {
        data_inicio,
        data_fim,
        incorporadora_id,
        empreendimento_id,
        imobiliaria_id,
        corretor_id,
        acao_id,
      } = req.query;

      // Obtém o ID da incorporadora do usuário logado (do token JWT ou da sessão)
      // Por enquanto, vamos pegar do query param incorporadora_id
      const incorporadoraIdUsuario = incorporadora_id;

      // Monta a query base para buscar registros de ações
      let query = `
        SELECT 
          ra.id, 
          ra.data_acao, 
          ra.quantidade, 
          ra.pontuacao_total, 
          ra.vgv, 
          ra.anotacoes,
          ra.criado_em,
          i.nome as imobiliaria_nome,
          c.nome as corretor_nome,
          c.sobrenome as corretor_sobrenome,
          e.nome as empreendimento_nome,
          a.nome as acao_nome
        FROM 
          registro_acoes ra
        INNER JOIN 
          imobiliarias i ON ra.imobiliaria_id = i.id
        INNER JOIN 
          corretores c ON ra.corretor_id = c.id
        INNER JOIN 
          empreendimentos e ON ra.empreendimento_id = e.id
        INNER JOIN 
          acoes a ON ra.acao_id = a.id
        WHERE 1=1
      `;

      // Array para armazenar os valores dos filtros
      const valores = [];
      let contador = 1;

      // Filtro obrigatório por incorporadora (do usuário logado)
      if (incorporadoraIdUsuario) {
        query += ` AND ra.incorporadora_id = $${contador}`;
        valores.push(incorporadoraIdUsuario);
        contador++;
      }

      // Adiciona filtros dinamicamente se foram fornecidos
      if (data_inicio) {
        query += ` AND ra.data_acao >= $${contador}`;
        valores.push(data_inicio);
        contador++;
      }

      if (data_fim) {
        query += ` AND ra.data_acao <= $${contador}`;
        valores.push(data_fim);
        contador++;
      }

      if (empreendimento_id) {
        query += ` AND ra.empreendimento_id = $${contador}`;
        valores.push(empreendimento_id);
        contador++;
      }

      if (imobiliaria_id) {
        query += ` AND ra.imobiliaria_id = $${contador}`;
        valores.push(imobiliaria_id);
        contador++;
      }

      if (corretor_id) {
        query += ` AND ra.corretor_id = $${contador}`;
        valores.push(corretor_id);
        contador++;
      }

      if (acao_id) {
        query += ` AND ra.acao_id = $${contador}`;
        valores.push(acao_id);
        contador++;
      }

      // Ordena os resultados por data de execução da ação (mais recente primeiro)
      query += ` ORDER BY ra.data_acao DESC`;

      // Executa a consulta no banco
      const resultado = await pool.query(query, valores);

      // Retorna os dados encontrados
      return res.status(200).json({
        sucesso: true,
        dados: resultado.rows,
        total: resultado.rows.length,
      });
    } catch (erro) {
      console.error("Erro ao listar registros de ações:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao consultar registros de ações",
      });
    }
  },

  // Função para buscar um registro de ação específico pelo ID
  buscarRegistroAcaoPorId: async (req, res) => {
    try {
      // Obtém o ID do registro de ação da URL
      const { id } = req.params;

      // Obtém o ID da incorporadora do usuário logado (do token JWT ou da sessão)
      // Por enquanto, vamos pegar do query param incorporadora_id
      const incorporadoraIdUsuario = req.query.incorporadora_id;

      // Consulta o registro de ação no banco
      const query = `
        SELECT 
          ra.id, 
          ra.data_acao, 
          ra.quantidade, 
          ra.pontuacao_total, 
          ra.vgv, 
          ra.anotacoes,
          ra.incorporadora_id,
          ra.empreendimento_id,
          ra.imobiliaria_id,
          ra.corretor_id,
          ra.acao_id,
          ra.criado_em,
          i.nome as imobiliaria_nome,
          c.nome as corretor_nome,
          c.sobrenome as corretor_sobrenome,
          e.nome as empreendimento_nome,
          a.nome as acao_nome,
          a.pontuacao as acao_pontuacao
        FROM 
          registro_acoes ra
        INNER JOIN 
          imobiliarias i ON ra.imobiliaria_id = i.id
        INNER JOIN 
          corretores c ON ra.corretor_id = c.id
        INNER JOIN 
          empreendimentos e ON ra.empreendimento_id = e.id
        INNER JOIN 
          acoes a ON ra.acao_id = a.id
        WHERE 
          ra.id = $1
      `;

      // Se houver ID de incorporadora, adiciona na condição de busca
      const params = [id];

      const resultado = await pool.query(query, params);

      // Verifica se encontrou o registro
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Registro de ação não encontrado",
        });
      }

      // Verifica se o registro pertence à incorporadora do usuário
      const registro = resultado.rows[0];
      if (
        incorporadoraIdUsuario &&
        registro.incorporadora_id != incorporadoraIdUsuario
      ) {
        return res.status(403).json({
          sucesso: false,
          mensagem: "Você não tem permissão para acessar este registro",
        });
      }

      // Retorna o registro encontrado
      return res.status(200).json({
        sucesso: true,
        dados: registro,
      });
    } catch (erro) {
      console.error("Erro ao buscar registro de ação:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar registro de ação",
      });
    }
  },

  // Função para criar um novo registro de ação
  criarRegistroAcao: async (req, res) => {
    try {
      // Obtém os dados do registro de ação do corpo da requisição
      const {
        data_acao,
        acao_id,
        quantidade,
        incorporadora_id,
        empreendimento_id,
        imobiliaria_id,
        corretor_id,
        vgv,
        anotacoes,
      } = req.body;

      // Validações básicas
      if (
        !data_acao ||
        !acao_id ||
        !quantidade ||
        !incorporadora_id ||
        !empreendimento_id ||
        !imobiliaria_id ||
        !corretor_id
      ) {
        return res.status(400).json({
          sucesso: false,
          mensagem:
            "Data, ação, quantidade, incorporadora, empreendimento, imobiliária e corretor são obrigatórios",
        });
      }

      // Busca a pontuação da ação para calcular o total
      const acaoQuery =
        "SELECT pontuacao FROM acoes WHERE id = $1 AND ativa = true";
      const acaoResultado = await pool.query(acaoQuery, [acao_id]);

      // Verifica se a ação existe e está ativa
      if (acaoResultado.rows.length === 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "A ação selecionada não existe ou não está ativa",
        });
      }

      // Calcula a pontuação total
      const pontuacaoAcao = acaoResultado.rows[0].pontuacao;
      const pontuacao_total = pontuacaoAcao * quantidade;

      // Prepara os dados para inserção
      const dadosParaInserir = [
        data_acao,
        acao_id,
        quantidade,
        pontuacao_total,
        incorporadora_id,
        empreendimento_id,
        imobiliaria_id,
        corretor_id,
        vgv || 0,
        anotacoes || "",
      ];

      // Query para inserir o novo registro de ação
      const query = `
        INSERT INTO registro_acoes (
          data_acao, 
          acao_id, 
          quantidade, 
          pontuacao_total, 
          incorporadora_id, 
          empreendimento_id, 
          imobiliaria_id, 
          corretor_id, 
          vgv, 
          anotacoes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `;

      // Executa a inserção
      const resultado = await pool.query(query, dadosParaInserir);

      // Busca o registro completo para retornar
      const registroId = resultado.rows[0].id;
      const registroQuery = `
        SELECT 
          ra.id, 
          ra.data_acao, 
          ra.quantidade, 
          ra.pontuacao_total, 
          ra.vgv, 
          ra.anotacoes,
          ra.incorporadora_id,
          ra.empreendimento_id,
          ra.imobiliaria_id,
          ra.corretor_id,
          ra.acao_id,
          ra.criado_em,
          i.nome as imobiliaria_nome,
          c.nome as corretor_nome,
          c.sobrenome as corretor_sobrenome,
          e.nome as empreendimento_nome,
          a.nome as acao_nome
        FROM 
          registro_acoes ra
        INNER JOIN 
          imobiliarias i ON ra.imobiliaria_id = i.id
        INNER JOIN 
          corretores c ON ra.corretor_id = c.id
        INNER JOIN 
          empreendimentos e ON ra.empreendimento_id = e.id
        INNER JOIN 
          acoes a ON ra.acao_id = a.id
        WHERE 
          ra.id = $1
      `;

      const registroCompleto = await pool.query(registroQuery, [registroId]);

      // Retorna o registro criado
      return res.status(201).json({
        sucesso: true,
        mensagem: "Registro de ação criado com sucesso",
        dados: registroCompleto.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao criar registro de ação:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao criar registro de ação",
      });
    }
  },

  // Função para atualizar um registro de ação existente
  atualizarRegistroAcao: async (req, res) => {
    try {
      // Obtém o ID do registro de ação da URL
      const { id } = req.params;

      // Obtém os dados atualizados do corpo da requisição
      const {
        data_acao,
        acao_id,
        quantidade,
        incorporadora_id,
        empreendimento_id,
        imobiliaria_id,
        corretor_id,
        vgv,
        anotacoes,
      } = req.body;

      // Validações básicas
      if (
        !data_acao ||
        !acao_id ||
        !quantidade ||
        !incorporadora_id ||
        !empreendimento_id ||
        !imobiliaria_id ||
        !corretor_id
      ) {
        return res.status(400).json({
          sucesso: false,
          mensagem:
            "Data, ação, quantidade, incorporadora, empreendimento, imobiliária e corretor são obrigatórios",
        });
      }

      // Obtém o ID da incorporadora do usuário logado (do token JWT ou da sessão)
      // Por enquanto, vamos usar o valor enviado no corpo da requisição
      const incorporadoraIdUsuario = incorporadora_id;

      // Verifica se o registro existe e pertence à incorporadora do usuário
      const verificacaoQuery =
        "SELECT incorporadora_id FROM registro_acoes WHERE id = $1";
      const verificacaoResultado = await pool.query(verificacaoQuery, [id]);

      if (verificacaoResultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Registro de ação não encontrado",
        });
      }

      // Verifica se o registro pertence à incorporadora do usuário
      const registroExistente = verificacaoResultado.rows[0];
      if (
        incorporadoraIdUsuario &&
        registroExistente.incorporadora_id != incorporadoraIdUsuario
      ) {
        return res.status(403).json({
          sucesso: false,
          mensagem: "Você não tem permissão para editar este registro",
        });
      }

      // Busca a pontuação da ação para calcular o total
      const acaoQuery =
        "SELECT pontuacao FROM acoes WHERE id = $1 AND ativa = true";
      const acaoResultado = await pool.query(acaoQuery, [acao_id]);

      // Verifica se a ação existe e está ativa
      if (acaoResultado.rows.length === 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "A ação selecionada não existe ou não está ativa",
        });
      }

      // Calcula a pontuação total
      const pontuacaoAcao = acaoResultado.rows[0].pontuacao;
      const pontuacao_total = pontuacaoAcao * quantidade;

      // Prepara os dados para atualização
      const dadosParaAtualizar = [
        data_acao,
        acao_id,
        quantidade,
        pontuacao_total,
        incorporadora_id,
        empreendimento_id,
        imobiliaria_id,
        corretor_id,
        vgv || 0,
        anotacoes || "",
        id,
      ];

      // Query para atualizar o registro de ação
      const query = `
        UPDATE registro_acoes
        SET 
          data_acao = $1, 
          acao_id = $2, 
          quantidade = $3, 
          pontuacao_total = $4, 
          incorporadora_id = $5, 
          empreendimento_id = $6, 
          imobiliaria_id = $7, 
          corretor_id = $8, 
          vgv = $9, 
          anotacoes = $10
        WHERE id = $11
        RETURNING id
      `;

      // Executa a atualização
      const resultado = await pool.query(query, dadosParaAtualizar);

      // Verifica se o registro foi encontrado e atualizado
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Registro de ação não encontrado",
        });
      }

      // Busca o registro completo para retornar
      const registroId = resultado.rows[0].id;
      const registroQuery = `
        SELECT 
          ra.id, 
          ra.data_acao, 
          ra.quantidade, 
          ra.pontuacao_total, 
          ra.vgv, 
          ra.anotacoes,
          ra.incorporadora_id,
          ra.empreendimento_id,
          ra.imobiliaria_id,
          ra.corretor_id,
          ra.acao_id,
          ra.criado_em,
          i.nome as imobiliaria_nome,
          c.nome as corretor_nome,
          c.sobrenome as corretor_sobrenome,
          e.nome as empreendimento_nome,
          a.nome as acao_nome
        FROM 
          registro_acoes ra
        INNER JOIN 
          imobiliarias i ON ra.imobiliaria_id = i.id
        INNER JOIN 
          corretores c ON ra.corretor_id = c.id
        INNER JOIN 
          empreendimentos e ON ra.empreendimento_id = e.id
        INNER JOIN 
          acoes a ON ra.acao_id = a.id
        WHERE 
          ra.id = $1
      `;

      const registroCompleto = await pool.query(registroQuery, [registroId]);

      // Retorna o registro atualizado
      return res.status(200).json({
        sucesso: true,
        mensagem: "Registro de ação atualizado com sucesso",
        dados: registroCompleto.rows[0],
      });
    } catch (erro) {
      console.error("Erro ao atualizar registro de ação:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao atualizar registro de ação",
      });
    }
  },

  // Função para excluir um registro de ação
  excluirRegistroAcao: async (req, res) => {
    try {
      // Obtém o ID do registro de ação da URL
      const { id } = req.params;

      // Obtém o ID da incorporadora do usuário logado (do token JWT ou da sessão)
      // Por enquanto, vamos pegar do query param incorporadora_id
      const incorporadoraIdUsuario = req.query.incorporadora_id;

      // Verifica se o registro existe e pertence à incorporadora do usuário
      const verificacaoQuery =
        "SELECT incorporadora_id FROM registro_acoes WHERE id = $1";
      const verificacaoResultado = await pool.query(verificacaoQuery, [id]);

      if (verificacaoResultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Registro de ação não encontrado",
        });
      }

      // Verifica se o registro pertence à incorporadora do usuário
      const registroExistente = verificacaoResultado.rows[0];
      if (
        incorporadoraIdUsuario &&
        registroExistente.incorporadora_id != incorporadoraIdUsuario
      ) {
        return res.status(403).json({
          sucesso: false,
          mensagem: "Você não tem permissão para excluir este registro",
        });
      }

      // Query para excluir o registro de ação
      const query = "DELETE FROM registro_acoes WHERE id = $1 RETURNING id";

      // Executa a exclusão
      const resultado = await pool.query(query, [id]);

      // Verifica se o registro foi encontrado e excluído
      if (resultado.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Registro de ação não encontrado",
        });
      }

      // Retorna confirmação da exclusão
      return res.status(200).json({
        sucesso: true,
        mensagem: "Registro de ação excluído com sucesso",
        dados: { id: resultado.rows[0].id },
      });
    } catch (erro) {
      console.error("Erro ao excluir registro de ação:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao excluir registro de ação",
      });
    }
  },

  // Função para obter dados para o formulário (ações, imobiliárias, corretores, empreendimentos)
  obterDadosFormulario: async (req, res) => {
    try {
      // Obtém o ID da incorporadora do usuário logado (do token JWT ou da sessão)
      // Por enquanto, vamos pegar do query param incorporadora_id
      const incorporadoraIdUsuario = req.query.incorporadora_id;

      if (!incorporadoraIdUsuario) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "ID da incorporadora é obrigatório",
        });
      }

      // Busca as ações ativas
      const acoesQuery =
        "SELECT id, nome, pontuacao FROM acoes WHERE ativa = true ORDER BY nome";
      const acoesResultado = await pool.query(acoesQuery);

      // Busca as imobiliárias
      const imobiliariasQuery =
        "SELECT id, nome FROM imobiliarias ORDER BY nome";
      const imobiliariasResultado = await pool.query(imobiliariasQuery);

      // Busca os corretores
      const corretoresQuery =
        "SELECT id, nome, sobrenome FROM corretores ORDER BY nome, sobrenome";
      const corretoresResultado = await pool.query(corretoresQuery);

      // Busca os empreendimentos da incorporadora
      const empreendimentosQuery =
        "SELECT id, nome FROM empreendimentos WHERE incorporadora_id = $1 ORDER BY nome";
      const empreendimentosResultado = await pool.query(empreendimentosQuery, [
        incorporadoraIdUsuario,
      ]);

      // Retorna todos os dados
      return res.status(200).json({
        sucesso: true,
        dados: {
          acoes: acoesResultado.rows,
          imobiliarias: imobiliariasResultado.rows,
          corretores: corretoresResultado.rows,
          empreendimentos: empreendimentosResultado.rows,
        },
      });
    } catch (erro) {
      console.error("Erro ao obter dados para formulário:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao obter dados para formulário",
      });
    }
  },
};

module.exports = registroAcaoController;
