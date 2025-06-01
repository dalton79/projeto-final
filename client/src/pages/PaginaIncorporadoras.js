// Funcionalidade de gerenciar incorporadoras (UC-003)

import React, { useState, useEffect } from "react";
import servicoIncorporadoras from "../services/incorporadoraService";
import "./PaginaIncorporadoras.css";

// Componente principal para gerenciar incorporadoras
function PaginaIncorporadoras() {
  // Estado para armazenar a lista de incorporadoras (AGORA VEM DO BANCO)
  const [incorporadoras, setIncorporadoras] = useState([]);
  // Estado para armazenar os filtros de pesquisa
  const [filtros, setFiltros] = useState({
    razaoSocial: "",
    cnpj: "",
    cidade: "",
    uf: "",
  });
  // Estado para controlar o carregamento
  const [carregando, setCarregando] = useState(true);
  // Estado para armazenar a incorporadora selecionada para visualização/edição
  const [incorporadoraSelecionada, setIncorporadoraSelecionada] =
    useState(null);
  // Estado para controlar o modo de exibição (lista, visualização, edição, novo)
  const [modo, setModo] = useState("lista");
  // Estado para armazenar mensagens para o usuário
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

  // Função para carregar incorporadoras do banco de dados
  const carregarIncorporadoras = async (filtrosParaBusca = {}) => {
    try {
      setCarregando(true);

      // Chama o serviço para buscar incorporadoras do banco
      const resultado = await servicoIncorporadoras.buscarIncorporadoras(
        filtrosParaBusca
      );

      if (resultado.sucesso) {
        setIncorporadoras(resultado.dados);
      } else {
        setMensagem({
          texto: resultado.mensagem || "Erro ao carregar incorporadoras",
          tipo: "erro",
        });
      }
    } catch (erro) {
      console.error("Erro ao carregar incorporadoras:", erro);
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
    // Carrega as incorporadoras do banco de dados
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

    await carregarIncorporadoras(filtros);
  };

  // Função para selecionar uma incorporadora para visualização
  const visualizarIncorporadora = (id) => {
    const incorporadora = incorporadoras.find((inc) => inc.id === id);
    setIncorporadoraSelecionada(incorporadora);
    setModo("visualizar");
  };

  // Função para voltar à lista de incorporadoras
  const voltarParaLista = () => {
    setIncorporadoraSelecionada(null);
    setModo("lista");

    carregarIncorporadoras(filtros);
  };

  // Função para entrar no modo de edição
  const editarIncorporadora = () => {
    // Fazemos uma cópia profunda do objeto para evitar referências compartilhadas
    const incorporadoraCopia = JSON.parse(
      JSON.stringify(incorporadoraSelecionada)
    );
    setIncorporadoraSelecionada(incorporadoraCopia);
    setModo("editar");
  };

  // Função para entrar no modo de cadastro de nova incorporadora
  const novaIncorporadora = () => {
    setIncorporadoraSelecionada({
      razaoSocial: "",
      cnpj: "",
      endereco: "",
      cidade: "",
      uf: "",
      nomeExibicao: "",
      email: "",
      telefone: "",
      responsavel: "",
      telefoneResponsavel: "",
      emailResponsavel: "",
    });
    setModo("novo");
  };

  // Função para excluir uma incorporadora (AGORA CONECTADO COM O BANCO)
  const confirmarExclusao = async () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir a incorporadora "${incorporadoraSelecionada.razao_social}"?`
      )
    ) {
      try {
        // Chama o serviço para excluir a incorporadora do banco
        const resultado = await servicoIncorporadoras.excluirIncorporadora(
          incorporadoraSelecionada.id
        );

        if (resultado.sucesso) {
          setMensagem({
            texto: "Incorporadora excluída com sucesso!",
            tipo: "sucesso",
          });

          // Volta para a lista e recarrega os dados
          voltarParaLista();
        } else {
          setMensagem({
            texto: resultado.mensagem || "Erro ao excluir incorporadora",
            tipo: "erro",
          });
        }
      } catch (erro) {
        console.error("Erro ao excluir incorporadora:", erro);
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

  // Função para salvar uma incorporadora
  const salvarIncorporadora = async (dadosFormulario) => {
    try {
      let resultado;

      if (modo === "novo") {
        // Chama o serviço para criar uma nova incorporadora no banco
        resultado = await servicoIncorporadoras.criarIncorporadora(
          dadosFormulario
        );
      } else {
        // Chama o serviço para atualizar a incorporadora no banco
        resultado = await servicoIncorporadoras.atualizarIncorporadora(
          incorporadoraSelecionada.id,
          dadosFormulario
        );
      }

      if (resultado.sucesso) {
        setMensagem({
          texto:
            resultado.mensagem ||
            (modo === "novo"
              ? "Incorporadora criada com sucesso!"
              : "Incorporadora atualizada com sucesso!"),
          tipo: "sucesso",
        });

        // Volta para a lista e recarrega os dados
        voltarParaLista();
      } else {
        setMensagem({
          texto: resultado.mensagem || "Erro ao salvar incorporadora",
          tipo: "erro",
        });
      }
    } catch (erro) {
      console.error("Erro ao salvar incorporadora:", erro);
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

    setIncorporadoraSelecionada({
      ...incorporadoraSelecionada,
      [name]: value,
    });
  };

  // Função para lidar com o envio do formulário
  const manipularEnvioFormulario = (e) => {
    e.preventDefault();

    // Validações básicas
    if (
      !incorporadoraSelecionada.razao_social ||
      !incorporadoraSelecionada.cnpj ||
      !incorporadoraSelecionada.endereco ||
      !incorporadoraSelecionada.cidade ||
      !incorporadoraSelecionada.uf
    ) {
      setMensagem({
        texto: "Por favor, preencha todos os campos obrigatórios.",
        tipo: "erro",
      });
      return;
    }

    salvarIncorporadora(incorporadoraSelecionada);
  };

  // Renderiza o painel de filtros
  const renderizarFiltros = () => (
    <div className="painelFiltros">
      <h3>Consultar Incorporadora</h3>

      <form onSubmit={pesquisar}>
        <div className="campoFormulario">
          <label htmlFor="razaoSocial">Razão Social:</label>
          <input
            type="text"
            id="razaoSocial"
            name="razaoSocial"
            className="entradaTexto"
            value={filtros.razaoSocial}
            onChange={atualizarFiltro}
          />
        </div>

        <div className="campoFormulario">
          <label htmlFor="cnpj">CNPJ:</label>
          <input
            type="text"
            id="cnpj"
            name="cnpj"
            className="entradaTexto"
            value={filtros.cnpj}
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
        <h3>Incorporadoras ({incorporadoras.length} encontradas)</h3>
        <button className="botaoNovo" onClick={novaIncorporadora}>
          + Cadastrar Incorporadora
        </button>
      </div>

      {carregando ? (
        <div className="carregando">Carregando dados...</div>
      ) : incorporadoras.length === 0 ? (
        <div className="semResultados">Nenhuma incorporadora encontrada.</div>
      ) : (
        <table className="tabelaResultados">
          <thead>
            <tr>
              <th>Razão Social</th>
              <th>CNPJ</th>
              <th>Cidade</th>
              <th>UF</th>
              <th>Responsável</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {incorporadoras.map((incorporadora) => (
              <tr key={incorporadora.id}>
                <td>{incorporadora.razao_social}</td>
                <td>{incorporadora.cnpj}</td>
                <td>{incorporadora.cidade}</td>
                <td>{incorporadora.uf}</td>
                <td>{incorporadora.responsavel}</td>
                <td>{incorporadora.telefone}</td>
                <td>
                  <button
                    className="botaoAcao"
                    onClick={() => visualizarIncorporadora(incorporadora.id)}
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

  // Renderiza a visualização detalhada de uma incorporadora
  const renderizarVisualizacao = () => (
    <div className="painelDetalhes">
      <div className="cabecalhoDetalhes">
        <h3>Detalhes da Incorporadora</h3>
        <div className="botoesAcao">
          <button className="botaoEditar" onClick={editarIncorporadora}>
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

      <div className="detalhesIncorporadora">
        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Razão Social:</span>
            <span className="valorDetalhe">
              {incorporadoraSelecionada.razao_social}
            </span>
          </div>

          <div className="detalhe">
            <span className="rotuloDetalhe">CNPJ:</span>
            <span className="valorDetalhe">
              {incorporadoraSelecionada.cnpj}
            </span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Endereço:</span>
            <span className="valorDetalhe">
              {incorporadoraSelecionada.endereco}
            </span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Cidade:</span>
            <span className="valorDetalhe">
              {incorporadoraSelecionada.cidade}
            </span>
          </div>

          <div className="detalhe">
            <span className="rotuloDetalhe">UF:</span>
            <span className="valorDetalhe">{incorporadoraSelecionada.uf}</span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Nome para Exibição:</span>
            <span className="valorDetalhe">
              {incorporadoraSelecionada.nome_exibicao}
            </span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">E-mail:</span>
            <span className="valorDetalhe">
              {incorporadoraSelecionada.email}
            </span>
          </div>

          <div className="detalhe">
            <span className="rotuloDetalhe">Telefone:</span>
            <span className="valorDetalhe">
              {incorporadoraSelecionada.telefone}
            </span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Responsável:</span>
            <span className="valorDetalhe">
              {incorporadoraSelecionada.responsavel}
            </span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Telefone do Responsável:</span>
            <span className="valorDetalhe">
              {incorporadoraSelecionada.telefone_responsavel}
            </span>
          </div>

          <div className="detalhe">
            <span className="rotuloDetalhe">E-mail do Responsável:</span>
            <span className="valorDetalhe">
              {incorporadoraSelecionada.email_responsavel}
            </span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Criado em:</span>
            <span className="valorDetalhe">
              {new Date(incorporadoraSelecionada.criado_em).toLocaleDateString(
                "pt-BR"
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderiza o formulário para editar uma incorporadora existente
  const renderizarFormularioEdicao = () => (
    <div className="painelFormulario">
      <div className="cabecalhoFormulario">
        <h3>Editar Incorporadora</h3>
        <div className="botoesAcao">
          <button
            type="submit"
            form="formIncorporadora"
            className="botaoSalvar"
          >
            Salvar
          </button>
          <button
            className="botaoCancelar"
            onClick={() => setModo("visualizar")}
          >
            Cancelar
          </button>
        </div>
      </div>

      <div className="corpoFormulario">
        <form id="formIncorporadora" onSubmit={manipularEnvioFormulario}>
          <div className="campoFormulario">
            <label htmlFor="razao_social">Razão Social:</label>
            <input
              type="text"
              id="razao_social"
              name="razao_social"
              className="entradaTexto"
              value={incorporadoraSelecionada.razao_social || ""}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="cnpj">CNPJ:</label>
            <input
              type="text"
              id="cnpj"
              name="cnpj"
              className="entradaTexto"
              value={incorporadoraSelecionada.cnpj || ""}
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
              value={incorporadoraSelecionada.endereco || ""}
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
              value={incorporadoraSelecionada.cidade || ""}
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
              value={incorporadoraSelecionada.uf || ""}
              onChange={manipularMudancaFormulario}
              maxLength="2"
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="nome_exibicao">Nome para Exibição:</label>
            <input
              type="text"
              id="nome_exibicao"
              name="nome_exibicao"
              className="entradaTexto"
              value={incorporadoraSelecionada.nome_exibicao || ""}
              onChange={manipularMudancaFormulario}
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="email">E-mail:</label>
            <input
              type="email"
              id="email"
              name="email"
              className="entradaTexto"
              value={incorporadoraSelecionada.email || ""}
              onChange={manipularMudancaFormulario}
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="telefone">Telefone:</label>
            <input
              type="text"
              id="telefone"
              name="telefone"
              className="entradaTexto"
              value={incorporadoraSelecionada.telefone || ""}
              onChange={manipularMudancaFormulario}
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="responsavel">Responsável:</label>
            <input
              type="text"
              id="responsavel"
              name="responsavel"
              className="entradaTexto"
              value={incorporadoraSelecionada.responsavel || ""}
              onChange={manipularMudancaFormulario}
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="telefone_responsavel">
              Telefone do Responsável:
            </label>
            <input
              type="text"
              id="telefone_responsavel"
              name="telefone_responsavel"
              className="entradaTexto"
              value={incorporadoraSelecionada.telefone_responsavel || ""}
              onChange={manipularMudancaFormulario}
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="email_responsavel">E-mail do Responsável:</label>
            <input
              type="email"
              id="email_responsavel"
              name="email_responsavel"
              className="entradaTexto"
              value={incorporadoraSelecionada.email_responsavel || ""}
              onChange={manipularMudancaFormulario}
            />
          </div>
        </form>
      </div>
    </div>
  );

  // Renderiza o formulário para cadastrar uma nova incorporadora
  const renderizarFormularioNovo = () => (
    <div className="painelFormulario">
      <div className="cabecalhoFormulario">
        <h3>Nova Incorporadora</h3>
        <div className="botoesAcao">
          <button
            type="submit"
            form="formIncorporadora"
            className="botaoSalvar"
          >
            Salvar
          </button>
          <button className="botaoCancelar" onClick={voltarParaLista}>
            Cancelar
          </button>
        </div>
      </div>

      <div className="corpoFormulario">
        <form id="formIncorporadora" onSubmit={manipularEnvioFormulario}>
          <div className="campoFormulario">
            <label htmlFor="razao_social">Razão Social:</label>
            <input
              type="text"
              id="razao_social"
              name="razao_social"
              className="entradaTexto"
              value={incorporadoraSelecionada.razao_social || ""}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="cnpj">CNPJ:</label>
            <input
              type="text"
              id="cnpj"
              name="cnpj"
              className="entradaTexto"
              value={incorporadoraSelecionada.cnpj}
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
              value={incorporadoraSelecionada.endereco}
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
              value={incorporadoraSelecionada.cidade}
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
              value={incorporadoraSelecionada.uf}
              onChange={manipularMudancaFormulario}
              maxLength="2"
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="nomeExibicao">Nome para Exibição:</label>
            <input
              type="text"
              id="nomeExibicao"
              name="nomeExibicao"
              className="entradaTexto"
              value={incorporadoraSelecionada.nomeExibicao}
              onChange={manipularMudancaFormulario}
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="email">E-mail:</label>
            <input
              type="email"
              id="email"
              name="email"
              className="entradaTexto"
              value={incorporadoraSelecionada.email}
              onChange={manipularMudancaFormulario}
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="telefone">Telefone:</label>
            <input
              type="text"
              id="telefone"
              name="telefone"
              className="entradaTexto"
              value={incorporadoraSelecionada.telefone}
              onChange={manipularMudancaFormulario}
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="responsavel">Responsável:</label>
            <input
              type="text"
              id="responsavel"
              name="responsavel"
              className="entradaTexto"
              value={incorporadoraSelecionada.responsavel}
              onChange={manipularMudancaFormulario}
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="telefoneResponsavel">
              Telefone do Responsável:
            </label>
            <input
              type="text"
              id="telefoneResponsavel"
              name="telefoneResponsavel"
              className="entradaTexto"
              value={incorporadoraSelecionada.telefoneResponsavel}
              onChange={manipularMudancaFormulario}
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="emailResponsavel">E-mail do Responsável:</label>
            <input
              type="email"
              id="emailResponsavel"
              name="emailResponsavel"
              className="entradaTexto"
              value={incorporadoraSelecionada.emailResponsavel}
              onChange={manipularMudancaFormulario}
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
    <div className="paginaIncorporadoras">
      {/* Mensagem de sucesso ou erro */}
      {mensagem.texto && (
        <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>
      )}

      {/* Conteúdo principal */}
      {renderizarConteudo()}
    </div>
  );
}

export default PaginaIncorporadoras;
