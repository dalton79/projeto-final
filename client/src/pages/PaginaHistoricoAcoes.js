// Funcionalidade de consultar histórico geral das ações (UC-006)
// Permite que Administradores e Gestores da Consultoria visualizem, editem e excluam
// os registros de ações executadas pelas imobiliárias em todas as incorporadoras

import React, { useState, useEffect } from "react";
import servicoHistoricoAcoes from "../services/historicoAcaoService";
import servicoAutenticacao from "../services/authService";
import "./PaginaHistoricoAcoes.css";

// Componente principal para gerenciar o histórico geral das ações
function PaginaHistoricoAcoes() {
  // Estado para armazenar a lista de registros de ações
  const [registros, setRegistros] = useState([]);
  // Estado para armazenar os filtros de pesquisa
  const [filtros, setFiltros] = useState({
    data_inicio: "",
    data_fim: "",
    incorporadora_id: "",
    empreendimento_id: "",
    imobiliaria_id: "",
    corretor_id: "",
    acao_id: "",
  });
  // Estado para controlar o carregamento
  const [carregando, setCarregando] = useState(true);
  // Estado para armazenar o registro selecionado para visualização/edição
  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  // Estado para controlar o modo de exibição (lista, visualização, edição)
  const [modo, setModo] = useState("lista");
  // Estado para armazenar mensagens para o usuário
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  // Estado para armazenar os dados para os selects do formulário
  const [dadosFiltros, setDadosFiltros] = useState({
    incorporadoras: [],
    empreendimentos: [],
    imobiliarias: [],
    corretores: [],
    acoes: [],
  });
  // Estado para armazenar o perfil do usuário logado
  const [perfilUsuario, setPerfilUsuario] = useState("");

  // Efeito para obter o perfil do usuário logado
  useEffect(() => {
    const usuarioLogado = servicoAutenticacao.obterUsuarioLogado();
    if (usuarioLogado && usuarioLogado.perfil) {
      setPerfilUsuario(usuarioLogado.perfil);

      // Verifica se o usuário tem permissão para acessar esta página
      if (
        usuarioLogado.perfil !== "Administrador" &&
        usuarioLogado.perfil !== "Gestor Consultoria"
      ) {
        setMensagem({
          texto: "Você não tem permissão para acessar esta página.",
          tipo: "erro",
        });
      }
    }
  }, []);

  // Efeito para carregar os dados iniciais quando o componente é montado
  useEffect(() => {
    // Carrega os registros de ações do banco de dados
    carregarHistoricoAcoes();
    // Carrega os dados para os selects do formulário
    carregarDadosFiltros();
  }, []);

  // Função para carregar registros de ações do banco de dados
  const carregarHistoricoAcoes = async (filtrosParaBusca = {}) => {
    try {
      setCarregando(true);

      // Chama o serviço para buscar registros de ações do banco
      const resultado = await servicoHistoricoAcoes.buscarHistoricoAcoes(
        filtrosParaBusca
      );

      if (resultado.sucesso) {
        setRegistros(resultado.dados);
      } else {
        setMensagem({
          texto: resultado.mensagem || "Erro ao carregar histórico de ações",
          tipo: "erro",
        });
      }
    } catch (erro) {
      console.error("Erro ao carregar histórico de ações:", erro);
      setMensagem({
        texto: "Erro ao conectar com o servidor",
        tipo: "erro",
      });
    } finally {
      setCarregando(false);
    }
  };

  // Função para carregar dados para os selects do formulário
  const carregarDadosFiltros = async () => {
    try {
      // Chama o serviço para buscar dados para os filtros
      const resultado = await servicoHistoricoAcoes.obterDadosFiltros();

      if (resultado.sucesso) {
        setDadosFiltros(resultado.dados);
      } else {
        console.error(
          "Erro ao carregar dados para filtros:",
          resultado.mensagem
        );
      }
    } catch (erro) {
      console.error("Erro ao carregar dados para filtros:", erro);
    }
  };

  // Função para atualizar os filtros quando o usuário digita
  const atualizarFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value,
    });

    // Se o filtro for de incorporadora, filtra os empreendimentos relacionados
    if (name === "incorporadora_id" && value) {
      setFiltros((filtrosAnteriores) => ({
        ...filtrosAnteriores,
        empreendimento_id: "", // Limpa a seleção de empreendimento
      }));
    }
  };

  // Função para realizar a pesquisa com base nos filtros
  const pesquisar = async (e) => {
    e.preventDefault();

    // Prepara os filtros com conversão de datas
    const filtrosPreparados = {
      ...filtros,
      data_inicio: filtros.data_inicio
        ? servicoHistoricoAcoes.converterDataParaISO(filtros.data_inicio)
        : "",
      data_fim: filtros.data_fim
        ? servicoHistoricoAcoes.converterDataParaISO(filtros.data_fim)
        : "",
    };

    // Faz a pesquisa no banco de dados usando os filtros
    await carregarHistoricoAcoes(filtrosPreparados);
  };

  // Função para selecionar um registro para visualização
  const visualizarRegistro = (id) => {
    const registro = registros.find((reg) => reg.id === id);
    setRegistroSelecionado(registro);
    setModo("visualizar");
  };

  // Função para voltar à lista de registros
  const voltarParaLista = () => {
    setRegistroSelecionado(null);
    setModo("lista");
    // Recarrega a lista após qualquer operação
    carregarHistoricoAcoes(filtros);
  };

  // Função para entrar no modo de edição
  const editarRegistro = () => {
    const registroCopia = JSON.parse(JSON.stringify(registroSelecionado));
    setRegistroSelecionado(registroCopia);
    setModo("editar");
  };

  // Função para excluir um registro
  const confirmarExclusao = async () => {
    if (
      window.confirm(`Tem certeza que deseja excluir este registro de ação?`)
    ) {
      try {
        // Chama o serviço para excluir o registro do banco
        const resultado = await servicoHistoricoAcoes.excluirHistoricoAcao(
          registroSelecionado.id
        );

        if (resultado.sucesso) {
          setMensagem({
            texto: "Registro excluído com sucesso!",
            tipo: "sucesso",
          });

          // Volta para a lista e recarrega os dados
          voltarParaLista();
        } else {
          setMensagem({
            texto: resultado.mensagem || "Erro ao excluir registro",
            tipo: "erro",
          });
        }
      } catch (erro) {
        console.error("Erro ao excluir registro:", erro);
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

  // Função para salvar um registro editado
  const salvarRegistro = async (dadosFormulario) => {
    try {
      if (
        !dadosFormulario.data_acao ||
        !dadosFormulario.acao_id ||
        !dadosFormulario.quantidade ||
        !dadosFormulario.incorporadora_id ||
        !dadosFormulario.empreendimento_id ||
        !dadosFormulario.imobiliaria_id ||
        !dadosFormulario.corretor_id
      ) {
        setMensagem({
          texto: "Todos os campos são obrigatórios, exceto VGV e Anotações",
          tipo: "erro",
        });
        return;
      }

      // Prepara os dados com conversão de data para formato ISO
      const dadosPreparados = {
        ...dadosFormulario,
        data_acao: servicoHistoricoAcoes.converterDataParaISO(
          dadosFormulario.data_acao
        ),
        // Garante que números sejam enviados como números, não strings
        quantidade: parseInt(dadosFormulario.quantidade, 10),
        vgv: parseFloat(dadosFormulario.vgv || 0),
        // Garante que IDs sejam enviados como números, não strings
        acao_id: parseInt(dadosFormulario.acao_id, 10),
        empreendimento_id: parseInt(dadosFormulario.empreendimento_id, 10),
        imobiliaria_id: parseInt(dadosFormulario.imobiliaria_id, 10),
        corretor_id: parseInt(dadosFormulario.corretor_id, 10),
        incorporadora_id: parseInt(dadosFormulario.incorporadora_id, 10),
      };

      // Chama o serviço para atualizar o registro no banco
      const resultado = await servicoHistoricoAcoes.atualizarHistoricoAcao(
        registroSelecionado.id,
        dadosPreparados
      );

      if (resultado.sucesso) {
        setMensagem({
          texto: resultado.mensagem || "Registro atualizado com sucesso!",
          tipo: "sucesso",
        });

        // Volta para a lista e recarrega os dados
        voltarParaLista();
      } else {
        setMensagem({
          texto: resultado.mensagem || "Erro ao salvar registro",
          tipo: "erro",
        });
      }
    } catch (erro) {
      console.error("Erro ao salvar registro:", erro);
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

    setRegistroSelecionado({
      ...registroSelecionado,
      [name]: value,
    });

    // Se o campo for incorporadora_id, limpa o empreendimento_id
    if (name === "incorporadora_id") {
      setRegistroSelecionado((prev) => ({
        ...prev,
        empreendimento_id: "",
      }));
    }
  };

  // Função para lidar com o envio do formulário
  const manipularEnvioFormulario = (e) => {
    e.preventDefault();

    // Validações básicas são feitas dentro da função salvarRegistro
    salvarRegistro(registroSelecionado);
  };

  // Função para filtrar empreendimentos por incorporadora
  const filtrarEmpreendimentosPorIncorporadora = (incorporadora_id) => {
    if (!incorporadora_id) return dadosFiltros.empreendimentos;

    return dadosFiltros.empreendimentos.filter(
      (empreendimento) => empreendimento.incorporadora_id == incorporadora_id
    );
  };

  // Renderiza o painel de filtros
  const renderizarFiltros = () => (
    <div className="painelFiltros">
      <h3>Consultar Histórico de Ações</h3>

      <form onSubmit={pesquisar}>
        <div className="campoFormulario">
          <label htmlFor="data_inicio">Data Início:</label>
          <input
            type="text"
            id="data_inicio"
            name="data_inicio"
            className="entradaTexto"
            value={filtros.data_inicio}
            onChange={atualizarFiltro}
            placeholder="DD/MM/AAAA"
          />
        </div>

        <div className="campoFormulario">
          <label htmlFor="data_fim">Data Fim:</label>
          <input
            type="text"
            id="data_fim"
            name="data_fim"
            className="entradaTexto"
            value={filtros.data_fim}
            onChange={atualizarFiltro}
            placeholder="DD/MM/AAAA"
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
            {dadosFiltros.incorporadoras.map((incorporadora) => (
              <option key={incorporadora.id} value={incorporadora.id}>
                {incorporadora.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="campoFormulario">
          <label htmlFor="empreendimento_id">Empreendimento:</label>
          <select
            id="empreendimento_id"
            name="empreendimento_id"
            className="entradaTexto"
            value={filtros.empreendimento_id}
            onChange={atualizarFiltro}
            disabled={!filtros.incorporadora_id}
          >
            <option value="">Todos os Empreendimentos</option>
            {filtrarEmpreendimentosPorIncorporadora(
              filtros.incorporadora_id
            ).map((empreendimento) => (
              <option key={empreendimento.id} value={empreendimento.id}>
                {empreendimento.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="campoFormulario">
          <label htmlFor="imobiliaria_id">Imobiliária:</label>
          <select
            id="imobiliaria_id"
            name="imobiliaria_id"
            className="entradaTexto"
            value={filtros.imobiliaria_id}
            onChange={atualizarFiltro}
          >
            <option value="">Todas as Imobiliárias</option>
            {dadosFiltros.imobiliarias.map((imobiliaria) => (
              <option key={imobiliaria.id} value={imobiliaria.id}>
                {imobiliaria.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="campoFormulario">
          <label htmlFor="corretor_id">Corretor:</label>
          <select
            id="corretor_id"
            name="corretor_id"
            className="entradaTexto"
            value={filtros.corretor_id}
            onChange={atualizarFiltro}
          >
            <option value="">Todos os Corretores</option>
            {dadosFiltros.corretores.map((corretor) => (
              <option key={corretor.id} value={corretor.id}>
                {corretor.nome} {corretor.sobrenome}
              </option>
            ))}
          </select>
        </div>

        <div className="campoFormulario">
          <label htmlFor="acao_id">Ação:</label>
          <select
            id="acao_id"
            name="acao_id"
            className="entradaTexto"
            value={filtros.acao_id}
            onChange={atualizarFiltro}
          >
            <option value="">Todas as Ações</option>
            {dadosFiltros.acoes.map((acao) => (
              <option key={acao.id} value={acao.id}>
                {acao.nome} ({acao.pontuacao} pontos)
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
        <h3>Histórico de Ações ({registros.length} encontradas)</h3>
      </div>

      {carregando ? (
        <div className="carregando">Carregando dados...</div>
      ) : registros.length === 0 ? (
        <div className="semResultados">Nenhum registro de ação encontrado.</div>
      ) : (
        <table className="tabelaResultados">
          <thead>
            <tr>
              <th>Data</th>
              <th>Ação</th>
              <th>Pontuação</th>
              <th>Imobiliária</th>
              <th>Corretor</th>
              <th>Empreendimento</th>
              <th>Incorporadora</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((registro) => (
              <tr key={registro.id}>
                <td>
                  {servicoHistoricoAcoes.formatarData(registro.data_acao)}
                </td>
                <td>
                  {registro.acao_nome} ({registro.quantidade}x)
                </td>
                <td className="destaque azul">{registro.pontuacao_total}</td>
                <td>{registro.imobiliaria_nome}</td>
                <td>
                  {registro.corretor_nome} {registro.corretor_sobrenome}
                </td>
                <td>{registro.empreendimento_nome}</td>
                <td>{registro.incorporadora_nome}</td>
                <td>
                  <button
                    className="botaoAcao"
                    onClick={() => visualizarRegistro(registro.id)}
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

  // Renderiza a visualização detalhada de um registro
  const renderizarVisualizacao = () => (
    <div className="painelDetalhes">
      <div className="cabecalhoDetalhes">
        <h3>Detalhes da Ação Executada</h3>
        <div className="botoesAcao">
          <button className="botaoEditar" onClick={editarRegistro}>
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

      <div className="detalhesRegistro">
        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Data da Ação:</span>
            <span className="valorDetalhe">
              {servicoHistoricoAcoes.formatarData(
                registroSelecionado.data_acao
              )}
            </span>
          </div>

          <div className="detalhe">
            <span className="rotuloDetalhe">Ação Executada:</span>
            <span className="valorDetalhe">
              {registroSelecionado.acao_nome}
            </span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Quantidade:</span>
            <span className="valorDetalhe">
              {registroSelecionado.quantidade}
            </span>
          </div>

          <div className="detalhe">
            <span className="rotuloDetalhe">Pontuação Total:</span>
            <span className="valorDetalhe destaque azul">
              {registroSelecionado.pontuacao_total}
            </span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Imobiliária:</span>
            <span className="valorDetalhe">
              {registroSelecionado.imobiliaria_nome}
            </span>
          </div>

          <div className="detalhe">
            <span className="rotuloDetalhe">Corretor:</span>
            <span className="valorDetalhe">
              {registroSelecionado.corretor_nome}{" "}
              {registroSelecionado.corretor_sobrenome}
            </span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Empreendimento:</span>
            <span className="valorDetalhe">
              {registroSelecionado.empreendimento_nome}
            </span>
          </div>

          <div className="detalhe">
            <span className="rotuloDetalhe">Incorporadora:</span>
            <span className="valorDetalhe">
              {registroSelecionado.incorporadora_nome}
            </span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">VGV (Valor Geral de Vendas):</span>
            <span className="valorDetalhe">
              {servicoHistoricoAcoes.formatarVGV(registroSelecionado.vgv)}
            </span>
          </div>
        </div>

        {registroSelecionado.anotacoes && (
          <div className="grupoDetalhes">
            <div className="detalhe">
              <span className="rotuloDetalhe">Anotações:</span>
              <span className="valorDetalhe">
                {registroSelecionado.anotacoes}
              </span>
            </div>
          </div>
        )}

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Data de Registro:</span>
            <span className="valorDetalhe">
              {servicoHistoricoAcoes.formatarData(
                registroSelecionado.criado_em
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderiza o formulário para editar um registro existente
  const renderizarFormularioEdicao = () => (
    <div className="painelFormulario">
      <div className="cabecalhoFormulario">
        <h3>Editar Registro de Ação</h3>
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
        <form id="formRegistro">
          <div className="campoFormulario">
            <label htmlFor="data_acao">Data da Ação:</label>
            <input
              type="text"
              id="data_acao"
              name="data_acao"
              className="entradaTexto"
              value={registroSelecionado.data_acao || ""}
              onChange={manipularMudancaFormulario}
              placeholder="DD/MM/AAAA"
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="acao_id">Ação Executada:</label>
            <select
              id="acao_id"
              name="acao_id"
              className="entradaTexto"
              value={registroSelecionado.acao_id || ""}
              onChange={manipularMudancaFormulario}
              required
            >
              <option value="">Selecione uma ação</option>
              {dadosFiltros.acoes.map((acao) => (
                <option key={acao.id} value={acao.id}>
                  {acao.nome} ({acao.pontuacao} pontos)
                </option>
              ))}
            </select>
          </div>

          <div className="campoFormulario">
            <label htmlFor="quantidade">Quantidade:</label>
            <input
              type="number"
              id="quantidade"
              name="quantidade"
              className="entradaTexto"
              value={registroSelecionado.quantidade || 1}
              onChange={manipularMudancaFormulario}
              min="1"
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="incorporadora_id">Incorporadora:</label>
            <select
              id="incorporadora_id"
              name="incorporadora_id"
              className="entradaTexto"
              value={registroSelecionado.incorporadora_id || ""}
              onChange={manipularMudancaFormulario}
              required
            >
              <option value="">Selecione uma incorporadora</option>
              {dadosFiltros.incorporadoras.map((incorporadora) => (
                <option key={incorporadora.id} value={incorporadora.id}>
                  {incorporadora.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="campoFormulario">
            <label htmlFor="empreendimento_id">Empreendimento:</label>
            <select
              id="empreendimento_id"
              name="empreendimento_id"
              className="entradaTexto"
              value={registroSelecionado.empreendimento_id || ""}
              onChange={manipularMudancaFormulario}
              disabled={!registroSelecionado.incorporadora_id}
              required
            >
              <option value="">Selecione um empreendimento</option>
              {filtrarEmpreendimentosPorIncorporadora(
                registroSelecionado.incorporadora_id
              ).map((empreendimento) => (
                <option key={empreendimento.id} value={empreendimento.id}>
                  {empreendimento.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="campoFormulario">
            <label htmlFor="imobiliaria_id">Imobiliária:</label>
            <select
              id="imobiliaria_id"
              name="imobiliaria_id"
              className="entradaTexto"
              value={registroSelecionado.imobiliaria_id || ""}
              onChange={manipularMudancaFormulario}
              required
            >
              <option value="">Selecione uma imobiliária</option>
              {dadosFiltros.imobiliarias.map((imobiliaria) => (
                <option key={imobiliaria.id} value={imobiliaria.id}>
                  {imobiliaria.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="campoFormulario">
            <label htmlFor="corretor_id">Corretor:</label>
            <select
              id="corretor_id"
              name="corretor_id"
              className="entradaTexto"
              value={registroSelecionado.corretor_id || ""}
              onChange={manipularMudancaFormulario}
              required
            >
              <option value="">Selecione um corretor</option>
              {dadosFiltros.corretores.map((corretor) => (
                <option key={corretor.id} value={corretor.id}>
                  {corretor.nome} {corretor.sobrenome}
                </option>
              ))}
            </select>
          </div>

          <div className="campoFormulario">
            <label htmlFor="vgv">VGV (Valor Geral de Vendas):</label>
            <input
              type="number"
              id="vgv"
              name="vgv"
              className="entradaTexto"
              value={registroSelecionado.vgv || 0}
              onChange={manipularMudancaFormulario}
              min="0"
              step="0.01"
            />
            <span className="infoAjuda">Opcional. Informe o valor em R$.</span>
          </div>

          <div className="campoFormulario">
            <label htmlFor="anotacoes">Anotações:</label>
            <textarea
              id="anotacoes"
              name="anotacoes"
              className="entradaTexto"
              value={registroSelecionado.anotacoes || ""}
              onChange={manipularMudancaFormulario}
              rows="4"
            ></textarea>
            <span className="infoAjuda">
              Opcional. Informações adicionais sobre a ação.
            </span>
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

  // Se o usuário não tiver permissão, exibe mensagem de erro
  if (
    perfilUsuario &&
    perfilUsuario !== "Administrador" &&
    perfilUsuario !== "Gestor Consultoria"
  ) {
    return (
      <div className="paginaHistoricoAcoes">
        <div className="mensagem erro">
          Você não tem permissão para acessar esta página. Este módulo é
          exclusivo para usuários com perfil Administrador ou Gestor
          Consultoria.
        </div>
      </div>
    );
  }

  return (
    <div className="paginaHistoricoAcoes">
      {/* Mensagem de sucesso ou erro */}
      {mensagem.texto && (
        <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>
      )}

      {/* Conteúdo principal */}
      {renderizarConteudo()}
    </div>
  );
}

export default PaginaHistoricoAcoes;
