// Funcionalidade de gerenciar usuários (UC-002)

import React, { useState, useEffect } from "react";
import servicoUsuarios from "../services/userService";
import servicoIncorporadoras from "../services/incorporadoraService";
import "./PaginaUsuarios.css";

// Componente principal para gerenciar usuários
function PaginaUsuarios() {
  // Estado para armazenar a lista de usuários
  const [usuarios, setUsuarios] = useState([]);
  // Estado para armazenar os filtros de pesquisa
  const [filtros, setFiltros] = useState({
    nome: "",
    email: "",
    perfil: "",
    ativo: "",
  });
  // Estado para controlar o carregamento
  const [carregando, setCarregando] = useState(true);
  // Estado para armazenar o usuário selecionado para visualização/edição
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  // Estado para controlar o modo de exibição (lista, visualização, edição, novo)
  const [modo, setModo] = useState("lista");
  // Estado para armazenar mensagens para o usuário
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  // Estado para armazenar a lista de incorporadoras
  const [incorporadoras, setIncorporadoras] = useState([]);

  // Função para carregar usuários do banco de dados
  const carregarUsuarios = async (filtrosParaBusca = {}) => {
    try {
      setCarregando(true);

      // Chama o serviço para buscar usuários do banco
      const resultado = await servicoUsuarios.buscarUsuarios(filtrosParaBusca);

      if (resultado.sucesso) {
        setUsuarios(resultado.dados);
      } else {
        setMensagem({
          texto: resultado.mensagem || "Erro ao carregar usuários",
          tipo: "erro",
        });
      }
    } catch (erro) {
      console.error("Erro ao carregar usuários:", erro);
      setMensagem({
        texto: "Erro ao conectar com o servidor",
        tipo: "erro",
      });
    } finally {
      setCarregando(false);
    }
  };

  // Função para carregar incorporadoras do banco de dados
  const carregarIncorporadoras = async () => {
    try {
      // Chama o serviço para buscar incorporadoras do banco
      const resultado = await servicoIncorporadoras.buscarIncorporadoras();

      if (resultado.sucesso) {
        setIncorporadoras(resultado.dados);
      } else {
        console.error("Erro ao carregar incorporadoras:", resultado.mensagem);
        setMensagem({
          texto: "Erro ao carregar incorporadoras",
          tipo: "erro",
        });
      }
    } catch (erro) {
      console.error("Erro ao carregar incorporadoras:", erro);
    }
  };

  // Efeito para carregar os dados iniciais quando o componente é montado
  useEffect(() => {
    // Carrega os usuários do banco de dados
    carregarUsuarios();

    // Carrega a lista de incorporadoras do banco de dados
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

    // Agora faz a pesquisa no banco de dados usando os filtros
    await carregarUsuarios(filtros);
  };

  // Função para selecionar um usuário para visualização
  const visualizarUsuario = (id) => {
    const usuario = usuarios.find((user) => user.id === id);
    setUsuarioSelecionado(usuario);
    setModo("visualizar");
  };

  // Função para voltar à lista de usuários
  const voltarParaLista = () => {
    setUsuarioSelecionado(null);
    setModo("lista");
    // Recarrega a lista após qualquer operação
    carregarUsuarios(filtros);
  };

  // Função para entrar no modo de edição
  const editarUsuario = () => {
    setModo("editar");
  };

  // Função para entrar no modo de cadastro de novo usuário
  const novoUsuario = () => {
    setUsuarioSelecionado({
      nome: "",
      email: "",
      telefone: "",
      perfil: "Gestor Consultoria",
      incorporadora_id: null,
      ativo: true,
      senha: "", // Campo adicional para o cadastro
    });
    setModo("novo");
  };

  // Função para excluir um usuário
  const confirmarExclusao = async () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o usuário "${usuarioSelecionado.nome}"?`
      )
    ) {
      try {
        // Chama o serviço para excluir o usuário do banco
        const resultado = await servicoUsuarios.excluirUsuario(
          usuarioSelecionado.id
        );

        if (resultado.sucesso) {
          setMensagem({
            texto: "Usuário excluído com sucesso!",
            tipo: "sucesso",
          });

          // Volta para a lista e recarrega os dados
          voltarParaLista();
        } else {
          setMensagem({
            texto: resultado.mensagem || "Erro ao excluir usuário",
            tipo: "erro",
          });
        }
      } catch (erro) {
        console.error("Erro ao excluir usuário:", erro);
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

  // Função para salvar um usuário
  const salvarUsuario = async (dadosFormulario) => {
    try {
      let resultado;

      if (modo === "novo") {
        // Chama o serviço para criar um novo usuário no banco
        resultado = await servicoUsuarios.criarUsuario(dadosFormulario);
      } else {
        // Chama o serviço para atualizar o usuário no banco
        resultado = await servicoUsuarios.atualizarUsuario(
          usuarioSelecionado.id,
          dadosFormulario
        );
      }

      if (resultado.sucesso) {
        setMensagem({
          texto:
            resultado.mensagem ||
            (modo === "novo"
              ? "Usuário criado com sucesso!"
              : "Usuário atualizado com sucesso!"),
          tipo: "sucesso",
        });

        // Volta para a lista e recarrega os dados
        voltarParaLista();
      } else {
        setMensagem({
          texto: resultado.mensagem || "Erro ao salvar usuário",
          tipo: "erro",
        });
      }
    } catch (erro) {
      console.error("Erro ao salvar usuário:", erro);
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

    const valorCampo = type === "checkbox" ? checked : value;

    setUsuarioSelecionado({
      ...usuarioSelecionado,
      [name]: valorCampo,
    });
  };

  // Função para lidar com o envio do formulário
  const manipularEnvioFormulario = (e) => {
    e.preventDefault();

    // Validações básicas
    if (!usuarioSelecionado.nome || !usuarioSelecionado.email) {
      setMensagem({
        texto: "Por favor, preencha todos os campos obrigatórios.",
        tipo: "erro",
      });
      return;
    }

    // Se o formulário for de novo usuário, validamos a senha
    if (modo === "novo" && !usuarioSelecionado.senha) {
      setMensagem({
        texto: "Por favor, defina uma senha para o usuário.",
        tipo: "erro",
      });
      return;
    }

    salvarUsuario(usuarioSelecionado);
  };

  // Renderiza o painel de filtros
  const renderizarFiltros = () => (
    <div className="painelFiltros">
      <h3>Consultar Usuário</h3>

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
          <label htmlFor="email">E-mail:</label>
          <input
            type="email"
            id="email"
            name="email"
            className="entradaTexto"
            value={filtros.email}
            onChange={atualizarFiltro}
          />
        </div>

        <div className="campoFormulario">
          <label htmlFor="perfil">Perfil:</label>
          <select
            id="perfil"
            name="perfil"
            className="entradaTexto"
            value={filtros.perfil}
            onChange={atualizarFiltro}
          >
            <option value="">Todos</option>
            <option value="Administrador">Administrador</option>
            <option value="Gestor Consultoria">Gestor Consultoria</option>
            <option value="Colaborador Incorporadora">
              Colaborador Incorporadora
            </option>
          </select>
        </div>

        <div className="campoFormulario">
          <label htmlFor="ativo">Status:</label>
          <select
            id="ativo"
            name="ativo"
            className="entradaTexto"
            value={filtros.ativo}
            onChange={atualizarFiltro}
          >
            <option value="">Todos</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
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
        <h3>Usuários ({usuarios.length} encontrados)</h3>
        <button className="botaoNovo" onClick={novoUsuario}>
          + Cadastrar Usuário
        </button>
      </div>

      {carregando ? (
        <div className="carregando">Carregando dados...</div>
      ) : usuarios.length === 0 ? (
        <div className="semResultados">Nenhum usuário encontrado.</div>
      ) : (
        <table className="tabelaResultados">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nome}</td>
                <td>{usuario.email}</td>
                <td>{usuario.telefone}</td>
                <td>{usuario.perfil}</td>
                <td>
                  <span
                    style={{
                      color: usuario.ativo ? "#2e7d32" : "#d32f2f",
                      fontWeight: "bold",
                    }}
                  >
                    {usuario.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td>
                  <button
                    className="botaoAcao"
                    onClick={() => visualizarUsuario(usuario.id)}
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

  // Renderiza a visualização detalhada de um usuário
  const renderizarVisualizacao = () => (
    <div className="painelDetalhes">
      <div className="cabecalhoDetalhes">
        <h3>Detalhes do Usuário</h3>
        <div className="botoesAcao">
          <button className="botaoEditar" onClick={editarUsuario}>
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

      <div className="detalhesUsuario">
        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Nome:</span>
            <span className="valorDetalhe">{usuarioSelecionado.nome}</span>
          </div>

          <div className="detalhe">
            <span className="rotuloDetalhe">E-mail:</span>
            <span className="valorDetalhe">{usuarioSelecionado.email}</span>
          </div>
        </div>

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Telefone:</span>
            <span className="valorDetalhe">{usuarioSelecionado.telefone}</span>
          </div>

          <div className="detalhe">
            <span className="rotuloDetalhe">Perfil:</span>
            <span className="valorDetalhe">{usuarioSelecionado.perfil}</span>
          </div>
        </div>

        {usuarioSelecionado.perfil === "Colaborador Incorporadora" && (
          <div className="grupoDetalhes">
            <div className="detalhe">
              <span className="rotuloDetalhe">Incorporadora:</span>
              <span className="valorDetalhe">
                {usuarioSelecionado.incorporadora_nome || "Não definida"}
              </span>
            </div>
          </div>
        )}

        <div className="grupoDetalhes">
          <div className="detalhe">
            <span className="rotuloDetalhe">Status:</span>
            <span className="valorDetalhe">
              <span
                style={{
                  color: usuarioSelecionado.ativo ? "#2e7d32" : "#d32f2f",
                  fontWeight: "bold",
                }}
              >
                {usuarioSelecionado.ativo ? "Ativo" : "Inativo"}
              </span>
            </span>
          </div>

          <div className="detalhe">
            <span className="rotuloDetalhe">Criado em:</span>
            <span className="valorDetalhe">
              {new Date(usuarioSelecionado.criado_em).toLocaleDateString(
                "pt-BR"
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderiza o formulário para editar um usuário existente
  const renderizarFormularioEdicao = () => (
    <div className="painelFormulario">
      <div className="cabecalhoFormulario">
        <h3>Editar Usuário</h3>
        <div className="botoesAcao">
          <button type="submit" form="formUsuario" className="botaoSalvar">
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
        <form id="formUsuario" onSubmit={manipularEnvioFormulario}>
          <div className="campoFormulario">
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              className="entradaTexto"
              value={usuarioSelecionado.nome}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="email">E-mail:</label>
            <input
              type="email"
              id="email"
              name="email"
              className="entradaTexto"
              value={usuarioSelecionado.email}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="telefone">Telefone:</label>
            <input
              type="text"
              id="telefone"
              name="telefone"
              className="entradaTexto"
              value={usuarioSelecionado.telefone}
              onChange={manipularMudancaFormulario}
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="perfil">Perfil:</label>
            <select
              id="perfil"
              name="perfil"
              className="entradaTexto"
              value={usuarioSelecionado.perfil}
              onChange={manipularMudancaFormulario}
              required
            >
              <option value="Administrador">Administrador</option>
              <option value="Gestor Consultoria">Gestor Consultoria</option>
              <option value="Colaborador Incorporadora">
                Colaborador Incorporadora
              </option>
            </select>
          </div>

          {/* Mostra o campo de incorporadora apenas para o perfil Colaborador Incorporadora */}
          {usuarioSelecionado.perfil === "Colaborador Incorporadora" && (
            <div className="campoFormulario">
              <label htmlFor="incorporadora_id">Incorporadora:</label>
              <select
                id="incorporadora_id"
                name="incorporadora_id"
                className="entradaTexto"
                value={usuarioSelecionado.incorporadora_id || ""}
                onChange={manipularMudancaFormulario}
                required
              >
                <option value="">Selecione uma incorporadora</option>
                {incorporadoras.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    {/* Usamos nome_exibicao se disponível, senão usamos nome */}
                    {inc.nome_exibicao || inc.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="campoFormulario">
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="ativo"
                checked={usuarioSelecionado.ativo}
                onChange={manipularMudancaFormulario}
              />
              Usuário Ativo
            </label>
          </div>
        </form>
      </div>
    </div>
  );

  // Renderiza o formulário para cadastrar um novo usuário
  const renderizarFormularioNovo = () => (
    <div className="painelFormulario">
      <div className="cabecalhoFormulario">
        <h3>Novo Usuário</h3>
        <div className="botoesAcao">
          <button type="submit" form="formUsuario" className="botaoSalvar">
            Salvar
          </button>
          <button className="botaoCancelar" onClick={voltarParaLista}>
            Cancelar
          </button>
        </div>
      </div>

      <div className="corpoFormulario">
        <form id="formUsuario" onSubmit={manipularEnvioFormulario}>
          <div className="campoFormulario">
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              className="entradaTexto"
              value={usuarioSelecionado.nome}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="email">E-mail:</label>
            <input
              type="email"
              id="email"
              name="email"
              className="entradaTexto"
              value={usuarioSelecionado.email}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="senha">Senha:</label>
            <input
              type="password"
              id="senha"
              name="senha"
              className="entradaTexto"
              value={usuarioSelecionado.senha || ""}
              onChange={manipularMudancaFormulario}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="telefone">Telefone:</label>
            <input
              type="text"
              id="telefone"
              name="telefone"
              className="entradaTexto"
              value={usuarioSelecionado.telefone}
              onChange={manipularMudancaFormulario}
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="perfil">Perfil:</label>
            <select
              id="perfil"
              name="perfil"
              className="entradaTexto"
              value={usuarioSelecionado.perfil}
              onChange={manipularMudancaFormulario}
              required
            >
              <option value="Administrador">Administrador</option>
              <option value="Gestor Consultoria">Gestor Consultoria</option>
              <option value="Colaborador Incorporadora">
                Colaborador Incorporadora
              </option>
            </select>
          </div>

          {/* Mostra o campo de incorporadora apenas para o perfil Colaborador Incorporadora */}
          {usuarioSelecionado.perfil === "Colaborador Incorporadora" && (
            <div className="campoFormulario">
              <label htmlFor="incorporadora_id">Incorporadora:</label>
              <select
                id="incorporadora_id"
                name="incorporadora_id"
                className="entradaTexto"
                value={usuarioSelecionado.incorporadora_id || ""}
                onChange={manipularMudancaFormulario}
                required
              >
                <option value="">Selecione uma incorporadora</option>
                {incorporadoras.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    {/* Usamos nome_exibicao se disponível, senão usamos nome */}
                    {inc.nome_exibicao || inc.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="campoFormulario">
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="ativo"
                checked={usuarioSelecionado.ativo}
                onChange={manipularMudancaFormulario}
              />
              Usuário Ativo
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
    <div className="paginaUsuarios">
      {/* Mensagem de sucesso ou erro */}
      {mensagem.texto && (
        <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>
      )}

      {/* Conteúdo principal */}
      {renderizarConteudo()}
    </div>
  );
}

export default PaginaUsuarios;
