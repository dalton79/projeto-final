// Este arquivo contém as funções para processar requisições relacionadas ao dashboard da incorporadora

// Importando a conexão com o banco de dados
const pool = require("../config/db");

// Objeto que vai conter as funções do controller de dashboard da incorporadora
const dashboardIncorporadoraController = {
  // Função para obter o ranking de imobiliárias para o Dashboard da Incorporadora
  // Calcula as pontuações acumuladas das ações executadas específicas para a incorporadora
  obterRankingIncorporadora: async (req, res) => {
    try {
      // Obtém os filtros enviados pela URL (query parameters)
      const { data_inicio, data_fim, incorporadora_id, empreendimento_id } =
        req.query;

      // Validação - incorporadora_id é obrigatório
      if (!incorporadora_id) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "ID da incorporadora é obrigatório",
        });
      }

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
        WHERE ra.incorporadora_id = $1
      `;

      // Array para armazenar os valores dos filtros
      const valores = [incorporadora_id];
      let contador = 2;

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
        WHERE ra.incorporadora_id = $1
      `;

      // Reutiliza os mesmos filtros da query anterior
      contador = 2;
      if (data_inicio) {
        detalhesQuery += ` AND ra.data_acao >= $${contador}`;
        contador++;
      }

      if (data_fim) {
        detalhesQuery += ` AND ra.data_acao <= $${contador}`;
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
        WHERE ra.incorporadora_id = $1
      `;

      // Reutiliza os mesmos filtros novamente
      let totalPontosValores = [incorporadora_id];
      contador = 2;

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
      console.error("Erro ao obter ranking da incorporadora:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao obter ranking da incorporadora",
      });
    }
  },

  // Função para obter os dados para os filtros do Dashboard da Incorporadora
  obterDadosFiltrosIncorporadora: async (req, res) => {
    try {
      // Obtém o ID da incorporadora da URL
      const { incorporadora_id } = req.query;

      // Validação - incorporadora_id é obrigatório
      if (!incorporadora_id) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "ID da incorporadora é obrigatório",
        });
      }

      // Busca apenas os empreendimentos da incorporadora específica
      const empreendimentosQuery =
        "SELECT id, nome FROM empreendimentos WHERE incorporadora_id = $1 ORDER BY nome";
      const empreendimentosResultado = await pool.query(empreendimentosQuery, [
        incorporadora_id,
      ]);

      // Retorna os dados
      return res.status(200).json({
        sucesso: true,
        dados: {
          empreendimentos: empreendimentosResultado.rows,
        },
      });
    } catch (erro) {
      console.error("Erro ao obter dados para filtros da incorporadora:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao obter dados para filtros da incorporadora",
      });
    }
  },
};

module.exports = dashboardIncorporadoraController;
