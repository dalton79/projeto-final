// Dashboard da Consultoria (UC-007)
// Exibe o ranking das imobiliárias com base nas pontuações acumuladas

import React, { useState, useEffect, useRef } from "react";
import servicoDashboard from "../services/dashboardService";
import { Chart, registerables } from "chart.js";
import "./DashboardConsultoria.css";

// Registra todos os componentes necessários do Chart.js
Chart.register(...registerables);

// Componente principal do Dashboard da Consultoria
function DashboardConsultoria() {
  // Estado para armazenar os dados do ranking
  const [dadosRanking, setDadosRanking] = useState({
    ranking: [],
    estatisticas: {
      total_imobiliarias: 0,
      total_acoes: 0,
      total_pontos: 0,
    },
  });

  // Estado para armazenar os filtros selecionados
  const [filtros, setFiltros] = useState({
    data_inicio: "",
    data_fim: "",
    incorporadora_id: "",
    empreendimento_id: "",
  });

  // Estado para armazenar os dados para os filtros (incorporadoras e empreendimentos)
  const [dadosFiltros, setDadosFiltros] = useState({
    incorporadoras: [],
    empreendimentos: [],
  });

  // Estado para controlar o carregamento
  const [carregando, setCarregando] = useState(true);

  // Estado para armazenar mensagens de erro
  const [erro, setErro] = useState("");

  // Estado para armazenar a imobiliária selecionada para detalhes
  const [imobiliariaSelecionada, setImobiliariaSelecionada] = useState(null);

  // Refs para os elementos de canvas dos gráficos
  const chartRankingRef = useRef(null);
  const chartDetalhesRef = useRef(null);

  // Refs para manter instâncias dos gráficos
  const chartRankingInstance = useRef(null);
  const chartDetalhesInstance = useRef(null);

  // Efeito para carregar os dados iniciais quando o componente é montado
  useEffect(() => {
    // Carrega os dados para os filtros
    carregarDadosFiltros();

    // Carrega os dados do ranking sem filtros
    carregarDadosRanking();
  }, []);

  // Efeito para renderizar o gráfico do ranking quando os dados mudam
  useEffect(() => {
    if (!carregando && dadosRanking.ranking.length > 0) {
      renderizarGraficoRanking();
    }

    // Limpa o gráfico quando o componente é desmontado
    return () => {
      if (chartRankingInstance.current) {
        chartRankingInstance.current.destroy();
        chartRankingInstance.current = null;
      }
    };
  }, [dadosRanking, carregando]);

  // Efeito para renderizar o gráfico de detalhes quando uma imobiliária é selecionada
  useEffect(() => {
    if (imobiliariaSelecionada) {
      renderizarGraficoDetalhes();
    }

    // Limpa o gráfico quando a imobiliária selecionada muda
    return () => {
      if (chartDetalhesInstance.current) {
        chartDetalhesInstance.current.destroy();
        chartDetalhesInstance.current = null;
      }
    };
  }, [imobiliariaSelecionada]);

  // Função para carregar os dados para os filtros
  const carregarDadosFiltros = async () => {
    try {
      // Chama o serviço para buscar os dados para os filtros
      const resultado = await servicoDashboard.buscarDadosFiltrosConsultoria();

      if (resultado.sucesso) {
        setDadosFiltros(resultado.dados);
      } else {
        setErro("Erro ao carregar dados para os filtros");
        console.error(resultado.mensagem);
      }
    } catch (erro) {
      setErro("Erro ao conectar com o servidor");
      console.error("Erro ao carregar dados para os filtros:", erro);
    }
  };

  // Função para carregar os dados do ranking
  const carregarDadosRanking = async (filtrosParaBusca = {}) => {
    try {
      setCarregando(true);

      // Converte as datas para o formato (YYYY-MM-DD)
      const filtrosConvertidos = {
        ...filtrosParaBusca,
      };

      if (filtrosParaBusca.data_inicio) {
        filtrosConvertidos.data_inicio = servicoDashboard.converterDataParaISO(
          filtrosParaBusca.data_inicio
        );
      }

      if (filtrosParaBusca.data_fim) {
        filtrosConvertidos.data_fim = servicoDashboard.converterDataParaISO(
          filtrosParaBusca.data_fim
        );
      }

      // busca os dados do ranking
      const resultado = await servicoDashboard.buscarRankingConsultoria(
        filtrosConvertidos
      );

      if (resultado.sucesso) {
        setDadosRanking(resultado.dados);
        setErro("");
      } else {
        setErro("Erro ao carregar dados do ranking");
        console.error(resultado.mensagem);
      }
    } catch (erro) {
      setErro("Erro ao conectar com o servidor");
      console.error("Erro ao carregar dados do ranking:", erro);
    } finally {
      setCarregando(false);
    }
  };

  // Função para renderizar o gráfico do ranking
  const renderizarGraficoRanking = () => {
    // Verifica se o canvas está disponível
    if (!chartRankingRef.current) return;

    // Limpa qualquer gráfico existente
    if (chartRankingInstance.current) {
      chartRankingInstance.current.destroy();
    }

    // Obtém os dados para o gráfico (limitado às 10 primeiras imobiliárias)
    const dadosGrafico = dadosRanking.ranking.slice(0, 10);

    // Cria o gráfico
    chartRankingInstance.current = new Chart(chartRankingRef.current, {
      type: "bar",
      data: {
        labels: dadosGrafico.map((imob) => imob.imobiliaria_nome),
        datasets: [
          {
            label: "Pontuação Total",
            data: dadosGrafico.map((imob) => imob.pontuacao_total),
            backgroundColor: "#2c5cbb", // Azul da consultoria
            borderColor: "#1e429e",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Top 10 Imobiliárias por Pontuação",
            font: {
              size: 16,
            },
          },
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `Pontuação: ${context.raw} pontos`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Pontuação",
            },
          },
          x: {
            title: {
              display: true,
              text: "Imobiliárias",
            },
          },
        },
      },
    });
  };

  // Função para renderizar o gráfico de detalhes de uma imobiliária
  const renderizarGraficoDetalhes = () => {
    // Verifica se o canvas está disponível e se há uma imobiliária selecionada
    if (!chartDetalhesRef.current || !imobiliariaSelecionada) return;

    // Limpa qualquer gráfico existente
    if (chartDetalhesInstance.current) {
      chartDetalhesInstance.current.destroy();
    }

    // Obtém os dados para o gráfico
    const detalhes = imobiliariaSelecionada.detalhes_acoes;

    // Cria o gráfico
    chartDetalhesInstance.current = new Chart(chartDetalhesRef.current, {
      type: "pie",
      data: {
        labels: detalhes.map((detalhe) => detalhe.acao_nome),
        datasets: [
          {
            data: detalhes.map((detalhe) => detalhe.pontuacao_acao),
            backgroundColor: [
              "#2c5cbb",
              "#4d7cdb",
              "#1a3f8f",
              "#6b93e4",
              "#0c2a6b",
              "#8daaea",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Distribuição de Pontos: ${imobiliariaSelecionada.imobiliaria_nome}`,
            font: {
              size: 16,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.dataset.data.reduce(
                  (acc, val) => acc + val,
                  0
                );
                const percentage =
                  total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: ${value} pontos (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  };

  // Função para atualizar os filtros quando o usuário seleciona valores
  const atualizarFiltro = (e) => {
    const { name, value } = e.target;

    setFiltros({
      ...filtros,
      [name]: value,
    });

    // Se o filtro for incorporadora, limpa o empreendimento selecionado
    if (name === "incorporadora_id") {
      setFiltros((prev) => ({
        ...prev,
        empreendimento_id: "",
      }));
    }
  };

  // Função para aplicar os filtros
  const aplicarFiltros = (e) => {
    e.preventDefault();
    carregarDadosRanking(filtros);
  };

  // Função para filtrar empreendimentos por incorporadora selecionada
  const filtrarEmpreendimentosPorIncorporadora = () => {
    if (!filtros.incorporadora_id) {
      return dadosFiltros.empreendimentos;
    }

    return dadosFiltros.empreendimentos.filter(
      (empreendimento) =>
        empreendimento.incorporadora_id === parseInt(filtros.incorporadora_id)
    );
  };

  // Função para calcular a porcentagem da pontuação em relação ao total
  const calcularPorcentagem = (pontuacao) => {
    if (!dadosRanking.estatisticas.total_pontos) return 0;

    return (pontuacao / dadosRanking.estatisticas.total_pontos) * 100;
  };

  // Função para exibir os detalhes de uma imobiliária
  const exibirDetalhesImobiliaria = (imobiliaria) => {
    setImobiliariaSelecionada(imobiliaria);
  };

  // Função para fechar os detalhes da imobiliária
  const fecharDetalhesImobiliaria = () => {
    setImobiliariaSelecionada(null);
  };

  // Função para renderizar os filtros
  const renderizarFiltros = () => (
    <div className="filtrosDashboard">
      <h3>Filtros do Dashboard</h3>

      <form onSubmit={aplicarFiltros}>
        <div className="grupoFiltros">
          <div className="campoFiltro">
            <label htmlFor="data_inicio">Data Início:</label>
            <input
              type="text"
              id="data_inicio"
              name="data_inicio"
              value={filtros.data_inicio}
              onChange={atualizarFiltro}
              placeholder="DD/MM/AAAA"
            />
          </div>

          <div className="campoFiltro">
            <label htmlFor="data_fim">Data Fim:</label>
            <input
              type="text"
              id="data_fim"
              name="data_fim"
              value={filtros.data_fim}
              onChange={atualizarFiltro}
              placeholder="DD/MM/AAAA"
            />
          </div>

          <div className="campoFiltro">
            <label htmlFor="incorporadora_id">Incorporadora:</label>
            <select
              id="incorporadora_id"
              name="incorporadora_id"
              value={filtros.incorporadora_id}
              onChange={atualizarFiltro}
            >
              <option value="">Todas as Incorporadoras</option>
              {dadosFiltros.incorporadoras.map((incorporadora) => (
                <option key={incorporadora.id} value={incorporadora.id}>
                  {incorporadora.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="campoFiltro">
            <label htmlFor="empreendimento_id">Empreendimento:</label>
            <select
              id="empreendimento_id"
              name="empreendimento_id"
              value={filtros.empreendimento_id}
              onChange={atualizarFiltro}
              disabled={!filtros.incorporadora_id}
            >
              <option value="">Todos os Empreendimentos</option>
              {filtrarEmpreendimentosPorIncorporadora().map(
                (empreendimento) => (
                  <option key={empreendimento.id} value={empreendimento.id}>
                    {empreendimento.nome}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="botoesFiltro">
          <button type="submit" className="botaoFiltrar">
            Aplicar Filtros
          </button>
        </div>
      </form>
    </div>
  );

  // Função para renderizar as estatísticas
  const renderizarEstatisticas = () => (
    <div className="estatisticasDashboard">
      <div className="cardEstatistica">
        <h4>Total de Imobiliárias</h4>
        <div className="valorEstatistica">
          {dadosRanking.estatisticas.total_imobiliarias}
        </div>
      </div>

      <div className="cardEstatistica">
        <h4>Total de Ações Executadas</h4>
        <div className="valorEstatistica">
          {dadosRanking.estatisticas.total_acoes}
        </div>
      </div>

      <div className="cardEstatistica">
        <h4>Total de Pontos</h4>
        <div className="valorEstatistica">
          {dadosRanking.estatisticas.total_pontos}
        </div>
      </div>
    </div>
  );

  // Função para renderizar o gráfico de barras do ranking
  const renderizarGraficoBarras = () => (
    <div className="graficoRanking">
      <div className="containerGrafico">
        <canvas ref={chartRankingRef} height="300"></canvas>
      </div>
    </div>
  );

  // Função para renderizar o ranking
  const renderizarRanking = () => (
    <div className="rankingDashboard">
      <h3>Ranking de Imobiliárias</h3>

      {dadosRanking.ranking.length === 0 ? (
        <p>Nenhuma imobiliária encontrada com os filtros atuais.</p>
      ) : (
        <table className="tabelaRanking">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Imobiliária</th>
              <th>Ações</th>
              <th>Pontuação</th>
              <th>Representação</th>
            </tr>
          </thead>
          <tbody>
            {dadosRanking.ranking.map((imobiliaria, index) => (
              <tr
                key={imobiliaria.imobiliaria_id}
                onClick={() => exibirDetalhesImobiliaria(imobiliaria)}
              >
                <td>
                  <span
                    className={`posicaoRanking ${
                      index < 3 ? `top${index + 1}` : ""
                    }`}
                  >
                    {index + 1}º
                  </span>
                </td>
                <td>{imobiliaria.imobiliaria_nome}</td>
                <td>{imobiliaria.total_acoes}</td>
                <td className="pontuacaoImobiliaria">
                  {imobiliaria.pontuacao_total}
                </td>
                <td>
                  <div className="barraProgresso">
                    <div
                      className="barraPreenchimento"
                      style={{
                        width: `${calcularPorcentagem(
                          imobiliaria.pontuacao_total
                        )}%`,
                      }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Função para renderizar os detalhes de uma imobiliária
  const renderizarDetalhesImobiliaria = () => {
    if (!imobiliariaSelecionada) return null;

    return (
      <div className="detalhesImobiliaria">
        <h4>
          Detalhes da Imobiliária: {imobiliariaSelecionada.imobiliaria_nome}
        </h4>

        {imobiliariaSelecionada.detalhes_acoes.length === 0 ? (
          <p>Não há detalhes disponíveis para esta imobiliária.</p>
        ) : (
          <div className="conteudoDetalhes">
            <div className="tabelaDetalhesContainer">
              <table className="tabelaDetalhes">
                <thead>
                  <tr>
                    <th>Ação</th>
                    <th>Quantidade</th>
                    <th>Pontuação</th>
                  </tr>
                </thead>
                <tbody>
                  {imobiliariaSelecionada.detalhes_acoes.map(
                    (detalhe, index) => (
                      <tr key={index}>
                        <td>{detalhe.acao_nome}</td>
                        <td>{detalhe.quantidade}</td>
                        <td>{detalhe.pontuacao_acao}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="graficoDetalhesContainer">
              <canvas ref={chartDetalhesRef} height="250"></canvas>
            </div>
          </div>
        )}

        <button className="fecharDetalhes" onClick={fecharDetalhesImobiliaria}>
          Fechar Detalhes
        </button>
      </div>
    );
  };

  // Renderização do componente
  return (
    <div className="dashboardConsultoria">
      {/* Mensagem de erro, se houver */}
      {erro && <div className="mensagemErro">{erro}</div>}

      {/* Filtros */}
      {renderizarFiltros()}

      {/* Conteúdo principal */}
      {carregando ? (
        <div className="carregando">Carregando dados do dashboard...</div>
      ) : (
        <>
          {/* Estatísticas */}
          {renderizarEstatisticas()}

          {/* Gráfico de barras do ranking */}
          {renderizarGraficoBarras()}

          {/* Ranking */}
          {renderizarRanking()}

          {/* Detalhes da imobiliária selecionada */}
          {imobiliariaSelecionada && renderizarDetalhesImobiliaria()}
        </>
      )}
    </div>
  );
}

export default DashboardConsultoria;
