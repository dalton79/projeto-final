// Este arquivo contém funções para comunicação com a API de autenticação

// Importando axios para fazer requisições HTTP
import axios from "axios";

// URL base da API
const API_URL = "https://sistema-consultoria.onrender.com/api/auth";

// Objeto que vai conter as funções do serviço
const servicoAutenticacao = {
  // Função para fazer login
  fazerLogin: async (email, senha) => {
    try {
      // Faz a requisição POST para a API
      const resposta = await axios.post(`${API_URL}/login`, {
        email,
        senha,
      });

      // Verifica se a resposta tem status de sucesso
      if (resposta.data.sucesso) {
        // Salva os dados do usuário no localStorage para manter a sessão
        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify(resposta.data.usuario)
        );
        return {
          sucesso: true,
          usuario: resposta.data.usuario,
          mensagem: resposta.data.mensagem,
        };
      } else {
        // Se não teve sucesso, retorna a mensagem de erro
        return {
          sucesso: false,
          mensagem: resposta.data.mensagem,
        };
      }
    } catch (erro) {
      // Se ocorreu um erro na requisição, trata aqui
      console.error("Erro ao fazer login:", erro);

      // Verifica se tem uma mensagem de erro específica na resposta
      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao conectar com o servidor. Tente novamente.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para fazer logout
  fazerLogout: () => {
    // Remove os dados do usuário do localStorage
    localStorage.removeItem("usuarioLogado");
    return {
      sucesso: true,
      mensagem: "Logout realizado com sucesso",
    };
  },

  // Função para verificar se o usuário está logado
  estaLogado: () => {
    // Verifica se existe um usuário salvo no localStorage
    const usuario = localStorage.getItem("usuarioLogado");
    return !!usuario; // Retorna true se existir, false se não existir
  },

  // Função para obter o usuário logado
  obterUsuarioLogado: () => {
    // Busca o usuário do localStorage
    const usuario = localStorage.getItem("usuarioLogado");
    return usuario ? JSON.parse(usuario) : null;
  },

  // Função para verificar se o usuário tem um determinado perfil
  temPerfil: (perfilNecessario) => {
    // Busca o usuário do localStorage
    const usuario = localStorage.getItem("usuarioLogado");
    if (!usuario) return false;

    // Verifica se o perfil do usuário é o perfil necessário
    const perfilUsuario = JSON.parse(usuario).perfil;
    return perfilUsuario === perfilNecessario;
  },
};

export default servicoAutenticacao;
