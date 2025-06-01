// Este arquivo contém as funções para processar requisições relacionadas aos dashboards

// Importando a conexão com o banco de dados
const pool = require("../config/db");

// Objeto que vai conter as funções do controller de dashboard
const dashboardController = {
  // Função para obter o ranking de imobiliárias para o Dashboard da Consultoria
  // Calcula as pontuações acumuladas das ações executadas
  obterRankingConsultoria: async (req, res) => {
    try {
      // Obtém os filtros enviados pela URL (query parameters)
      const { data_inicio, data_fim, incorporadora_id, empreendimento_id } =
        req.query;

      // Monta a query base para calcular o ranking das imobiliárias
      let query = `
        SELECT 
          i.id as imobiliaria_id,
          i.nome as imobiliaria_nome,
          COUNT(DISTINCT ra.id) as total_acoes,
          SUM(ra.pontuacao_total) as pontuacao_total
        FROM 
          registro_acoes ra
        INNER JOIN 
          imobiliarias i ON ra.imobiliaria_id = i.id
        WHERE 1=1
      `;

      // Array para armazenar os valores dos filtros
      const valores = [];
      let contador = 1;

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

      if (incorporadora_id) {
        query += ` AND ra.incorporadora_id = $${contador}`;
        valores.push(incorporadora_id);
        contador++;
      }

      if (empreendimento_id) {
        query += ` AND ra.empreendimento_id = $${contador}`;
        valores.push(empreendimento_id);
        contador++;
      }

      // Agrupa por imobiliária
      query += `
        GROUP BY i.id, i.nome
        ORDER BY pontuacao_total DESC, total_acoes DESC
      `;

      // Executa a consulta no banco
      const resultado = await pool.query(query, valores);

      // Também busca os detalhes das ações por imobiliária
      let detalhesQuery = `
        SELECT 
          i.id as imobiliaria_id,
          a.id as acao_id,
          a.nome as acao_nome,
          COUNT(ra.id) as quantidade,
          SUM(ra.pontuacao_total) as pontuacao_acao
        FROM 
          registro_acoes ra
        INNER JOIN 
          imobiliarias i ON ra.imobiliaria_id = i.id
        INNER JOIN 
          acoes a ON ra.acao_id = a.id
        WHERE 1=1
      `;

      // Reutiliza os mesmos filtros da query anterior
      contador = 1;
      if (data_inicio) {
        detalhesQuery += ` AND ra.data_acao >= $${contador}`;
        contador++;
      }

      if (data_fim) {
        detalhesQuery += ` AND ra.data_acao <= $${contador}`;
        contador++;
      }

      if (incorporadora_id) {
        detalhesQuery += ` AND ra.incorporadora_id = $${contador}`;
        contador++;
      }

      if (empreendimento_id) {
        detalhesQuery += ` AND ra.empreendimento_id = $${contador}`;
        contador++;
      }

      // Agrupa por imobiliária e ação
      detalhesQuery += `
        GROUP BY i.id, a.id, a.nome
        ORDER BY i.id, pontuacao_acao DESC
      `;

      // Executa a consulta de detalhes
      const detalhesResultado = await pool.query(detalhesQuery, valores);

      // Organiza os detalhes por imobiliária
      const detalhesAcoesPorImobiliaria = {};

      detalhesResultado.rows.forEach((detalhe) => {
        if (!detalhesAcoesPorImobiliaria[detalhe.imobiliaria_id]) {
          detalhesAcoesPorImobiliaria[detalhe.imobiliaria_id] = [];
        }

        detalhesAcoesPorImobiliaria[detalhe.imobiliaria_id].push({
          acao_id: detalhe.acao_id,
          acao_nome: detalhe.acao_nome,
          quantidade: detalhe.quantidade,
          pontuacao_acao: detalhe.pontuacao_acao,
        });
      });

      // Adiciona os detalhes das ações ao resultado do ranking
      const rankingCompleto = resultado.rows.map((imobiliaria) => {
        return {
          ...imobiliaria,
          detalhes_acoes:
            detalhesAcoesPorImobiliaria[imobiliaria.imobiliaria_id] || [],
        };
      });

      // Busca o total geral de pontos (para calcular percentuais)
      const totalPontosQuery = `
        SELECT SUM(ra.pontuacao_total) as total_geral
        FROM registro_acoes ra
        WHERE 1=1
      `;

      // Reutiliza os mesmos filtros novamente
      let totalPontosValores = [];
      contador = 1;

      let totalPontosQueryFinal = totalPontosQuery;

      if (data_inicio) {
        totalPontosQueryFinal += ` AND ra.data_acao >= $${contador}`;
        totalPontosValores.push(data_inicio);
        contador++;
      }

      if (data_fim) {
        totalPontosQueryFinal += ` AND ra.data_acao <= $${contador}`;
        totalPontosValores.push(data_fim);
        contador++;
      }

      if (incorporadora_id) {
        totalPontosQueryFinal += ` AND ra.incorporadora_id = $${contador}`;
        totalPontosValores.push(incorporadora_id);
        contador++;
      }

      if (empreendimento_id) {
        totalPontosQueryFinal += ` AND ra.empreendimento_id = $${contador}`;
        totalPontosValores.push(empreendimento_id);
        contador++;
      }

      const totalPontosResultado = await pool.query(
        totalPontosQueryFinal,
        totalPontosValores
      );
      const totalGeral = totalPontosResultado.rows[0].total_geral || 0;

      // Calcula estatísticas adicionais
      let totalImobiliarias = rankingCompleto.length;
      let totalAcoes = rankingCompleto.reduce(
        (sum, imob) => sum + parseInt(imob.total_acoes),
        0
      );

      // Retorna os dados encontrados com estatísticas
      return res.status(200).json({
        sucesso: true,
        dados: {
          ranking: rankingCompleto,
          estatisticas: {
            total_imobiliarias: totalImobiliarias,
            total_acoes: totalAcoes,
            total_pontos: totalGeral,
          },
        },
      });
    } catch (erro) {
      console.error("Erro ao obter ranking da consultoria:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao obter ranking da consultoria",
      });
    }
  },

  // Função para obter os dados para os filtros do Dashboard da Consultoria
  obterDadosFiltrosConsultoria: async (req, res) => {
    try {
      // Busca as incorporadoras
      const incorporadorasQuery =
        "SELECT id, nome_exibicao as nome FROM incorporadoras ORDER BY nome_exibicao";
      const incorporadorasResultado = await pool.query(incorporadorasQuery);

      // Busca os empreendimentos
      const empreendimentosQuery =
        "SELECT id, nome, incorporadora_id FROM empreendimentos ORDER BY nome";
      const empreendimentosResultado = await pool.query(empreendimentosQuery);

      // Retorna os dados
      return res.status(200).json({
        sucesso: true,
        dados: {
          incorporadoras: incorporadorasResultado.rows,
          empreendimentos: empreendimentosResultado.rows,
        },
      });
    } catch (erro) {
      console.error("Erro ao obter dados para filtros da consultoria:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao obter dados para filtros da consultoria",
      });
    }
  },
};

module.exports = dashboardController;
