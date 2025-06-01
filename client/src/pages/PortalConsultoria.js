// Portal da Consultoria que será usado por Administradores e Gestores da Consultoria

import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import servicoAutenticacao from "../services/authService";
import PaginaIncorporadoras from "./PaginaIncorporadoras";
import PaginaUsuarios from "./PaginaUsuarios";
import PaginaEmpreendimentos from "./PaginaEmpreendimentos";
import PaginaAcoes from "./PaginaAcoes";
import PaginaHistoricoAcoes from "./PaginaHistoricoAcoes";
import DashboardConsultoria from "./DashboardConsultoria";
import "./PortalConsultoria.css";

// Componente para a página de Alterar Senha
const PaginaAlterarSenha = () => (
  <div className="conteudoPrincipal">
    <h2>Alterar Senha</h2>
    <p>Aqui será implementada a funcionalidade para alterar a senha.</p>
  </div>
);

function PortalConsultoria() {
  // Estado para armazenar os dados do usuário logado
  const [usuario, setUsuario] = useState(null);
  // Estado para controlar a página/funcionalidade ativa
  const [paginaAtiva, setPaginaAtiva] = useState("dashboard");

  // Hook de navegação do React Router
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

    // Verifica se o usuário tem permissão para acessar o Portal da Consultoria
    if (
      usuarioLogado.perfil !== "Administrador" &&
      usuarioLogado.perfil !== "Gestor Consultoria"
    ) {
      // Se não tiver permissão, redireciona para o portal adequado
      navegar("/incorporadora/dashboard");
      return;
    }

    // Se chegou aqui, o usuário tem permissão. Armazena os dados do usuário no estado
    setUsuario(usuarioLogado);
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
    <div className="portalConsultoria">
      {/* Cabeçalho com logo e menu de navegação */}
      <header className="cabecalhoPortal">
        <div className="areaLogo">
          <img
            src="/images/logo-consultoria.png"
            alt="Logo da Consultoria"
            className="logoPortal"
          />
          <span className="nomeEmpresa">Business Consulting</span>
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

            {/* Exibe o item Usuários apenas para o perfil Administrador */}
            {usuario.perfil === "Administrador" && (
              <li
                className={
                  paginaAtiva === "usuarios" ? "itemMenuAtivo" : "itemMenu"
                }
              >
                <button onClick={() => navegarPara("usuarios")}>
                  Usuários
                </button>
              </li>
            )}

            <li
              className={
                paginaAtiva === "incorporadoras" ? "itemMenuAtivo" : "itemMenu"
              }
            >
              <button onClick={() => navegarPara("incorporadoras")}>
                Incorporadoras
              </button>
            </li>

            <li
              className={
                paginaAtiva === "empreendimentos" ? "itemMenuAtivo" : "itemMenu"
              }
            >
              <button onClick={() => navegarPara("empreendimentos")}>
                Empreendimentos
              </button>
            </li>

            <li
              className={paginaAtiva === "acoes" ? "itemMenuAtivo" : "itemMenu"}
            >
              <button onClick={() => navegarPara("acoes")}>Ações</button>
            </li>

            <li
              className={
                paginaAtiva === "historico" ? "itemMenuAtivo" : "itemMenu"
              }
            >
              <button onClick={() => navegarPara("historico")}>
                Histórico
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
        <div className="conteudoPrincipal">
          {paginaAtiva === "dashboard" && <DashboardConsultoria />}
          {paginaAtiva === "usuarios" && <PaginaUsuarios />}
          {paginaAtiva === "incorporadoras" && <PaginaIncorporadoras />}
          {paginaAtiva === "empreendimentos" && <PaginaEmpreendimentos />}
          {paginaAtiva === "acoes" && <PaginaAcoes />}
          {paginaAtiva === "historico" && <PaginaHistoricoAcoes />}
          {paginaAtiva === "alterarSenha" && <PaginaAlterarSenha />}
        </div>
      </main>

      {/* Rodapé com informações de copyright */}
      <footer className="rodapePortal">
        <p>&copy; 2025 Business Consulting - Sistema de Mensuração</p>
      </footer>
    </div>
  );
}

export default PortalConsultoria;
