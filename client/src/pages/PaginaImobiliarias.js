// Funcionalidade de gerenciar imobiliárias (UC-010)
// Permite listar, criar, editar e excluir imobiliárias do sistema

import React, { useState, useEffect } from "react";
import servicoImobiliarias from "../services/imobiliariaService";
import servicoAutenticacao from "../services/authService";
import "./PaginaImobiliarias.css";

// Componente principal para gerenciar imobiliárias
function PaginaImobiliarias() {
  // Estado para armazenar a lista de imobiliárias
  const [imobiliarias, setImobiliarias] = useState([]);
  // Estado para armazenar os filtros de pesquisa
  const [filtros, setFiltros] = useState({
    nome: "",
    cidade: "",
    uf: "",
  });
  // Estado para controlar o carregamento
  const [carregando, setCarregando] = useState(true);
  // Estado para armazenar a imobiliária selecionada para visualização/edição
  const [imobiliariaSelecionada, setImobiliariaSelecionada] = useState(null);
  // Estado para controlar o modo de exibição (lista, visualização, edição, novo)
  const [modo, setModo] = useState("lista");
  // Estado para armazenar mensagens para o usuário
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

  // Função para carregar imobiliárias do banco de dados
  const carregarImobiliarias = async (filtrosParaBusca = {}) => {
    try {
      setCarregando(true);

      // Chama o serviço para buscar imobiliárias do banco
      const resultado = await servicoImobiliarias.buscarImobiliarias(
        filtrosParaBusca
      );

      if (resultado.sucesso) {
        setImobiliarias(resultado.dados);
      } else {
        setMensagem({
          texto: resultado.mensagem || "Erro ao carregar imobiliárias",
          tipo: "erro",
        });
      }
    } catch (erro) {
      console.error("Erro ao carregar imobiliárias:", erro);
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
    // Carrega as imobiliárias do banco de dados
    carregarImobiliarias();
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
    await carregarImobiliarias(filtros);
  };

  // Função para selecionar uma imobiliária para visualização
  const visualizarImobiliaria = (id) => {
    const imobiliaria = imobiliarias.find((imob) => imob.id === id);
    setImobiliariaSelecionada(imobiliaria);
    setModo("visualizar");
  };

  // Função para voltar à lista de imobiliárias
  const voltarParaLista = () => {
    setImobiliariaSelecionada(null);
    setModo("lista");
    // Recarrega a lista após qualquer operação
    carregarImobiliarias(filtros);
  };

  // Função para entrar no modo de edição
  const editarImobiliaria = () => {
    const imobiliariaCopia = JSON.parse(JSON.stringify(imobiliariaSelecionada));
    setImobiliariaSelecionada(imobiliariaCopia);
    setModo("editar");
  };

  // Função para entrar no modo de cadastro de nova imobiliária
  const novaImobiliaria = () => {
    setImobiliariaSelecionada({
      nome: "",
      cidade: "",
      uf: "",
    });
    setModo("novo");
  };

  // Função para excluir uma imobiliária
  const confirmarExclusao = async () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir a imobiliária "${imobiliariaSelecionada.nome}"?`
      )
    ) {
      try {
        // Chama o serviço para excluir a imobiliária do banco
        const resultado = await servicoImobiliarias.excluirImobiliaria(
          imobiliariaSelecionada.id
        );

        if (resultado.sucesso) {
          setMensagem({
            texto: "Imobiliária excluída com sucesso!",
            tipo: "sucesso",
          });

          // Volta para a lista e recarrega os dados
          voltarParaLista();
        } else {
          setMensagem({
            texto: resultado.mensagem || "Erro ao excluir imobiliária",
            tipo: "erro",
          });
        }
      } catch (erro) {
        console.error("Erro ao excluir imobiliária:", erro);
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

  // Função para salvar uma imobiliária (nova ou editada)
  const salvarImobiliaria = async (dadosFormulario) => {
    try {
      if (
        !dadosFormulario.nome ||
        !dadosFormulario.cidade ||
        !dadosFormulario.uf
      ) {
        setMensagem({
          texto: "Nome, cidade e UF são obrigatórios",
          tipo: "erro",
        });
        return;
      }

      let resultado;

      if (modo === "novo") {
        // Chama o serviço para criar uma nova imobiliária no banco
        resultado = await servicoImobiliarias.criarImobiliaria(dadosFormulario);
      } else {
        // Chama o serviço para atualizar a imobiliária no banco
        resultado = await servicoImobiliarias.atualizarImobiliaria(
          imobiliariaSelecionada.id,
          dadosFormulario
        );
      }

      if (resultado.sucesso) {
        setMensagem({
          texto:
            resultado.mensagem ||
            (modo === "novo"
              ? "Imobiliária criada com sucesso!"
              : "Imobiliária atualizada com sucesso!"),
          tipo: "sucesso",
        });

        // Volta para a lista e recarrega os dados
        voltarParaLista();
      } else {
        setMensagem({
          texto: resultado.mensagem || "Erro ao salvar imobiliária",
          tipo: "erro",
        });
      }
    } catch (erro) {
      console.error("Erro ao salvar imobiliária:", erro);
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

    // Se for campo UF, converte para maiúsculo
    const valorFinal = name === "uf" ? value.toUpperCase() : value;

    setImobiliariaSelecionada({
      ...imobiliariaSelecionada,
      [name]: valorFinal,
    });
  };

  // Função para lidar com o envio do formulário
  const manipularEnvioFormulario = (e) => {
    e.preventDefault();

    salvarImobiliaria(imobiliariaSelecionada);
  };

  // Renderiza o painel de filtros
  const renderizarFiltros = () => (
    <div className="painelFiltros">
      <h3>Consultar Imobiliária</h3>

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
        <h3>Imobiliárias ({imobiliarias.length} encontradas)</h3>
        <button className="botaoNovo" onClick={novaImobiliaria}>
          + Cadastrar Imobiliária
        </button>
      </div>

      {carregando ? (
        <div className="carregando">Carregando dados...</div>
      ) : imobiliarias.length === 0 ? (
        <div className="semResultados">Nenhuma imobiliária encontrada.</div>
      ) : (
        <table className="tabelaResultados">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cidade</th>
              <th>UF</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {imobiliarias.map((imobiliaria) => (
              <tr key={imobiliaria.id}>
                <td>{imobiliaria.nome}</td>
                <td>{imobiliaria.cidade}</td>
                <td>{imobiliaria.uf}</td>
                <td>
                  <button
                    className="botaoAcao"
                    onClick={() => visualizarImobiliaria(imobiliaria.id)}
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

  // Renderiza a visualização detalhada de uma imobiliária
  const renderizarVisualizacao = () => (
    <div className="painelDetalhes">
      <div className="cabecalhoDetalhes">
        <h3>Detalhes da Imobiliária</h3>
        <div className="botoesAcao">
          <button className="botaoEditar" onClick={editarImobiliaria}>
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

      <div className="detalhesImobiliaria">
        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Nome:</span>
            <span className="valorDetalhe">{imobiliariaSelecionada.nome}</span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Cidade:</span>
            <span className="valorDetalhe">
              {imobiliariaSelecionada.cidade}
            </span>
          </div>

          <div className="detalhe">
            <span className="rotuloDetalhe">UF:</span>
            <span className="valorDetalhe">{imobiliariaSelecionada.uf}</span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Data de Cadastro:</span>
            <span className="valorDetalhe">
              {new Date(imobiliariaSelecionada.criado_em).toLocaleDateString(
                "pt-BR"
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderiza o formulário para editar uma imobiliária existente
  const renderizarFormularioEdicao = () => (
    <div className="painelFormulario">
      <div className="cabecalhoFormulario">
        <h3>Editar Imobiliária</h3>
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
        <form id="formImobiliaria">
          <div className="campoFormulario">
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              className="entradaTexto"
              value={imobiliariaSelecionada.nome || ""}
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
              value={imobiliariaSelecionada.cidade || ""}
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
              value={imobiliariaSelecionada.uf || ""}
              onChange={manipularMudancaFormulario}
              maxLength="2"
              required
            />
          </div>
        </form>
      </div>
    </div>
  );

  // Renderiza o formulário para cadastrar uma nova imobiliária
  const renderizarFormularioNovo = () => (
    <div className="painelFormulario">
      <div className="cabecalhoFormulario">
        <h3>Nova Imobiliária</h3>
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
        <form id="formImobiliaria">
          <div className="campoFormulario">
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              className="entradaTexto"
              value={imobiliariaSelecionada.nome}
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
              value={imobiliariaSelecionada.cidade}
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
              value={imobiliariaSelecionada.uf}
              onChange={manipularMudancaFormulario}
              maxLength="2"
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
    <div className="paginaImobiliarias">
      {/* Mensagem de sucesso ou erro */}
      {mensagem.texto && (
        <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>
      )}

      {/* Conteúdo principal */}
      {renderizarConteudo()}
    </div>
  );
}

export default PaginaImobiliarias;
