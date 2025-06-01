// Funcionalidade de gerenciar empreendimentos (UC-004)

import React, { useState, useEffect } from "react";
import servicoEmpreendimentos from "../services/empreendimentoService";
import "./PaginaEmpreendimentos.css";

// Componente principal para gerenciar empreendimentos
function PaginaEmpreendimentos() {
  // Estado para armazenar a lista de empreendimentos
  const [empreendimentos, setEmpreendimentos] = useState([]);
  // Estado para armazenar os filtros de pesquisa
  const [filtros, setFiltros] = useState({
    nome: "",
    cidade: "",
    uf: "",
    incorporadora_id: "",
  });
  // Estado para controlar o carregamento
  const [carregando, setCarregando] = useState(true);
  // Estado para armazenar o empreendimento selecionado para visualização/edição
  const [empreendimentoSelecionado, setEmpreendimentoSelecionado] =
    useState(null);
  // Estado para controlar o modo de exibição (lista, visualização, edição, novo)
  const [modo, setModo] = useState("lista");
  // Estado para armazenar mensagens para o usuário
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  // Estado para armazenar a lista de incorporadoras (para os selects)
  const [incorporadoras, setIncorporadoras] = useState([]);

  // Função para carregar empreendimentos do banco de dados
  const carregarEmpreendimentos = async (filtrosParaBusca = {}) => {
    try {
      setCarregando(true);

      // Chama o serviço para buscar empreendimentos do banco
      const resultado = await servicoEmpreendimentos.buscarEmpreendimentos(
        filtrosParaBusca
      );

      if (resultado.sucesso) {
        setEmpreendimentos(resultado.dados);
      } else {
        setMensagem({
          texto: resultado.mensagem || "Erro ao carregar empreendimentos",
          tipo: "erro",
        });
      }
    } catch (erro) {
      console.error("Erro ao carregar empreendimentos:", erro);
      setMensagem({
        texto: "Erro ao conectar com o servidor",
        tipo: "erro",
      });
    } finally {
      setCarregando(false);
    }
  };

  // Função para carregar incorporadoras (para os dropdowns)
  const carregarIncorporadoras = async () => {
    try {
      // Chama o serviço para buscar incorporadoras do banco
      const resultado = await servicoEmpreendimentos.buscarIncorporadoras();

      if (resultado.sucesso) {
        setIncorporadoras(resultado.dados);
      } else {
        console.error("Erro ao carregar incorporadoras:", resultado.mensagem);
      }
    } catch (erro) {
      console.error("Erro ao carregar incorporadoras:", erro);
    }
  };

  // Efeito para carregar os dados iniciais quando o componente é montado
  useEffect(() => {
    // Carrega os empreendimentos e incorporadoras do banco de dados
    carregarEmpreendimentos();
    carregarIncorporadoras();
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
    await carregarEmpreendimentos(filtros);
  };

  // Função para selecionar um empreendimento para visualização
  const visualizarEmpreendimento = (id) => {
    const empreendimento = empreendimentos.find((emp) => emp.id === id);
    setEmpreendimentoSelecionado(empreendimento);
    setModo("visualizar");
  };

  // Função para voltar à lista de empreendimentos
  const voltarParaLista = () => {
    setEmpreendimentoSelecionado(null);
    setModo("lista");
    // Recarrega a lista após qualquer operação
    carregarEmpreendimentos(filtros);
  };

  // Função para entrar no modo de edição
  const editarEmpreendimento = () => {
    const empreendimentoCopia = JSON.parse(
      JSON.stringify(empreendimentoSelecionado)
    );
    setEmpreendimentoSelecionado(empreendimentoCopia);
    setModo("editar");

    console.log("Entrando no modo de edição", empreendimentoCopia);
  };

  // Função para entrar no modo de cadastro de novo empreendimento
  const novoEmpreendimento = () => {
    setEmpreendimentoSelecionado({
      nome: "",
      endereco: "",
      cidade: "",
      uf: "",
      incorporadora_id: "",
    });
    setModo("novo");
  };

  // Função para excluir um empreendimento
  const confirmarExclusao = async () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o empreendimento "${empreendimentoSelecionado.nome}"?`
      )
    ) {
      try {
        // Chama o serviço para excluir o empreendimento do banco
        const resultado = await servicoEmpreendimentos.excluirEmpreendimento(
          empreendimentoSelecionado.id
        );

        if (resultado.sucesso) {
          setMensagem({
            texto: "Empreendimento excluído com sucesso!",
            tipo: "sucesso",
          });

          // Volta para a lista e recarrega os dados
          voltarParaLista();
        } else {
          setMensagem({
            texto: resultado.mensagem || "Erro ao excluir empreendimento",
            tipo: "erro",
          });
        }
      } catch (erro) {
        console.error("Erro ao excluir empreendimento:", erro);
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

  // Função para salvar um empreendimento (novo ou editado)
  const salvarEmpreendimento = async (dadosFormulario) => {
    try {
      console.log("Salvando empreendimento:", dadosFormulario);
      let resultado;

      if (modo === "novo") {
        // Chama o serviço para criar um novo empreendimento no banco
        resultado = await servicoEmpreendimentos.criarEmpreendimento(
          dadosFormulario
        );
      } else {
        // Chama o serviço para atualizar o empreendimento no banco
        resultado = await servicoEmpreendimentos.atualizarEmpreendimento(
          empreendimentoSelecionado.id,
          dadosFormulario
        );
      }

      if (resultado.sucesso) {
        setMensagem({
          texto:
            resultado.mensagem ||
            (modo === "novo"
              ? "Empreendimento criado com sucesso!"
              : "Empreendimento atualizado com sucesso!"),
          tipo: "sucesso",
        });

        // Volta para a lista e recarrega os dados
        voltarParaLista();
      } else {
        setMensagem({
          texto: resultado.mensagem || "Erro ao salvar empreendimento",
          tipo: "erro",
        });
      }
    } catch (erro) {
      console.error("Erro ao salvar empreendimento:", erro);
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
    const { name, value } = e.target;

    setEmpreendimentoSelecionado({
      ...empreendimentoSelecionado,
      [name]: value,
    });
  };

  // Função para lidar com o envio do formulário
  const manipularEnvioFormulario = (e) => {
    e.preventDefault(); // Impede o comportamento padrão de envio do formulário
    console.log("Formulário enviado", empreendimentoSelecionado);

    if (
      !empreendimentoSelecionado.nome ||
      !empreendimentoSelecionado.endereco ||
      !empreendimentoSelecionado.cidade ||
      !empreendimentoSelecionado.uf ||
      !empreendimentoSelecionado.incorporadora_id
    ) {
      setMensagem({
        texto: "Por favor, preencha todos os campos obrigatórios.",
        tipo: "erro",
      });
      return;
    }

    salvarEmpreendimento(empreendimentoSelecionado);
  };

  // Renderiza o painel de filtros
  const renderizarFiltros = () => (
    <div className="painelFiltros">
      <h3>Consultar Empreendimento</h3>

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
          <label htmlFor="cidade">Cidade:</label>
          <input
            type="text"
            id="cidade"
            name="cidade"
            className="entradaTexto"
            value={filtros.cidade}
            onChange={atualizarFiltro}
          />
        </div>

        <div className="campoFormulario">
          <label htmlFor="uf">UF:</label>
          <input
            type="text"
            id="uf"
            name="uf"
            className="entradaTexto"
            value={filtros.uf}
            onChange={atualizarFiltro}
            maxLength="2"
          />
        </div>

        <div className="campoFormulario">
          <label htmlFor="incorporadora_id">Incorporadora:</label>
          <select
            id="incorporadora_id"
            name="incorporadora_id"
            className="entradaTexto"
            value={filtros.incorporadora_id}
            onChange={atualizarFiltro}
          >
            <option value="">Todas as Incorporadoras</option>
            {incorporadoras.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.nome_exibicao || inc.razao_social}
              </option>
            ))}
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
        <h3>Empreendimentos ({empreendimentos.length} encontrados)</h3>
        <button className="botaoNovo" onClick={novoEmpreendimento}>
          + Cadastrar Empreendimento
        </button>
      </div>

      {carregando ? (
        <div className="carregando">Carregando dados...</div>
      ) : empreendimentos.length === 0 ? (
        <div className="semResultados">Nenhum empreendimento encontrado.</div>
      ) : (
        <table className="tabelaResultados">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Endereço</th>
              <th>Cidade</th>
              <th>UF</th>
              <th>Incorporadora</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {empreendimentos.map((empreendimento) => (
              <tr key={empreendimento.id}>
                <td>{empreendimento.nome}</td>
                <td>{empreendimento.endereco}</td>
                <td>{empreendimento.cidade}</td>
                <td>{empreendimento.uf}</td>
                <td>{empreendimento.incorporadora_nome}</td>
                <td>
                  <button
                    className="botaoAcao"
                    onClick={() => visualizarEmpreendimento(empreendimento.id)}
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

  // Renderiza a visualização detalhada de um empreendimento
  const renderizarVisualizacao = () => (
    <div className="painelDetalhes">
      <div className="cabecalhoDetalhes">
        <h3>Detalhes do Empreendimento</h3>
        <div className="botoesAcao">
          <button className="botaoEditar" onClick={editarEmpreendimento}>
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

      <div className="detalhesEmpreendimento">
        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Nome:</span>
            <span className="valorDetalhe">
              {empreendimentoSelecionado.nome}
            </span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Endereço:</span>
            <span className="valorDetalhe">
              {empreendimentoSelecionado.endereco}
            </span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Cidade:</span>
            <span className="valorDetalhe">
              {empreendimentoSelecionado.cidade}
            </span>
          </div>

          <div className="detalhe">
            <span className="rotuloDetalhe">UF:</span>
            <span className="valorDetalhe">{empreendimentoSelecionado.uf}</span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Incorporadora:</span>
            <span className="valorDetalhe">
              {empreendimentoSelecionado.incorporadora_nome}
            </span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Criado em:</span>
            <span className="valorDetalhe">
              {new Date(empreendimentoSelecionado.criado_em).toLocaleDateString(
                "pt-BR"
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderiza o formulário para editar um empreendimento existente
  const renderizarFormularioEdicao = () => (
    <div className="painelFormulario">
      <div className="cabecalhoFormulario">
        <h3>Editar Empreendimento</h3>
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
        <form id="formEmpreendimento">
          <div className="campoFormulario">
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              className="entradaTexto"
              value={empreendimentoSelecionado.nome || ""}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="endereco">Endereço:</label>
            <input
              type="text"
              id="endereco"
              name="endereco"
              className="entradaTexto"
              value={empreendimentoSelecionado.endereco || ""}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="cidade">Cidade:</label>
            <input
              type="text"
              id="cidade"
              name="cidade"
              className="entradaTexto"
              value={empreendimentoSelecionado.cidade || ""}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="uf">UF:</label>
            <input
              type="text"
              id="uf"
              name="uf"
              className="entradaTexto"
              value={empreendimentoSelecionado.uf || ""}
              onChange={manipularMudancaFormulario}
              maxLength="2"
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="incorporadora_id">Incorporadora:</label>
            <select
              id="incorporadora_id"
              name="incorporadora_id"
              className="entradaTexto"
              value={empreendimentoSelecionado.incorporadora_id || ""}
              onChange={manipularMudancaFormulario}
              required
            >
              <option value="">Selecione uma incorporadora</option>
              {incorporadoras.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.nome_exibicao || inc.razao_social}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>
    </div>
  );

  // Renderiza o formulário para cadastrar um novo empreendimento
  const renderizarFormularioNovo = () => (
    <div className="painelFormulario">
      <div className="cabecalhoFormulario">
        <h3>Novo Empreendimento</h3>
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
        <form id="formEmpreendimento">
          <div className="campoFormulario">
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              className="entradaTexto"
              value={empreendimentoSelecionado.nome}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="endereco">Endereço:</label>
            <input
              type="text"
              id="endereco"
              name="endereco"
              className="entradaTexto"
              value={empreendimentoSelecionado.endereco}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="cidade">Cidade:</label>
            <input
              type="text"
              id="cidade"
              name="cidade"
              className="entradaTexto"
              value={empreendimentoSelecionado.cidade}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="uf">UF:</label>
            <input
              type="text"
              id="uf"
              name="uf"
              className="entradaTexto"
              value={empreendimentoSelecionado.uf}
              onChange={manipularMudancaFormulario}
              maxLength="2"
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="incorporadora_id">Incorporadora:</label>
            <select
              id="incorporadora_id"
              name="incorporadora_id"
              className="entradaTexto"
              value={empreendimentoSelecionado.incorporadora_id}
              onChange={manipularMudancaFormulario}
              required
            >
              <option value="">Selecione uma incorporadora</option>
              {incorporadoras.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.nome_exibicao || inc.razao_social}
                </option>
              ))}
            </select>
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
    <div className="paginaEmpreendimentos">
      {/* Mensagem de sucesso ou erro */}
      {mensagem.texto && (
        <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>
      )}

      {/* Conteúdo principal */}
      {renderizarConteudo()}
    </div>
  );
}

export default PaginaEmpreendimentos;
