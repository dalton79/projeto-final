// Página de login do sistema

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import servicoAutenticacao from "../services/authService";
import "./PaginaLogin.css";

function PaginaLogin() {
  // Estados para armazenar os valores dos campos e mensagens
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navegar = useNavigate();

  // Função para lidar com o envio do formulário
  const manipularEnvio = async (evento) => {
    evento.preventDefault();

    // Limpa qualquer mensagem de erro anterior
    setMensagemErro("");

    // Validação básica
    if (!email || !senha) {
      setMensagemErro("Por favor, preencha todos os campos");
      return;
    }

    try {
      // Inicia o estado de carregamento
      setCarregando(true);

      // Chama o serviço de autenticação para fazer login
      const resultado = await servicoAutenticacao.fazerLogin(email, senha);

      // Verifica o resultado
      if (resultado.sucesso) {
        // Login bem-sucedido

        // Determina para qual página redirecionar com base no perfil do usuário
        const usuario = resultado.usuario;
        let rotaDestino = "/";

        if (
          usuario.perfil === "Administrador" ||
          usuario.perfil === "Gestor Consultoria"
        ) {
          // Redireciona para o Portal da Consultoria
          rotaDestino = "/consultoria/dashboard";
        } else if (usuario.perfil === "Colaborador Incorporadora") {
          // Redireciona para o Portal da Incorporadora
          rotaDestino = "/incorporadora/dashboard";
        }

        // Navega para a página correspondente
        navegar(rotaDestino);
      } else {
        // Login falhou, mostra a mensagem de erro
        setMensagemErro(resultado.mensagem);
      }
    } catch (erro) {
      console.error("Erro ao fazer login:", erro);
      setMensagemErro("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      // Finaliza o estado de carregamento
      setCarregando(false);
    }
  };

  // Função para preencher automaticamente o login de teste
  const preencherUsuario = (emailUsuario, senhaUsuario) => {
    setEmail(emailUsuario);
    setSenha(senhaUsuario);
  };

  return (
    <div className="paginaLogin">
      <div className="containerLogin">
        <div className="cabecalhoLogin">
          <img
            src="/images/logo-consultoria.png"
            alt="Logo da Consultoria"
            className="logoLogin"
          />
          <h1 className="tituloLogin">Sistema de Mensuração</h1>
          <p className="subtituloLogin">
            Relação entre Incorporadora e Imobiliárias
          </p>
        </div>

        <form className="formularioLogin" onSubmit={manipularEnvio}>
          <div className="campoFormulario">
            <label htmlFor="campoEmail" className="rotuloInput">
              Email:
            </label>
            <input
              type="email"
              id="campoEmail"
              className="entradaTexto"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="campoFormulario">
            <label htmlFor="campoSenha" className="rotuloInput">
              Senha:
            </label>
            <input
              type="password"
              id="campoSenha"
              className="entradaTexto"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {mensagemErro && <div className="mensagemErro">{mensagemErro}</div>}

          <button type="submit" className="botaoLogin" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>

          <div className="linkEsqueciSenha">
            <button type="button" className="botaoLinkSenha">
              Esqueci minha senha
            </button>
          </div>
        </form>

        <div className="boxUsuariosTeste">
          <h3 className="tituloUsuariosTeste">Usuários para teste:</h3>
          <div className="listaUsuariosTeste">
            <div className="itemUsuarioTeste">
              <strong>Admin:</strong> admin@sistema.com /
              <button
                className="botaoPreencherUsuario"
                onClick={() => preencherUsuario("admin@sistema.com", "123456")}
              >
                Usar
              </button>
            </div>
            <div className="itemUsuarioTeste">
              <strong>Gestor:</strong> gestor@sistema.com /
              <button
                className="botaoPreencherUsuario"
                onClick={() => preencherUsuario("gestor@sistema.com", "123456")}
              >
                Usar
              </button>
            </div>
            <div className="itemUsuarioTeste">
              <strong>Colaborador:</strong> colaborador@exemplo.com /
              <button
                className="botaoPreencherUsuario"
                onClick={() =>
                  preencherUsuario("colaborador@exemplo.com", "123456")
                }
              >
                Usar
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="rodapePagina">&copy; 2025 Business Consulting</footer>
    </div>
  );
}

export default PaginaLogin;
