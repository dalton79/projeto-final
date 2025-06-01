// Funcionalidade de gerenciar corretores (UC-011)
// Permite listar, criar, editar e excluir corretores do sistema

import React, { useState, useEffect } from "react";
import servicoCorretores from "../services/corretorService";
import servicoAutenticacao from "../services/authService";
import "./PaginaCorretores.css";

// Componente principal para gerenciar corretores
function PaginaCorretores() {
  // Estado para armazenar a lista de corretores
  const [corretores, setCorretores] = useState([]);
  // Estado para armazenar os filtros de pesquisa
  const [filtros, setFiltros] = useState({
    nome: "",
    sobrenome: "",
  });
  // Estado para controlar o carregamento
  const [carregando, setCarregando] = useState(true);
  // Estado para armazenar o corretor selecionado para visualização/edição
  const [corretorSelecionado, setCorretorSelecionado] = useState(null);
  // Estado para controlar o modo de exibição (lista, visualização, edição, novo)
  const [modo, setModo] = useState("lista");
  // Estado para armazenar mensagens para o usuário
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

  // Função para carregar corretores do banco de dados
  const carregarCorretores = async (filtrosParaBusca = {}) => {
    try {
      setCarregando(true);

      // Chama o serviço para buscar corretores do banco
      const resultado = await servicoCorretores.buscarCorretores(
        filtrosParaBusca
      );

      if (resultado.sucesso) {
        setCorretores(resultado.dados);
      } else {
        setMensagem({
          texto: resultado.mensagem || "Erro ao carregar corretores",
          tipo: "erro",
        });
      }
    } catch (erro) {
      console.error("Erro ao carregar corretores:", erro);
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
    // Carrega os corretores do banco de dados
    carregarCorretores();
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
    await carregarCorretores(filtros);
  };

  // Função para selecionar um corretor para visualização
  const visualizarCorretor = (id) => {
    const corretor = corretores.find((corr) => corr.id === id);
    setCorretorSelecionado(corretor);
    setModo("visualizar");
  };

  // Função para voltar à lista de corretores
  const voltarParaLista = () => {
    setCorretorSelecionado(null);
    setModo("lista");
    // Recarrega a lista após qualquer operação
    carregarCorretores(filtros);
  };

  // Função para entrar no modo de edição
  const editarCorretor = () => {
    const corretorCopia = JSON.parse(JSON.stringify(corretorSelecionado));
    setCorretorSelecionado(corretorCopia);
    setModo("editar");
  };

  // Função para entrar no modo de cadastro de novo corretor
  const novoCorretor = () => {
    setCorretorSelecionado({
      nome: "",
      sobrenome: "",
    });
    setModo("novo");
  };

  // Função para excluir um corretor
  const confirmarExclusao = async () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o corretor "${corretorSelecionado.nome} ${corretorSelecionado.sobrenome}"?`
      )
    ) {
      try {
        // Chama o serviço para excluir o corretor do banco
        const resultado = await servicoCorretores.excluirCorretor(
          corretorSelecionado.id
        );

        if (resultado.sucesso) {
          setMensagem({
            texto: "Corretor excluído com sucesso!",
            tipo: "sucesso",
          });

          // Volta para a lista e recarrega os dados
          voltarParaLista();
        } else {
          setMensagem({
            texto: resultado.mensagem || "Erro ao excluir corretor",
            tipo: "erro",
          });
        }
      } catch (erro) {
        console.error("Erro ao excluir corretor:", erro);
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

  // Função para salvar um corretor (novo ou editado)
  const salvarCorretor = async (dadosFormulario) => {
    try {
      if (!dadosFormulario.nome || !dadosFormulario.sobrenome) {
        setMensagem({
          texto: "Nome e sobrenome são obrigatórios",
          tipo: "erro",
        });
        return;
      }

      let resultado;

      if (modo === "novo") {
        // Chama o serviço para criar um novo corretor no banco
        resultado = await servicoCorretores.criarCorretor(dadosFormulario);
      } else {
        // Chama o serviço para atualizar o corretor no banco
        resultado = await servicoCorretores.atualizarCorretor(
          corretorSelecionado.id,
          dadosFormulario
        );
      }

      if (resultado.sucesso) {
        setMensagem({
          texto:
            resultado.mensagem ||
            (modo === "novo"
              ? "Corretor criado com sucesso!"
              : "Corretor atualizado com sucesso!"),
          tipo: "sucesso",
        });

        // Volta para a lista e recarrega os dados
        voltarParaLista();
      } else {
        setMensagem({
          texto: resultado.mensagem || "Erro ao salvar corretor",
          tipo: "erro",
        });
      }
    } catch (erro) {
      console.error("Erro ao salvar corretor:", erro);
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

    let valorFinal = value;
    if ((name === "nome" || name === "sobrenome") && value.length === 1) {
      valorFinal = value.toUpperCase();
    }

    setCorretorSelecionado({
      ...corretorSelecionado,
      [name]: valorFinal,
    });
  };

  // Função para lidar com o envio do formulário
  const manipularEnvioFormulario = (e) => {
    e.preventDefault();

    salvarCorretor(corretorSelecionado);
  };

  // Renderiza o painel de filtros
  const renderizarFiltros = () => (
    <div className="painelFiltros">
      <h3>Consultar Corretor</h3>

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
          <label htmlFor="sobrenome">Sobrenome:</label>
          <input
            type="text"
            id="sobrenome"
            name="sobrenome"
            className="entradaTexto"
            value={filtros.sobrenome}
            onChange={atualizarFiltro}
          />
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
        <h3>Corretores ({corretores.length} encontrados)</h3>
        <button className="botaoNovo" onClick={novoCorretor}>
          + Cadastrar Corretor
        </button>
      </div>

      {carregando ? (
        <div className="carregando">Carregando dados...</div>
      ) : corretores.length === 0 ? (
        <div className="semResultados">Nenhum corretor encontrado.</div>
      ) : (
        <table className="tabelaResultados">
          <thead>
            <tr>
              <th>Nome Completo</th>
              <th>Data de Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {corretores.map((corretor) => (
              <tr key={corretor.id}>
                <td className="nomeCompletoCorretor">
                  {corretor.nome} {corretor.sobrenome}
                </td>
                <td>
                  {new Date(corretor.criado_em).toLocaleDateString("pt-BR")}
                </td>
                <td>
                  <button
                    className="botaoAcao"
                    onClick={() => visualizarCorretor(corretor.id)}
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

  // Renderiza a visualização detalhada de um corretor
  const renderizarVisualizacao = () => (
    <div className="painelDetalhes">
      <div className="cabecalhoDetalhes">
        <h3>Detalhes do Corretor</h3>
        <div className="botoesAcao">
          <button className="botaoEditar" onClick={editarCorretor}>
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

      <div className="detalhesCorretor">
        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Nome:</span>
            <span className="valorDetalhe">{corretorSelecionado.nome}</span>
          </div>

          <div className="detalhe">
            <span className="rotuloDetalhe">Sobrenome:</span>
            <span className="valorDetalhe">
              {corretorSelecionado.sobrenome}
            </span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Nome Completo:</span>
            <span className="valorDetalhe">
              {corretorSelecionado.nome} {corretorSelecionado.sobrenome}
            </span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Data de Cadastro:</span>
            <span className="valorDetalhe">
              {new Date(corretorSelecionado.criado_em).toLocaleDateString(
                "pt-BR"
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderiza o formulário para editar um corretor existente
  const renderizarFormularioEdicao = () => (
    <div className="painelFormulario">
      <div className="cabecalhoFormulario">
        <h3>Editar Corretor</h3>
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
        <form id="formCorretor">
          <div className="campoFormulario">
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              className="entradaTexto"
              value={corretorSelecionado.nome || ""}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="sobrenome">Sobrenome:</label>
            <input
              type="text"
              id="sobrenome"
              name="sobrenome"
              className="entradaTexto"
              value={corretorSelecionado.sobrenome || ""}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>
        </form>
      </div>
    </div>
  );

  // Renderiza o formulário para cadastrar um novo corretor
  const renderizarFormularioNovo = () => (
    <div className="painelFormulario">
      <div className="cabecalhoFormulario">
        <h3>Novo Corretor</h3>
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
        <form id="formCorretor">
          <div className="campoFormulario">
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              className="entradaTexto"
              value={corretorSelecionado.nome}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="sobrenome">Sobrenome:</label>
            <input
              type="text"
              id="sobrenome"
              name="sobrenome"
              className="entradaTexto"
              value={corretorSelecionado.sobrenome}
              onChange={manipularMudancaFormulario}
              required
            />
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
    <div className="paginaCorretores">
      {/* Mensagem de sucesso ou erro */}
      {mensagem.texto && (
        <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>
      )}

      {/* Conteúdo principal */}
      {renderizarConteudo()}
    </div>
  );
}

export default PaginaCorretores;
