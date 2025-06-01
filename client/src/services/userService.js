// Este arquivo contém funções para comunicação com a API de usuários

// Importando axios para fazer requisições HTTP
import axios from "axios";

// URL base da API
const API_URL = "http://localhost:5000/api/usuarios";

// Objeto que vai conter as funções do serviço de usuários
const servicoUsuarios = {
  // Função para buscar todos os usuários com filtros opcionais
  buscarUsuarios: async (filtros = {}) => {
    try {
      // Monta os parâmetros da URL com os filtros
      const parametros = new URLSearchParams();

      // Adiciona cada filtro se foi fornecido
      if (filtros.nome) parametros.append("nome", filtros.nome);
      if (filtros.email) parametros.append("email", filtros.email);
      if (filtros.perfil) parametros.append("perfil", filtros.perfil);
      if (filtros.ativo !== undefined && filtros.ativo !== "") {
        parametros.append("ativo", filtros.ativo);
      }

      // Monta a URL completa com os parâmetros
      const urlCompleta = parametros.toString()
        ? `${API_URL}?${parametros.toString()}`
        : API_URL;

      // Faz a requisição GET para a API
      const resposta = await axios.get(urlCompleta);

      // Verifica se a resposta tem status de sucesso
      if (resposta.data.sucesso) {
        return {
          sucesso: true,
          dados: resposta.data.dados,
          total: resposta.data.total,
        };
      } else {
        return {
          sucesso: false,
          mensagem: "Erro ao buscar usuários",
        };
      }
    } catch (erro) {
      console.error("Erro ao buscar usuários:", erro);

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

  // Função para buscar um usuário específico pelo ID
  buscarUsuarioPorId: async (id) => {
    try {
      // Faz a requisição GET para buscar o usuário
      const resposta = await axios.get(`${API_URL}/${id}`);

      // Verifica se a resposta tem status de sucesso
      if (resposta.data.sucesso) {
        return {
          sucesso: true,
          dados: resposta.data.dados,
        };
      } else {
        return {
          sucesso: false,
          mensagem: resposta.data.mensagem,
        };
      }
    } catch (erro) {
      console.error("Erro ao buscar usuário:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao buscar usuário.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para criar um novo usuário
  criarUsuario: async (dadosUsuario) => {
    try {
      // Faz a requisição POST para criar o usuário
      const resposta = await axios.post(API_URL, dadosUsuario);

      // Verifica se a resposta tem status de sucesso
      if (resposta.data.sucesso) {
        return {
          sucesso: true,
          dados: resposta.data.dados,
          mensagem: resposta.data.mensagem,
        };
      } else {
        return {
          sucesso: false,
          mensagem: resposta.data.mensagem,
        };
      }
    } catch (erro) {
      console.error("Erro ao criar usuário:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao criar usuário.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para atualizar um usuário existente
  atualizarUsuario: async (id, dadosUsuario) => {
    try {
      // Faz a requisição PUT para atualizar o usuário
      const resposta = await axios.put(`${API_URL}/${id}`, dadosUsuario);

      // Verifica se a resposta tem status de sucesso
      if (resposta.data.sucesso) {
        return {
          sucesso: true,
          dados: resposta.data.dados,
          mensagem: resposta.data.mensagem,
        };
      } else {
        return {
          sucesso: false,
          mensagem: resposta.data.mensagem,
        };
      }
    } catch (erro) {
      console.error("Erro ao atualizar usuário:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao atualizar usuário.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para excluir um usuário
  excluirUsuario: async (id) => {
    try {
      // Faz a requisição DELETE para excluir o usuário
      const resposta = await axios.delete(`${API_URL}/${id}`);

      // Verifica se a resposta tem status de sucesso
      if (resposta.data.sucesso) {
        return {
          sucesso: true,
          dados: resposta.data.dados,
          mensagem: resposta.data.mensagem,
        };
      } else {
        return {
          sucesso: false,
          mensagem: resposta.data.mensagem,
        };
      }
    } catch (erro) {
      console.error("Erro ao excluir usuário:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao excluir usuário.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },
};

export default servicoUsuarios;
