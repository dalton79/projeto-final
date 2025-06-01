// Portal da Incorporadora
// que será usado pelos Colaboradores das Incorporadoras

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import servicoAutenticacao from "../services/authService";
import PaginaImobiliarias from "./PaginaImobiliarias";
import PaginaCorretores from "./PaginaCorretores";
import PaginaRegistroAcoes from "./PaginaRegistroAcoes";
import DashboardIncorporadora from "./DashboardIncorporadora";
import servicoIncorporadoras from "../services/incorporadoraService";
import "./PortalIncorporadora.css";

// Componente placeholder para a página de Alterar Senha
const PaginaAlterarSenha = () => (
  <div className="conteudoPrincipal">
    <h2>Alterar Senha</h2>
    <p>Aqui será implementada a funcionalidade para alterar a senha.</p>
  </div>
);

function PortalIncorporadora() {
  // Estado para armazenar os dados do usuário logado
  const [usuario, setUsuario] = useState(null);
  // Estado para controlar a página/funcionalidade ativa
  const [paginaAtiva, setPaginaAtiva] = useState("dashboard");
  // Estado para armazenar os dados da incorporadora do usuário
  const [incorporadora, setIncorporadora] = useState({
    nome: "Construtora Exemplo",
    id: 1,
  });

  const navegar = useNavigate();

  // Efeito para verificar se o usuário está logado e tem permissão
  useEffect(() => {
    // Verifica se o usuário está logado
    if (!servicoAutenticacao.estaLogado()) {
      // Se não estiver logado, redireciona para a página de login
      navegar("/login");
      return;
    }

    // Obtém os dados do usuário logado
    const usuarioLogado = servicoAutenticacao.obterUsuarioLogado();

    // Verifica se o usuário tem permissão para acessar o Portal da Incorporadora
    if (usuarioLogado.perfil !== "Colaborador Incorporadora") {
      // Se não tiver permissão, redireciona para o portal adequado
      navegar("/consultoria");
      return;
    }

    // Se chegou aqui, o usuário tem permissão. Armazena os dados do usuário no estado
    setUsuario(usuarioLogado);

    // Se o usuário tem um ID de incorporadora, busca os detalhes da incorporadora
    if (usuarioLogado.incorporadora_id) {
      // Atualiza o ID da incorporadora no estado
      setIncorporadora((prev) => ({
        ...prev,
        id: usuarioLogado.incorporadora_id,
      }));

      // Busca os detalhes da incorporadora pelo ID
      const buscarDetalhesIncorporadora = async () => {
        try {
          const resultado =
            await servicoIncorporadoras.buscarIncorporadoraPorId(
              usuarioLogado.incorporadora_id
            );

          if (resultado.sucesso) {
            setIncorporadora({
              id: resultado.dados.id,
              nome:
                resultado.dados.nome_exibicao || resultado.dados.razao_social,
            });
          } else {
            console.error(
              "Erro ao buscar detalhes da incorporadora:",
              resultado.mensagem
            );
          }
        } catch (erro) {
          console.error("Erro ao buscar detalhes da incorporadora:", erro);
        }
      };

      buscarDetalhesIncorporadora();
    }
  }, [navegar]);

  // Função para fazer logout
  const fazerLogout = () => {
    servicoAutenticacao.fazerLogout();
    navegar("/login");
  };

  // Função para navegar entre as páginas
  const navegarPara = (pagina) => {
    setPaginaAtiva(pagina);
  };

  // Se o usuário ainda não foi carregado, exibe uma mensagem de carregamento
  if (!usuario) {
    return <div className="carregando">Carregando...</div>;
  }

  return (
    <div className="portalIncorporadora">
      {/* Cabeçalho com logo e menu de navegação */}
      <header className="cabecalhoPortal">
        <div className="areaLogo">
          <img
            src="/images/logo-consultoria.png"
            alt="Logo da Consultoria"
            className="logoPortal"
          />
          <span className="nomeEmpresa">
            <span className="textoBusinessConsulting">Business Consulting</span>
            <span className="separadorNome">|</span>
            <span className="textoIncorporadora">{incorporadora.nome}</span>
          </span>
        </div>

        <nav className="menuNavegacao">
          <ul className="listaMenu">
            <li
              className={
                paginaAtiva === "dashboard" ? "itemMenuAtivo" : "itemMenu"
              }
            >
              <button onClick={() => navegarPara("dashboard")}>
                Dashboard
              </button>
            </li>

            <li
              className={
                paginaAtiva === "imobiliarias" ? "itemMenuAtivo" : "itemMenu"
              }
            >
              <button onClick={() => navegarPara("imobiliarias")}>
                Imobiliárias
              </button>
            </li>

            <li
              className={
                paginaAtiva === "corretores" ? "itemMenuAtivo" : "itemMenu"
              }
            >
              <button onClick={() => navegarPara("corretores")}>
                Corretores
              </button>
            </li>

            <li
              className={
                paginaAtiva === "registroAcoes" ? "itemMenuAtivo" : "itemMenu"
              }
            >
              <button onClick={() => navegarPara("registroAcoes")}>
                Registrar Ações
              </button>
            </li>
          </ul>
        </nav>

        <div className="areaUsuario">
          <span className="nomeUsuario">{usuario.nome}</span>
          <div className="menuUsuario">
            <button
              className="botaoUsuario"
              onClick={() => navegarPara("alterarSenha")}
            >
              Alterar Senha
            </button>
            <button className="botaoSair" onClick={fazerLogout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal - muda de acordo com a página ativa */}
      <main className="conteudo">
        {paginaAtiva === "dashboard" && <DashboardIncorporadora />}{" "}
        {/* Agora utiliza o componente real do Dashboard */}
        {paginaAtiva === "imobiliarias" && <PaginaImobiliarias />}
        {paginaAtiva === "corretores" && <PaginaCorretores />}
        {paginaAtiva === "registroAcoes" && <PaginaRegistroAcoes />}
        {paginaAtiva === "alterarSenha" && <PaginaAlterarSenha />}
      </main>

      {/* Rodapé com informações de copyright */}
      <footer className="rodapePortal">
        <p>&copy; 2025 Business Consulting - Sistema de Mensuração</p>
      </footer>
    </div>
  );
}

export default PortalIncorporadora;
