// funcionalidade de gerenciar ações (UC-005)
// Permite listar, criar, editar e excluir ações do sistema

import React, { useState, useEffect } from "react";
import servicoAcoes from "../services/acaoService";
import "./PaginaAcoes.css";

// Componente principal para gerenciar ações
function PaginaAcoes() {
  // Estado para armazenar a lista de ações
  const [acoes, setAcoes] = useState([]);
  // Estado para armazenar os filtros de pesquisa
  const [filtros, setFiltros] = useState({
    nome: "",
    ativa: "",
  });
  // Estado para controlar o carregamento
  const [carregando, setCarregando] = useState(true);
  // Estado para armazenar a ação selecionada para visualização/edição
  const [acaoSelecionada, setAcaoSelecionada] = useState(null);
  // Estado para controlar o modo de exibição (lista, visualização, edição, novo)
  const [modo, setModo] = useState("lista");
  // Estado para armazenar mensagens para o usuário
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

  // Função para carregar ações do banco de dados
  const carregarAcoes = async (filtrosParaBusca = {}) => {
    try {
      setCarregando(true);

      // Chama o serviço para buscar ações do banco
      const resultado = await servicoAcoes.buscarAcoes(filtrosParaBusca);

      if (resultado.sucesso) {
        setAcoes(resultado.dados);
      } else {
        setMensagem({
          texto: resultado.mensagem || "Erro ao carregar ações",
          tipo: "erro",
        });
      }
    } catch (erro) {
      console.error("Erro ao carregar ações:", erro);
      setMensagem({
        texto: "Erro ao conectar com o servidor",
        tipo: "erro",
      });
    } finally {
      setCarregando(false);
    }
  };

  // Efeito para carregar os dados iniciais quando o componente é montado
  useEffect(() => {
    // Carrega as ações do banco de dados
    carregarAcoes();
  }, []);

  // Função para atualizar os filtros quando o usuário digita
  const atualizarFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value,
    });
  };

  // Função para realizar a pesquisa com base nos filtros
  const pesquisar = async (e) => {
    e.preventDefault();

    // Faz a pesquisa no banco de dados usando os filtros
    await carregarAcoes(filtros);
  };

  // Função para selecionar uma ação para visualização
  const visualizarAcao = (id) => {
    const acao = acoes.find((a) => a.id === id);
    setAcaoSelecionada(acao);
    setModo("visualizar");
  };

  // Função para voltar à lista de ações
  const voltarParaLista = () => {
    setAcaoSelecionada(null);
    setModo("lista");
    // Recarrega a lista após qualquer operação
    carregarAcoes(filtros);
  };

  // Função para entrar no modo de edição
  const editarAcao = () => {
    // Fazemos uma cópia profunda do objeto para evitar referências compartilhadas
    const acaoCopia = JSON.parse(JSON.stringify(acaoSelecionada));
    setAcaoSelecionada(acaoCopia);
    setModo("editar");
  };

  // Função para entrar no modo de cadastro de nova ação
  const novaAcao = () => {
    setAcaoSelecionada({
      nome: "",
      pontuacao: 0,
      ativa: true,
    });
    setModo("novo");
  };

  // Função para excluir uma ação
  const confirmarExclusao = async () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir a ação "${acaoSelecionada.nome}"?`
      )
    ) {
      try {
        // Chama o serviço para excluir a ação do banco
        const resultado = await servicoAcoes.excluirAcao(acaoSelecionada.id);

        if (resultado.sucesso) {
          setMensagem({
            texto: "Ação excluída com sucesso!",
            tipo: "sucesso",
          });

          // Volta para a lista e recarrega os dados
          voltarParaLista();
        } else {
          setMensagem({
            texto: resultado.mensagem || "Erro ao excluir ação",
            tipo: "erro",
          });
        }
      } catch (erro) {
        console.error("Erro ao excluir ação:", erro);
        setMensagem({
          texto: "Erro ao conectar com o servidor",
          tipo: "erro",
        });
      }

      // Limpa a mensagem após alguns segundos
      setTimeout(() => {
        setMensagem({ texto: "", tipo: "" });
      }, 3000);
    }
  };

  // Função para salvar uma ação (nova ou editada)
  const salvarAcao = async (dadosFormulario) => {
    try {
      // Primeiro verificamos se todos os campos obrigatórios foram preenchidos
      if (!dadosFormulario.nome || dadosFormulario.pontuacao === undefined) {
        setMensagem({
          texto: "Nome e pontuação são obrigatórios",
          tipo: "erro",
        });
        return;
      }

      let resultado;

      if (modo === "novo") {
        // Chama o serviço para criar uma nova ação no banco
        resultado = await servicoAcoes.criarAcao(dadosFormulario);
      } else {
        // Chama o serviço para atualizar a ação no banco
        resultado = await servicoAcoes.atualizarAcao(
          acaoSelecionada.id,
          dadosFormulario
        );
      }

      if (resultado.sucesso) {
        setMensagem({
          texto:
            resultado.mensagem ||
            (modo === "novo"
              ? "Ação criada com sucesso!"
              : "Ação atualizada com sucesso!"),
          tipo: "sucesso",
        });

        // Volta para a lista e recarrega os dados
        voltarParaLista();
      } else {
        setMensagem({
          texto: resultado.mensagem || "Erro ao salvar ação",
          tipo: "erro",
        });
      }
    } catch (erro) {
      console.error("Erro ao salvar ação:", erro);
      setMensagem({
        texto: "Erro ao conectar com o servidor",
        tipo: "erro",
      });
    }

    // Limpa a mensagem após alguns segundos
    setTimeout(() => {
      setMensagem({ texto: "", tipo: "" });
    }, 3000);
  };

  // Função para manipular as mudanças no formulário
  const manipularMudancaFormulario = (e) => {
    const { name, value, type, checked } = e.target;

    let valorFinal;
    if (type === "checkbox") {
      valorFinal = checked;
    } else if (type === "number") {
      valorFinal = parseInt(value, 10);
    } else {
      valorFinal = value;
    }

    setAcaoSelecionada({
      ...acaoSelecionada,
      [name]: valorFinal,
    });
  };

  // Função para lidar com o envio do formulário
  const manipularEnvioFormulario = (e) => {
    e.preventDefault();

    salvarAcao(acaoSelecionada);
  };

  // Renderiza o painel de filtros
  const renderizarFiltros = () => (
    <div className="painelFiltros">
      <h3>Consultar Ação</h3>

      <form onSubmit={pesquisar}>
        <div className="campoFormulario">
          <label htmlFor="nome">Nome:</label>
          <input
            type="text"
            id="nome"
            name="nome"
            className="entradaTexto"
            value={filtros.nome}
            onChange={atualizarFiltro}
          />
        </div>

        <div className="campoFormulario">
          <label htmlFor="ativa">Status:</label>
          <select
            id="ativa"
            name="ativa"
            className="entradaTexto"
            value={filtros.ativa}
            onChange={atualizarFiltro}
          >
            <option value="">Todas</option>
            <option value="true">Ativas</option>
            <option value="false">Inativas</option>
          </select>
        </div>

        <button type="submit" className="botaoPesquisar">
          Pesquisar
        </button>
      </form>
    </div>
  );

  // Renderiza a tabela de resultados
  const renderizarTabela = () => (
    <div className="painelResultados">
      <div className="cabecalhoResultados">
        <h3>Ações ({acoes.length} encontradas)</h3>
        <button className="botaoNovo" onClick={novaAcao}>
          + Cadastrar Ação
        </button>
      </div>

      {carregando ? (
        <div className="carregando">Carregando dados...</div>
      ) : acoes.length === 0 ? (
        <div className="semResultados">Nenhuma ação encontrada.</div>
      ) : (
        <table className="tabelaResultados">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Pontuação</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {acoes.map((acao) => (
              <tr key={acao.id}>
                <td>{acao.nome}</td>
                <td>{acao.pontuacao}</td>
                <td>
                  <span
                    className={acao.ativa ? "statusAtivo" : "statusInativo"}
                  >
                    {acao.ativa ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td>
                  <button
                    className="botaoAcao"
                    onClick={() => visualizarAcao(acao.id)}
                    title="Visualizar detalhes"
                  >
                    👁️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Renderiza a visualização detalhada de uma ação
  const renderizarVisualizacao = () => (
    <div className="painelDetalhes">
      <div className="cabecalhoDetalhes">
        <h3>Detalhes da Ação</h3>
        <div className="botoesAcao">
          <button className="botaoEditar" onClick={editarAcao}>
            Editar
          </button>
          <button className="botaoExcluir" onClick={confirmarExclusao}>
            Excluir
          </button>
          <button className="botaoVoltar" onClick={voltarParaLista}>
            Voltar
          </button>
        </div>
      </div>

      <div className="detalhesAcao">
        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Nome:</span>
            <span className="valorDetalhe">{acaoSelecionada.nome}</span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Pontuação:</span>
            <span className="valorDetalhe">{acaoSelecionada.pontuacao}</span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Status:</span>
            <span className="valorDetalhe">
              <span
                className={
                  acaoSelecionada.ativa ? "statusAtivo" : "statusInativo"
                }
              >
                {acaoSelecionada.ativa ? "Ativa" : "Inativa"}
              </span>
            </span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Data de Criação:</span>
            <span className="valorDetalhe">
              {new Date(acaoSelecionada.criado_em).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderiza o formulário para editar uma ação existente
  const renderizarFormularioEdicao = () => (
    <div className="painelFormulario">
      <div className="cabecalhoFormulario">
        <h3>Editar Ação</h3>
        <div className="botoesAcao">
          <button
            type="button"
            onClick={manipularEnvioFormulario}
            className="botaoSalvar"
          >
            Salvar
          </button>
          <button
            type="button"
            className="botaoCancelar"
            onClick={() => setModo("visualizar")}
          >
            Cancelar
          </button>
        </div>
      </div>

      <div className="corpoFormulario">
        <form id="formAcao">
          <div className="campoFormulario">
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              className="entradaTexto"
              value={acaoSelecionada.nome || ""}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="pontuacao">Pontuação:</label>
            <input
              type="number"
              id="pontuacao"
              name="pontuacao"
              className="entradaTexto"
              value={acaoSelecionada.pontuacao || 0}
              onChange={manipularMudancaFormulario}
              min="0"
              required
            />
          </div>

          <div className="campoFormulario">
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="ativa"
                checked={acaoSelecionada.ativa}
                onChange={manipularMudancaFormulario}
              />
              Ação Ativa
            </label>
          </div>
        </form>
      </div>
    </div>
  );

  // Renderiza o formulário para cadastrar uma nova ação
  const renderizarFormularioNovo = () => (
    <div className="painelFormulario">
      <div className="cabecalhoFormulario">
        <h3>Nova Ação</h3>
        <div className="botoesAcao">
          <button
            type="button"
            onClick={manipularEnvioFormulario}
            className="botaoSalvar"
          >
            Salvar
          </button>
          <button
            type="button"
            className="botaoCancelar"
            onClick={voltarParaLista}
          >
            Cancelar
          </button>
        </div>
      </div>

      <div className="corpoFormulario">
        <form id="formAcao">
          <div className="campoFormulario">
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              className="entradaTexto"
              value={acaoSelecionada.nome}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="pontuacao">Pontuação:</label>
            <input
              type="number"
              id="pontuacao"
              name="pontuacao"
              className="entradaTexto"
              value={acaoSelecionada.pontuacao}
              onChange={manipularMudancaFormulario}
              min="0"
              required
            />
          </div>

          <div className="campoFormulario">
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="ativa"
                checked={acaoSelecionada.ativa}
                onChange={manipularMudancaFormulario}
              />
              Ação Ativa
            </label>
          </div>
        </form>
      </div>
    </div>
  );

  // Renderiza o conteúdo baseado no modo atual
  const renderizarConteudo = () => {
    switch (modo) {
      case "visualizar":
        return (
          <div className="conteudoPagina">
            {renderizarFiltros()}
            {renderizarVisualizacao()}
          </div>
        );

      case "editar":
        return (
          <div className="conteudoPagina">
            {renderizarFiltros()}
            {renderizarFormularioEdicao()}
          </div>
        );

      case "novo":
        return (
          <div className="conteudoPagina">
            {renderizarFiltros()}
            {renderizarFormularioNovo()}
          </div>
        );

      case "lista":
      default:
        return (
          <div className="conteudoPagina">
            {renderizarFiltros()}
            {renderizarTabela()}
          </div>
        );
    }
  };

  return (
    <div className="paginaAcoes">
      {/* Mensagem de sucesso ou erro */}
      {mensagem.texto && (
        <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>
      )}

      {/* Conteúdo principal */}
      {renderizarConteudo()}
    </div>
  );
}

export default PaginaAcoes;
